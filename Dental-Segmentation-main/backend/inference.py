import os
import time
import numpy as np
import torch
import nrrd
from collections import OrderedDict

from monai.bundle import ConfigParser
from monai.data import decollate_batch, list_data_collate
from monai.utils import convert_to_dst_type, MetaKeys
from monai.inferers import SlidingWindowInfererAdapt
from monai.transforms import (
    Compose, CropForegroundd, EnsureTyped, Invertd,
    KeepLargestConnectedComponentd, Lambdad, LoadImaged,
    NormalizeIntensityd, Resized, ScaleIntensityRanged,
    Spacingd, Orientationd, ConcatItemsd,
)

BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
INPUT_DIR   = os.path.join(BASE_DIR, "input")
OUTPUT_DIR  = os.path.join(BASE_DIR, "output")


def logits2pred(logits, sigmoid=False, dim=1):
    if isinstance(logits, (list, tuple)):
        logits = logits[0]
    if sigmoid:
        pred = torch.sigmoid(logits)
        pred = (pred >= 0.5)
    else:
        pred = torch.softmax(logits, dim=dim)
        pred = torch.argmax(pred, dim=dim, keepdim=True).to(dtype=torch.uint8)
    return pred


def _add_normalization_transforms(ts, key, normalize_mode, intensity_bounds):
    if normalize_mode == "none":
        pass
    elif normalize_mode in ["range", "ct"]:
        ts.append(ScaleIntensityRanged(
            keys=key, a_min=intensity_bounds[0], a_max=intensity_bounds[1],
            b_min=-1, b_max=1, clip=False
        ))
        ts.append(Lambdad(keys=key, func=lambda x: torch.sigmoid(x)))
    elif normalize_mode in ["meanstd", "mri"]:
        ts.append(NormalizeIntensityd(keys=key, nonzero=True, channel_wise=True))
    elif normalize_mode in ["meanstdtanh"]:
        ts.append(NormalizeIntensityd(keys=key, nonzero=True, channel_wise=True))
        ts.append(Lambdad(keys=key, func=lambda x: 3 * torch.tanh(x / 3)))
    elif normalize_mode in ["pet"]:
        ts.append(Lambdad(keys=key, func=lambda x: torch.sigmoid((x - x.min()) / x.std())))
    else:
        raise ValueError("Unsupported normalize_mode: " + str(normalize_mode))


