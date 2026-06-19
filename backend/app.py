from fastapi import FastAPI, UploadFile, File
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader
import os
import faiss
import ollama
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


from sentence_transformers import SentenceTransformer
import numpy as np

class QuestionRequest(BaseModel):
    question: str

GLOBAL_INDEX = None
GLOBAL_CHUNK_DATA = []


model = SentenceTransformer("all-MiniLM-L6-v2")

def get_embedding(text):
    return model.encode(text).tolist()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
async def ask(req: QuestionRequest):

    question = req.question

    # safety check
    if GLOBAL_INDEX is None or len(GLOBAL_CHUNK_DATA) == 0:
        return {
            "error": "No document uploaded yet. Please upload a PDF first."
        }

    # 1. Convert question → embedding
    query_embedding = np.array([get_embedding(question)]).astype("float32")

    # 2. Search FAISS for top matches
    D, I = GLOBAL_INDEX.search(query_embedding, k=10)

    # 3. Get relevant chunks
    retrieved_chunks = []
    retrieved_sources = []

    for idx in I[0]:
     if idx < len(GLOBAL_CHUNK_DATA):
        retrieved_chunks.append(
            GLOBAL_CHUNK_DATA[idx]["text"]
        )

        retrieved_sources.append(
            GLOBAL_CHUNK_DATA[idx]["id"]
        )
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
    "source_chunks": retrieved_sources,
    "sources_used": len(retrieved_chunks)
}

@app.post("/summarize")
async def summarize():

    # Safety check
    if len(GLOBAL_CHUNK_DATA) == 0:
        return {
            "error": "No document uploaded yet. Please upload a PDF first."
        }

    # Combine all chunks into one text
    all_text = "\n\n".join(
        [chunk["text"] for chunk in GLOBAL_CHUNK_DATA]
    )

    # Limit size to avoid context window issues
    all_text = all_text[:12000]

    # Send to Llama 3
    response = ollama.chat(
        model="llama3",
        messages=[
            {
                "role": "system",
                "content": """
                You are a senior due diligence analyst.

                Analyze the document and provide:

                1. Executive Summary
                2. Key Objectives
                3. Technologies Used
                4. Key Findings
                5. Risks
                6. Recommendations

                Be concise and professional.
                """
            },
            {
                "role": "user",
                "content": all_text
            }
        ]
    )

    return {
        "summary": response["message"]["content"]
    }

@app.post("/risk-analysis")
async def risk_analysis():

    if len(GLOBAL_CHUNK_DATA) == 0:
        return {
            "error": "No document uploaded yet. Please upload a PDF first."
        }
    
    all_text = "\n\n".join(
        [chunk["text"] for chunk in GLOBAL_CHUNK_DATA]
    )

    all_text = all_text[:12000]

    response = ollama.chat(
        model="llama3",
        options={
            "temperature": 0.2
        },
        messages=[
            {
                "role": "system",
                "content": """
You are a senior due diligence analyst.

Analyze the document and identify:

1. Financial Risks
2. Operational Risks
3. Technical Risks
4. Security Risks
5. Compliance Risks

For each risk:
- Description
- Severity (Low, Medium, High)

If a category is not mentioned, say:
'No significant risk identified.'

Be concise and factual.
"""
            },
            {
                "role": "user",
                "content": all_text
            }
        ]
    )

    return {
        "risk_analysis": response["message"]["content"]    
        }