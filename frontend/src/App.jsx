import VoiceInput from './VoiceInput.jsx'
import { useState, useEffect } from 'react'
import { useMeetingStore } from './store.js'
import ActionPanel from './ActionPanel.jsx'
import DecisionsPanel from './DecisionsPanel.jsx'
import StatsPanel from './StatsPanel.jsx'


export default function App() {
  const { meetingState, sendTranscript, isConnected } = useMeetingStore()
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim()) {
      sendTranscript(input.trim())
      setInput('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            🤖 Sarah AI Meeting Facilitator
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="text-white text-sm">
              {isConnected ? 'Backend Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LEFT COLUMN: Input + Sarah's Interventions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Transcript Input Box */}
            {/* After the transcript textarea,  */}
              
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-2xl">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                💬 Meeting Transcript
              </h3>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Type conversation here...&#10;&#10;Example:&#10;'Sarah will send budget by Friday'&#10;&#10;Press Enter to analyze"
                className="w-full h-40 p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 resize-none focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="mt-3 w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
              >
                🚀 Analyze with Sarah
              </button>
            </div>
            <VoiceInput />
            {/* Sarah's Recent Interventions */}
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-2xl">
              <h3 className="text-white font-semibold mb-3">🎤 Sarah Says...</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {meetingState.interventions.length === 0 ? (
                  <div className="text-white/40 text-center py-8 text-sm">
                    Waiting for transcript...
                  </div>
                ) : (
                  meetingState.interventions.slice(-5).reverse().map((intervention, i) => (
                    <div 
                      key={i} 
                      className="p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-xl animate-slideIn"
                    >
                      <div className="text-xs text-purple-300 font-semibold mb-1">
                        {intervention.type.toUpperCase()}
                      </div>
                      <div className="text-white text-sm">{intervention.content}</div>
                      <div className="text-xs text-white/60 mt-2 flex justify-between">
                        <span>👤 {intervention.speaker}</span>
                        <span>✨ {Math.round((intervention.confidence || 0.9) * 100)}%</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMNS: 3-Panel Dashboard */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <ActionPanel />
            <DecisionsPanel />
            <StatsPanel />
          </div>
        </div>
      </div>
    </div>
  )
}