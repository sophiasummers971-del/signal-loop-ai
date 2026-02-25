import { motion } from "framer-motion";
import { Lightbulb, ListChecks, DollarSign, Layers, LucideIcon } from "lucide-react";

interface EmptyStateProps {
  type: "opportunities" | "tasks" | "revenue" | "roadmap";
  message?: string;
}

const configs: Record<EmptyStateProps["type"], { icon: LucideIcon; title: string; description: string; color: string }> = {
  opportunities: {
    icon: Lightbulb,
    title: "No signals detected",
    description: "Complete onboarding to activate the AI scanner and generate your first opportunities.",
    color: "text-primary",
  },
  tasks: {
    icon: ListChecks,
    title: "Task queue empty",
    description: "Add your first task above to start building momentum.",
    color: "text-accent",
  },
  revenue: {
    icon: DollarSign,
    title: "No revenue streams",
    description: "Start logging income to visualize your growth trajectory.",
    color: "text-amber-400",
  },
  roadmap: {
    icon: Layers,
    title: "Roadmap offline",
    description: "Move ideas into the pipeline to activate your roadmap.",
    color: "text-primary",
  },
};

const EmptyState = ({ type, message }: EmptyStateProps) => {
  const config = configs[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col items-center justify-center py-20 px-4"
    >
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Icon container */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative mb-6"
      >
        {/* Hex border */}
        <div className="w-20 h-20 rounded-xl border border-primary/20 bg-card/60 backdrop-blur-sm flex items-center justify-center rotate-3 shadow-neon-cyan/20">
          <Icon className={`w-9 h-9 ${config.color} drop-shadow-lg`} />
        </div>
        {/* Corner dots */}
        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary/40 neon-flicker" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-accent/40" />
      </motion.div>

      {/* Decorative lines */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary/30" />
        <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
        <div className="w-12 h-px bg-gradient-to-l from-transparent to-primary/30" />
      </div>

      <h3 className="font-display text-lg font-bold text-foreground tracking-wider uppercase mb-2 text-neon-glow">
        {config.title}
      </h3>
      <p className="text-muted-foreground text-sm font-mono max-w-xs text-center leading-relaxed">
        {message || config.description}
      </p>

      {/* Bottom decoration */}
      <div className="mt-6 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-1 bg-primary/20 rounded-full"
            animate={{ height: [4, 12, 4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default EmptyState;
