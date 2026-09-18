import api from "./api.js";

export function createScan(data) {
  return api.post("/scans", data).then((res) => res.data);
}

export function getScan(id) {
  return api.get(`/scans/${id}`).then((res) => res.data);
}

export function getScanStatus(id) {
  return api.get(`/scans/${id}/status`).then((res) => res.data);
}

export function processScan(id) {
  return api.post(`/scans/${id}/process`).then((res) => res.data);
}

export function approveScan(id) {
  return api.post(`/scans/${id}/approve`).then((res) => res.data);
}

export function publishScan(id) {
  return api.post(`/scans/${id}/publish`).then((res) => res.data);
}

export function deleteScan(id) {
  return api.delete(`/scans/${id}`);
}

export function uploadCapture(scanId, blob) {
  const formData = new FormData();
  formData.append("file", blob, "capture.jpg");
  return api
    .post(`/scans/${scanId}/captures`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
}
