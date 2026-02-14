import { useMeetingStore } from './store.js'

export default function DecisionsPanel() {
  const { decisions } = useMeetingStore().meetingState

  return (
    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-2xl">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-white">
        💡 Decisions
        <span className="text-sm bg-yellow-500 px-2 py-1 rounded-full">{decisions.length}</span>
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {decisions.length === 0 ? (
          <div className="text-white/40 text-center py-12 text-sm">
            No decisions yet...
          </div>
        ) : (
          decisions.map((decision, i) => (
            <div 
              key={i} 
              className="p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-xl hover:bg-yellow-500/20 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-white text-sm mb-2">
                    {decision.what}
                  </div>
                  {decision.speaker && (
                    <div className="text-xs text-yellow-200">
                      👤 Decided by: {decision.speaker}
                    </div>
                  )}
                </div>
                <div className="text-xs text-white/60">
                  {Math.round(decision.confidence * 100)}%
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}