from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ner import extract_entities
from market import get_market_data

app = FastAPI(title="fin-ai Python Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/ner")
def ner(payload: dict):
    text = payload.get("text", "")
    entities = extract_entities(text)
    return {"entities": entities}

@app.post("/market")
def market(payload: dict):
    tickers = payload.get("tickers", [])
    data = get_market_data(tickers)
    return {"market_data": data}