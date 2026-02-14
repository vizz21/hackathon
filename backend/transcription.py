from faster_whisper import WhisperModel
import tempfile
import os
import subprocess

# Load Whisper model (runs locally, FREE)
print("🎤 Loading Whisper model...")
model = WhisperModel("base", device="cpu", compute_type="int8")
print("✅ Whisper ready!")

async def transcribe_audio(audio_bytes: bytes) -> dict:
    """
    Transcribe audio to text using Whisper
    Converts WebM to WAV first
    """
    try:
        print(f"🎤 Transcribing {len(audio_bytes)} bytes of audio...")
        
        # Save WebM audio to temp file
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as webm_tmp:
            webm_tmp.write(audio_bytes)
            webm_path = webm_tmp.name
        
        # Convert WebM to WAV using ffmpeg
        wav_path = webm_path.replace(".webm", ".wav")
        
        try:
            # Use ffmpeg to convert
            subprocess.run([
                "ffmpeg",
                "-i", webm_path,
                "-ar", "16000",  # 16kHz sample rate
                "-ac", "1",      # mono
                "-f", "wav",     # WAV format
                wav_path
            ], check=True, capture_output=True)
            
        except subprocess.CalledProcessError as e:
            print(f"❌ FFmpeg conversion failed: {e}")
            print(f"FFmpeg error: {e.stderr.decode()}")
            # Cleanup
            os.unlink(webm_path)
            return {
                "text": "",
                "confidence": 0.0,
                "error": "Audio conversion failed"
            }
        
        # Transcribe WAV with Whisper
        segments, info = model.transcribe(wav_path, beam_size=5)
        
        # Combine all segments
        full_text = " ".join([segment.text for segment in segments])
        
        # Cleanup temp files
        os.unlink(webm_path)
        os.unlink(wav_path)
        
        print(f"✅ Transcription: '{full_text}'")
        
        return {
            "text": full_text.strip(),
            "confidence": float(info.language_probability),
            "language": info.language
        }
        
    except Exception as e:
        print(f"❌ Transcription error: {e}")
        import traceback
        traceback.print_exc()
        
        # Cleanup on error
        try:
            os.unlink(webm_path)
        except:
            pass
        try:
            os.unlink(wav_path)
        except:
            pass
        
        return {
            "text": "",
            "confidence": 0.0,
            "error": str(e)
        }