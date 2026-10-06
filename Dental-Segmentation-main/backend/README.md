<h1 align="center">Skull Segmentation API</h1>

<h4 align="center">FastAPI-based medical image segmentation backend with live inference streaming for whole-head CT scans.</h4>

---

## Overview

- Medical image segmentation of skull CT scans requires computationally intensive 3D deep learning models that are difficult to integrate into clinical or research workflows
- Automated skull segmentation is critical for surgical planning, implant design, and neuroimaging research
- This project wraps a pre-trained MONAI Auto3DSeg segmentation model into a REST API that accepts DICOM input, converts it to RAS-oriented NRRD, runs sliding-window inference on GPU, and streams real-time progress logs to any connected client via Server-Sent Events (SSE)

---

## Architecture Overview

**Core Components:**
- `dicom_to_nrrd.py` — Converts raw DICOM series to LPS NRRD, then reorients to RAS coordinate space
- `inference.py` — Loads the segmentation model checkpoint, runs MONAI sliding-window inference, and pushes all logs (including tqdm progress) into a thread-safe queue
- `main.py` — FastAPI application exposing REST endpoints; spawns inference in a background thread and streams logs to clients via SSE
- `viewer.py` — PySide6 + VTK desktop viewer for visualizing segmentation output with per-label toggle and STL export

**Data Flow:**
```
DICOM folder (input/)
      │
      ▼
POST /convert
      │
      ▼
skull_ct_RAS.nrrd (output/)
      │
      ▼
POST /infer  ──► Background Thread ──► GPU Inference (125 sliding window patches)
      │                                        │
      ▼                                        ▼
job_id returned                        Queue (log lines + tqdm)
      │                                        │
      ▼                                        ▼
GET /infer/{job_id}/stream  ◄── SSE EventSourceResponse
      │
      ▼
output_seg.nrrd (output/)
      │
      ▼
POST /view  ──► viewer.py (desktop VTK window)
      │
      ▼
Export visible segments as STL
```

**External Integrations:**
- MONAI (Medical Open Network for AI) — transform pipeline and sliding window inferrer
- PyTorch + CUDA 11.7 — GPU-accelerated model inference
- SimpleITK — DICOM reading and coordinate space conversion
- pynrrd — NRRD file reading and writing
- VTK + PySide6 — 3D desktop visualization and STL export

---

## Tech Stack

| Layer         | Technology Used                              |
|--------------|----------------------------------------------|
| Backend      | FastAPI 0.129.0, Uvicorn 0.40.0              |
| ML Framework | PyTorch 1.13.1+cu117, MONAI 1.5.1            |
| Image I/O    | SimpleITK 2.4.1, pynrrd 1.1.3               |
| Streaming    | sse-starlette 3.2.0 (Server-Sent Events)     |
| Viewer       | VTK, PySide6                                 |
| GPU          | NVIDIA CUDA 11.7 (tested on RTX 2050)        |
| Runtime      | Python 3.10, Windows 11                      |
| Other Tools  | tqdm 4.67.1, numpy 1.23.5                    |

---

## Project Structure

```
fastapi_skul_test02/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md           # Bug report template
│   │   ├── feature_request.md      # Feature request template
│   │   └── inference_issue.md      # Inference-specific issue template
│   ├── PULL_REQUEST_TEMPLATE.md    # PR checklist template
│   └── CODEOWNERS                  # Auto-assign reviewers
├── input/
│   ├── DICOM/                      # Raw DICOM series (PA0/ST0/SE0/)
│   │   └── PA0/ST0/SE0/
│   └── model.pt                    # Pre-trained whole-head segmentation model
├── output/                         # All generated files saved here automatically
│   ├── skull_ct.nrrd               # LPS NRRD (intermediate)
│   ├── skull_ct_RAS.nrrd           # RAS-reoriented input for inference
│   └── output_seg.nrrd             # Final segmentation result
├── venv/                           # Python virtual environment
├── main.py                         # FastAPI app — endpoints, job management, SSE
├── inference.py                    # Model loading, preprocessing, inference logic
├── dicom_to_nrrd.py                # DICOM → LPS → RAS NRRD conversion
├── viewer.py                       # PySide6 + VTK desktop segmentation viewer
└── requirements.txt                # Python dependencies
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fastapi_skul_test02
```

### 2. Enable PowerShell Script Execution (Windows — one time only)

Open PowerShell as Administrator and run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 3. Create and Activate Virtual Environment

```powershell
python -m venv venv
venv\Scripts\activate
```

### 4. Install Dependencies

```bash
# Install standard packages
pip install -r requirements.txt

# Install PyTorch with CUDA 11.7 (required — do NOT use plain pip install torch)
pip install torch==1.13.1+cu117 --extra-index-url https://download.pytorch.org/whl/cu117

# Install numpy (pin to exact version)
pip install numpy==1.23.5

# Install MONAI without dependency overrides
pip install monai==1.5.1 --no-deps

# Install viewer dependencies
pip install PySide6 vtk
```

> ⚠️ Always use `--no-deps` when installing monai. Without it, pip will upgrade torch to a CPU-only version and break CUDA.

