# import os
# import sys
# import json
# import asyncio
# from pathlib import Path
# from openai import AsyncOpenAI
# from pydantic import BaseModel, Field
#
# # --- CONFIGURATION ---
# FUELIX_BASE_URL = "https://api.fuelix.ai/v1"
# FUELIX_API_KEY = os.environ.get("FUELIX_API_KEY") or os.environ.get("FUELIX_KEY")
#
# if not FUELIX_API_KEY:
#     print("❌ ERROR: FUELIX_API_KEY or FUELIX_KEY environment variable not set.")
#     print("Usage: FUELIX_KEY=your_key python scripts/test_voice_pipeline.py")
#     sys.exit(1)
#
# client = AsyncOpenAI(
#     base_url=FUELIX_BASE_URL,
#     api_key=FUELIX_API_KEY
# )
#
# TEST_PHRASE = "I paid Terry two hundred bucks cash for the site cleanup yesterday."
# OUTPUT_DIR = Path("test_artifacts")
# OUTPUT_DIR.mkdir(exist_ok=True)
#
# # --- MODELS ---
# class VoiceTransaction(BaseModel):
#     vendor: str = Field(..., description="Name of the merchant or person paid")
#     amount: float = Field(..., description="Numeric amount")
#     currency: str = Field("CAD", description="Currency code")
#     category_intent: str = Field(..., description="Likely spending category")
#     payment_method: str = Field(..., description="cash, card, etransfer, etc.")
#     confidence: float = Field(..., description="0.0 to 1.0 confidence score")
#
# # --- PIPELINE STEPS ---
#
# async def step_1_generate_audio(text: str) -> Path:
#     print(f"\n🎙️  STEP 1: Generating Audio for: '{text}'")
#     try:
#         response = await client.audio.speech.create(
#             model="tts-1",
#             voice="alloy",
#             input=text
#         )
#         output_path = OUTPUT_DIR / "test_audio.mp3"
#         response.stream_to_file(output_path)
#         print(f"✅ Audio saved to: {output_path}")
#         return output_path
#     except Exception as e:
#         print(f"❌ TTS Failed: {e}")
#         sys.exit(1)
#
# async def step_2_transcribe(audio_path: Path) -> str:
#     print("\n👂 STEP 2: Transcribing Audio...")
#     try:
#         with open(audio_path, "rb") as audio_file:
#             transcript = await client.audio.transcriptions.create(
#                 model="whisper-1",
#                 file=audio_file
#             )
#         text = transcript.text
#         print(f"✅ Transcript: \"{text}\"")
#         return text
#     except Exception as e:
#         print(f"❌ Transcription Failed: {e}")
#         sys.exit(1)
#
# async def step_3_extract_json(transcript: str) -> VoiceTransaction:
#     print("\n🧠 STEP 3: Extracting Intelligence...")
#
#     system_prompt = """
#     You are an expert accountant AI. Extract structured data from the user's spoken transaction.
#     Return JSON only.
#     """
#
#     try:
#         response = await client.chat.completions.create(
#             model="gpt-4o", # Or appropriate model on Fuelix
#             messages=[
#                 {"role": "system", "content": system_prompt},
#                 {"role": "user", "content": transcript}
#             ],
#             tools=[{
#                 "type": "function",
#                 "function": {
#                     "name": "extract_transaction",
#                     "description": "Extracts accounting data",
#                     "parameters": VoiceTransaction.model_json_schema()
#                 }
#             }],
#             tool_choice={"type": "function", "function": {"name": "extract_transaction"}}
#         )
#
#         tool_call = response.choices[0].message.tool_calls[0]
#         args = json.loads(tool_call.function.arguments)
#         data = VoiceTransaction(**args)
#
#         print("✅ Extraction Successful:")
#         print(json.dumps(data.model_dump(), indent=2))
#         return data
#
#     except Exception as e:
#         print(f"❌ Extraction Failed: {e}")
#         # Fallback to standard JSON mode if tools fail
#         sys.exit(1)
#
# async def main():
#     print("🚀 Starting Fuelix Voice Pipeline Test")
#     print("=======================================")
#
#     audio_path = await step_1_generate_audio(TEST_PHRASE)
#     transcript = await step_2_transcribe(audio_path)
#     data = await step_3_extract_json(transcript)
#
#     print("\n✅ PIPELINE VERIFIED SUCCESSFULLY")
#
# if __name__ == "__main__":
#     asyncio.run(main())
