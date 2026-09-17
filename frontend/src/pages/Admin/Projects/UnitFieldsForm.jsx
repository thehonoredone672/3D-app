import { useState } from "react";
import FileUploadField from "../../../components/common/FileUploadField.jsx";

const STATUSES = ["AVAILABLE", "RESERVED", "SOLD"];

function toFormState(unit) {
  return {
    unitNumber: unit?.unitNumber || "",
    floor: unit?.floor ?? "",
    bhk: unit?.bhk ?? "",
    area: unit?.area ?? "",
    price: unit?.price ?? "",
    facing: unit?.facing || "",
    status: unit?.status || "AVAILABLE",
    floorPlanUrl: unit?.floorPlanUrl || "",
  };
}

function UnitFieldsForm({ initialUnit, onSubmit, submitLabel }) {
  const [form, setForm] = useState(() => toFormState(initialUnit));
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        unitNumber: form.unitNumber,
        floor: Number(form.floor),
        bhk: Number(form.bhk),
        area: Number(form.area),
        price: Number(form.price),
        facing: form.facing || undefined,
        status: form.status,
        floorPlanUrl: form.floorPlanUrl || undefined,
      });
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <form className="unit-fields-form" onSubmit={handleSubmit}>
      {error && <p className="state-message state-message-error">{error}</p>}

      <div className="unit-fields-grid">
        <label>
          Unit #
          <input name="unitNumber" value={form.unitNumber} onChange={handleChange} required />
        </label>
        <label>
          Floor
          <input name="floor" type="number" value={form.floor} onChange={handleChange} required />
        </label>
        <label>
          BHK
          <input
            name="bhk"
            type="number"
            min="1"
            value={form.bhk}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Area (sq.ft)
          <input
            name="area"
            type="number"
            min="0"
            value={form.area}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Price (₹)
          <input
            name="price"
            type="number"
            min="0"
            value={form.price}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Facing
          <input name="facing" value={form.facing} onChange={handleChange} />
        </label>
        <label>
          Status
          <select name="status" value={form.status} onChange={handleChange}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <FileUploadField
        label="Floor Plan Image"
        accept="image/*"
        value={form.floorPlanUrl}
        onChange={(url) => setForm((f) => ({ ...f, floorPlanUrl: url }))}
      />

      <button type="submit" className="btn" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

export default UnitFieldsForm;
