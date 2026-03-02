import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Menu, X, LogOut, Settings, HelpCircle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isLanding = location.pathname === "/";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${isLanding ? "bg-transparent" : "bg-card/90 backdrop-blur-md border-b border-primary/10"}`}>
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center shadow-neon-cyan">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-bold text-xl text-foreground tracking-wider">
            SignalLoop
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {isLanding ? (
            <>
              <a href="#features" className="text-muted-foreground hover:text-primary text-sm transition-colors font-mono uppercase tracking-wider">Features</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-primary text-sm transition-colors font-mono uppercase tracking-wider">How it works</a>
              {user ? (
                <Link to="/dashboard">
                  <Button variant="default" size="sm" className="shadow-neon-cyan">Dashboard</Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="default" size="sm" className="shadow-neon-cyan">Get Started</Button>
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/dashboard" className="text-muted-foreground hover:text-primary text-sm transition-colors font-mono uppercase tracking-wider">Dashboard</Link>
              <Link to="/settings" className="text-muted-foreground hover:text-primary text-sm transition-colors font-mono uppercase tracking-wider flex items-center gap-1">
                <Settings className="w-3.5 h-3.5" /> Settings
              </Link>
              <Link to="/support" className="text-muted-foreground hover:text-primary text-sm transition-colors font-mono uppercase tracking-wider flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Help
              </Link>
              <button onClick={handleSignOut} className="text-muted-foreground hover:text-primary text-sm transition-colors flex items-center gap-1 font-mono uppercase tracking-wider">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </>
          )}
        </div>

        <button
          className="md:hidden text-foreground"
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
            className="md:hidden bg-card/95 backdrop-blur-md border-b border-primary/10"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {isLanding ? (
                <Link to={user ? "/dashboard" : "/auth"} onClick={() => setMobileOpen(false)}>
                  <Button variant="default" size="sm" className="w-full shadow-neon-cyan">{user ? "Dashboard" : "Get Started"}</Button>
                </Link>
              ) : (
                <>
                  <Link to="/dashboard" className="text-muted-foreground hover:text-primary text-sm py-2 font-mono" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                  <Link to="/settings" className="text-muted-foreground hover:text-primary text-sm py-2 font-mono" onClick={() => setMobileOpen(false)}>Settings</Link>
                  <Link to="/support" className="text-muted-foreground hover:text-primary text-sm py-2 font-mono" onClick={() => setMobileOpen(false)}>Help & FAQ</Link>
                  <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="text-muted-foreground hover:text-primary text-sm py-2 text-left font-mono">Sign Out</button>
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
