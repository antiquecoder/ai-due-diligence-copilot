from fastapi import FastAPI, UploadFile, File
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader
import os
import faiss
import ollama


from sentence_transformers import SentenceTransformer
import numpy as np

GLOBAL_INDEX = None
GLOBAL_CHUNK_DATA = []


model = SentenceTransformer("all-MiniLM-L6-v2")

def get_embedding(text):
    return model.encode(text).tolist()

app = FastAPI()

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):



    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    reader = PdfReader(file_path)

    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    chunks = splitter.split_text(text)

    # ---------------------------
    # STEP 4: EMBEDDINGS
    # ---------------------------
    embeddings = []
    chunk_store = []

    for i, chunk in enumerate(chunks):
        emb = get_embedding(chunk)

        embeddings.append(emb)
        chunk_store.append({
            "id": i,
            "text": chunk
        })

    # ---------------------------
    # STEP 5: FAISS INDEX
    # ---------------------------
    global GLOBAL_INDEX, GLOBAL_CHUNK_DATA

    embeddings = np.array(embeddings).astype("float32")

    dimension = embeddings.shape[1]

    GLOBAL_INDEX = faiss.IndexFlatL2(dimension)
    GLOBAL_INDEX.add(embeddings)

    GLOBAL_CHUNK_DATA = chunk_store

    return {
       "filename": file.filename,
       "total_characters": len(text),
       "total_chunks": len(chunks),
       "first_chunk": chunks[0] if chunks else None,
       "faiss_size": GLOBAL_INDEX.ntotal if GLOBAL_INDEX else 0
    }

@app.post("/ask")
async def ask(question: str):

    # safety check
    if GLOBAL_INDEX is None or len(GLOBAL_CHUNK_DATA) == 0:
        return {
            "error": "No document uploaded yet. Please upload a PDF first."
        }

    # 1. Convert question → embedding
    query_embedding = np.array([get_embedding(question)]).astype("float32")

    # 2. Search FAISS for top matches
    D, I = GLOBAL_INDEX.search(query_embedding, k=5)

    # 3. Get relevant chunks
    retrieved_chunks = []
    for idx in I[0]:
        if idx < len(GLOBAL_CHUNK_DATA):
            retrieved_chunks.append(GLOBAL_CHUNK_DATA[idx]["text"])

    # 4. Build context
    context = "\n\n".join(retrieved_chunks)

    # 5. Simple AI-style response (rule-based for now)
    response = ollama.chat(
    model="llama3",
    messages=[
        {
            "role": "system",
            "content": """You are a financial due diligence analyst.

Answer ONLY using the provided context.
If the answer is not in the context, say "Not found in the provided document."
Be concise.
If the user asks for names, return only names.
If the user asks for dates, return only dates.
If the user asks for risks, return only risks.
Do not include unrelated information."""
        },
        {
            "role": "user",
            "content": f"Context:\n{context}\n\nQuestion: {question}"
        }
    ]
)

    return {
    "question": question,
    "answer": response["message"]["content"],
    "retrieved_chunks": retrieved_chunks,
    "sources_used": len(retrieved_chunks)
        }