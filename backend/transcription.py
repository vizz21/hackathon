from faster_whisper import WhisperModel
import tempfile
import os
import subprocess
import base64

# Load Whisper model (runs locally, FREE)
print("🎤 Loading Whisper model...")
model = WhisperModel("base", device="cpu", compute_type="int8")
print("✅ Whisper ready!")

async def transcribe_audio(audio_bytes: bytes) -> dict:
    """
    Transcribe audio to text using Whisper
    Converts WebM to WAV first
    """
    webm_path = None
    wav_path = None
    
    try:
        print(f"🎤 Transcribing {len(audio_bytes)} bytes of audio...")
        
        # Create temp directory
        temp_dir = tempfile.gettempdir()
        
        # Generate unique filenames
        import time
        timestamp = int(time.time() * 1000)
        webm_path = os.path.join(temp_dir, f"audio_{timestamp}.webm")
        wav_path = os.path.join(temp_dir, f"audio_{timestamp}.wav")
        
        # Save WebM audio to file
        with open(webm_path, 'wb') as f:
            f.write(audio_bytes)
        
        print(f"📁 Saved WebM to: {webm_path}")
        print(f"📊 File size: {os.path.getsize(webm_path)} bytes")
        
        # Verify file exists
        if not os.path.exists(webm_path):
            print(f"❌ WebM file not created!")
            return {
                "text": "",
                "confidence": 0.0,
                "error": "Failed to save audio file"
            }
        
        # Build FFmpeg command
        ffmpeg_cmd = [
            "ffmpeg",
            "-y",              # Overwrite output
            "-i", webm_path,   # Input file
            "-ar", "16000",    # Sample rate
            "-ac", "1",        # Mono
            "-f", "wav",       # Output format
            wav_path           # Output file
        ]
        
        print(f"🔄 Running FFmpeg...")
        print(f"   Input: {webm_path}")
        print(f"   Output: {wav_path}")
        
        # Run FFmpeg
        result = subprocess.run(
            ffmpeg_cmd,
            capture_output=True,
            text=True,
            timeout=15
        )
        
        # Check result
        if result.returncode != 0:
            print(f"❌ FFmpeg failed with code: {result.returncode}")
            print(f"❌ stderr (first 500 chars): {result.stderr[:500]}")
            
            # Cleanup
            if os.path.exists(webm_path):
                os.unlink(webm_path)
            
            return {
                "text": "",
                "confidence": 0.0,
                "error": f"FFmpeg failed: {result.stderr[:200]}"
            }
        
        print(f"✅ FFmpeg conversion successful")
        
        # Verify WAV file exists
        if not os.path.exists(wav_path):
            print(f"❌ WAV file not created!")
            if os.path.exists(webm_path):
                os.unlink(webm_path)
            return {
                "text": "",
                "confidence": 0.0,
                "error": "WAV file not created"
            }
        
        print(f"📁 WAV file size: {os.path.getsize(wav_path)} bytes")
        
        # Transcribe with Whisper
        print(f"🎤 Starting Whisper transcription...")
        segments, info = model.transcribe(
        wav_path, 
        beam_size=5,
        language="en",  # ← ADD THIS LINE!
        initial_prompt="This is an English conversation about work meetings and action items."
)
        
        # Combine segments
        full_text = " ".join([segment.text for segment in segments])
        
        print(f"✅ Transcription: '{full_text}'")
        
        # Cleanup
        if os.path.exists(webm_path):
            os.unlink(webm_path)
        if os.path.exists(wav_path):
            os.unlink(wav_path)
        
        return {
            "text": full_text.strip(),
            "confidence": float(info.language_probability),
            "language": info.language
        }
        
    except subprocess.TimeoutExpired:
        print(f"❌ FFmpeg timeout")
        if webm_path and os.path.exists(webm_path):
            os.unlink(webm_path)
        if wav_path and os.path.exists(wav_path):
            os.unlink(wav_path)
        return {
            "text": "",
            "confidence": 0.0,
            "error": "FFmpeg timeout"
        }
        
    except Exception as e:
        print(f"❌ Transcription error: {e}")
        import traceback
        traceback.print_exc()
        
        # Cleanup
        try:
            if webm_path and os.path.exists(webm_path):
                os.unlink(webm_path)
            if wav_path and os.path.exists(wav_path):
                os.unlink(wav_path)
        except:
            pass
        
        return {
            "text": "",
            "confidence": 0.0,
            "error": str(e)
        }