import axios from "axios";

export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120_000,
});

/** Upload PDF */
export async function uploadPdf(file: File) {
  const form = new FormData();
  form.append("file", file);

  const res = await api.post("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

/** Ask question */
export async function askQuestion(question: string) {
  const res = await api.post("/ask", { question });
  return res.data;
}

/** Summary */
export async function generateSummary() {
  const res = await api.post("/summarize");
  return res.data;
}

/** Risk analysis */
export async function generateRiskAnalysis() {
  const res = await api.post("/risk-analysis");
  return res.data;
}

export default api;