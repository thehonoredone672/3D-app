import api from "./api.js";

export function createBuilding(data) {
  return api.post("/buildings", data).then((res) => res.data);
}

export function updateBuilding(id, data) {
  return api.put(`/buildings/${id}`, data).then((res) => res.data);
}

export function deleteBuilding(id) {
  return api.delete(`/buildings/${id}`);
}
