import UploadForm from "./components/UploadForm";
import AskQuestion from "./components/AskQuestion";

function App() {
  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <h1
      style={{
        textAlign: "center",
        marginBottom: "30px",
      }}
    >
      AI Due Diligence Copilot
    </h1>

      <UploadForm />

      <hr />

      <AskQuestion />
    </div>
  );
}

export default App;