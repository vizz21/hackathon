from faster_whisper import WhisperModel
import tempfile
import os

# Load Whisper model (runs locally, FREE)
print("🎤 Loading Whisper model...")
model = WhisperModel("base", device="cpu", compute_type="int8")
print("✅ Whisper ready!")

async def transcribe_audio(audio_bytes: bytes) -> dict:
    """
    Transcribe audio to text using Whisper
    Returns: {"text": "...", "confidence": 0.95}
    """
    try:
        print(f"🎤 Transcribing {len(audio_bytes)} bytes of audio...")
        
        # Save audio to temp file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name
        
        # Transcribe with Whisper
        segments, info = model.transcribe(tmp_path, beam_size=5)
        
        # Combine all segments
        full_text = " ".join([segment.text for segment in segments])
        
        # Delete temp file
        os.unlink(tmp_path)
        
        print(f"✅ Transcription: '{full_text}'")
        
        return {
            "text": full_text.strip(),
            "confidence": float(info.language_probability),
            "language": info.language
        }
        
    except Exception as e:
        print(f"❌ Transcription error: {e}")
        return {
            "text": "",
            "confidence": 0.0,
            "error": str(e)
        }