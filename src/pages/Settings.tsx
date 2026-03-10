import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import {
  Save, Lock, User, Sparkles, Heart, CheckCircle2, Loader2, ArrowLeft,
  Eye, EyeOff, Bell, Target, Clock, Briefcase, Palette, Trash2, Download,
  AlertTriangle, HelpCircle,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

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

const workStyleOptions = [
  { id: "solo", label: "Solo Creator", description: "Work independently", icon: User },
  { id: "collab", label: "Collaborator", description: "Team settings", icon: Briefcase },
  { id: "hybrid", label: "Hybrid", description: "Best of both", icon: Palette },
];

type TabId = "profile" | "mission" | "notifications" | "security" | "account";

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  // Profile
  const [name, setName] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);

  // Mission
  const [hoursPerWeek, setHoursPerWeek] = useState("");
  const [incomeGoal, setIncomeGoal] = useState("");
  const [workStyle, setWorkStyle] = useState("");

  // Notifications (local prefs)
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifIdeas, setNotifIdeas] = useState(true);
  const [notifTasks, setNotifTasks] = useState(true);
  const [notifRevenue, setNotifRevenue] = useState(false);

  // Security
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Account
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("name, portfolio, skills, interests, hours_per_week, income_goal, work_style")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setName(data.name || "");
        setPortfolio(data.portfolio || "");
        setSkills(data.skills || []);
        setInterests(data.interests || []);
        setHoursPerWeek(data.hours_per_week || "");
        setIncomeGoal(data.income_goal || "");
        setWorkStyle(data.work_style || "");
      }
      // Load local notification prefs
      const saved = localStorage.getItem("signalloop_notifs");
      if (saved) {
        const p = JSON.parse(saved);
        setNotifEmail(p.email ?? true);
        setNotifIdeas(p.ideas ?? true);
        setNotifTasks(p.tasks ?? true);
        setNotifRevenue(p.revenue ?? false);
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
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMission = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ hours_per_week: hoursPerWeek, income_goal: incomeGoal, work_style: workStyle })
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Mission parameters updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = () => {
    localStorage.setItem("signalloop_notifs", JSON.stringify({
      email: notifEmail, ideas: notifIdeas, tasks: notifTasks, revenue: notifRevenue,
    }));
    toast.success("Notification preferences saved");
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    try {
      const [ideas, tasks, revenue] = await Promise.all([
        supabase.from("ideas").select("*").eq("user_id", user.id),
        supabase.from("tasks").select("*").eq("user_id", user.id),
        supabase.from("revenue_logs").select("*").eq("user_id", user.id),
      ]);
      const data = { ideas: ideas.data, tasks: tasks.data, revenue: revenue.data };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "signalloop-export.json"; a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported");
    } catch {
      toast.error("Export failed");
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      // Delete user data
      await Promise.all([
        supabase.from("revenue_logs").delete().eq("user_id", user.id),
        supabase.from("tasks").delete().eq("user_id", user.id),
        supabase.from("ideas").delete().eq("user_id", user.id),
      ]);
      await supabase.from("profiles").delete().eq("user_id", user.id);
      await signOut();
      toast.success("Account data deleted. You've been signed out.");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete account data");
    } finally {
      setDeleting(false);
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

  const tabs: { id: TabId; label: string; icon: typeof User }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "mission", label: "Mission", icon: Target },
    { id: "notifications", label: "Alerts", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "account", label: "Account", icon: AlertTriangle },
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
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-foreground text-neon-glow tracking-wider">Settings</h1>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider">Configure your profile, mission & security</p>
          </div>
          <Link to="/support">
            <Button variant="ghost" size="sm" className="gap-1 font-mono text-xs uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" /> Help
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-200 border whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary/15 text-primary border-primary/40 shadow-neon-cyan/20"
                  : "bg-card/60 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

          {/* ── PROFILE TAB ── */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="bg-card/60 backdrop-blur-sm rounded-xl p-5 border border-primary/10 space-y-4">
                <div>
                  <label className="text-xs font-mono font-medium text-primary/80 mb-1.5 block uppercase tracking-wider">
                    <User className="w-3.5 h-3.5 inline mr-1" /> Your name
                  </label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex Chen"
                    className="h-12 text-base bg-background/50 border-primary/20 focus:border-primary focus:shadow-neon-cyan/20" maxLength={100} />
                </div>
                <div>
                  <label className="text-xs font-mono font-medium text-primary/80 mb-1.5 block uppercase tracking-wider">Portfolio (optional)</label>
                  <Input value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://yoursite.com"
                    className="h-12 text-base bg-background/50 border-primary/20 focus:border-primary" maxLength={255} />
                </div>
              </div>

              <div className="bg-card/60 backdrop-blur-sm rounded-xl p-5 border border-primary/10">
                <label className="text-xs font-mono font-medium text-primary/80 mb-3 block uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 inline mr-1" /> Skills
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {skillOptions.map((skill) => (
                    <button key={skill} onClick={() => toggleItem("skills", skill)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-mono transition-all duration-200 border ${
                        skills.includes(skill) ? "bg-primary/15 text-primary border-primary/40 ring-1 ring-primary/20" : "bg-card/60 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                      }`}>
                      {skills.includes(skill) && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5 text-primary" />}{skill}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-primary/50 font-mono mt-3">{skills.length} selected</p>
              </div>

              <div className="bg-card/60 backdrop-blur-sm rounded-xl p-5 border border-primary/10">
                <label className="text-xs font-mono font-medium text-accent/80 mb-3 block uppercase tracking-wider">
                  <Heart className="w-3.5 h-3.5 inline mr-1" /> Interests
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {interestOptions.map((interest) => (
                    <button key={interest} onClick={() => toggleItem("interests", interest)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-mono transition-all duration-200 border ${
                        interests.includes(interest) ? "bg-accent/15 text-accent border-accent/40 ring-1 ring-accent/20" : "bg-card/60 text-muted-foreground border-border hover:border-accent/30 hover:text-foreground"
                      }`}>
                      {interests.includes(interest) && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5 text-accent" />}{interest}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-accent/50 font-mono mt-3">{interests.length} selected</p>
              </div>

              <Button variant="accent" onClick={handleSaveProfile} disabled={saving}
                className="w-full gap-2 font-mono uppercase tracking-wider text-xs shadow-neon-magenta/30">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Profile</>}
              </Button>
            </div>
          )}

          {/* ── MISSION TAB ── */}
          {activeTab === "mission" && (
            <div className="space-y-6">
              <div className="bg-card/60 backdrop-blur-sm rounded-xl p-5 border border-primary/10 space-y-5">
                <h2 className="font-display text-lg font-semibold text-foreground tracking-wider">Mission Parameters</h2>
                <p className="text-muted-foreground text-sm font-mono">Update your operational goals to recalibrate idea scoring.</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background/30 rounded-xl p-4 border border-primary/10">
                    <label className="text-xs font-mono font-medium text-primary/80 mb-2 block uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 inline mr-1" /> Hours/week
                    </label>
                    <select value={hoursPerWeek} onChange={(e) => setHoursPerWeek(e.target.value)}
                      className="w-full h-11 rounded-lg border border-primary/20 bg-background/50 px-3 text-sm text-foreground font-mono focus:border-primary">
                      <option value="">Select</option>
                      <option value="1-5">1–5 hours</option>
                      <option value="5-10">5–10 hours</option>
                      <option value="10-20">10–20 hours</option>
                      <option value="20+">20+ hours</option>
                    </select>
                  </div>
                  <div className="bg-background/30 rounded-xl p-4 border border-primary/10">
                    <label className="text-xs font-mono font-medium text-primary/80 mb-2 block uppercase tracking-wider">
                      <Target className="w-3.5 h-3.5 inline mr-1" /> Monthly goal
                    </label>
                    <select value={incomeGoal} onChange={(e) => setIncomeGoal(e.target.value)}
                      className="w-full h-11 rounded-lg border border-primary/20 bg-background/50 px-3 text-sm text-foreground font-mono focus:border-primary">
                      <option value="">Select</option>
                      <option value="100-500">$100–$500</option>
                      <option value="500-1000">$500–$1,000</option>
                      <option value="1000-3000">$1,000–$3,000</option>
                      <option value="3000+">$3,000+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono font-medium text-primary/80 mb-3 block uppercase tracking-wider">Work style</label>
                  <div className="grid grid-cols-3 gap-3">
                    {workStyleOptions.map((ws) => (
                      <button key={ws.id} onClick={() => setWorkStyle(ws.id)}
                        className={`p-4 rounded-xl border text-center transition-all duration-200 ${
                          workStyle === ws.id ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20" : "bg-card/60 border-border hover:border-primary/30"
                        }`}>
                        <ws.icon className={`w-6 h-6 mx-auto mb-2 ${workStyle === ws.id ? "text-primary" : "text-muted-foreground"}`} />
                        <div className={`text-sm font-medium font-mono ${workStyle === ws.id ? "text-primary" : "text-foreground"}`}>{ws.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">{ws.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button variant="accent" onClick={handleSaveMission} disabled={saving}
                className="w-full gap-2 font-mono uppercase tracking-wider text-xs shadow-neon-magenta/30">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Mission</>}
              </Button>
            </div>
          )}

          {/* ── NOTIFICATIONS TAB ── */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="bg-card/60 backdrop-blur-sm rounded-xl p-5 border border-primary/10 space-y-1">
                <h2 className="font-display text-lg font-semibold text-foreground tracking-wider">Notification Preferences</h2>
                <p className="text-muted-foreground text-sm font-mono mb-4">Control what alerts you receive.</p>

                {[
                  { label: "Email notifications", desc: "Receive important updates via email", value: notifEmail, setter: setNotifEmail },
                  { label: "New idea alerts", desc: "Get notified when new opportunities match", value: notifIdeas, setter: setNotifIdeas },
                  { label: "Task reminders", desc: "Daily task completion reminders", value: notifTasks, setter: setNotifTasks },
                  { label: "Revenue milestones", desc: "Celebrate when you hit income goals", value: notifRevenue, setter: setNotifRevenue },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-4 border-b border-border/50 last:border-0">
                    <div>
                      <div className="text-sm font-mono text-foreground">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                    <Switch checked={item.value} onCheckedChange={item.setter} />
                  </div>
                ))}
              </div>

              <Button variant="accent" onClick={handleSaveNotifications}
                className="w-full gap-2 font-mono uppercase tracking-wider text-xs shadow-neon-magenta/30">
                <Save className="w-4 h-4" /> Save Preferences
              </Button>
            </div>
          )}

          {/* ── SECURITY TAB ── */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="bg-card/60 backdrop-blur-sm rounded-xl p-5 border border-primary/10 space-y-4">
                <h2 className="font-display text-lg font-semibold text-foreground tracking-wider">Change Password</h2>
                <p className="text-muted-foreground text-sm font-mono">Update your authentication credentials.</p>
                <div>
                  <label className="text-xs font-mono font-medium text-primary/80 mb-1.5 block uppercase tracking-wider">New password</label>
                  <div className="relative">
                    <Input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters" className="h-12 text-base bg-background/50 border-primary/20 focus:border-primary pr-10" maxLength={128} />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-mono font-medium text-primary/80 mb-1.5 block uppercase tracking-wider">Confirm password</label>
                  <div className="relative">
                    <Input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password" className="h-12 text-base bg-background/50 border-primary/20 focus:border-primary pr-10" maxLength={128} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-card/60 backdrop-blur-sm rounded-xl p-5 border border-primary/10">
                <h3 className="text-sm font-mono font-medium text-foreground mb-1">Session info</h3>
                <p className="text-xs text-muted-foreground font-mono">Logged in as: {user?.email}</p>
              </div>

              <Button variant="accent" onClick={handleChangePassword} disabled={changingPassword || !newPassword || !confirmPassword}
                className="w-full gap-2 font-mono uppercase tracking-wider text-xs shadow-neon-magenta/30">
                {changingPassword ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : <><Lock className="w-4 h-4" /> Update Password</>}
              </Button>
            </div>
          )}

          {/* ── ACCOUNT TAB ── */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <div className="bg-card/60 backdrop-blur-sm rounded-xl p-5 border border-primary/10 space-y-4">
                <h2 className="font-display text-lg font-semibold text-foreground tracking-wider">Account Management</h2>

                <div className="flex items-center justify-between py-3 border-b border-border/50">
                  <div>
                    <div className="text-sm font-mono text-foreground">Export your data</div>
                    <div className="text-xs text-muted-foreground">Download all your ideas, tasks & revenue as JSON</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportData} className="gap-1 font-mono text-xs">
                    <Download className="w-3.5 h-3.5" /> Export
                  </Button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-mono text-foreground">Email address</div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                  </div>
                </div>
              </div>

              <div className="bg-destructive/5 backdrop-blur-sm rounded-xl p-5 border border-destructive/20 space-y-3">
                <h3 className="font-display text-lg font-semibold text-destructive tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Danger Zone
                </h3>
                <p className="text-sm text-muted-foreground font-mono">
                  Permanently delete all your data (ideas, tasks, revenue logs). This action cannot be undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-1 font-mono text-xs uppercase tracking-wider">
                      <Trash2 className="w-3.5 h-3.5" /> Delete All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your ideas, tasks, and revenue logs. You will be signed out. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {deleting ? "Deleting..." : "Yes, delete everything"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
