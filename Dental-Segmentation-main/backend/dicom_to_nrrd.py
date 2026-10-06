import os
import numpy as np
import SimpleITK as sitk

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
DICOM_DIR  = os.path.join(BASE_DIR, "input", "DICOM", "PA0", "ST0", "SE0")
OUTPUT_LPS = os.path.join(BASE_DIR, "output", "skull_ct.nrrd")
OUTPUT_RAS = os.path.join(BASE_DIR, "output", "skull_ct_RAS.nrrd")


def convert_dicom_to_ras_nrrd(dicom_dir=DICOM_DIR,
                               output_lps=OUTPUT_LPS,
                               output_ras=OUTPUT_RAS):
    print(f"Reading DICOM from: {dicom_dir}")
    reader = sitk.ImageSeriesReader()
    dicom_names = reader.GetGDCMSeriesFileNames(dicom_dir)
    if not dicom_names:
        raise ValueError(f"No DICOM files found in: {dicom_dir}")
    reader.SetFileNames(dicom_names)
    img = reader.Execute()

    os.makedirs(os.path.dirname(output_lps), exist_ok=True)
    sitk.WriteImage(img, output_lps)
    print(f"Saved LPS NRRD: {output_lps}")

    # LPS → RAS
    origin    = np.array(img.GetOrigin())
    direction = np.array(img.GetDirection()).reshape(3, 3)
    lps_to_ras = np.diag([-1, -1, 1])

    img.SetDirection((lps_to_ras @ direction).flatten())
    img.SetOrigin(tuple(lps_to_ras @ origin))

    sitk.WriteImage(img, output_ras)
    print(f"Saved RAS NRRD:  {output_ras}")
    print(f"Size:     {img.GetSize()}")
    print(f"Spacing:  {img.GetSpacing()}")

    return output_ras


if __name__ == "__main__":
    convert_dicom_to_ras_nrrd()