@torch.no_grad()
def run_inference(model_file, image_file, result_file, log_queue,
                  save_mode=None, image_file_2=None,
                  image_file_3=None, image_file_4=None):

    def log(msg: str):
        print(msg, flush=True)
        log_queue.put(msg)

    try:
        start_time = time.time()
        timing_checkpoints = []

        if not os.path.exists(model_file):
            raise ValueError("Cannot find model file: " + str(model_file))

        log(f"Loading model from: {model_file}")
        checkpoint  = torch.load(model_file, map_location="cpu")

        if "config" not in checkpoint:
            raise ValueError("Config not found in checkpoint: " + str(model_file))

        config      = checkpoint["config"]
        state_dict  = checkpoint["state_dict"]
        epoch       = checkpoint.get("epoch", 0)
        best_metric = checkpoint.get("best_metric", 0)
        sigmoid     = config.get("sigmoid", False)

        model = ConfigParser(config["network"]).get_parsed_content()
        model.load_state_dict(state_dict, strict=True)
        log(f"Model loaded: Epoch {epoch}, Best Metric {best_metric}")

        device = torch.device("cpu") if torch.cuda.device_count() == 0 else torch.device(0)
        log(f"Moving model to device: {device}")
        model = model.to(device=device, memory_format=torch.channels_last_3d)
        model.eval()

        autocast_device = "cuda" if device.type == "cuda" else "cpu"

        # ── Standard Mode ─────────────────────────────────────────────────
        if save_mode != "brats" and "brats" not in model_file:
            log("Mode: Standard")
            image_files = {}
            for idx, img in enumerate([image_file, image_file_2, image_file_3, image_file_4]):
                if img is not None:
                    image_files[f"image{idx + 1}"] = img

            keys = list(image_files.keys())
            for key, path in image_files.items():
                if path is None or not os.path.exists(path):
                    raise ValueError(f"Incorrect image filename for {key}: \"{path}\"")

            loader = LoadImaged(
                keys=keys, ensure_channel_first=True,
                dtype=None, allow_missing_keys=True, image_only=False
            )
            images_loaded = loader(image_files)
            timing_checkpoints.append(("Loading volumes", time.time()))

            if len(keys) > 1:
                image1_shape = images_loaded[keys[0]].shape[1:]
                for img_key in keys[1:]:
                    temp_shape = images_loaded[img_key].shape[-len(image1_shape):]
                    if np.any(np.not_equal(image1_shape, temp_shape)):
                        log(f"Resizing volume {img_key}")
                        resizer = Resized(keys=img_key, spatial_size=image1_shape, mode="bilinear")
                        images_loaded = resizer(images_loaded)
                        timing_checkpoints.append((f"Resizing {img_key}", time.time()))

            main_normalize_mode = config["normalize_mode"]
            intensity_bounds    = config["intensity_bounds"]

            if len(keys) == 1:
                ts = [
                    ConcatItemsd(keys=keys, name="image", dim=0),
                    EnsureTyped(keys="image", data_type="tensor",
                                dtype=torch.float, allow_missing_keys=True),
                ]
                _add_normalization_transforms(ts, "image", main_normalize_mode, intensity_bounds)
            else:
                ts = []
                extra_modalities = OrderedDict(config["extra_modalities"])
                normalize_modes  = [main_normalize_mode] + list(extra_modalities.values())
                for key, nm in zip(keys, normalize_modes):
                    _add_normalization_transforms(ts, key, nm, intensity_bounds)
                ts.extend([
                    ConcatItemsd(keys=keys, name="image", dim=0),
                    EnsureTyped(keys="image", data_type="tensor",
                                dtype=torch.float, allow_missing_keys=True),
                ])

            if config.get("orientation_ras", False):
                log("Using orientation_ras")
                ts.append(Orientationd(keys="image", axcodes="RAS"))

            if config.get("crop_foreground", True):
                log("Using crop_foreground")
                ts.append(CropForegroundd(keys="image", source_key="image1",
                                          margin=10, allow_smaller=True))

            if config.get("resample_resolution", None) is not None:
                pixdim = list(config["resample_resolution"])
                log(f"Using resample with resample_resolution {pixdim}")
                ts.append(
                    Spacingd(
                        keys=["image"], pixdim=list(pixdim), mode=["bilinear"],
                        dtype=torch.float,
                        min_pixdim=np.array(pixdim) * 0.75,
                        max_pixdim=np.array(pixdim) * 1.25,
                        allow_missing_keys=True,
                    )
                )

            inf_transform = Compose(ts)
            roi_size      = config["roi_size"]

            # Patch tqdm to stream into queue
            from tqdm import tqdm as _tqdm
            import monai.inferers.utils as _miu

            class QueueTqdm(_tqdm):
                def display(self, msg=None, pos=None):
                    super().display(msg=msg, pos=pos)
                    line = self.__str__()
                    log_queue.put(line)
                    print(f"\r{line}", end="", flush=True)

            _miu.tqdm = QueueTqdm

            sliding_inferrer = SlidingWindowInfererAdapt(
                roi_size=roi_size, sw_batch_size=1, overlap=0.625,
                mode="gaussian", cache_roi_weight_map=False, progress=True
            )

            batch_data      = inf_transform([images_loaded])
            original_affine = batch_data[0]["image"].meta[MetaKeys.ORIGINAL_AFFINE]
            batch_data      = list_data_collate([batch_data])
            data            = batch_data["image"].as_subclass(torch.Tensor).to(
                memory_format=torch.channels_last_3d, device=device
            )
            timing_checkpoints.append(("Preprocessing", time.time()))

            log("Running Inference ...")
            with torch.amp.autocast(device_type=autocast_device, enabled=True):
                logits = sliding_inferrer(inputs=data, network=model)
            timing_checkpoints.append(("Inference", time.time()))

            log(f"Logits shape: {logits.shape}")
            try:
                pred = logits2pred(logits, sigmoid=sigmoid)
            except RuntimeError as e:
                if not logits.is_cuda:
                    raise e
                log(f"logits2pred failed on GPU, retrying on CPU.")
                logits = logits.cpu()
                pred   = logits2pred(logits, sigmoid=sigmoid)

            log(f"Preds shape: {pred.shape}")
            timing_checkpoints.append(("Logits", time.time()))
            logits = None

            post_transforms_list = [
                Invertd(keys="pred", orig_keys="image",
                        transform=inf_transform, nearest_interp=True)
            ]
            if "whole-head" in model_file:
                log("Applying KeepLargestConnectedComponentd")
                post_transforms_list.append(
                    KeepLargestConnectedComponentd(
                        keys="pred", applied_labels=[1, 2], num_components=1
                    )
                )

            post_transforms = Compose(post_transforms_list)
            batch_data["pred"] = convert_to_dst_type(
                pred, batch_data["image"], dtype=pred.dtype, device=pred.device
            )[0]
            pred = [post_transforms(x)["pred"] for x in decollate_batch(batch_data)]
            seg  = pred[0][0]

        # ── BRATS Mode ────────────────────────────────────────────────────
        else:
            log("Mode: BRATS")
            image_files = [i for i in [image_file, image_file_2, image_file_3, image_file_4] if i]
            for img in image_files:
                if not os.path.exists(img):
                    raise ValueError(f"Incorrect image filename: \"{img}\"")

            ts = [
                LoadImaged(keys="image", ensure_channel_first=True,
                           dtype=None, allow_missing_keys=True, image_only=False),
                EnsureTyped(keys="image", data_type="tensor",
                            dtype=torch.float, allow_missing_keys=True),
            ]
            if config.get("orientation_ras", False):
                ts.append(Orientationd(keys="image", axcodes="RAS"))
            if config.get("crop_foreground", True):
                ts.append(CropForegroundd(keys="image", source_key="image",
                                          margin=10, allow_smaller=True))
            if config.get("resample_resolution", None) is not None:
                pixdim = list(config["resample_resolution"])
                ts.append(Spacingd(
                    keys=["image"], pixdim=list(pixdim), mode=["bilinear"],
                    dtype=torch.float,
                    min_pixdim=np.array(pixdim) * 0.75,
                    max_pixdim=np.array(pixdim) * 1.25,
                    allow_missing_keys=True,
                ))
            _add_normalization_transforms(ts, "image",
                                          config["normalize_mode"],
                                          config["intensity_bounds"])

            from tqdm import tqdm as _tqdm
            import monai.inferers.utils as _miu

            class QueueTqdm(_tqdm):
                def display(self, msg=None, pos=None):
                    super().display(msg=msg, pos=pos)
                    log_queue.put(self.__str__())

            _miu.tqdm = QueueTqdm

            inf_transform = Compose(ts)
            roi_size      = config["roi_size"]
            sliding_inferrer = SlidingWindowInfererAdapt(
                roi_size=roi_size, sw_batch_size=1, overlap=0.625,
                mode="gaussian", cache_roi_weight_map=False, progress=True
            )
            batch_data      = inf_transform([{"image": image_files}])
            original_affine = batch_data[0]["image"].meta[MetaKeys.ORIGINAL_AFFINE]
            batch_data      = list_data_collate([batch_data])
            data            = batch_data["image"].as_subclass(torch.Tensor).to(
                memory_format=torch.channels_last_3d, device=device
            )
            timing_checkpoints.append(("Preprocessing", time.time()))

            log("Running Inference ...")
            with torch.amp.autocast(device_type=autocast_device, enabled=True):
                logits = sliding_inferrer(inputs=data, network=model)
            timing_checkpoints.append(("Inference", time.time()))

            try:
                pred = logits2pred(logits, sigmoid=sigmoid)
            except RuntimeError as e:
                if not logits.is_cuda:
                    raise e
                logits = logits.cpu()
                pred   = logits2pred(logits, sigmoid=sigmoid)

            timing_checkpoints.append(("Logits", time.time()))
            logits = None

            post_transforms = Compose([
                Invertd(keys="pred", orig_keys="image",
                        transform=inf_transform, nearest_interp=True)
            ])
            batch_data["pred"] = convert_to_dst_type(
                pred, batch_data["image"], dtype=pred.dtype, device=pred.device
            )[0]
            pred = [post_transforms(x)["pred"] for x in decollate_batch(batch_data)]
            seg  = pred[0]
            p2   = 2 * seg.any(0).to(dtype=torch.uint8)
            p2[seg[1:].any(0)] = 1
            p2[seg[2:].any(0)] = 3
            seg  = p2

        log(f"Preds inverted shape: {seg.shape}")
        timing_checkpoints.append(("Preds", time.time()))

        seg = seg.cpu().numpy().astype(np.uint8)
        timing_checkpoints.append(("Convert to array", time.time()))

        os.makedirs(os.path.dirname(result_file), exist_ok=True)
        _, nrrd_header = nrrd.read(image_file)
        nrrd.write(result_file, seg, nrrd_header)
        timing_checkpoints.append(("Save", time.time()))

        log("\n--- Computation Time Log ---")
        prev = start_time
        for name, t in timing_checkpoints:
            log(f"  {name:<25}: {t - prev:.2f} seconds")
            prev = t

        log(f"\nALL DONE. Result saved in: {result_file}")

    except Exception as e:
        log(f"[ERROR] {type(e).__name__}: {str(e)}")
    finally:
        log_queue.put(None)
