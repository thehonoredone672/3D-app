import { useState } from "react";
import { createEnquiry } from "../../services/enquiries.js";
import "./EnquiryForm.css";

const initialForm = { name: "", phone: "", email: "", preferredDate: "", message: "" };

function EnquiryForm({ projectId, unitId, includeDate = false, submitLabel = "Send Message" }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      await createEnquiry({
        name: form.name,
        phone: form.phone,
        email: form.email,
        message: form.message || undefined,
        preferredDate: includeDate && form.preferredDate ? form.preferredDate : undefined,
        projectId: projectId || undefined,
        unitId: unitId || undefined,
      });
      setStatus("success");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "success") {
    return (
      <p className="enquiry-success">
        Thanks! We've received your request and will get back to you shortly.
      </p>
    );
  }

  return (
    <form className="enquiry-form" onSubmit={handleSubmit}>
      {error && <p className="state-message state-message-error">{error}</p>}

      <label>
        Name
        <input name="name" value={form.name} onChange={handleChange} required />
      </label>

      <label>
        Phone
        <input name="phone" type="tel" value={form.phone} onChange={handleChange} required />
      </label>

      <label>
        Email
        <input name="email" type="email" value={form.email} onChange={handleChange} required />
      </label>

      {includeDate && (
        <label>
          Preferred Date
          <input
            name="preferredDate"
            type="date"
            value={form.preferredDate}
            onChange={handleChange}
          />
        </label>
      )}

      <label>
        Message
        <textarea name="message" rows={3} value={form.message} onChange={handleChange} />
      </label>

      <button type="submit" className="btn" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending..." : submitLabel}
      </button>
    </form>
  );
}

export default EnquiryForm;
