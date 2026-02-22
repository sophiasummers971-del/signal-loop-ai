import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Menu, X, LogOut } from "lucide-react";
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
              {user ? (
                <Link to="/dashboard">
                  <Button variant="accent" size="sm">Dashboard</Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="accent" size="sm">Get Started</Button>
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Dashboard</Link>
              <button onClick={handleSignOut} className="text-muted-foreground hover:text-foreground text-sm transition-colors flex items-center gap-1">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
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
                <Link to={user ? "/dashboard" : "/auth"} onClick={() => setMobileOpen(false)}>
                  <Button variant="accent" size="sm" className="w-full">{user ? "Dashboard" : "Get Started"}</Button>
                </Link>
              ) : (
                <>
                  <Link to="/dashboard" className="text-muted-foreground hover:text-foreground text-sm py-2" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                  <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="text-muted-foreground hover:text-foreground text-sm py-2 text-left">Sign Out</button>
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
