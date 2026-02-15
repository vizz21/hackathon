# Sophiie AI Agents Hackathon 2026

# 🤖 Sarah - AI Meeting Facilitator



**Complete System - Built in 33 Hours for Sophiie Hackathon**



Sarah is an intelligent meeting assistant that listens to conversations in real-time, extracts action items, tracks decisions, monitors participation, and intervenes contextually to improve meeting productivity.

<img width="1755" height="1664" alt="image" src="https://github.com/user-attachments/assets/26b114f7-da84-4d32-a30a-ef9ddc7c132b" />



## 🎯 Live Demo

- **Demo Video**: [(https://www.loom.com/share/2988230b54f14585ba6de0bd4a03c4b6)]

## ✨ Features

### 🎤 Multi-Modal Input
- **Voice Input** - Real-time speech-to-text with Whisper
- **Text Input** - Direct meeting notes entry
- **Visual Dashboard** - Live updates as meeting progresses

### 🤖 AI-Powered Analysis
- **Action Items** - Auto-extracts who/what/when
- **Decisions** - Tracks team commitments
- **Parking Lot** - Captures off-topic items
- **Participation** - Monitors speaker contributions
- **Sentiment** - Detects meeting tone

### 📊 Real-Time Dashboard
- Beautiful glassmorphic UI
- Live interventions from Sarah
- Export meeting summary (copy/download)
- Voice output (Sarah speaks)

## 🛠️ Tech Stack

### Backend
- FastAPI (WebSocket server)
- Ollama (Llama 3.2 3B - local AI)
- Whisper (faster-whisper - local STT)
- Python 3.11+

### Frontend
- React 18 + Vite
- Zustand (state management)
- Tailwind CSS (glassmorphic UI)
- WebSocket API

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Ollama installed ([ollama.ai](https://ollama.ai))
- FFmpeg installed

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt --break-system-packages
ollama pull llama3.2:3b
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Open Application
**Frontend**: http://localhost:5173  
**Backend**: http://localhost:8000

## 📖 How to Use

### Text Input
1. Type: `"Sarah will send budget by Friday"`
2. Click: "Send to Sarah"
3. Watch: Action item appears in dashboard

### Voice Input
1. Click: "🎤 Start Recording"
2. Speak: `"Let's park the budget discussion for later"`
3. Wait: ~9 seconds for transcription
4. See: Parking lot item extracted

### Export Summary
1. Add some action items and decisions
2. Scroll to "Export Summary" panel
3. Click: "📋 Copy to Clipboard" or "💾 Download"



**Action Items:**
```
"Sarah will send the budget report by Friday"
"John will review the code by Monday"
"Mike will update documentation by Wednesday"
```

**Parking Lot:**
```
"Let's park the international expansion for later"
"Discuss the hiring process another time"
"Let's table the marketing plan for now"
```

**Decisions:**
```
"We decided to use React for the frontend"
"Team agreed to launch next quarter"
"Let's go with TypeScript for the backend"
```

## 🏗️ Architecture
```
╔═══════════════════════════════════════════════════════════════════════════╗
║                        🤖 SARAH AI MEETING FACILITATOR                    ║
║                         Multi-Modal AI Architecture                        ║
╚═══════════════════════════════════════════════════════════════════════════╝


 USER INTERFACE                AI PROCESSING                 OUTPUT
 ═════════════                ═══════════════                ══════

┌─────────────┐              ┌─────────────┐              ┌─────────────┐
│ 🎤 VOICE    │─────────────▶│  WHISPER    │              │ 📋 ACTION   │
│             │              │             │              │    ITEMS    │
│ "Sarah will │  Audio       │ faster-     │              │             │
│ send budget"│  Chunks      │ whisper     │              │ ✓ Sarah     │
│             │              │             │              │   Budget    │
└─────────────┘              │ WebM → WAV  │              │   Friday    │
                             │ 16kHz mono  │              └─────────────┘
┌─────────────┐              │             │              ┌─────────────┐
│ 💬 TEXT     │─────────────▶│ ~2-3s ⚡    │              │ 💡 DECISIONS│
│             │              └──────┬──────┘              │             │
│ "We decided │  WebSocket          │                     │ ✓ Use React │
│ to use React"│                    │                     │   Team      │
│             │                     │                     │   90%       │
└─────────────┘                     ▼                     └─────────────┘
                             ┌─────────────┐              ┌─────────────┐
                             │   OLLAMA    │              │ 🅿️ PARKING │
                             │             │              │    LOT      │
                             │ Llama 3.2   │              │             │
┌─────────────┐              │    3B       │              │ ✓ Budget    │
│ 🎨 DASHBOARD│◀─────────────│             │◀─────┐       │   Review    │
│             │              │ • Contextual│      │       └─────────────┘
│ Real-time   │  WebSocket   │ • Smart     │      │       ┌─────────────┐
│ Updates     │  Response    │ • Local     │      │       │ 👥 PARTICIP.│
│             │              │ • Free      │      │       │             │
│ All Panels  │              │             │      │       │ Sarah: 3    │
│ Live ✨     │              │ ~1-2s ⚡    │      │       │ John:  2    │
└─────────────┘              └──────┬──────┘      │       └─────────────┘
                                    │             │
                                    ▼             │       ┌─────────────┐
┌─────────────┐              ┌─────────────┐     │       │ 📊 SENTIMENT│
│ 🔊 VOICE    │◀─────────────│   REGEX     │     │       │             │
│  OUTPUT     │  Fallback    │  FALLBACK   │─────┘       │ 😊 Neutral  │
│             │              │             │             │ ⚡ Medium   │
│ Browser TTS │              │ • Reliable  │             │             │
│             │              │ • Patterns  │             └─────────────┘
│ "Just to    │              │ • 85% conf  │
│ confirm..."  │              │             │             ┌─────────────┐
└─────────────┘              └─────────────┘             │ 📄 EXPORT   │
                                                         │             │
┌─────────────┐                                         │ Copy/       │
│ 📋 EXPORT   │◀────────────────────────────────────────│ Download    │
│             │  Generate Summary                       │             │
│ Copy or     │                                         │ Meeting     │
│ Download    │                                         │ Summary     │
└─────────────┘                                         └─────────────┘


╔═══════════════════════════════════════════════════════════════════════════╗
║  KEY FEATURES: 100% Local AI • Multi-Modal • Real-Time • No API Costs    ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

## 📂 Repository Structure
```
meeting-facilitator/
├── backend/               # FastAPI backend
│   ├── agent.py          # AI analysis
│   ├── main.py           # Server & WebSocket
│   ├── transcription.py  # Whisper integration
│   ├── tts.py            # Voice output
│   └── requirements.txt
│
├── frontend/             # React frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── VoiceInput.jsx
│   │   ├── ActionPanel.jsx
│   │   ├── DecisionsPanel.jsx
│   │   ├── StatsPanel.jsx
│   │   └── ExportSummary.jsx
│   └── package.json
│
└── README.md
```

## 🎯 Key Innovations

### 1. Hybrid AI Approach
- **Ollama** (90% confidence) for intelligent analysis
- **Regex** (85% confidence) as reliable fallback
- Best of both worlds: smart + reliable

### 2. 100% Local & Private
- No API keys required
- No internet needed (after setup)
- All processing on local machine
- Complete data privacy

### 3. Multi-Modal Experience
- Voice input (speak naturally)
- Voice output (Sarah responds)
- Visual dashboard (see everything)
- Text input (type notes)

### 4. Real-Time Processing
- WebSocket for instant updates
- Live transcription display
- Immediate AI analysis
- No page refreshes needed

## 📊 Performance Metrics

- **Voice Recognition**: 2-3 seconds
- **AI Analysis**: 1-2 seconds
- **Total Latency**: 5-7 seconds
- **Model Size**: 2GB (Llama 3.2 3B)
- **Memory Usage**: ~4GB RAM total
- **Bundle Size**: ~500KB (frontend)




## 🤝 Hackathon Details

**Event**: Sophiie Hackathon  
**Duration**: 33 hours  
**Team**: [Avishkar]  
**Built**: February 2026



## Key Features

1. **Real-Time AI** - Not just transcription, actual intelligence
2. **Beautiful UI** - Production-quality glassmorphic design
3. **Fully Local** - $0 API costs, complete privacy
4. **Multi-Modal** - Voice, text, and visual all integrated
5. **Reliable** - Hybrid AI + Regex ensures it always works

## 📧 Contact

Built by [Avishkar]  
- GitHub: [https://github.com/vizz21]
- LinkedIn: []
-

---

⭐ If you found this helpful, please star the repo!

🎉 Built with ❤️ in 33 hours for Sophiie Hackathon

---

## The Challenge

**Design and build an AI agent with an exceptional interaction experience.**

We want to see how you think about the space between humans and AI. This is deliberately open-ended — you choose the problem, the modality, and the approach. What matters is the *interaction*.

Some directions to inspire you (not requirements):

- A voice agent that feels natural to talk to
- A text-based assistant with a thoughtful, intuitive UX
- A multi-modal agent that blends voice, text, and visual elements
- An agent that handles a complex workflow through conversation
- Something we haven't thought of yet

**You will be judged on innovation, technical execution, and how good the interaction feels** — not just whether the AI works, but whether a human would *want* to use it.

Use any tech stack. Use any AI provider. Use AI coding assistants. The only constraint is time.

---


### Participant

| Field | Your Answer |
|-------|-------------|
| **Name** |Avishkar Waikar |
| **University |Adelaide University | |

### Project

| Field | Your Answer |
|-------|-------------|
| **Project Name** | |
| **One-Line Description** | |
| **Demo Video Link** | |
| **Tech Stack** | |
| **AI Provider(s) Used** | |



## About Sophiie

Sophiie is an AI office manager for trades businesses — helping plumbers, electricians, builders, and other trade professionals run their operations with intelligent automation. We're a team that cares deeply about how humans interact with AI, and we're looking for people who think the same way.

[sophiie.com](https://sophiie.com)

---

**Good luck. Build something that makes us say "wow."**
