import openai
import openrouter
import json
import os
from dotenv import load_dotenv

load_dotenv()

SARAH_SYSTEM_PROMPT= """
You are Sarah, expert meeting facilitator. Analyze ONLY this transcript segment.

Return ONLY valis JSON with this Exact structure:
{
    "interventions":[
    {
    "type": "action_item|decision|circular|time_check|participation|offtopic",
    "confidence":0.85,
    "speaker": "Sarah|Alax|Team|Unknown" ,
    "content": "Sarah will send budget by Friday",
    "details":{
        "task": "send budget",
        "deadline": "Friday" ,
        "priority": "medium"
    
    }
    }
    ],
    "state":{
        "actions":[
        {"speaker": "Sarah", "task: "send budget", "deadline": "Friday","confidence":0.85}
        ],
        "decisions": [
        {"what": "Use React frontend", "speaker": "Team", "confidence": 0.9}
        ],
        "parking_lot":[],
        "participation":{
            "Sarah": {"time": 12.5, "turns": 8},
            "Alex": {"time": 3.2, "turns": 2},       
        },
        "sentiment": "neutral|positive|negative",
        "energy": "high|medium|low"

    }

}
Sarah Interventions:
ACTION_ITEM: Extract who/what/when
DECISION: Clear commitments made
CIRCULAR: Repetition detected -> suggest decision/parking
TIME_CHECK: Time overrun warnings
PARTICIPATION: Quiet members need prompting
"""

#client= openrouter.Client(api_key=os.getenv("OPENROUTER_API_KEY"))

client = openai.OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)
async def analyze_transcript(transcript:str, context: dict=None):

      messages = [
        {"role": "system", "content": SARAH_SYSTEM_PROMPT},
        {"role": "user", "content": f"Context: {json.dumps(context or {})}\n\nTranscript: {transcript}"}
    ]

      response = client.chat.completions.create(
          model="openai/gpt-oss-120b:free",
          messages=messages,
          response_format={"type": "json_object"}


    )
      return json.loads(response.choices[0].message.content)