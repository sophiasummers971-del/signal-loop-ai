import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get("type") === "recovery") {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen bg-gradient-hero cyber-grid flex items-center justify-center p-4 relative">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-3xl rounded-full" />
        <div className="w-full max-w-md text-center relative z-10">
          <Link to="/" className="flex items-center gap-2 justify-center mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center shadow-neon-cyan">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display font-bold text-2xl text-foreground tracking-wider">SignalLoop</span>
          </Link>
          <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-primary/15">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2 tracking-wider">Invalid Link</h1>
            <p className="text-muted-foreground text-sm font-mono mb-6">
              This password reset link is invalid or has expired.
            </p>
            <Link to="/auth">
              <Button variant="default" size="lg" className="w-full gap-2 shadow-neon-cyan font-mono uppercase tracking-wider text-xs">
                Back to Sign In <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero cyber-grid flex items-center justify-center p-4 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-3xl rounded-full" />
      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center shadow-neon-cyan">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <span className="font-display font-bold text-2xl text-foreground tracking-wider">SignalLoop</span>
        </Link>

        <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-primary/15">
          <h1 className="font-display text-2xl font-bold text-foreground text-center mb-2 tracking-wider">
            Set New Password
          </h1>
          <p className="text-muted-foreground text-center text-sm font-mono mb-6">
            Enter your new password below
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono font-medium text-primary/80 mb-1.5 block uppercase tracking-wider">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-12 bg-muted/50 border-primary/20 focus:border-primary/50"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono font-medium text-primary/80 mb-1.5 block uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-12 bg-muted/50 border-primary/20 focus:border-primary/50"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button variant="default" size="lg" className="w-full gap-2 shadow-neon-cyan font-mono uppercase tracking-wider text-xs" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;