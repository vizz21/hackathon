import json
import re
import requests

async def analyze_transcript(transcript: str, context: dict = None):
    """
    Analyze transcript using local Ollama
    """
    
    print(f"🤖 Sarah analyzing with Ollama: {transcript[:60]}...")
    
    try:
        # Call local Ollama API
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3.2:3b",
                "prompt": f"""You are Sarah, an expert meeting facilitator AI.

Analyze this meeting transcript and extract action items.

Transcript: "{transcript}"

Return ONLY valid JSON with this EXACT structure:
{{
  "interventions": [
    {{
      "type": "action_item",
      "confidence": 0.9,
      "speaker": "PersonName",
      "content": "PersonName will do task by deadline",
      "details": {{"task": "task description", "deadline": "when"}}
    }}
  ],
  "state": {{
    "actions": [
      {{"speaker": "PersonName", "task": "task description", "deadline": "when", "confidence": 0.9}}
    ],
    "decisions": [],
    "parking_lot": [],
    "participation": {{}},
    "sentiment": "neutral",
    "energy": "medium"
  }}
}}

Extract action items with format: "PersonName will do something by deadline"
""",
                "stream": False,
                "format": "json",
                "options": {
                    "temperature": 0.3,
                    "num_predict": 500
                }
            },
            timeout=30
        )
        
        result = response.json()
        raw_response = result.get("response", "")
        
        print(f"📥 Ollama response: {raw_response[:200]}")
        
        # Parse JSON response
        analysis = json.loads(raw_response)
        
        # HANDLE DIFFERENT JSON FORMATS
        # Check if Ollama returned simplified format
        if "action_items" in analysis and "interventions" not in analysis:
            # Convert simplified format to our format
            interventions = []
            actions = []
            
            for item in analysis.get("action_items", []):
                speaker = item.get("speaker", "Unknown")
                task = item.get("task", "")
                deadline = item.get("deadline", "soon")
                
                actions.append({
                    "speaker": speaker,
                    "task": task,
                    "deadline": deadline,
                    "confidence": 0.9
                })
                
                interventions.append({
                    "type": "action_item",
                    "confidence": 0.9,
                    "speaker": speaker,
                    "content": f"{speaker} will {task} by {deadline}",
                    "details": {
                        "task": task,
                        "deadline": deadline,
                        "priority": "medium"
                    }
                })
            
            analysis = {
                "interventions": interventions,
                "state": {
                    "actions": actions,
                    "decisions": [],
                    "parking_lot": [],
                    "participation": {},
                    "sentiment": "neutral",
                    "energy": "medium"
                }
            }
        
        # Log results
        num_interventions = len(analysis.get("interventions", []))
        num_actions = len(analysis.get("state", {}).get("actions", []))
        print(f"✅ Extracted: {num_interventions} interventions, {num_actions} actions")
        
        return analysis
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Ollama!")
        print("💡 Make sure Ollama is running (it should be in background)")
        return get_fallback_response(transcript)
        
    except json.JSONDecodeError as e:
        print(f"❌ JSON parsing error: {e}")
        print(f"Raw response: {result.get('response', 'none')[:300]}")
        return get_fallback_response(transcript)
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return get_fallback_response(transcript)


def get_fallback_response(transcript: str):
    """
    Fallback: Simple pattern matching if Ollama fails
    """
    print("🔄 Using fallback pattern matching...")
    
    actions = []
    interventions = []
    
    # Pattern: "X will Y by Z"
    action_patterns = [
        r"(\w+)\s+will\s+(.+?)\s+by\s+(\w+(?:\s+\w+)?)",
        r"(\w+)\s+(?:to|should)\s+(.+?)\s+by\s+(\w+(?:\s+\w+)?)",
    ]
    
    for pattern in action_patterns:
        matches = re.findall(pattern, transcript, re.IGNORECASE)
        for match in matches:
            who, what, when = match
            action = {
                "speaker": who.capitalize(),
                "task": what.strip(),
                "deadline": when.capitalize(),
                "confidence": 0.85
            }
            actions.append(action)
            
            interventions.append({
                "type": "action_item",
                "confidence": 0.85,
                "speaker": who.capitalize(),
                "content": f"Got it - {who.capitalize()} will {what.strip()} by {when.capitalize()}",
                "details": {
                    "task": what.strip(),
                    "deadline": when.capitalize(),
                    "priority": "medium"
                }
            })
    
    # If no patterns matched, create generic response
    if not interventions:
        interventions.append({
            "type": "note",
            "confidence": 0.5,
            "speaker": "System",
            "content": f"Noted: {transcript[:50]}...",
            "details": {}
        })
    
    return {
        "interventions": interventions,
        "state": {
            "actions": actions,
            "decisions": [],
            "parking_lot": [],
            "participation": {},
            "sentiment": "neutral",
            "energy": "medium"
        }
    }