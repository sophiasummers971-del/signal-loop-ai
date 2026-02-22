import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${isLanding ? "bg-transparent" : "bg-card/80 backdrop-blur-md border-b"}`}>
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent-foreground" />
          </div>
          <span className={`font-display font-bold text-xl ${isLanding ? "text-primary-foreground" : "text-foreground"}`}>
            SignalLoop
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {isLanding ? (
            <>
              <a href="#features" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Features</a>
              <a href="#how-it-works" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">How it works</a>
              <Link to="/onboarding">
                <Button variant="accent" size="sm">Get Started</Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Dashboard</Link>
              <Link to="/roadmap" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Roadmap</Link>
            </>
          )}
        </div>

        <button
          className={`md:hidden ${isLanding ? "text-primary-foreground" : "text-foreground"}`}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card/95 backdrop-blur-md border-b"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {isLanding ? (
                <>
                  <a href="#features" className="text-muted-foreground hover:text-foreground text-sm py-2" onClick={() => setMobileOpen(false)}>Features</a>
                  <Link to="/onboarding" onClick={() => setMobileOpen(false)}>
                    <Button variant="accent" size="sm" className="w-full">Get Started</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="text-muted-foreground hover:text-foreground text-sm py-2" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                  <Link to="/roadmap" className="text-muted-foreground hover:text-foreground text-sm py-2" onClick={() => setMobileOpen(false)}>Roadmap</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
