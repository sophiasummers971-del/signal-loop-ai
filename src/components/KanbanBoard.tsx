import { motion } from "framer-motion";

interface Opportunity {
  id: string;
  title: string;
  match_score: number;
  stage: "idea" | "validate" | "build" | "monetize" | "scale";
}

const stages = [
  { key: "idea", label: "💡 Idea", color: "border-accent/30 bg-accent/5" },
  { key: "validate", label: "✅ Validate", color: "border-success/30 bg-success/5" },
  { key: "build", label: "🔨 Build", color: "border-primary/30 bg-primary/5" },
  { key: "monetize", label: "💰 Monetize", color: "border-accent/30 bg-accent/5" },
  { key: "scale", label: "🚀 Scale", color: "border-success/30 bg-success/5" },
];

const KanbanBoard = ({ opportunities }: { opportunities: Opportunity[] }) => {
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4 min-w-[900px]">
        {stages.map((stage) => {
          const items = opportunities.filter((o) => o.stage === stage.key);
          return (
            <div key={stage.key} className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-display font-semibold text-sm text-foreground">{stage.label}</h3>
                <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                  {items.length}
                </span>
              </div>
              <div className={`rounded-xl border-2 border-dashed ${stage.color} p-3 min-h-[200px] space-y-3`}>
                {items.length > 0 ? (
                  items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      className="bg-card rounded-lg p-3 border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="font-medium text-sm text-foreground">{item.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{item.match_score}% match</div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground/50 py-8">
                    Drag ideas here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;
