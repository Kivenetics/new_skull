import { LABEL_COLORS } from "./VtkViewer";

export default function SegmentationPanel({ visibleLabels, onToggle }) {
  return (
    <aside className="seg-panel">
      <div className="seg-panel__header">
        <div className="seg-panel__icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
        </div>
        <h2>Segmentation Labels</h2>
      </div>

      <p className="seg-panel__subtitle">
        Toggle anatomical structures on or off
      </p>

      <div className="seg-panel__list">
        {Object.entries(LABEL_COLORS).map(([labelStr, { name, rgb }]) => {
          const label = Number(labelStr);
          const active = visibleLabels.has(label);
          const cssColor = `rgb(${Math.round(rgb[0] * 255)}, ${Math.round(rgb[1] * 255)}, ${Math.round(rgb[2] * 255)})`;

          return (
            <button
              key={label}
              id={`label-toggle-${label}`}
              className={`seg-panel__item ${active ? "seg-panel__item--active" : ""}`}
              onClick={() => onToggle(label)}
              title={`Toggle ${name}`}
            >
              <span
                className="seg-panel__swatch"
                style={{
                  background: active ? cssColor : "transparent",
                  borderColor: cssColor,
                }}
              />
              <span className="seg-panel__label-name">{name}</span>
              <span
                className={`seg-panel__toggle ${active ? "seg-panel__toggle--on" : ""}`}
              >
                <span className="seg-panel__toggle-thumb" />
              </span>
            </button>
          );
        })}
      </div>

      <div className="seg-panel__actions">
        <button
          className="seg-panel__btn"
          onClick={() => {
            // Show all
            Object.keys(LABEL_COLORS).forEach((k) => {
              if (!visibleLabels.has(Number(k))) onToggle(Number(k));
            });
          }}
        >
          Show All
        </button>
        <button
          className="seg-panel__btn seg-panel__btn--outline"
          onClick={() => {
            // Hide all
            Object.keys(LABEL_COLORS).forEach((k) => {
              if (visibleLabels.has(Number(k))) onToggle(Number(k));
            });
          }}
        >
          Hide All
        </button>
      </div>

      <div className="seg-panel__footer">
        <span className="seg-panel__badge">
          {visibleLabels.size} / 9 active
        </span>
      </div>
    </aside>
  );
}
