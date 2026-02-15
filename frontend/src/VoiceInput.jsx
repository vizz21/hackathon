import { useState, useRef, useEffect } from 'react'
import { useMeetingStore } from './store.js'

export default function VoiceInput() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [status, setStatus] = useState('Ready')
  const [isSarahSpeaking, setIsSarahSpeaking] = useState(false)
  const mediaRecorderRef = useRef(null)
  const wsRef = useRef(null)
  const chunkCountRef = useRef(0)
  const audioRef = useRef(null)
  
  // Load voices for speech synthesis
  useEffect(() => {
    if (window.speechSynthesis) {
      // Force load voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices()
        console.log('🔊 Available voices:', voices.length)
        voices.forEach(v => console.log(`  - ${v.name} (${v.lang})`))
      }
      
      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])
  
  const startRecording = async () => {
    try {
      setStatus('Requesting microphone...')
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      })
      
      setStatus('Connecting to backend...')
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })
      mediaRecorderRef.current = mediaRecorder
      chunkCountRef.current = 0
      
      const ws = new WebSocket('ws://localhost:8000/ws/audio')
      wsRef.current = ws
      
      ws.onopen = () => {
        console.log('🎤 Audio WebSocket connected')
        setIsRecording(true)
        setStatus('🎤 Listening... (speak for 9+ seconds)')
      }
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log('📥 FULL DATA RECEIVED:', data)
        
        if (data.type === 'transcription') {
          console.log('✅ Transcription:', data.transcript)
          console.log('✅ Interventions:', data.interventions)
          console.log('✅ State:', data.state)
          
          // Update transcript
          setTranscript(data.transcript)
          setStatus('✅ Transcription complete!')
          
          // Update meeting state
          useMeetingStore.setState(state => ({
            meetingState: {
              ...state.meetingState,
              interventions: [
                ...state.meetingState.interventions,
                ...(data.interventions || [])
              ],
              actions: data.state?.actions || state.meetingState.actions,
              decisions: data.state?.decisions || state.meetingState.decisions,
              parking_lot: data.state?.parking_lot || state.meetingState.parking_lot,
              participation: data.state?.participation || state.meetingState.participation,
              sentiment: data.state?.sentiment || state.meetingState.sentiment,
              energy: data.state?.energy || state.meetingState.energy
            }
          }))
          
          console.log('✅ State updated')
          
          // Get interventions to speak
          const newInterventions = data.interventions || []
          console.log('🎯 Interventions to process:', newInterventions.length)
          
          if (newInterventions.length > 0) {
            // Speak ALL interventions (in case there are multiple)
            newInterventions.forEach((intervention, index) => {
              console.log(`🔊 Intervention ${index + 1}:`, intervention.content)
              
              // Delay each intervention slightly if multiple
              setTimeout(() => {
                playSpeechSynthesisWithText(intervention.content)
              }, index * 100) // 100ms delay between multiple interventions
            })
          } else {
            console.log('⚠️ No interventions to speak')
          }
        }
      }
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        setStatus('❌ Connection error')
      }
      
      ws.onclose = () => {
        console.log('👋 WebSocket closed')
        setStatus('Disconnected')
        setIsSarahSpeaking(false)
      }
      
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          chunkCountRef.current += 1
          console.log(`🎤 Sending chunk #${chunkCountRef.current}: ${event.data.size} bytes`)
          
          const reader = new FileReader()
          reader.onload = () => {
            const base64Audio = reader.result.split(',')[1]
            ws.send(JSON.stringify({
              type: 'audio',
              audio: base64Audio
            }))
          }
          reader.readAsDataURL(event.data)
        }
      }
      
      mediaRecorder.start(3000)
      
    } catch (error) {
      console.error('❌ Microphone error:', error)
      setStatus('❌ Microphone access denied')
      alert('⚠️ Microphone access required!')
    }
  }
  
  const stopRecording = () => {
    setStatus('⏹️ Stopping...')
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
    
    if (wsRef.current) {
      wsRef.current.close()
    }
    
    setIsRecording(false)
    setStatus('Ready')
    chunkCountRef.current = 0
  }
  
  const clearTranscript = () => {
    setTranscript('')
    setStatus('Ready')
  }
  
  // Speech synthesis with text parameter
  const playSpeechSynthesisWithText = (textToSpeak) => {
    try {
      if (!textToSpeak || textToSpeak.trim().length === 0) {
        console.log('⚠️ No text to speak')
        return
      }
      
      console.log('🔊 STARTING SPEECH:', textToSpeak)
      
      setIsSarahSpeaking(true)
      setStatus('🔊 Sarah is speaking...')
      
      // Cancel any ongoing speech
      if (window.speechSynthesis.speaking) {
        console.log('🛑 Canceling previous speech')
        window.speechSynthesis.cancel()
      }
      
      // Small delay to ensure cancellation completes
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(textToSpeak)
        
        // Get voices
        const voices = window.speechSynthesis.getVoices()
        console.log('🎤 Total voices available:', voices.length)
        
        // Try to find a good female voice
        const femaleVoice = voices.find(voice => 
          voice.name.includes('Female') || 
          voice.name.includes('Samantha') ||
          voice.name.includes('Karen') ||
          voice.name.includes('Zira') ||
          voice.name.includes('Google') ||
          voice.lang.startsWith('en')
        )
        
        if (femaleVoice) {
          utterance.voice = femaleVoice
          console.log('🎤 Using voice:', femaleVoice.name)
        } else {
          console.log('🎤 Using default voice')
        }
        
        // Configure
        utterance.rate = 0.95
        utterance.pitch = 1.1
        utterance.volume = 1.0
        utterance.lang = 'en-US'
        
        // Handlers
        utterance.onstart = () => {
          console.log('▶️ Speech started')
        }
        
        utterance.onend = () => {
          console.log('✅ Speech complete')
          setIsSarahSpeaking(false)
          setStatus('✅ Ready')
        }
        
        utterance.onerror = (error) => {
          console.error('❌ Speech error:', error)
          setIsSarahSpeaking(false)
          setStatus('Ready')
        }
        
        // Speak!
        console.log('📢 Calling speak()...')
        window.speechSynthesis.speak(utterance)
        console.log('📢 Speak() called, speaking:', window.speechSynthesis.speaking)
        
      }, 100) // 100ms delay after cancel
      
    } catch (error) {
      console.error('❌ Speech synthesis failed:', error)
      setIsSarahSpeaking(false)
      setStatus('Ready')
    }
  }
  
  return (
    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-2xl">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        🎤 Voice Input
        <span className="text-xs text-white/60 font-normal">
          (Whisper STT + Browser TTS)
        </span>
      </h3>
      
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isSarahSpeaking}
        className={`w-full py-4 rounded-xl font-semibold transition-all shadow-lg ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : isSarahSpeaking
            ? 'bg-purple-500 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white disabled:opacity-70`}
      >
        {isRecording ? '⏹️ Stop Recording' : 
         isSarahSpeaking ? '🔊 Sarah Speaking...' :
         '🎤 Start Recording'}
      </button>
      
      <div className="mt-4 flex items-center justify-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          isRecording ? 'bg-red-400 animate-pulse' : 
          isSarahSpeaking ? 'bg-purple-400 animate-pulse' :
          status === 'Ready' ? 'bg-green-400' :
          status.includes('✅') ? 'bg-green-400' :
          status.includes('❌') ? 'bg-red-400' :
          'bg-yellow-400'
        }`}></div>
        <span className="text-white/60 text-sm">{status}</span>
      </div>
      
      {transcript && (
        <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs text-white/60 font-semibold">
              📝 Live Transcript:
            </div>
            <button
              onClick={clearTranscript}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Clear
            </button>
          </div>
          <div className="text-white text-sm max-h-32 overflow-y-auto">
            {transcript}
          </div>
        </div>
      )}
      
      {isSarahSpeaking && (
        <div className="mt-4 p-3 bg-purple-500/20 rounded-xl border border-purple-400/30 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              <div className="w-3 h-3 bg-purple-400 rounded-full absolute top-0 left-0 animate-ping"></div>
            </div>
            <span className="text-purple-200 text-sm font-semibold">
              🔊 Sarah is speaking...
            </span>
          </div>
        </div>
      )}
      
      {!isRecording && !transcript && !isSarahSpeaking && (
        <div className="mt-4 p-3 bg-blue-500/10 rounded-xl border border-blue-400/20">
          <div className="text-xs text-blue-300 mb-2 font-semibold">
            💡 Try saying:
          </div>
          <div className="text-xs text-blue-200 space-y-1">
            <div>• "Sarah will send report by Friday"</div>
            <div>• "We will discuss it later"</div>
            <div>• "Mary decided to use React"</div>
          </div>
          <div className="text-xs text-blue-300 mt-3 pt-2 border-t border-blue-400/20 italic">
            🎙️ Sarah will respond with her voice!
          </div>
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex items-center justify-center gap-2 text-xs flex-wrap">
          <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full font-semibold">
            ✅ Voice Input
          </span>
          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full font-semibold">
            ✅ Voice Output
          </span>
        </div>
      </div>
    </div>
  )
}