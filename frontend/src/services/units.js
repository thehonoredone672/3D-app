import api from "./api.js";

export function getUnit(id) {
  return api.get(`/units/${id}`).then((res) => res.data);
}

export function createUnit(data) {
  return api.post("/units", data).then((res) => res.data);
}

export function updateUnit(id, data) {
  return api.put(`/units/${id}`, data).then((res) => res.data);
}

export function deleteUnit(id) {
  return api.delete(`/units/${id}`);
}
