import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Save, Lock, User, Sparkles, Heart, CheckCircle2, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const skillOptions = [
  "Writing", "Design", "Coding", "Marketing", "Video Editing",
  "Photography", "Teaching", "Data Analysis", "Sales", "Music",
  "Consulting", "Social Media", "SEO", "Copywriting", "AI/ML",
];

const interestOptions = [
  "Tech", "Health & Fitness", "Finance", "Education", "Art & Creative",
  "Gaming", "Travel", "Food", "Fashion", "Environment",
  "Productivity", "Self-Improvement", "Parenting", "Sports", "Pets",
];

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  const [name, setName] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("name, portfolio, skills, interests")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setName(data.name || "");
        setPortfolio(data.portfolio || "");
        setSkills(data.skills || []);
        setInterests(data.interests || []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const toggleItem = (field: "skills" | "interests", item: string) => {
    const setter = field === "skills" ? setSkills : setInterests;
    const current = field === "skills" ? skills : interests;
    setter(current.includes(item) ? current.filter((i) => i !== item) : [...current, item]);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    if (!name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name: name.trim(), portfolio: portfolio.trim(), skills, interests })
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "password" as const, label: "Security", icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-background cyber-grid relative">
      <Navbar />
      <div className="fixed top-1/4 -left-32 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 -right-32 w-64 h-64 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 pt-24 pb-12 max-w-2xl relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground text-neon-glow tracking-wider">Settings</h1>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider">Configure your profile & security</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-mono uppercase tracking-wider transition-all duration-200 border ${
                activeTab === tab.id
                  ? "bg-primary/15 text-primary border-primary/40 shadow-neon-cyan/20"
                  : "bg-card/60 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Name & Portfolio */}
              <div className="bg-card/60 backdrop-blur-sm rounded-xl p-5 border border-primary/10 space-y-4">
                <div>
                  <label className="text-xs font-mono font-medium text-primary/80 mb-1.5 block uppercase tracking-wider">
                    <User className="w-3.5 h-3.5 inline mr-1" /> Your name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Chen"
                    className="h-12 text-base bg-background/50 border-primary/20 focus:border-primary focus:shadow-neon-cyan/20"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-medium text-primary/80 mb-1.5 block uppercase tracking-wider">
                    Portfolio or website (optional)
                  </label>
                  <Input
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    placeholder="https://yoursite.com"
                    className="h-12 text-base bg-background/50 border-primary/20 focus:border-primary"
                    maxLength={255}
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="bg-card/60 backdrop-blur-sm rounded-xl p-5 border border-primary/10">
                <label className="text-xs font-mono font-medium text-primary/80 mb-3 block uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 inline mr-1" /> Skills
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {skillOptions.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleItem("skills", skill)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-mono transition-all duration-200 border ${
                        skills.includes(skill)
                          ? "bg-primary/15 text-primary border-primary/40 shadow-neon-cyan/20 ring-1 ring-primary/20"
                          : "bg-card/60 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                      }`}
                    >
                      {skills.includes(skill) && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5 text-primary" />}
                      {skill}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-primary/50 font-mono mt-3">{skills.length} selected</p>
              </div>

              {/* Interests */}
              <div className="bg-card/60 backdrop-blur-sm rounded-xl p-5 border border-primary/10">
                <label className="text-xs font-mono font-medium text-accent/80 mb-3 block uppercase tracking-wider">
                  <Heart className="w-3.5 h-3.5 inline mr-1" /> Interests
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {interestOptions.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleItem("interests", interest)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-mono transition-all duration-200 border ${
                        interests.includes(interest)
                          ? "bg-accent/15 text-accent border-accent/40 shadow-neon-magenta/20 ring-1 ring-accent/20"
                          : "bg-card/60 text-muted-foreground border-border hover:border-accent/30 hover:text-foreground"
                      }`}
                    >
                      {interests.includes(interest) && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5 text-accent" />}
                      {interest}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-accent/50 font-mono mt-3">{interests.length} selected</p>
              </div>

              <Button
                variant="accent"
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full gap-2 font-mono uppercase tracking-wider text-xs shadow-neon-magenta/30"
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Profile</>}
              </Button>
            </div>
          )}

          {activeTab === "password" && (
            <div className="space-y-6">
              <div className="bg-card/60 backdrop-blur-sm rounded-xl p-5 border border-primary/10 space-y-4">
                <h2 className="font-display text-lg font-semibold text-foreground tracking-wider">Change Password</h2>
                <p className="text-muted-foreground text-sm font-mono">Update your authentication credentials.</p>

                <div>
                  <label className="text-xs font-mono font-medium text-primary/80 mb-1.5 block uppercase tracking-wider">New password</label>
                  <div className="relative">
                    <Input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="h-12 text-base bg-background/50 border-primary/20 focus:border-primary pr-10"
                      maxLength={128}
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-mono font-medium text-primary/80 mb-1.5 block uppercase tracking-wider">Confirm password</label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="h-12 text-base bg-background/50 border-primary/20 focus:border-primary pr-10"
                      maxLength={128}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                variant="accent"
                onClick={handleChangePassword}
                disabled={changingPassword || !newPassword || !confirmPassword}
                className="w-full gap-2 font-mono uppercase tracking-wider text-xs shadow-neon-magenta/30"
              >
                {changingPassword ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : <><Lock className="w-4 h-4" /> Update Password</>}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
