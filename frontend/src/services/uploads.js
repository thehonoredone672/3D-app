import api from "./api.js";

export function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  return api
    .post("/uploads", formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((res) => res.data.url);
}
