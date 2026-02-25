import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CyberSkeletonProps {
  className?: string;
  variant?: "card" | "stat" | "text" | "title" | "chart";
}

const shimmer = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
  },
  transition: {
    duration: 2.5,
    repeat: Infinity,
    ease: "linear" as const,
  },
};

export const CyberSkeleton = ({ className, variant = "text" }: CyberSkeletonProps) => {
  const base = "rounded-lg relative overflow-hidden";
  const gradientBg =
    "bg-gradient-to-r from-muted via-primary/10 to-muted bg-[length:200%_100%]";

  if (variant === "stat") {
    return (
      <div className={cn("bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-primary/10", className)}>
        <motion.div
          className={cn(base, gradientBg, "w-5 h-5 mb-3")}
          animate={shimmer.animate}
          transition={shimmer.transition}
        />
        <motion.div
          className={cn(base, gradientBg, "w-16 h-7 mb-2")}
          animate={shimmer.animate}
          transition={{ ...shimmer.transition, delay: 0.1 }}
        />
        <motion.div
          className={cn(base, gradientBg, "w-24 h-3")}
          animate={shimmer.animate}
          transition={{ ...shimmer.transition, delay: 0.2 }}
        />
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("bg-card/80 backdrop-blur-sm rounded-xl p-5 border border-primary/10 space-y-4", className)}>
        <div className="flex items-center justify-between">
          <motion.div className={cn(base, gradientBg, "w-32 h-5")} animate={shimmer.animate} transition={shimmer.transition} />
          <motion.div className={cn(base, gradientBg, "w-12 h-6 rounded-full")} animate={shimmer.animate} transition={{ ...shimmer.transition, delay: 0.1 }} />
        </div>
        <motion.div className={cn(base, gradientBg, "w-full h-4")} animate={shimmer.animate} transition={{ ...shimmer.transition, delay: 0.15 }} />
        <motion.div className={cn(base, gradientBg, "w-3/4 h-4")} animate={shimmer.animate} transition={{ ...shimmer.transition, delay: 0.2 }} />
        <div className="flex gap-2 pt-2">
          <motion.div className={cn(base, gradientBg, "w-20 h-8 rounded-md")} animate={shimmer.animate} transition={{ ...shimmer.transition, delay: 0.25 }} />
          <motion.div className={cn(base, gradientBg, "w-20 h-8 rounded-md")} animate={shimmer.animate} transition={{ ...shimmer.transition, delay: 0.3 }} />
        </div>
      </div>
    );
  }

  if (variant === "chart") {
    return (
      <div className={cn("bg-card/80 backdrop-blur-sm rounded-xl p-5 border border-primary/10 space-y-4", className)}>
        <motion.div className={cn(base, gradientBg, "w-40 h-5")} animate={shimmer.animate} transition={shimmer.transition} />
        <div className="flex items-end gap-2 h-40">
          {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
            <motion.div
              key={i}
              className={cn("flex-1 rounded-t", gradientBg)}
              style={{ height: `${h}%` }}
              animate={shimmer.animate}
              transition={{ ...shimmer.transition, delay: i * 0.08 }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "title") {
    return (
      <motion.div
        className={cn(base, gradientBg, "h-8 w-64", className)}
        animate={shimmer.animate}
        transition={shimmer.transition}
      />
    );
  }

  return (
    <motion.div
      className={cn(base, gradientBg, "h-4 w-full", className)}
      animate={shimmer.animate}
      transition={shimmer.transition}
    />
  );
};

/** Full dashboard loading skeleton */
export const DashboardSkeleton = () => (
  <div className="container mx-auto px-4 pt-24 pb-12 space-y-8">
    <div className="space-y-2">
      <CyberSkeleton variant="title" />
      <CyberSkeleton variant="text" className="w-72 h-3" />
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CyberSkeleton key={i} variant="stat" />
      ))}
    </div>
    <div className="flex gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <CyberSkeleton key={i} variant="text" className="w-28 h-9 rounded-md" />
      ))}
    </div>
    <div className="grid md:grid-cols-2 gap-6">
      <CyberSkeleton variant="card" />
      <CyberSkeleton variant="card" />
    </div>
  </div>
);

export default CyberSkeleton;
