import { useMeetingStore } from './store.js'

export default function ActionPanel() {
  const { actions } = useMeetingStore().meetingState

  return (
    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-2xl">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-white">
        📋 Action Items
        <span className="text-sm bg-blue-500 px-2 py-1 rounded-full">{actions.length}</span>
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {actions.length === 0 ? (
          <div className="text-white/40 text-center py-12 text-sm">
            No action items yet...
          </div>
        ) : (
          actions.map((action, i) => (
            <div 
              key={i} 
              className="p-4 bg-green-500/10 border border-green-400/30 rounded-xl hover:bg-green-500/20 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-green-300 text-sm mb-1">
                    👤 {action.speaker}
                  </div>
                  <div className="text-white text-sm mb-2">
                    {action.task}
                  </div>
                  {action.deadline && (
                    <div className="inline-flex items-center gap-1 text-xs bg-green-400/20 text-green-200 px-2 py-1 rounded-full">
                      <span>⏰</span>
                      <span>{action.deadline}</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-white/60">
                  {Math.round(action.confidence * 100)}%
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}