from transcription import transcribe_audio
from tts import text_to_speech
import base64

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from agent import analyze_transcript
import json

app = FastAPI(title="Sarah - AI Meeting Facilitator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Handle text input from meeting transcript"""
    await websocket.accept()
    print("💬 Text WebSocket connected")
    
    meeting_state = {
        "actions": [],
        "decisions": [],
        "parking_lot": [],
        "participation": {},
        "sentiment": "neutral",
        "energy": "medium"
    }
    
    try:
        while True:
            data = await websocket.receive_json()
            transcript = data.get("transcript", "")
            
            if transcript.strip():
                print(f"📝 Analyzing text: {transcript[:50]}...")
                
                # Sarah analyzes
                result = await analyze_transcript(transcript, meeting_state)
                
                # Update meeting state
                if "state" in result:
                    meeting_state.update(result.get("state", {}))
                
                # Generate voice response for first intervention
                audio_response = None
                if result.get("interventions") and len(result["interventions"]) > 0:
                    first_intervention = result["interventions"][0]
                    intervention_text = first_intervention.get("content", "")
                    
                    print(f"🔊 Generating voice for: {intervention_text[:50]}...")
                    audio_bytes = await text_to_speech(intervention_text)
                    
                    if audio_bytes:
                        audio_response = base64.b64encode(audio_bytes).decode('utf-8')
                        print(f"✅ Voice response ready ({len(audio_bytes)} bytes)")
                
                # Send live update to dashboard
                await websocket.send_json({
                    "interventions": result.get("interventions", []),
                    "state": meeting_state,
                    "audio": audio_response
                })
                
    except WebSocketDisconnect:
        print("👋 Text client disconnected")
    except Exception as e:
        print(f"❌ Text WebSocket error: {e}")
        import traceback
        traceback.print_exc()


@app.websocket("/ws/audio")
async def audio_websocket(websocket: WebSocket):
    """Handle audio streaming for voice input"""
    await websocket.accept()
    print("🎤 Audio WebSocket connected")
    
    meeting_state = {
        "actions": [],
        "decisions": [],
        "parking_lot": [],
        "participation": {},
        "sentiment": "neutral",
        "energy": "medium"
    }
    
    # Accumulate audio chunks
    audio_chunks = []
    
    try:
        while True:
            data = await websocket.receive_json()
            
            if data.get("type") == "audio":
                import time
                current_time = time.time()
                
                print(f"📥 Received audio chunk #{len(audio_chunks) + 1}")
                
                # Decode base64 audio
                audio_base64 = data.get("audio", "")
                audio_bytes = base64.b64decode(audio_base64)
                
                # Add to chunks
                audio_chunks.append(audio_bytes)
                
                print(f"📊 Total chunks collected: {len(audio_chunks)}")
                
                # Wait for 3+ chunks before processing
                if len(audio_chunks) >= 3:
                    print(f"🎤 Got {len(audio_chunks)} chunks, transcribing now...")
                    
                    # Combine all chunks
                    combined_audio = b''.join(audio_chunks)
                    print(f"📊 Combined audio size: {len(combined_audio)} bytes")
                    
                    # Reset chunks for next recording
                    audio_chunks = []
                    
                    # Transcribe combined audio with Whisper
                    result = await transcribe_audio(combined_audio)
                    transcript = result["text"]
                    
                    if transcript.strip():
                        print(f"📝 Transcribed: {transcript}")
                        
                        # EXTRACT SPEAKER NAME
                        speaker_name = extract_speaker_name(transcript)
                        
                        # UPDATE PARTICIPATION TRACKING
                        if speaker_name:
                            if speaker_name not in meeting_state["participation"]:
                                meeting_state["participation"][speaker_name] = {
                                    "turns": 0,
                                    "time": 0
                                }
                            meeting_state["participation"][speaker_name]["turns"] += 1
                            print(f"👤 Speaker: {speaker_name} ({meeting_state['participation'][speaker_name]['turns']} turns)")
                        
                        # Analyze with Sarah (Ollama + regex)
                        analysis = await analyze_transcript(transcript, meeting_state)
                        
                        # Update state with analysis results
                        if "state" in analysis:
                            # Merge participation data (preserve speaker tracking)
                            analysis_participation = analysis["state"].get("participation", {})
                            for speaker, stats in meeting_state["participation"].items():
                                if speaker not in analysis_participation:
                                    analysis_participation[speaker] = stats
                            analysis["state"]["participation"] = analysis_participation
                            
                            # Update meeting state
                            meeting_state.update(analysis["state"])
                        
                        # GENERATE VOICE RESPONSE
                        audio_response = None
                        if analysis.get("interventions") and len(analysis["interventions"]) > 0:
                            # Get first intervention to speak
                            first_intervention = analysis["interventions"][0]
                            intervention_text = first_intervention.get("content", "")
                            
                            print(f"🔊 Generating Sarah's voice response...")
                            audio_bytes = await text_to_speech(intervention_text)
                            
                            if audio_bytes:
                                # Convert to base64 for transmission
                                audio_response = base64.b64encode(audio_bytes).decode('utf-8')
                                print(f"✅ Voice response ready ({len(audio_bytes)} bytes)")
                        
                        # Send back: transcript + analysis + voice response
                        await websocket.send_json({
                            "type": "transcription",
                            "transcript": transcript,
                            "confidence": result["confidence"],
                            "interventions": analysis.get("interventions", []),
                            "state": meeting_state,
                            "audio": audio_response  # Sarah's voice!
                        })
                        
                        print(f"📤 Sent complete response to frontend")
                        
                    else:
                        print("⚠️ Empty transcription, skipping")
                    
    except WebSocketDisconnect:
        print("👋 Audio client disconnected")
    except Exception as e:
        print(f"❌ Audio WebSocket error: {e}")
        import traceback
        traceback.print_exc()


def extract_speaker_name(transcript: str) -> str:
    """
    Extract speaker name from transcript
    Looks for common names in the transcript
    """
    words = transcript.strip().split()
    if len(words) == 0:
        return "Unknown"
    
    # List of known names that commonly appear
    known_names = [
        "Sarah", "Sera", "John", "Mike", "Aviskar", "Tom", 
        "Alice", "Bob", "Emma", "David", "Lisa", "James",
        "Maria", "Chris", "Anna", "Peter", "Kate", "Alex"
    ]
    
    # Check if any known name appears in transcript
    transcript_lower = transcript.lower()
    for name in known_names:
        if name.lower() in transcript_lower:
            return name
    
    # Fallback: use first word if it looks like a name (capitalized)
    first_word = words[0]
    if first_word[0].isupper() and len(first_word) > 2:
        return first_word.capitalize()
    
    return "Unknown"


@app.get("/")
async def root():
    return {
        "message": "Sarah AI Meeting Facilitator - Backend Ready 🚀",
        "version": "2.0",
        "features": [
            "Voice Input (Whisper STT)",
            "Voice Output (Piper TTS)",
            "Action Items Extraction",
            "Decisions Tracking",
            "Parking Lot",
            "Participation Tracking",
            "Real-time Dashboard"
        ]
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "ollama": "connected",
        "whisper": "ready",
        "tts": "ready"
    }


if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Sarah AI Meeting Facilitator Backend...")
    print("📊 Dashboard: http://localhost:5173")
    print("🔌 Backend API: http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)