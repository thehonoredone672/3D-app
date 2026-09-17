import { useEffect, useState } from "react";
import { listEnquiries, updateEnquiryStatus } from "../../../services/enquiries.js";
import Loading from "../../../components/common/Loading.jsx";
import ErrorMessage from "../../../components/common/ErrorMessage.jsx";

const STATUSES = ["NEW", "CONTACTED", "CLOSED"];

function EnquiriesList() {
  const [enquiries, setEnquiries] = useState([]);
  const [status, setStatus] = useState("loading");

  function load() {
    setStatus("loading");
    listEnquiries()
      .then((data) => {
        setEnquiries(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }

  useEffect(load, []);

  async function handleStatusChange(enquiry, newStatus) {
    await updateEnquiryStatus(enquiry.id, newStatus);
    load();
  }

  return (
    <div className="admin-enquiries">
      <h1>Enquiries</h1>

      {status === "loading" && <Loading label="Loading enquiries..." />}
      {status === "error" && <ErrorMessage message="Could not load enquiries." />}
      {status === "ready" && enquiries.length === 0 && (
        <p className="state-message">No enquiries yet.</p>
      )}

      {status === "ready" && enquiries.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Project</th>
              <th>Unit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((enquiry) => (
              <tr key={enquiry.id}>
                <td>{enquiry.name}</td>
                <td>{enquiry.phone}</td>
                <td>{enquiry.project?.name || "—"}</td>
                <td>{enquiry.unit?.unitNumber || "—"}</td>
                <td>
                  <select
                    value={enquiry.status}
                    onChange={(event) => handleStatusChange(enquiry, event.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default EnquiriesList;