### 5. Place Required Files

- Copy your DICOM folder into `input/DICOM/PA0/ST0/SE0/`
- Copy your model checkpoint into `input/model.pt`

### 6. Run the Project

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

API will be live at `http://localhost:8000`  
Interactive docs at `http://localhost:8000/docs`

---

## API Usage

### Step 1 — Convert DICOM to NRRD

```bash
curl -X POST http://localhost:8000/convert
```

Expected:
```json
{
  "status": "success",
  "output": "...\\output\\skull_ct_RAS.nrrd"
}
```

### Step 2 — Start Inference

```bash
curl -X POST http://localhost:8000/infer \
  -H "Content-Type: application/json" \
  -d "{}"
```

Expected:
```json
{
  "job_id": "abc-123-...",
  "status": "started"
}
```

### Step 3 — Stream Live Progress

```bash
curl -N http://localhost:8000/infer/{job_id}/stream
```

Live output example:
```
event: log
data: Loading model from: ...\input\model.pt

event: log
data: Running Inference ...

event: log
data:  21%|██  | 26/125 [02:42<12:08, 7.36s/it]

event: done
data: INFERENCE COMPLETE
```

### Step 4 — Launch Desktop Viewer

```bash
curl -X POST "http://localhost:8000/view?filename=output_seg.nrrd"
```

Opens a VTK desktop window with:
- Per-label visibility toggle (skull, brain, mandible, muscles, etc.)
- Show All / Hide All controls
- Export visible segments as a single STL
- Export each segment as a separate STL file

### All Endpoints

| Method | Endpoint                 | Description                              |
|--------|--------------------------|------------------------------------------|
| GET    | `/`                      | API status                               |
| GET    | `/health`                | GPU status, inference state, output files|
| POST   | `/convert`               | Convert DICOM to RAS NRRD                |
| POST   | `/infer`                 | Start inference job                      |
| GET    | `/infer/{job_id}/stream` | Stream live inference logs via SSE       |
| GET    | `/infer/{job_id}/status` | Status of a specific job                 |
| GET    | `/jobs`                  | List all jobs and statuses               |
| GET    | `/files`                 | List all files in output directory       |
| POST   | `/view`                  | Launch desktop VTK viewer                |

---

## Segmentation Labels

| Label | Structure                  |
|-------|----------------------------|
| 1     | Masseter Muscle            |
| 2     | Temporal Muscle            |
| 3     | Lateral Pterygoid Muscle   |
| 4     | Medial Pterygoid Muscle    |
| 5     | Eyeball                    |
| 6     | Brain                      |
| 7     | Skull                      |
| 8     | Mandible                   |
| 9     | Rachis                     |

---

## Viewer Usage

The viewer can be launched via the API or directly from the terminal:

```bash
# Via API (non-blocking, server keeps running)
curl -X POST "http://localhost:8000/view?filename=output_seg.nrrd"

# Directly from terminal
python viewer.py

# With a specific file
python viewer.py output\output_seg.nrrd
```

---

## Docker Setup

### Build Image

```bash
docker build -t skull-segmentation-api .
```

### Run Container

```bash
docker run --gpus all -p 8000:8000 \
  -v ./input:/app/input \
  -v ./output:/app/output \
  skull-segmentation-api
```

> ⚠️ Docker GPU support requires [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html).

---

## Environment Variables

No `.env` file is required for default local usage. All paths are resolved relative to the project directory automatically.

| Variable Name  | Description                       | Default                    |
|---------------|-----------------------------------|----------------------------|
| `MODEL_FILE`  | Path to model checkpoint          | `input/model.pt`           |
| `IMAGE_FILE`  | Path to RAS NRRD input            | `output/skull_ct_RAS.nrrd` |
| `RESULT_FILE` | Path to save segmentation output  | `output/output_seg.nrrd`   |

---

## Deployment

- **Platform:** Local Windows machine or Linux server with NVIDIA GPU
- **CUDA Requirement:** CUDA 11.7 with `torch==1.13.1+cu117`
- **GPU Minimum:** 4GB VRAM (tested on RTX 2050)
- **Build:** Activate venv, install dependencies as above, run uvicorn
- **Production:** Replace `--reload` with `--workers 1` (inference is single-threaded by design due to GPU memory constraints)

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1
```

---

## Testing

### Health Check

```bash
curl http://localhost:8000/health
```

Expected:
```json
{
  "status": "ok",
  "device": "NVIDIA GeForce RTX 2050",
  "inference_running": false,
  "output_files": []
}
```

### Verify GPU and Packages

```bash
python -c "import torch; print(torch.__version__); print(torch.cuda.is_available())"
python -c "import monai; print(monai.__version__)"
python -c "import numpy; print(numpy.__version__)"
```

Expected:
```
1.13.1+cu117
True
1.5.1
1.23.5
```

### Check Output Files After Inference

```bash
curl http://localhost:8000/files
```

Expected:
```json
{
  "output_dir": "...\\output",
  "files": ["skull_ct.nrrd", "skull_ct_RAS.nrrd", "output_seg.nrrd"]
}
```

---


---

## Project Status

- 🟢 In Development
