import json
import re
import requests

async def analyze_transcript(transcript: str, context: dict = None):
    """
    Analyze transcript using local Ollama with smart regex fallback
    """
    
    print(f"🤖 Sarah analyzing with Ollama: {transcript[:60]}...")
    
    try:
        # Clean, simple prompt
        prompt = f"""You are a meeting analysis assistant.

Analyze this transcript:
"{transcript}"

Extract ONLY what you find:
- Action items: who will do what by when
- Parking lot: items to discuss later (look for "park", "discuss later", "table")
- Decisions: commitments made (look for "decided", "agreed", "let's use")

IMPORTANT: If you find NOTHING, return empty array. Do NOT make up examples.

Return JSON:
{{
  "items": [
    // Only items ACTUALLY found in the transcript
  ]
}}

Formats:
- Action: {{"type": "action_item", "speaker": "PersonName", "task": "description", "deadline": "when"}}
- Parking: {{"type": "parking_lot", "item": "what to park"}}
- Decision: {{"type": "decision", "decision": "what was decided"}}"""

        # Call Ollama
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3.2:3b",
                "prompt": prompt,
                "stream": False,
                "format": "json",
                "options": {
                    "temperature": 0.1,
                    "num_predict": 300
                }
            },
            timeout=30
        )
        
        result = response.json()
        raw_response = result.get("response", "")
        
        print(f"📥 Ollama raw: {raw_response[:300]}")
        
        # Parse Ollama response
        ollama_data = json.loads(raw_response)
        items = ollama_data.get("items", [])
        
        # Filter out placeholder/noise data
        filtered_items = []
        for item in items:
            item_str = json.dumps(item).lower()
            
            # Expanded placeholder detection
            placeholders = [
                "name will", "do something", "task description",
                "what to park", "what was decided", 
                "nothing", "no items", "none", "n/a",
                "example", "placeholder", "nothing to",
                "parking"
            ]
            
            if any(placeholder in item_str for placeholder in placeholders):
                print(f"⚠️ Skipping Ollama placeholder/noise: {item}")
                continue
            
            # Validate item content
            item_type = item.get("type", "")
            
            if item_type == "parking_lot":
                parking_item = item.get("item", "").strip()
                
                # Strict validation
                blacklist = ["nothing", "none", "n/a", "parking", "items", "item", "lot"]
                
                if (len(parking_item) < 4 or 
                    parking_item.lower() in blacklist or
                    any(word == parking_item.lower() for word in blacklist)):
                    print(f"⚠️ Skipping invalid parking item: '{parking_item}'")
                    continue
            
            elif item_type == "action_item":
                task = item.get("task", "").strip()
                deadline = item.get("deadline", "").strip()
                speaker = item.get("speaker", "").strip()
                
                if (len(task) < 3 or 
                    not deadline or 
                    speaker.lower() in ["name", "we", "person", ""]):
                    print(f"⚠️ Skipping incomplete action item")
                    continue
            
            elif item_type == "decision":
                decision = item.get("decision", "").strip()
                if len(decision) < 3:
                    print(f"⚠️ Skipping empty decision")
                    continue
            
            filtered_items.append(item)
        
        ollama_data["items"] = filtered_items
        print(f"✅ Ollama found {len(filtered_items)} valid items")
        
        # Convert to our format
        analysis = convert_ollama_format(ollama_data)
        
        # Add regex fallback
        analysis = enhance_with_regex_fallback(transcript, analysis)
        
        # Log final results
        num_actions = len(analysis.get("state", {}).get("actions", []))
        num_parking = len(analysis.get("state", {}).get("parking_lot", []))
        num_decisions = len(analysis.get("state", {}).get("decisions", []))
        
        print(f"✅ Final: {num_actions} actions, {num_parking} parked, {num_decisions} decisions")
        
        return analysis
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Ollama! Using regex fallback...")
        return get_fallback_response(transcript)
        
    except json.JSONDecodeError as e:
        print(f"⚠️ Ollama JSON error: {e}")
        return get_fallback_response(transcript)
        
    except Exception as e:
        print(f"⚠️ Ollama error: {e}")
        import traceback
        traceback.print_exc()
        return get_fallback_response(transcript)


