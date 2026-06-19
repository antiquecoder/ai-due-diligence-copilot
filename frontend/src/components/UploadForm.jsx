import { useState } from "react";
import api from "../api";

function UploadForm() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(
        `Uploaded successfully. Chunks: ${res.data.total_chunks}`
      );
    } catch (error) {
      setMessage("Upload failed");
      console.error(error);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleUpload}>
        Upload PDF
      </button>

      <p>{message}</p>
    </div>
  );
}

export default UploadForm;