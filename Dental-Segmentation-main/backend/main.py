import asyncio
import os
import queue
import threading
import uuid


from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from inference import run_inference
from dicom_to_nrrd import convert_dicom_to_ras_nrrd, DICOM_DIR, OUTPUT_RAS

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
INPUT_DIR  = os.path.join(BASE_DIR, "input")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")

os.makedirs(OUTPUT_DIR, exist_ok=True)

app = FastAPI(title="Skull Segmentation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

jobs: dict[str, dict] = {}
_inference_lock = threading.Lock()


class InferenceRequest(BaseModel):
    model_file:   str = os.path.join(BASE_DIR, "input",  "model.pt")
    image_file:   str = os.path.join(BASE_DIR, "output", "skull_ct_RAS.nrrd")
    result_file:  str = os.path.join(BASE_DIR, "output", "output_seg.nrrd")
    save_mode:    Optional[str] = None
    image_file_2: Optional[str] = None
    image_file_3: Optional[str] = None
    image_file_4: Optional[str] = None


def sanitize(path):
    if path and os.path.exists(path):
        return path
    return None


# ── GET / ─────────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "message": "Skull Segmentation API",
        "docs":    "http://localhost:8000/docs",
        "health":  "http://localhost:8000/health"
    }


# ── POST /convert — DICOM → RAS NRRD ─────────────────────────────────────────
@app.post("/convert")
async def convert_dicom():
    """Convert DICOM from input/DICOM/ to output/skull_ct_RAS.nrrd"""
    if not os.path.exists(DICOM_DIR):
        raise HTTPException(
            status_code=404,
            detail=f"DICOM folder not found: {DICOM_DIR}"
        )
    try:
        output_path = convert_dicom_to_ras_nrrd()
        return {"status": "success", "output": output_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── POST /infer ───────────────────────────────────────────────────────────────
@app.post("/infer")
async def start_inference(req: InferenceRequest):
    if _inference_lock.locked():
        raise HTTPException(
            status_code=409,
            detail="Inference already running. Check /jobs for active job_id."
        )

    job_id = str(uuid.uuid4())
    q: queue.Queue = queue.Queue()
    jobs[job_id] = {"queue": q, "status": "running"}

    def _run():
        with _inference_lock:
            try:
                run_inference(
                    model_file=req.model_file,
                    image_file=req.image_file,
                    result_file=req.result_file,
                    log_queue=q,
                    save_mode=req.save_mode,
                    image_file_2=sanitize(req.image_file_2),
                    image_file_3=sanitize(req.image_file_3),
                    image_file_4=sanitize(req.image_file_4),
                )
                jobs[job_id]["status"] = "done"
            except Exception as e:
                jobs[job_id]["status"] = f"error: {e}"
                q.put(f"[ERROR] {e}")
                q.put(None)

    threading.Thread(target=_run, daemon=True).start()
    return {"job_id": job_id, "status": "started"}


# ── GET /infer/{job_id}/stream ────────────────────────────────────────────────
@app.get("/infer/{job_id}/stream")
async def stream_logs(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    q: queue.Queue = jobs[job_id]["queue"]

    async def event_generator():
        while True:
            try:
                line = await asyncio.get_event_loop().run_in_executor(
                    None, lambda: q.get(timeout=1.0)
                )
                if line is None:
                    yield {"event": "done", "data": "INFERENCE COMPLETE"}
                    break
                yield {"event": "log", "data": line}
            except queue.Empty:
                yield {"event": "ping", "data": ""}

    return EventSourceResponse(event_generator())


# ── GET /infer/{job_id}/status ────────────────────────────────────────────────
@app.get("/infer/{job_id}/status")
async def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"job_id": job_id, "status": jobs[job_id]["status"]}


# ── GET /jobs ─────────────────────────────────────────────────────────────────
@app.get("/jobs")
async def list_jobs():
    return {jid: {"status": jobs[jid]["status"]} for jid in jobs}


# ── GET /files — list output files ───────────────────────────────────────────
@app.get("/files")
async def list_output_files():
    files = os.listdir(OUTPUT_DIR) if os.path.exists(OUTPUT_DIR) else []
    return {
        "output_dir": OUTPUT_DIR,
        "files": files
    }


# ── GET /health ───────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    import torch
    gpu     = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU only"
    outputs = os.listdir(OUTPUT_DIR) if os.path.exists(OUTPUT_DIR) else []
    return {
        "status":            "ok",
        "device":            gpu,
        "inference_running": _inference_lock.locked(),
        "input_dir":         INPUT_DIR,
        "output_dir":        OUTPUT_DIR,
        "output_files":      outputs,
    }
@app.post("/view")
async def launch_viewer(filename: str = "output_seg.nrrd"):
    """Launch the desktop VTK viewer for a segmentation result."""
    nrrd_path = os.path.join(OUTPUT_DIR, filename)

    if not os.path.exists(nrrd_path):
        raise HTTPException(
            status_code=404,
            detail=f"File not found: {nrrd_path}. Run /infer first."
        )

    # Launch viewer in a separate process — non-blocking
    subprocess.Popen(
        [sys.executable, os.path.join(BASE_DIR, "viewer.py"), nrrd_path],
        creationflags=subprocess.CREATE_NEW_CONSOLE  # Windows: opens new window
    )

    return {
        "status": "launched",
        "file":   nrrd_path
    }

#to upload DICOM files and trigger conversion

import shutil
from fastapi import UploadFile, File
from typing import List

@app.post("/upload-dicom")
async def upload_dicom(files: List[UploadFile] = File(...)):
    target_dir = os.path.join(INPUT_DIR, "DICOM", "PA0", "ST0", "SE0")

    if os.path.exists(target_dir):
        shutil.rmtree(target_dir)

    os.makedirs(target_dir, exist_ok=True)

    for file in files:
        # 🔥 FIX: remove any folder structure
        filename = os.path.basename(file.filename)

        file_path = os.path.join(target_dir, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    return {"status": "uploaded", "count": len(files)}



#new api endpoints for exporting STL files from the viewer
from fastapi.responses import FileResponse

@app.get("/download/{filename}")
async def download_file(filename: str):
    file_path = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)