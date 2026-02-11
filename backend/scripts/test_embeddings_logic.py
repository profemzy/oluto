import os
import sys
import asyncio
import numpy as np
from typing import List
from openai import AsyncOpenAI

# --- CONFIGURATION ---
FUELIX_BASE_URL = "https://api.fuelix.ai/v1"
FUELIX_API_KEY = os.environ.get("FUELIX_API_KEY") or os.environ.get("FUELIX_KEY")

if not FUELIX_API_KEY:
    print("❌ ERROR: FUELIX_API_KEY or FUELIX_KEY environment variable not set.")
    sys.exit(1)

client = AsyncOpenAI(
    base_url=FUELIX_BASE_URL,
    api_key=FUELIX_API_KEY
)

# Sample "Database" of categorized transactions (The Knowledge Base)
KNOWN_TRANSACTIONS = [
    {"text": "Shell Station 123", "category": "Fuel"},
    {"text": "Starbucks Coffee", "category": "Meals & Ent"},
    {"text": "Home Depot Supply", "category": "Materials"},
    {"text": "Adobe Creative Cloud", "category": "Software"},
    {"text": "Uber Trip", "category": "Travel"},
]

# New incoming transactions to categorize
TEST_QUERIES = [
    "Chevron Gas Bar",      # Should match Shell
    "Tim Hortons #442",     # Should match Starbucks
    "Rona Hardware",        # Should match Home Depot
    "Github Subscription",  # Should match Adobe
]

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

async def get_embedding(text: str) -> List[float]:
    """Generates vector embedding for a single string."""
    try:
        response = await client.embeddings.create(
            input=text,
            model="text-embedding-3-small" # Or supported Fuelix model
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"❌ Embedding Failed for '{text}': {e}")
        sys.exit(1)

async def main():
    print("🚀 Starting Fuelix Embeddings Logic Test")
    print("========================================")

    # 1. Embed the Known Database
    print("\n📚 Embedding Knowledge Base...")
    db_embeddings = []
    for item in KNOWN_TRANSACTIONS:
        vector = await get_embedding(item["text"])
        db_embeddings.append({"vector": vector, **item})
        print(f"   - Embedded: {item['text']}")

    # 2. Test Queries
    print("\n🔍 Testing Similarity Search...")
    for query in TEST_QUERIES:
        query_vector = await get_embedding(query)
        
        # Find nearest neighbor
        best_match = None
        highest_score = -1.0
        
        for item in db_embeddings:
            score = cosine_similarity(query_vector, item["vector"])
            if score > highest_score:
                highest_score = score
                best_match = item
        
        print(f"\n   Query: '{query}'")
        print(f"   --> Best Match: '{best_match['text']}' ({best_match['category']})")
        print(f"   --> Similarity: {highest_score:.4f}")
        
        # Simple Assertion Logic
        if highest_score < 0.3:
             print("   ⚠️  Low Confidence Match")
        else:
             print("   ✅  High Confidence Match")

if __name__ == "__main__":
    asyncio.run(main())
