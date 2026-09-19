import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { DETAIL_PRESETS, pointCountForPreset } from "../../lib/capturePoints.js";
import { savePendingScanConfig } from "../../lib/scanConfig.js";
import "./ObjectSetup.css";

const CHECKLIST_ITEMS = [
  "Keep the object completely still",
  "Use consistent, even lighting",
  "Avoid moving objects nearby",
  "Clean the camera lens",
  "Keep the entire object visible",
];

const SIZE_OPTIONS = [
  { id: "small", label: "Small", hint: "e.g. a bottle, a shoe", objectSize: 0.2 },
  { id: "medium", label: "Medium", hint: "e.g. a toy, a bag", objectSize: 0.4 },
  { id: "large", label: "Large", hint: "e.g. a chair", objectSize: 0.9 },
];

function ObjectSetup() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(() => CHECKLIST_ITEMS.map(() => false));
  const [objectLabel, setObjectLabel] = useState("");
  const [sizeId, setSizeId] = useState("small");
  const [detailLevel, setDetailLevel] = useState("STANDARD");
  const [customH, setCustomH] = useState(12);
  const [customV, setCustomV] = useState(4);

  const allChecked = checked.every(Boolean);
  const pointCount =
    detailLevel === "CUSTOM"
      ? pointCountForPreset("CUSTOM", { horizontalDensity: customH, verticalDensity: customV })
      : pointCountForPreset(detailLevel);

  function toggleCheck(index) {
    setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }

  function handleStart() {
    const objectSize = SIZE_OPTIONS.find((s) => s.id === sizeId)?.objectSize ?? 0.2;
    savePendingScanConfig({
      objectLabel: objectLabel.trim() || "Untitled object",
      objectSize,
      detailLevel,
      horizontalDensity: detailLevel === "CUSTOM" ? customH : undefined,
      verticalDensity: detailLevel === "CUSTOM" ? customV : undefined,
    });
    navigate("/new/capture");
  }

  return (
    <div className="object-setup">
      <header className="object-setup-header">
        <Link to="/" className="object-setup-back">
          ←
        </Link>
        <h1>Prepare the object</h1>
      </header>

      <label className="object-setup-label">
        What are you scanning?
        <input
          type="text"
          value={objectLabel}
          onChange={(e) => setObjectLabel(e.target.value)}
          placeholder="e.g. Bottle"
          className="object-setup-input"
        />
      </label>

      <fieldset className="object-setup-fieldset">
        <legend>Object size</legend>
        <div className="object-setup-options">
          {SIZE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`chip ${sizeId === opt.id ? "chip-active" : ""}`}
              onClick={() => setSizeId(opt.id)}
            >
              {opt.label}
              <span className="object-setup-option-hint">{opt.hint}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="object-setup-fieldset">
        <legend>Detail level</legend>
        <div className="object-setup-options">
          {Object.entries(DETAIL_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              className={`chip ${detailLevel === key ? "chip-active" : ""}`}
              onClick={() => setDetailLevel(key)}
            >
              {preset.label}
              <span className="object-setup-option-hint">
                {preset.horizontalDensity * preset.verticalDensity} points
              </span>
            </button>
          ))}
          <button
            type="button"
            className={`chip ${detailLevel === "CUSTOM" ? "chip-active" : ""}`}
            onClick={() => setDetailLevel("CUSTOM")}
          >
            Custom
            <span className="object-setup-option-hint">{customH * customV} points</span>
          </button>
        </div>

        {detailLevel === "CUSTOM" && (
          <div className="object-setup-custom">
            <label>
              Viewpoints per ring: {customH}
              <input
                type="range"
                min="4"
                max="36"
                value={customH}
                onChange={(e) => setCustomH(Number(e.target.value))}
              />
            </label>
            <label>
              Elevation rings: {customV}
              <input
                type="range"
                min="1"
                max="16"
                value={customV}
                onChange={(e) => setCustomV(Number(e.target.value))}
              />
            </label>
          </div>
        )}
      </fieldset>

      <div className="object-setup-checklist">
        {CHECKLIST_ITEMS.map((item, i) => (
          <label key={item} className="object-setup-check">
            <input type="checkbox" checked={checked[i]} onChange={() => toggleCheck(i)} />
            {item}
          </label>
        ))}
      </div>

      <button className="btn btn-primary btn-large" disabled={!allChecked} onClick={handleStart}>
        Start ({pointCount} viewpoints)
      </button>
    </div>
  );
}

export default ObjectSetup;
