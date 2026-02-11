import os
import sys
import asyncio
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

async def main():
    print("🚀 Listing Fuelix Models...")
    print("==========================")
    
    try:
        response = await client.models.list()
        
        print(f"\n✅ Found {len(response.data)} Models:\n")
        
        vision_models = []
        
        for model in response.data:
            print(f"- {model.id} (Owner: {model.owned_by})")
            if "gpt-4" in model.id or "vision" in model.id:
                vision_models.append(model.id)
                
        print("\n🔍 VISION ANALYSIS:")
        if vision_models:
            print(f"✅ Potential Vision/OCR candidates found: {vision_models}")
        else:
            print("❌ No obvious Vision models found (checking for 'gpt-4o', 'vision').")
            
    except Exception as e:
        print(f"❌ Failed to list models: {e}")

if __name__ == "__main__":
    asyncio.run(main())
