import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background cyber-grid flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-3xl rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center px-4"
      >
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center shadow-neon-cyan">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <span className="font-display font-bold text-2xl text-foreground tracking-wider">SignalLoop</span>
        </Link>

        <div className="font-display text-8xl font-bold text-primary/20 text-neon-glow mb-4">404</div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-2 tracking-wider">Signal Lost</h1>
        <p className="text-muted-foreground font-mono text-sm mb-8 max-w-md mx-auto">
          The route <span className="text-primary">{location.pathname}</span> doesn't exist in this network.
        </p>

        <Link to="/">
          <Button variant="default" size="lg" className="gap-2 shadow-neon-cyan font-mono uppercase tracking-wider text-xs">
            Return to Base <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;