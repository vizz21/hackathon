import { useState, useEffect } from 'react'
import { useMeetingStore } from './store.js'
import VoiceInput from './VoiceInput.jsx'
import ActionPanel from './ActionPanel.jsx'
import DecisionsPanel from './DecisionsPanel.jsx'
import StatsPanel from './StatsPanel.jsx'
import ExportSummary from './ExportSummary.jsx'

export default function App() {
  const [transcript, setTranscript] = useState('')
  const [ws, setWs] = useState(null)
  const meetingState = useMeetingStore((state) => state.meetingState)

  // VOICE TEST FUNCTION - GUARANTEED TO WORK
  const testVoice = () => {
    console.log('🧪 Testing voice...')
    const utterance = new SpeechSynthesisUtterance("This is Sarah speaking. Voice test successful!")
    utterance.rate = 0.95
    utterance.pitch = 1.1
    utterance.volume = 1.0
    
    utterance.onstart = () => console.log('▶️ Voice test started')
    utterance.onend = () => console.log('✅ Voice test complete')
    utterance.onerror = (e) => console.error('❌ Voice test error:', e)
    
    window.speechSynthesis.cancel() // Clear any ongoing speech
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    // Connect to WebSocket for text input
    const websocket = new WebSocket('ws://localhost:8000/ws')
    
    websocket.onopen = () => {
      console.log('✅ Text WebSocket connected')
      setWs(websocket)
    }
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log('📥 Received:', data)
      console.log('  ↳ Actions:', data.state?.actions?.length || 0)
      console.log('  ↳ Decisions:', data.state?.decisions?.length || 0)
      console.log('  ↳ Parking:', data.state?.parking_lot?.length || 0)
      console.log('  ↳ Interventions:', data.interventions?.length || 0)
      
      // Use Zustand's setState directly with functional update to avoid stale state
      useMeetingStore.setState(state => ({
        meetingState: {
          ...state.meetingState,
          // Append new interventions to existing ones
          interventions: [
            ...state.meetingState.interventions,
            ...(data.interventions || [])
          ],
          // Replace with new data from backend (backend sends full state)
          actions: data.state?.actions || state.meetingState.actions,
          decisions: data.state?.decisions || state.meetingState.decisions,
          parking_lot: data.state?.parking_lot || state.meetingState.parking_lot,
          // Merge participation data
          participation: {
            ...state.meetingState.participation,
            ...(data.state?.participation || {})
          },
          sentiment: data.state?.sentiment || state.meetingState.sentiment,
          energy: data.state?.energy || state.meetingState.energy
        }
      }))
      
      console.log('✅ State updated!')
    }
    
    websocket.onerror = (error) => {
      console.error('❌ WebSocket error:', error)
    }
    
    websocket.onclose = () => {
      console.log('👋 WebSocket closed')
    }
    
    return () => {
      if (websocket) websocket.close()
    }
  }, [])

  const handleSend = () => {
    if (ws && ws.readyState === WebSocket.OPEN && transcript.trim()) {
      console.log('📤 Sending:', transcript)
      ws.send(JSON.stringify({ transcript: transcript.trim() }))
      setTranscript('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      {/* VOICE TEST BUTTON - Top Right Corner */}
      <button
        onClick={testVoice}
        className="fixed top-4 right-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 font-semibold text-sm transition-all"
        title="Click to test if browser voice works"
      >
        🧪 Test Voice
      </button>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
            🤖 Sarah
          </h1>
          <p className="text-xl text-white/80">
            AI Meeting Facilitator
          </p>
          <p className="text-sm text-white/60 mt-2">
            Powered by Ollama + Whisper + Browser TTS
          </p>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Input + Sarah Says */}
        <div className="lg:col-span-1 space-y-6">
          {/* Text Input */}
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-2xl">
            <h3 className="text-white font-semibold mb-4">
              💬 Text Input
            </h3>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type meeting notes here or use voice input below..."
              className="w-full h-32 p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
            <button
              onClick={handleSend}
              className="mt-3 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all shadow-lg"
            >
              Send to Sarah
            </button>
          </div>

          {/* Voice Input */}
          <VoiceInput />

          {/* Sarah Says... */}
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-2xl">
            <h3 className="text-white font-semibold mb-4">
              🎙️ Sarah Says...
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {meetingState.interventions.length === 0 ? (
                <div className="text-white/40 text-center py-8 text-sm">
                  Sarah's interventions will appear here...
                </div>
              ) : (
                meetingState.interventions.slice(-5).reverse().map((intervention, i) => (
                  <div 
                    key={i} 
                    className="p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-xl animate-slideIn"
                  >
                    <div className="text-xs text-purple-300 font-semibold mb-1">
                      {intervention.type ? intervention.type.toUpperCase().replace('_', ' ') : 'NOTE'}
                    </div>
                    <div className="text-white text-sm">{intervention.content}</div>
                    <div className="text-xs text-white/60 mt-2 flex justify-between">
                      <span>👤 {intervention.speaker || 'Unknown'}</span>
                      <span>✨ {Math.round((intervention.confidence || 0.9) * 100)}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Action Items, Decisions, Stats */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Row: 3 Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ActionPanel />
            <DecisionsPanel />
            <StatsPanel />
          </div>

          {/* Bottom Row: Export Summary */}
          <ExportSummary />
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-8 text-center">
        <div className="text-white/60 text-sm">
          Built with ❤️ for Sophiie Hackathon • Ollama + Whisper + FastAPI + React
        </div>
        <div className="flex items-center justify-center gap-3 mt-3">
          <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-semibold">
            ✅ Voice Input
          </span>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold">
            ✅ Voice Output
          </span>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold">
            ✅ AI Analysis
          </span>
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-semibold">
            ✅ Export
          </span>
        </div>
      </div>
    </div>
  )
}