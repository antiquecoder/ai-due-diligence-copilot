import { useState } from "react";
import api from "../api";

function AskQuestion() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    try {
      setLoading(true);
      setAnswer("");
      setSources([]);

      const res = await api.post("/ask", {
        question: question,
      });

      setAnswer(res.data.answer);
      setSources(res.data.source_chunks || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSummary = async () => {
    try {
      setLoading(true);
      setAnswer("");
      setSources([]);

      const res = await api.post("/summarize");

      setAnswer(res.data.summary);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRiskAnalysis = async () => {
    try {
      setLoading(true);
      setAnswer("");
      setSources([]);

      const res = await api.post("/risk-analysis");

      setAnswer(res.data.risk_analysis);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Ask a Question</h2>

      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask about the document..."
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "16px",
          marginBottom: "15px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          boxSizing: "border-box",
        }}
      />

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={handleAsk}
          disabled={loading}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Ask
        </button>

        <button
          onClick={handleSummary}
          disabled={loading}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Summarize
        </button>

        <button
          onClick={handleRiskAnalysis}
          disabled={loading}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Risk Analysis
        </button>
      </div>

      {loading && <p>Thinking...</p>}

      {answer && (
        <>
          <h3>Response</h3>

          <div
            style={{
              maxWidth: "900px",
              margin: "20px auto",
              padding: "20px",
              border: "1px solid #444",
              borderRadius: "10px",
              textAlign: "left",
              whiteSpace: "pre-wrap",
              overflowWrap: "break-word",
            }}
          >
            {answer}
          </div>

          {sources.length > 0 && (
            <>
              <h4>Sources Used</h4>
              <ul>
                {sources.map((source) => (
                  <li key={source}>Chunk {source}</li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default AskQuestion;