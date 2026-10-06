import { useEffect, useState } from "react";

export default function LogsPanel({ jobId }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!jobId) return;

    setLogs([]);

    const eventSource = new EventSource(
      `http://localhost:8000/infer/${jobId}/stream`,
    );

    eventSource.addEventListener("log", (event) => {
      setLogs((prev) => [...prev, event.data]);
    });

    eventSource.addEventListener("done", () => {
      setLogs((prev) => [...prev, "=== COMPLETE ==="]);
      eventSource.close();
    });

    return () => eventSource.close();
  }, [jobId]);

  return (
    <div className="glass-card p-1 mt-6 overflow-hidden border-cyan/20">
      <div className="bg-dark-800/50 px-4 py-2 border-b border-white/5 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
          Live Inference Stream
        </span>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse"></div>
        </div>
      </div>
      <div className="h-[100%] overflow-y-auto p-4 terminal-window scrollbar-hide text-cyan/80">
        {logs.map((log, i) => (
          <div key={i} className="mb-1">
            <span className="text-blue mr-2">
              [{new Date().toLocaleTimeString()}]
            </span>
            <span
              className={log.includes("COMPLETE") ? "text-mint font-bold" : ""}
            >
              {log}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
