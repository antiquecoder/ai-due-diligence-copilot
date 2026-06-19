import { useState } from "react";
import api from "../api";

function AskQuestion() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleAsk = async () => {
    try {
      const res = await api.post("/ask", {
        question: question,
      });

      setAnswer(res.data.answer);
    } catch (error) {
      console.error(error);
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
      />

      <button onClick={handleAsk}>
        Ask
      </button>

      <pre>{answer}</pre>
    </div>
  );
}

export default AskQuestion;