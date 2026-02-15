import { useMeetingStore } from './store.js'

export default function DecisionsPanel() {
  const { decisions, interventions } = useMeetingStore().meetingState

  // Combine decisions from state and decision interventions
  const allDecisions = []
  const seen = new Set()
  
  // Add decisions from state array
  decisions.forEach(d => {
    const text = typeof d === 'string' ? d : d.what
    const key = text.toLowerCase().trim()
    
    if (!seen.has(key)) {
      seen.add(key)
      allDecisions.push({
        what: text,
        speaker: typeof d === 'string' ? 'Team' : (d.speaker || 'Team'),
        confidence: typeof d === 'string' ? 0.9 : (d.confidence || 0.9)
      })
    }
  })
  
  // Add decisions from interventions (only if not already in state)
  interventions
    .filter(i => i.type === 'decision')
    .forEach(i => {
      const text = i.content || i.details?.what || ''
      // Remove "Decision: " prefix if present
      const cleanText = text.replace(/^Decision:\s*/i, '').trim()
      const key = cleanText.toLowerCase()
      
      if (!seen.has(key) && cleanText.length > 0) {
        seen.add(key)
        allDecisions.push({
          what: cleanText,
          speaker: i.speaker || 'Team',
          confidence: i.confidence || 0.9
        })
      }
    })

  return (
    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-2xl">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-white">
        💡 Decisions
        <span className="text-sm bg-yellow-500 px-2 py-1 rounded-full">
          {allDecisions.length}
        </span>
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {allDecisions.length === 0 ? (
          <div className="text-white/40 text-center py-12 text-sm">
            No decisions yet...
          </div>
        ) : (
          allDecisions.map((decision, i) => (
            <div 
              key={i} 
              className="p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-xl hover:bg-yellow-500/20 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-white text-sm mb-2">
                    {decision.what}
                  </div>
                  <div className="text-xs text-yellow-200">
                    👤 Decided by: {decision.speaker}
                  </div>
                </div>
                <div className="text-xs text-white/60">
                  {Math.round((decision.confidence || 0.9) * 100)}%
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
