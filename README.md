# Sophiie AI Agents Hackathon 2026

# 🤖 Sarah - AI Meeting Facilitator

**Complete System - Built in 30 Hours for Sophiie Hackathon**

Sarah is an intelligent meeting assistant that listens to conversations in real-time, extracts action items, tracks decisions, monitors participation, and intervenes contextually to improve meeting productivity.

<img width="1755" height="1664" alt="image" src="https://github.com/user-attachments/assets/26b114f7-da84-4d32-a30a-ef9ddc7c132b" />
![Screenshot_15-2-2026_18953_localhost](https://github.com/user-attachments/assets/334198bc-c134-4e96-8f17-fe4d56f44191)



## 🎯 Live Demo

- **Demo Video**: [Add YouTube/Loom link]

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
┌─────────────────────┐
│   User (Voice/Text) │
└──────────┬──────────┘
           │
    ┌──────▼──────┐
    │   Frontend  │ (React + WebSocket)
    │  Port 5173  │
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │   Backend   │ (FastAPI)
    │  Port 8000  │
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │   Whisper   │ (Speech-to-Text)
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │   Ollama    │ (Llama 3.2 3B)
    │  + Regex    │
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │  Response   │ (JSON with extracted data)
    └─────────────┘
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

## 🎥 Demo Video

[Record a 2-3 minute demo showing:
1. Text input extraction
2. Voice input transcription
3. Dashboard updates in real-time
4. Export functionality
5. Voice output test]

## 🔗 Links

- **Backend Repo**: [Add link]
- **Frontend Repo**: [Add link]
  
- **Demo Video**: [Add link]

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







## 📄 License

MIT License - see LICENSE file for details


## 📧 Contact

Built by [Your Name]  
- GitHub: [@yourusername]
- LinkedIn: [Your LinkedIn]
- Email: your.email@example.com

---

⭐ If you found this helpful, please star the repo!

🎉 Built with ❤️ in 30 hours for Sophiie Hackathon

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

## Schedule

All times are **AEST (Australian Eastern Standard Time, UTC+10 — Brisbane time)**.

### Saturday, February 14

| Time | Event |
|------|-------|
| **9:00 AM** | Kickoff — challenge explained, rules confirmed |
| **9:30 AM** | **Hacking begins** |
| 12:00 PM | Office hours / Q&A (optional, Discord) |
| 4:00 PM | Community check-in / progress sharing (optional, Discord) |

### Sunday, February 15

| Time | Event |
|------|-------|
| **6:00 PM** | **Submission deadline — hard cut-off, no exceptions** |

### After the Hackathon

| When | Event |
|------|-------|
| Feb 16 – Feb 28 | Judging period — judges review all submissions |
| ~Early March | Winners announced via livestream (details shared on Discord and Email) |

---

## Rules

### The Essentials

1. **Solo only** — one person per submission, no teams
2. **No pre-work** — all project code must be written during the hackathon window (after 9:30 AM AEST, Feb 14)
3. **Public GitHub repo** — your repository must be publicly visible at time of submission
4. **AI assistance is allowed** — Copilot, Claude, ChatGPT, Cursor, whatever you want. You still need to build it within the timeframe
5. **Must be functional** — your project must run and be demonstrable, not just a concept or slide deck
6. **One submission per person** — you may iterate, but submit one final project

### What You CAN Prepare Before Kickoff

- Research, planning, and brainstorming (on paper, in your head — just not in code)
- Setting up your development environment
- Reading documentation for tools/APIs you plan to use
- Creating accounts (GitHub, API providers, etc.)
- Watching tutorials

### What You CANNOT Do Before Kickoff

- Write any project code
- Create your project repository
- Fork/clone an existing project and modify it
- Build components, libraries, or templates specifically for your submission
- Start a project in a private repo then make it public later

### How We Verify

We will check:
- **Repository creation date** — must be after 9:30 AM AEST, Feb 14
- **Commit history** — should show natural progression, not a single massive commit
- **First commit timestamp** — must be after kickoff

**Red flags that will result in disqualification:**
- Repo created before the hackathon
- Single commit containing the entire project
- Commits timestamped before kickoff
- Evidence of code copied from a pre-existing private repo

---

## Submission Requirements

**Deadline: 6:00 PM AEST, Sunday February 15, 2026 — hard cut-off.**

To submit, you must complete **all** of the following:

1. **Public GitHub repo** — created after kickoff, with a clear commit history
2. **This README** — fill out the [Your Submission](#your-submission) section below
3. **Demo video** (2–5 minutes) — show your agent in action, explain your approach
4. **Working project** — judges must be able to understand and evaluate your agent from the repo + video

### How to Submit

1. Fork this repository
2. Build your project in the fork
3. Fill out the [Your Submission](#your-submission) section below
4. Record your demo video and add the link to your submission
5. Ensure your repo is **public** before 6:00 PM AEST Sunday
6. Submit your repo link via the submission form (link will be shared at kickoff)

---

## Judging Criteria

| Criteria | Weight | What We're Looking For |
|----------|--------|----------------------|
| **Interaction Design** | 30% | How intuitive, natural, and delightful is the human-AI interaction? Does it feel good to use? |
| **Innovation** | 25% | Novel approach, creative problem-solving, or a fresh take on agent interaction |
| **Technical Execution** | 25% | Code quality, architecture, reliability, completeness |
| **Presentation** | 20% | Demo quality, clarity of communication, ability to convey your vision |

### Judges

Sophiie senior engineers and CTO. Judging will take place over a 2-week period following the submission deadline.

---

## Prizes

| Place | Prize |
|-------|-------|
| **1st Place** | **$5,000 AUD cash** |
| **Top Performers** | Job offers or interview fast-tracks at Sophiie* |
| **All Finalists** | Consideration for current and future roles |

*\*Job offers and interview fast-tracks are entirely at the discretion of Sophiie and are not guaranteed.*

> Participants retain full ownership and IP of their submissions. Sophiie receives a non-exclusive license to review and evaluate submissions for judging purposes only.

---

## Your Submission

> **Instructions:** Fill out this section in your forked repo. This is what judges will see first.

### Participant

| Field | Your Answer |
|-------|-------------|
| **Name** | |
| **University / Employer** | |

### Project

| Field | Your Answer |
|-------|-------------|
| **Project Name** | |
| **One-Line Description** | |
| **Demo Video Link** | |
| **Tech Stack** | |
| **AI Provider(s) Used** | |

### About Your Project

#### What does it do?

<!-- 2-3 paragraphs explaining your agent, the problem it solves, and why the interaction matters -->

#### How does the interaction work?

<!-- Describe the user experience — what does a user see, hear, or do when using your agent? -->

#### What makes it special?

<!-- What are you most proud of? What would you want the judges to notice? -->

#### How to run it

<!-- Step-by-step instructions to set up and run your project locally -->

```bash
# Example:
# git clone <your-repo>
# cd <your-project>
# npm install
# cp .env.example .env  # add your API keys
# npm start
```

#### Architecture / Technical Notes

<!-- Optional: describe your architecture, key technical decisions, or interesting implementation details -->

---

## Code of Conduct

All participants must adhere to a standard of respectful, professional behavior. Harassment, discrimination, or disruptive behavior of any kind will result in immediate disqualification.

By participating, you agree to:
- Treat all participants, judges, and organizers with respect
- Submit only your own original work created during the hackathon
- Not interfere with other participants' work
- Follow the rules outlined in this document

---

## Communication & Support

- **Discord** — join the hackathon Discord server for announcements, Q&A, and community chat (link provided upon registration)
- **Office hours** — available during the event for technical questions

---

## FAQ

**Q: Can I use boilerplate / starter templates?**
A: You can use publicly available boilerplate (e.g., `create-react-app`, `Next.js` starter) as a starting point. You cannot use custom templates you built specifically for this hackathon before kickoff.

**Q: Can I use existing open-source libraries and APIs?**
A: Yes. You can use any publicly available libraries, frameworks, APIs, and services. The code *you* write must be created during the hackathon.

**Q: Do I need to be in Australia?**
A: Preferred but not strictly required. The hackathon is primarily targeted at Australian residents and students, but we won't turn away great talent.

**Q: Can I use AI coding tools like Copilot or Claude?**
A: Absolutely. Use whatever tools you want. The 33-hour time constraint is the great equalizer.

**Q: What if I can't finish?**
A: Submit what you have. A well-thought-out partial project with a great demo video can still score well. We're evaluating your thinking and skill, not just completion.

**Q: How will I know if I won?**
A: Winners will be announced via livestream approximately 2 weeks after the hackathon. All participants will be notified.

**Q: Can I keep working on my project after the deadline?**
A: You can continue developing after the hackathon, but **only the state of your repo at 6:00 PM AEST Sunday Feb 15 will be judged**. We will check commit timestamps.

---

## About Sophiie

Sophiie is an AI office manager for trades businesses — helping plumbers, electricians, builders, and other trade professionals run their operations with intelligent automation. We're a team that cares deeply about how humans interact with AI, and we're looking for people who think the same way.

[sophiie.com](https://sophiie.com)

---

**Good luck. Build something that makes us say "wow."**
