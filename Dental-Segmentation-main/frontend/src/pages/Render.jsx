import { useState, useCallback } from "react";
import VtkViewer from "../components/render/VtkViewer";
import SegmentationPanel from "../components/render/SegmentationPanel";

function Render() {
  const [visibleLabels, setVisibleLabels] = useState(
    () => new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]),
  );
  const [isLoading, setIsLoading] = useState(true);

  const toggleLabel = useCallback((label) => {
    setVisibleLabels((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }, []);

  const handleLoaded = useCallback(() => setIsLoading(false), []);

  return (
    <div className="app-layout">
      <SegmentationPanel visibleLabels={visibleLabels} onToggle={toggleLabel} />
      <main className="vtk-canvas">
        <VtkViewer visibleLabels={visibleLabels} onLoaded={handleLoaded} />
        {isLoading && (
          <div className="loading-overlay" id="loading-overlay">
            <div className="loading-spinner" />
            <p>Loading volume data…</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Render;
