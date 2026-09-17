import api from "./api.js";

export function listProjects() {
  return api.get("/projects").then((res) => res.data);
}

export function getProject(id) {
  return api.get(`/projects/${id}`).then((res) => res.data);
}

export function createProject(data) {
  return api.post("/projects", data).then((res) => res.data);
}

export function updateProject(id, data) {
  return api.put(`/projects/${id}`, data).then((res) => res.data);
}

export function deleteProject(id) {
  return api.delete(`/projects/${id}`);
}
