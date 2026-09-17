import { useState } from "react";
import FileUploadField from "../../../components/common/FileUploadField.jsx";

function toFormState(project) {
  return {
    name: project?.name || "",
    location: project?.location || "",
    description: project?.description || "",
    startingPrice: project?.startingPrice ?? "",
    amenities: (project?.amenities || []).join(", "),
    imageUrl: project?.imageUrl || "",
    modelUrl: project?.modelUrl || "",
  };
}

function ProjectFieldsForm({ initialProject, onSubmit, submitLabel }) {
  const [form, setForm] = useState(() => toFormState(initialProject));
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
        name: form.name,
        location: form.location,
        description: form.description,
        startingPrice: Number(form.startingPrice),
        amenities: form.amenities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        imageUrl: form.imageUrl || undefined,
        modelUrl: form.modelUrl || undefined,
      });
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <form className="project-fields-form" onSubmit={handleSubmit}>
      {error && <p className="state-message state-message-error">{error}</p>}

      <label>
        Name
        <input name="name" value={form.name} onChange={handleChange} required />
      </label>

      <label>
        Location
        <input name="location" value={form.location} onChange={handleChange} required />
      </label>

      <label>
        Description
        <textarea
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Starting Price (₹)
        <input
          name="startingPrice"
          type="number"
          min="0"
          value={form.startingPrice}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Amenities (comma-separated)
        <input
          name="amenities"
          value={form.amenities}
          onChange={handleChange}
          placeholder="Pool, Gym, Clubhouse"
        />
      </label>

      <FileUploadField
        label="Project Image"
        accept="image/*"
        value={form.imageUrl}
        onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
      />

      <FileUploadField
        label="3D Model (.glb)"
        accept=".glb,.gltf"
        value={form.modelUrl}
        onChange={(url) => setForm((f) => ({ ...f, modelUrl: url }))}
      />

      <button type="submit" className="btn" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

export default ProjectFieldsForm;
