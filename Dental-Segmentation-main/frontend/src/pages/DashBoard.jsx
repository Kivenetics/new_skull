import { useState } from "react";
import UploadSection from "../components/dashboard/UploadSection";
import ConvertSection from "../components/dashboard/ConvertSection";
import InferenceSection from "../components/dashboard/InferenceSection";
import LogsPanel from "../components/dashboard/LogsPanel";
import ResultsPanel from "../components/dashboard/ResultsPanel";

export default function DashBoard() {
  const [jobId, setJobId] = useState(null);

  return (
    <main className="min-h-screen bg-dark-900 grid-bg flex flex-col pt-28 px-10 pb-10">
      <div className="max-w-[1800px] mx-auto w-full flex-1 flex flex-col">
        {/* Header - More Breathable */}
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">
              Skull <span className="gradient-text">Segmentation</span> Center
            </h1>
            <p className="text-cyan font-bold text-xs tracking-[0.4em] uppercase mt-4 opacity-70">
              Neural Engine V1.5.1 — Hardware Accelerated
            </p>
          </div>
          <div className="flex gap-4 mb-1">
            <div className="px-4 py-2 glass-card border-cyan/20 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-mint animate-pulse" />
              <span className="text-[10px] font-bold text-white uppercase">
                System Online
              </span>
            </div>
          </div>
        </header>

        {/* Main Workspace - 2 Column Layout with Full Height */}
        <div className="flex-1 grid grid-cols-12 gap-10">
          {/* LEFT: Controls (Pipeline) - Spans 4 columns */}
          <div className="col-span-4 flex flex-col gap-6">
            <div className="flex-1 space-y-6">
              <UploadSection />
              <ConvertSection />
              <InferenceSection setJobId={setJobId} />
            </div>

            {/* Results moved here to balance the height */}
            <ResultsPanel />
          </div>

          {/* RIGHT: Visualizer/Logs - Spans 8 columns */}
          <div className="col-span-8 flex flex-col">
            <div className="glass-card flex-1 flex flex-col border-cyan/10 overflow-hidden">
              <div className="bg-dark-800/80 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40" />
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">
                    Live Inference stream
                  </span>
                </div>
                <span className="text-[10px] text-cyan/50 font-mono">
                  ID: {jobId || "WAITING"}
                </span>
              </div>

              {/* Expanded Log Viewport */}
              <div className="flex-1 p-8 overflow-hidden">
                <LogsPanel jobId={jobId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
