import { useMeetingStore } from './store.js'

export default function StatsPanel() {
  const { participation, sentiment, energy, parking_lot } = useMeetingStore().meetingState

  const getSentimentEmoji = (s) => {
    switch(s) {
      case 'positive': return '😊'
      case 'negative': return '😟'
      case 'neutral': return '😐'
      default: return '🤔'
    }
  }

  const getEnergyColor = (e) => {
    switch(e) {
      case 'high': return 'bg-green-400'
      case 'medium': return 'bg-yellow-400'
      case 'low': return 'bg-red-400'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-2xl">
      <h3 className="font-semibold text-lg mb-4 text-white">
        📊 Meeting Stats
      </h3>
      
      <div className="space-y-4">
        {/* Sentiment */}
        <div className="p-4 bg-purple-500/10 border border-purple-400/30 rounded-xl">
          <div className="text-xs text-purple-200 mb-1">Sentiment</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getSentimentEmoji(sentiment)}</span>
            <span className="text-white font-semibold capitalize">{sentiment}</span>
          </div>
        </div>

        {/* Energy */}
        <div className="p-4 bg-blue-500/10 border border-blue-400/30 rounded-xl">
          <div className="text-xs text-blue-200 mb-2">Energy Level</div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getEnergyColor(energy)} animate-pulse`}></div>
            <span className="text-white font-semibold capitalize">{energy}</span>
          </div>
        </div>

        {/* Participation */}
        <div className="p-4 bg-orange-500/10 border border-orange-400/30 rounded-xl">
          <div className="text-xs text-orange-200 mb-2">Participation</div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {Object.keys(participation).length === 0 ? (
              <div className="text-white/40 text-xs">Tracking speakers...</div>
            ) : (
              Object.entries(participation).map(([speaker, stats]) => (
                <div key={speaker} className="flex justify-between items-center">
                  <span className="text-white text-sm">👤 {speaker}</span>
                  <span className="text-xs text-orange-200">{stats.turns || 0} turns</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Parking Lot */}
        <div className="p-4 bg-red-500/10 border border-red-400/30 rounded-xl">
          <div className="text-xs text-red-200 mb-2">🅿️ Parking Lot</div>
          <div className="text-sm text-white">
            {parking_lot?.length || 0} items parked
          </div>
        </div>
      </div>
    </div>
  )
}