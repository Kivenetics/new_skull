# Medical 3D Skull Segmentation Project

A full-stack application for 3D medical image segmentation of skull CT scans. This project enables computationally intensive 3D deep learning segmentation algorithms, wraps a pre-trained MONAI Auto3DSeg model into a REST API, and visualizes the results utilizing a Vite/React application using VTK.js.

## Directory Structure

- `backend/` - FastAPI backend with live inference streaming and PyTorch/MONAI machine learning.
- `frontend/` - React + Vite SPA using VTK.js for interacting with the 3D medical volume data.

---
<img width="500" height="700" alt="image" src="https://github.com/user-attachments/assets/57110316-03ae-4a59-b705-7b11cdd05f6d" />

---

## 🚀 Getting Started

### Prerequisites

To run this project, make sure you have the following installed on your machine:

1. **Node.js** (v16+ recommended) - For the frontend
2. **Python** (v3.10 recommended) - For the backend
3. **NVIDIA GPU** & **CUDA 11.7** - For fast deep learning inference

---

### 1. Backend Setup

The backend handles DICOM-to-NRRD conversion, runs sliding-window inference on the GPU, and streams progress.

1. **Navigate to the backend directory and create a virtual environment:**
   ```bash
   cd backend
   python -m venv venv
   ```

2. **Activate the virtual environment:**
   - **Windows:** `venv\Scripts\activate`
   - **Mac/Linux:** `source venv/bin/activate`

3. **Install the required dependencies:**
   **Important:** You must install these exact versions to avoid breaking the CUDA integration!
   ```bash
   pip install -r requirements.txt
   pip install torch==1.13.1+cu117 --extra-index-url https://download.pytorch.org/whl/cu117
   pip install numpy==1.23.5
   pip install monai==1.5.1 --no-deps
   pip install PySide6 vtk
   ```

4. **Prepare Input Data:**
   - Place your raw DICOM folder into `backend/input/DICOM/PA0/ST0/SE0/`
   - Place your pre-trained model checkpoint into `backend/input/model.pt`

5. **Start the API Server:**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
   *The backend will be running at `http://localhost:8000`*

---

### 2. Frontend Setup

The frontend provides a user interface with segmentation labels allowing you to interactively view the 3D output (e.g., Masseter Muscle, Temporal Muscle, etc.).

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *The frontend will be running at `http://localhost:5173` (or the port specified by Vite).*

---

## 🛠 Features

- **End-to-end Pipeline**: Convert raw DICOM input to RAS-oriented NRRD, evaluate with sliding-window deep learning, and output a segmented `.nrrd` or `.vti` result.
- **Server-Sent Events (SSE)**: View live streaming logs and progress bars directly from the ML backend.
- **Medical 3D Visualization**: Use VTK.js in the browser to smoothly render complex anatomical structures. Toggle structures on or off independently (skull, brain, mandible, muscles).
- **Desktop Viewer fallback**: If the frontend isn't needed, run `python viewer.py output/output_seg.nrrd` from the backend to open a standalone UI.

## 🤝 Troubleshooting

- **CUDA Issues?** Make sure you ran the specific `pip install torch==1.13.1+cu117` setup. If Pip installs a CPU-only Torch version, inference will be exceedingly slow.
- **"Unknown at rule @tailwind" in index.css?** (If using Tailwind) Ensure your PostCSS configuration is properly loading the Tailwind plugins.
- **VTK.js import path issues?** Make sure `@kitware/vtk.js` is installed locally via npm.

---

*This project is built for visualizing volumetric data efficiently without relying on cloud computation for privacy/security.*
