import os
import sys
import base64
import json
import asyncio
import io
from PIL import Image
from openai import AsyncOpenAI

# --- CONFIGURATION ---
FUELIX_BASE_URL = "https://api.fuelix.ai/v1"
FUELIX_API_KEY = os.environ.get("FUELIX_API_KEY") or os.environ.get("FUELIX_KEY")
IMAGE_PATH = os.path.expanduser("~/Downloads/receipt.png")

if not FUELIX_API_KEY:
    print("❌ ERROR: FUELIX_API_KEY or FUELIX_KEY environment variable not set.")
    sys.exit(1)

client = AsyncOpenAI(
    base_url=FUELIX_BASE_URL,
    api_key=FUELIX_API_KEY
)

# --- HELPER: Resize & Encode ---
def process_image(image_path):
    print(f"🖼️  Processing Image: {image_path}")
    try:
        with Image.open(image_path) as img:
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            
            max_size = 1024
            if max(img.size) > max_size:
                ratio = max_size / max(img.size)
                new_size = (int(img.width * ratio), int(img.height * ratio))
                img = img.resize(new_size, Image.Resampling.LANCZOS)
            
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=80)
            return base64.b64encode(buf.getvalue()).decode('utf-8')
    except Exception as e:
        print(f"❌ Image Processing Failed: {e}")
        sys.exit(1)

async def main():
    print("🚀 Starting Fuelix Receipt OCR Test (DeepSeek-OCR - JSON Mode)")
    print("==============================================================")
    
    base64_image = process_image(IMAGE_PATH)
    
    # JSON Schema for the model to follow
    json_structure = {
        "vendor_name": "string",
        "total_amount": "number",
        "currency": "CAD",
        "tax_gst": "number (optional)",
        "tax_pst": "number (optional)",
        "date": "YYYY-MM-DD",
        "category": "string"
    }
    
    print("\n👁️  Sending to Vision Model...")
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o", # Switching to GPT-4o for reliability
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text", 
                            "text": f"Extract receipt data into this JSON format:\n{json.dumps(json_structure)}\nReturn ONLY raw JSON, no markdown."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            temperature=0.1
        )

        content = response.choices[0].message.content
        print(f"\n📥 Raw Response:\n{content}\n")
        
        # Cleanup Markdown Code Blocks if present
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
            
        data = json.loads(content)
        
        print("✅ Extraction Successful:")
        print(json.dumps(data, indent=2))
        
    except Exception as e:
        print(f"❌ OCR Request Failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
