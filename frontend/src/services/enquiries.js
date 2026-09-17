import api from "./api.js";

export function createEnquiry(payload) {
  return api.post("/enquiries", payload).then((res) => res.data);
}

export function listEnquiries() {
  return api.get("/enquiries").then((res) => res.data);
}

export function updateEnquiryStatus(id, status) {
  return api.put(`/enquiries/${id}`, { status }).then((res) => res.data);
}
