import { create } from 'zustand'

export const useMeetingStore = create((set, get) => ({
  isConnected: false,
  meetingState: {
    interventions: [],
    actions: [],
    decisions: [],
    parking_lot: [],
    participation: {},
    sentiment: 'neutral',
    energy: 'medium'
  },
  setMeetingState: (newState) => {
    console.log('📊 Updating meeting state:', newState)
    set({ meetingState: newState })
  },
  sendTranscript: async (transcript) => {
    try {
      const ws = new WebSocket('ws://localhost:8000/ws')
      
      ws.onopen = () => {
        console.log('✅ Connected to Sarah backend')
        set({ isConnected: true })
        ws.send(JSON.stringify({ transcript }))
      }
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log('📥 Received from Sarah:', data)
        
        set({ 
          meetingState: { 
            ...get().meetingState, 
            interventions: [
              ...get().meetingState.interventions,
              ...(data.interventions || [])
            ],
            actions: data.state?.actions || get().meetingState.actions,
            decisions: data.state?.decisions || get().meetingState.decisions,
            parking_lot: data.state?.parking_lot || get().meetingState.parking_lot,
            participation: data.state?.participation || get().meetingState.participation,
            sentiment: data.state?.sentiment || get().meetingState.sentiment,
            energy: data.state?.energy || get().meetingState.energy
          }
        })
        
        ws.close()
      }
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        set({ isConnected: false })
      }
      
      ws.onclose = () => {
        set({ isConnected: false })
      }
    } catch (error) {
      console.error('❌ Failed to connect to backend:', error)
      set({ isConnected: false })
    }
  }
}))