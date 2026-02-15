import { useMeetingStore } from './store.js'

export default function ActionPanel() {
  const { actions, interventions } = useMeetingStore().meetingState

  // Combine actions and interventions with smart deduplication
  const allActionItems = []
  const seen = new Set()
  
  // Priority 1: Add actions from state.actions array
  actions.forEach(action => {
    const key = `${action.speaker.toLowerCase()}:${action.task.toLowerCase()}`
    
    if (!seen.has(key)) {
      seen.add(key)
      allActionItems.push(action)
    }
  })
  
  // Priority 2: Add action_item interventions (only if not already added)
  interventions
    .filter(i => i.type === 'action_item')
    .forEach(i => {
      // Extract data from intervention
      const speaker = i.speaker || 'Unknown'
      const task = i.details?.task || i.content || ''
      const deadline = i.details?.deadline || 'soon'
      
      // Create key for deduplication
      const key = `${speaker.toLowerCase()}:${task.toLowerCase()}`
      
      // Check if similar action already exists
      const alreadyExists = Array.from(seen).some(existingKey => {
        return key.includes(existingKey) || existingKey.includes(key)
      })
      
      if (!alreadyExists && task.length > 3) {
        seen.add(key)
        allActionItems.push({
          speaker: speaker,
          task: task,
          deadline: deadline,
          confidence: i.confidence || 0.9
        })
      }
    })

  return (
    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-2xl">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-white">
        📋 Action Items
        <span className="text-sm bg-blue-500 px-2 py-1 rounded-full">
          {allActionItems.length}
        </span>
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {allActionItems.length === 0 ? (
          <div className="text-white/40 text-center py-12 text-sm">
            No action items yet...
          </div>
        ) : (
          allActionItems.map((action, i) => (
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
                  {Math.round((action.confidence || 0.9) * 100)}%
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}