import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Target, Users, DollarSign, ChevronDown, ChevronUp, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Opportunity {
  id: string;
  title: string;
  audience: string;
  problem: string;
  monetization: string;
  mvp_steps: string[];
  match_score: number;
  stage: "idea" | "validate" | "build" | "monetize" | "scale";
}

const OpportunityCard = ({ opportunity, onStartIdea }: { opportunity: Opportunity; onStartIdea?: () => void }) => {
  const [expanded, setExpanded] = useState(false);

  const matchColor = opportunity.match_score >= 90 ? "text-success" : opportunity.match_score >= 80 ? "text-accent" : "text-muted-foreground";

  return (
    <div className="bg-card rounded-xl border p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-accent transition-colors">{opportunity.title}</h3>
        <div className={`font-display font-bold text-lg ${matchColor}`}>{opportunity.match_score}%</div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-2">
          <Users className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <span className="text-sm text-muted-foreground">{opportunity.audience}</span>
        </div>
        <div className="flex items-start gap-2">
          <Target className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <span className="text-sm text-muted-foreground">{opportunity.problem}</span>
        </div>
        <div className="flex items-start gap-2">
          <DollarSign className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <span className="text-sm text-muted-foreground">{opportunity.monetization}</span>
        </div>
      </div>

      <button onClick={() => setExpanded(!expanded)} className="text-sm font-medium text-accent flex items-center gap-1 mb-3">
        MVP Steps {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <ol className="space-y-2 mb-4">
              {opportunity.mvp_steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>

      {opportunity.stage === "idea" && onStartIdea && (
        <Button variant="accent" size="sm" className="w-full gap-1" onClick={onStartIdea}>
          <Rocket className="w-4 h-4" /> Start This Idea
        </Button>
      )}
      {opportunity.stage !== "idea" && (
        <div className="text-sm text-success font-medium text-center py-2">✓ In progress</div>
      )}
    </div>
  );
};

export default OpportunityCard;
