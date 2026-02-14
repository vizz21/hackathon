import { useState, useRef } from 'react'
import { useMeetingStore } from './store.js'

export default function VoiceInput() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [status, setStatus] = useState('Ready')
  const mediaRecorderRef = useRef(null)
  const wsRef = useRef(null)
  const { meetingState, setMeetingState } = useMeetingStore()
  
  const startRecording = async () => {
    try {
      setStatus('Requesting microphone...')
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      })
      
      setStatus('Connecting to backend...')
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })
      mediaRecorderRef.current = mediaRecorder
      
      // Connect to backend WebSocket
      const ws = new WebSocket('ws://localhost:8000/ws/audio')
      wsRef.current = ws
      
      ws.onopen = () => {
        console.log('🎤 Audio WebSocket connected')
        setIsRecording(true)
        setStatus('Listening...')
      }
      
    ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log('📥 Received from backend:', data)
  
  if (data.type === 'transcription') {
    console.log('✅ Transcription received:', data.transcript)
    console.log('✅ Interventions:', data.interventions)
    console.log('✅ State:', data.state)
    
    // Update transcript
    setTranscript(prev => prev + ' ' + data.transcript)
    
    // Get current state
    const currentState = useMeetingStore.getState().meetingState
    console.log('📊 Current state before update:', currentState)
    
    // Update meeting state with Sarah's analysis
    const newState = {
      ...currentState,
      interventions: [
        ...currentState.interventions,
        ...(data.interventions || [])
      ],
      actions: data.state?.actions || currentState.actions,
      decisions: data.state?.decisions || currentState.decisions,
      sentiment: data.state?.sentiment || currentState.sentiment,
      energy: data.state?.energy || currentState.energy
    }
    
    console.log('📊 New state after update:', newState)
    
    // Use the setter method
    useMeetingStore.getState().setMeetingState(newState)
    
    console.log('✅ State updated successfully')
  }
}
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        setStatus('Connection error')
      }
      
      ws.onclose = () => {
        console.log('👋 WebSocket closed')
        setStatus('Disconnected')
      }
      
      // Send audio chunks every 3 seconds
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          console.log('🎤 Sending audio chunk:', event.data.size, 'bytes')
          
          // Convert to base64
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
      
      mediaRecorder.start(3000) // Chunk every 3 seconds
      
    } catch (error) {
      console.error('❌ Microphone error:', error)
      setStatus('Microphone access denied')
      alert('⚠️ Microphone access required!\n\nPlease allow microphone access and try again.')
    }
  }
  
  const stopRecording = () => {
    setStatus('Stopping...')
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
    
    if (wsRef.current) {
      wsRef.current.close()
    }
    
    setIsRecording(false)
    setStatus('Stopped')
  }
  
  const clearTranscript = () => {
    setTranscript('')
  }
  
  return (
    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-2xl">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        🎤 Voice Input
        <span className="text-xs text-white/60 font-normal">
          (Phase 3 - Whisper STT)
        </span>
      </h3>
      
      {/* Recording Button */}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-full py-4 rounded-xl font-semibold transition-all ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white shadow-lg`}
      >
        {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
      </button>
      
      {/* Status Indicator */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          isRecording ? 'bg-red-400 animate-pulse' : 'bg-gray-400'
        }`}></div>
        <span className="text-white/60 text-sm">{status}</span>
      </div>
      
      {/* Live Transcript */}
      {transcript && (
        <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs text-white/60 font-semibold">Live Transcript:</div>
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
      
      {/* Instructions */}
      {!isRecording && !transcript && (
        <div className="mt-4 p-3 bg-blue-500/10 rounded-xl border border-blue-400/20">
          <div className="text-xs text-blue-300">
            💡 <strong>Try saying:</strong> "Sarah will send the budget report by Friday"
          </div>
        </div>
      )}
    </div>
  )
}