def convert_ollama_format(ollama_data: dict) -> dict:
    """
    Convert Ollama's simplified response to our full format
    """
    
    analysis = {
        "interventions": [],
        "state": {
            "actions": [],
            "decisions": [],
            "parking_lot": [],
            "participation": {},
            "sentiment": "neutral",
            "energy": "medium"
        }
    }
    
    items = ollama_data.get("items", [])
    
    for item in items:
        item_type = item.get("type", "")
        
        if item_type == "action_item":
            speaker = item.get("speaker", "Unknown")
            task = item.get("task", "")
            deadline = item.get("deadline", "soon")
            
            if task:
                analysis["state"]["actions"].append({
                    "speaker": speaker,
                    "task": task,
                    "deadline": deadline,
                    "confidence": 0.9
                })
                
                analysis["interventions"].append({
                    "type": "action_item",
                    "confidence": 0.9,
                    "speaker": speaker,
                    "content": f"{speaker} will {task} by {deadline}",
                    "details": {"task": task, "deadline": deadline}
                })
        
        elif item_type == "parking_lot":
            parking_item = item.get("item", "")
            
            if parking_item and len(parking_item) > 3:
                analysis["state"]["parking_lot"].append(parking_item)
                
                analysis["interventions"].append({
                    "type": "parking_lot",
                    "confidence": 0.9,
                    "speaker": "Team",
                    "content": f"Parked for later: {parking_item}",
                    "details": {"item": parking_item}
                })
        
        elif item_type == "decision":
            decision = item.get("decision", "")
            
            if decision and len(decision) > 3:
                analysis["state"]["decisions"].append(decision)
                
                analysis["interventions"].append({
                    "type": "decision",
                    "confidence": 0.9,
                    "speaker": "Team",
                    "content": f"Decision: {decision}",
                    "details": {"what": decision}
                })
    
    return analysis


