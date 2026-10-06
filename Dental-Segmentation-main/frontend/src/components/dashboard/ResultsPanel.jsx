import { useEffect, useState } from "react";
import API from "../../api";

export default function ResultsPanel() {
  const [files, setFiles] = useState([]);

  const loadFiles = async () => {
    const res = await API.get("/files");
    setFiles(res.data.files);
  };

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <div className="glass-card p-6">
      <h2 className="gradient-text font-display text-sm tracking-widest uppercase mb-4">
        Generated Assets
      </h2>
      <div className="space-y-3">
        {files.map((file, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-cyan/30 transition-all"
          >
            <span className="text-xs text-gray-300 truncate max-w-[150px]">
              {file}
            </span>
            <a
              href={`http://localhost:8000/download/${file}`}
              className="text-[10px] font-bold text-cyan uppercase tracking-tighter hover:text-white transition-colors"
            >
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
