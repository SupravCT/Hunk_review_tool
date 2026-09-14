import axios from "axios";

const API_BASE = "http://localhost:8000";

export const runReview = async (repo_path, task_description, diff_source) => {
  const res = await axios.post(`${API_BASE}/review`, {
    repo_path,
    task_description,
    diff_source,
  });
  return res.data;
};

export const revertHunk = async (hunkId) => {
  const res = await axios.post(`${API_BASE}/hunks/${hunkId}/revert`);
  return res.data;
};

export const revertByLabel = async (sessionId, label) => {
  const res = await axios.post(
    `${API_BASE}/sessions/${sessionId}/revert-by-label`,
    null,
    { params: { label } }
  );
  return res.data;
};

export const updateHunkLabel = async (hunkId, newLabel) => {
  const res = await axios.patch(
    `${API_BASE}/hunks/${hunkId}/label`,
    null,
    { params: { new_label: newLabel } }
  );
  return res.data;
};

export const listSessions = async () => {
  const res = await axios.get(`${API_BASE}/sessions`);
  return res.data;
};

export const getSessionHunks = async (sessionId) => {
  const res = await axios.get(`${API_BASE}/sessions/${sessionId}`);
  return res.data;
};