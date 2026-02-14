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
    await websocket.accept()
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
                # Sarah analyzes
                result = await analyze_transcript(transcript, meeting_state)
                
                # Update meeting state
                meeting_state.update(result.get("state", {}))
                
                # Send live update to dashboard
                await websocket.send_json({
                    "interventions": result.get("interventions", []),
                    "state": meeting_state
                })
    except WebSocketDisconnect:
        print("Client disconnected")

@app.get("/")
async def root():
    return {"message": "Sarah AI Meeting Facilitator - Backend Ready 🚀"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
