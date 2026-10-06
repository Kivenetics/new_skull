import { useState } from "react";
import API from "../../api";

export default function UploadSection() {
  const [files, setFiles] = useState([]);

  const handleUpload = async () => {
    const formData = new FormData();

    for (let file of files) {
      formData.append("files", file);
    }

    const res = await API.post("/upload-dicom", formData);
    alert(`Uploaded ${res.data.count} files`);
  };

  return (
    <div className="glass-card p-6 glass-card-hover">
      <h2 className="text-cyan font-display text-sm tracking-widest uppercase mb-4 flex items-center gap-2">
        <span className="opacity-50">01</span> Upload DICOM
      </h2>
      <div className="flex flex-col gap-4">
        <input
          type="file"
          multiple
          webkitdirectory="true"
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-dark-600 file:text-cyan hover:file:bg-dark-500 cursor-pointer"
          onChange={(e) => setFiles(e.target.files)}
        />
        <button className="btn-primary" onClick={handleUpload}>
          Sync to Cloud
        </button>
      </div>
    </div>
  );
}