def enhance_with_regex_fallback(transcript: str, analysis: dict) -> dict:
    """
    Add regex detection to catch what Ollama might have missed
    """
    
    print("🔍 Running regex fallback...")
    
    # Track what Ollama already found
    existing_parking = set(item.lower().strip() for item in analysis["state"]["parking_lot"])
    existing_actions = set(
        f"{a['speaker'].lower()}:{a['task'].lower()}" 
        for a in analysis["state"]["actions"]
    )
    existing_decisions = set(d.lower().strip() for d in analysis["state"]["decisions"])
    
    # ==========================================
    # PARKING LOT PATTERNS - ENHANCED FOR "DISCUSS IT LATER"
    # ==========================================
    
    # Pattern 1: Specific items to park
    specific_parking_patterns = [
        r"park\s+(?:the\s+)?([a-z\s]+?)\s+(?:discussion|for\s+(?:next|later|another))",
        r"discuss\s+(?:the\s+)?([a-z\s]+?)\s+(?:later|another\s+time|next\s+(?:time|meeting))",
        r"table\s+(?:the\s+)?([a-z\s]+?)(?:\s+for|$)",
    ]
    
    for pattern in specific_parking_patterns:
        for match in re.finditer(pattern, transcript, re.IGNORECASE):
            item = match.group(1).strip()
            
            # Remove "the" prefix
            if item.lower().startswith("the "):
                item = item[4:]
            
            item = item.strip()
            item_lower = item.lower()
            
            # Check if already exists
            similar_exists = any(
                item_lower in existing or existing in item_lower
                for existing in existing_parking
            )
            
            if len(item) > 3 and not similar_exists:
                print(f"🅿️ Regex caught parking: '{item}'")
                existing_parking.add(item_lower)
                
                analysis["state"]["parking_lot"].append(item)
                analysis["interventions"].append({
                    "type": "parking_lot",
                    "confidence": 0.85,
                    "speaker": "Team",
                    "content": f"Parked for later: {item}",
                    "details": {"item": item}
                })
    
    # Pattern 2: General "discuss it/this/that later"
    general_parking_patterns = [
        r"discuss\s+(?:it|this|that)\s+later",
        r"we\s+(?:will|can|should)\s+discuss\s+(?:it|this|that)\s+later",
        r"(?:let's|we'll)\s+discuss\s+(?:it|this|that)\s+later",
    ]
    
    for pattern in general_parking_patterns:
        if re.search(pattern, transcript, re.IGNORECASE):
            item = "discussion topic"
            item_lower = item.lower()
            
            if item_lower not in existing_parking:
                print(f"🅿️ Regex caught general parking: '{item}'")
                existing_parking.add(item_lower)
                
                analysis["state"]["parking_lot"].append(item)
                analysis["interventions"].append({
                    "type": "parking_lot",
                    "confidence": 0.85,
                    "speaker": "Team",
                    "content": f"Parked for later: {item}",
                    "details": {"item": item}
                })
            break  # Only add once even if multiple patterns match
    
    # ==========================================
    # ACTION PATTERNS
    # ==========================================
    action_pattern = r"(\w+)\s+will\s+(.+?)\s+by\s+(\w+(?:\s+\w+)?)"
    
    for match in re.finditer(action_pattern, transcript, re.IGNORECASE):
        who = match.group(1).strip().capitalize()
        what = match.group(2).strip()
        when = match.group(3).strip().capitalize()
        
        # Clean up
        when = re.sub(r'\s+(and|but|or|then)$', '', when, flags=re.IGNORECASE).strip()
        what = re.sub(r'\s+(and|but|or|then)$', '', what, flags=re.IGNORECASE).strip()
        
        # Check if already exists
        key_base = f"{who.lower()}:{what.lower()}"
        
        already_exists = False
        for existing_key in existing_actions:
            if (key_base in existing_key or existing_key in key_base):
                already_exists = True
                print(f"⚠️ Regex skipping duplicate: {who} will {what}")
                break
        
        if (not already_exists and 
            "something" not in what.lower() and 
            " and " not in what.lower()):
            
            print(f"📋 Regex caught action: {who} will {what} by {when}")
            existing_actions.add(key_base)
            
            analysis["state"]["actions"].append({
                "speaker": who,
                "task": what,
                "deadline": when,
                "confidence": 0.85
            })
            
            analysis["interventions"].append({
                "type": "action_item",
                "confidence": 0.85,
                "speaker": who,
                "content": f"{who} will {what} by {when}",
                "details": {"task": what, "deadline": when}
            })
    
    # ==========================================
    # DECISION PATTERNS - HANDLES ANY NAME
    # ==========================================
    decision_patterns = [
        # "NAME decided to X"
        (r"(\w+)\s+decided\s+to\s+(.+?)(?:\.|,|$)", True),
        
        # "we/team decided to X"
        (r"(?:we|team)\s+decided\s+to\s+(.+?)(?:\.|,|$)", False),
        
        # "we/team agreed to X"
        (r"(?:we|team)\s+agreed\s+to\s+(.+?)(?:\.|,|$)", False),
        
        # "let's/we'll use/go with X"
        (r"(?:let's|we'll)\s+(?:go with|use)\s+(.+?)(?:\.|,|$)", False),
    ]
    
    for pattern, has_speaker in decision_patterns:
        for match in re.finditer(pattern, transcript, re.IGNORECASE):
            groups = match.groups()
            
            if has_speaker and len(groups) >= 2:
                # "Mary decided to use frontend"
                speaker_name = groups[0].capitalize()
                decision_content = groups[1].strip().rstrip('.')
                decision_text = f"use {decision_content}"
                speaker = speaker_name
                
                print(f"💡 Regex caught decision: '{speaker}' - '{decision_text}'")
            else:
                # "we decided to X"
                decision_content = groups[0].strip().rstrip('.')
                decision_text = decision_content
                speaker = "Team"
                
                print(f"💡 Regex caught decision: '{decision_text}'")
            
            # Check if already exists
            decision_lower = decision_content.lower()
            similar_exists = any(
                decision_lower in existing.lower() or existing.lower() in decision_lower
                for existing in existing_decisions
            )
            
            if len(decision_text) > 3 and not similar_exists:
                existing_decisions.add(decision_text.lower())
                
                analysis["state"]["decisions"].append(decision_text)
                analysis["interventions"].append({
                    "type": "decision",
                    "confidence": 0.85,
                    "speaker": speaker,
                    "content": f"Decision: {decision_text}",
                    "details": {"what": decision_text}
                })
    
    return analysis


def get_fallback_response(transcript: str):
    """
    Pure regex fallback if Ollama fails
    """
    print("🔄 Using 100% regex fallback...")
    
    analysis = {
        "interventions": [],
        "state": {
            "actions": [],
            "decisions": [],
            "parking_lot": [],
            "participation": {},
            "sentiment": "neutral",
            "energy": "medium"
        }
    }
    
    return enhance_with_regex_fallback(transcript, analysis)