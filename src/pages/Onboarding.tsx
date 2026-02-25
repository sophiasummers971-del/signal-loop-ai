import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Zap, CheckCircle2, User, Briefcase, Clock, Target, Palette, Loader2 } from "lucide-react";
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

const workStyleOptions = [
  { id: "solo", label: "Solo Creator", description: "I prefer working independently", icon: User },
  { id: "collab", label: "Collaborator", description: "I thrive in team settings", icon: Briefcase },
  { id: "hybrid", label: "Hybrid", description: "Best of both worlds", icon: Palette },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    skills: [] as string[],
    interests: [] as string[],
    hoursPerWeek: "",
    incomeGoal: "",
    workStyle: "",
    portfolio: "",
  });

  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  const toggleItem = (field: "skills" | "interests", item: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter((i) => i !== item)
        : [...prev[field], item],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return formData.name.trim().length > 0;
      case 1: return formData.skills.length >= 2;
      case 2: return formData.interests.length >= 1;
      case 3: return formData.hoursPerWeek && formData.incomeGoal && formData.workStyle;
      default: return false;
    }
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Save profile
      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          skills: formData.skills,
          interests: formData.interests,
          hours_per_week: formData.hoursPerWeek,
          income_goal: formData.incomeGoal,
          work_style: formData.workStyle,
          portfolio: formData.portfolio,
          onboarding_complete: true,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      // Generate AI ideas
      const { data: aiData, error: aiError } = await supabase.functions.invoke("generate-ideas", {
        body: {
          skills: formData.skills,
          interests: formData.interests,
          hoursPerWeek: formData.hoursPerWeek,
          incomeGoal: formData.incomeGoal,
          workStyle: formData.workStyle,
        },
      });

      if (aiError) {
        console.error("AI error:", aiError);
        toast.error("Ideas generation had an issue, but your profile is saved. You can regenerate later.");
      } else if (aiData?.ideas?.length) {
        // Save ideas to database
        const ideas = aiData.ideas.map((idea: any) => ({
          user_id: user.id,
          title: idea.title || "Untitled Idea",
          audience: idea.audience || "",
          problem: idea.problem || "",
          monetization: idea.monetization || "",
          mvp_steps: idea.mvp_steps || [],
          match_score: idea.match_score || 75,
          stage: "idea",
        }));

        const { error: insertError } = await supabase.from("ideas").insert(ideas);
        if (insertError) console.error("Insert ideas error:", insertError);
      }

      toast.success("Profile saved! Your opportunities are ready.");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const slideVariant = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className="min-h-screen bg-background cyber-grid relative">
      <Navbar />

      {/* Ambient glow orbs */}
      <div className="fixed top-1/4 -left-32 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 -right-32 w-64 h-64 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 pt-24 pb-12 max-w-2xl relative z-10">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-muted-foreground mb-2 font-mono uppercase tracking-wider">
            <span>Step {step + 1} of {totalSteps}</span>
            <span className="text-primary neon-flicker">{Math.round(progress)}% complete</span>
          </div>
          <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden border border-primary/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{ boxShadow: "0 0 12px hsl(185 100% 50% / 0.5)" }}
            />
          </div>
          {/* Step indicators */}
          <div className="flex justify-between mt-3">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${i <= step ? "bg-primary shadow-neon-cyan scale-110" : "bg-muted"}`} />
                <span className={`text-[10px] font-mono uppercase tracking-wider hidden sm:inline ${i <= step ? "text-primary" : "text-muted-foreground/50"}`}>
                  {["Identity", "Skills", "Interests", "Goals"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={slideVariant}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2 text-neon-glow tracking-wider">Welcome to SignalLoop</h1>
                <p className="text-muted-foreground mb-8 font-mono text-sm">Initializing profile... Enter your identity credentials.</p>
                <div className="space-y-5">
                  <div className="bg-card/60 backdrop-blur-sm rounded-xl p-5 border border-primary/10 space-y-4">
                    <div>
                      <label className="text-xs font-mono font-medium text-primary/80 mb-1.5 block uppercase tracking-wider">Your name</label>
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Alex Chen" className="h-12 text-base bg-background/50 border-primary/20 focus:border-primary focus:shadow-neon-cyan/20" />
                    </div>
                    <div>
                      <label className="text-xs font-mono font-medium text-primary/80 mb-1.5 block uppercase tracking-wider">Portfolio or website (optional)</label>
                      <Input value={formData.portfolio} onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })} placeholder="https://yoursite.com" className="h-12 text-base bg-background/50 border-primary/20 focus:border-primary" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2 text-neon-glow tracking-wider">Skill Matrix</h1>
                <p className="text-muted-foreground mb-8 font-mono text-sm">Select at least 2 skills to calibrate the signal scanner.</p>
                <div className="flex flex-wrap gap-2.5">
                  {skillOptions.map((skill) => (
                    <button key={skill} onClick={() => toggleItem("skills", skill)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-mono transition-all duration-200 border ${formData.skills.includes(skill) ? "bg-primary/15 text-primary border-primary/40 shadow-neon-cyan/20 ring-1 ring-primary/20" : "bg-card/60 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"}`}>
                      {formData.skills.includes(skill) && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5 text-primary" />}{skill}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-primary/50 font-mono mt-4">{formData.skills.length} / 2+ selected</p>
              </div>
            )}

            {step === 2 && (
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2 text-neon-glow tracking-wider">Interest Vectors</h1>
                <p className="text-muted-foreground mb-8 font-mono text-sm">Pick topics you'd enjoy building around.</p>
                <div className="flex flex-wrap gap-2.5">
                  {interestOptions.map((interest) => (
                    <button key={interest} onClick={() => toggleItem("interests", interest)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-mono transition-all duration-200 border ${formData.interests.includes(interest) ? "bg-accent/15 text-accent border-accent/40 shadow-neon-magenta/20 ring-1 ring-accent/20" : "bg-card/60 text-muted-foreground border-border hover:border-accent/30 hover:text-foreground"}`}>
                      {formData.interests.includes(interest) && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5 text-accent" />}{interest}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-accent/50 font-mono mt-4">{formData.interests.length} selected</p>
              </div>
            )}

            {step === 3 && (
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2 text-neon-glow tracking-wider">Mission Parameters</h1>
                <p className="text-muted-foreground mb-8 font-mono text-sm">Configure your operational parameters.</p>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-card/60 backdrop-blur-sm rounded-xl p-4 border border-primary/10">
                      <label className="text-xs font-mono font-medium text-primary/80 mb-2 block uppercase tracking-wider"><Clock className="w-3.5 h-3.5 inline mr-1" /> Hours/week</label>
                      <select value={formData.hoursPerWeek} onChange={(e) => setFormData({ ...formData, hoursPerWeek: e.target.value })} className="w-full h-11 rounded-lg border border-primary/20 bg-background/50 px-3 text-sm text-foreground font-mono focus:border-primary">
                        <option value="">Select</option>
                        <option value="1-5">1–5 hours</option>
                        <option value="5-10">5–10 hours</option>
                        <option value="10-20">10–20 hours</option>
                        <option value="20+">20+ hours</option>
                      </select>
                    </div>
                    <div className="bg-card/60 backdrop-blur-sm rounded-xl p-4 border border-primary/10">
                      <label className="text-xs font-mono font-medium text-primary/80 mb-2 block uppercase tracking-wider"><Target className="w-3.5 h-3.5 inline mr-1" /> Monthly goal</label>
                      <select value={formData.incomeGoal} onChange={(e) => setFormData({ ...formData, incomeGoal: e.target.value })} className="w-full h-11 rounded-lg border border-primary/20 bg-background/50 px-3 text-sm text-foreground font-mono focus:border-primary">
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
                        <button key={ws.id} onClick={() => setFormData({ ...formData, workStyle: ws.id })}
                          className={`p-4 rounded-xl border text-center transition-all duration-200 ${formData.workStyle === ws.id ? "bg-primary/10 border-primary/40 shadow-neon-cyan/20 ring-1 ring-primary/20" : "bg-card/60 border-border hover:border-primary/30"}`}>
                          <ws.icon className={`w-6 h-6 mx-auto mb-2 ${formData.workStyle === ws.id ? "text-primary drop-shadow-lg" : "text-muted-foreground"}`} />
                          <div className={`text-sm font-medium font-mono ${formData.workStyle === ws.id ? "text-primary" : "text-foreground"}`}>{ws.label}</div>
                          <div className="text-xs text-muted-foreground mt-1">{ws.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-10">
          <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 0} className="gap-1 font-mono uppercase tracking-wider text-xs">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>

          {step < totalSteps - 1 ? (
            <Button variant="accent" onClick={() => setStep(step + 1)} disabled={!canProceed()} className="gap-1 font-mono uppercase tracking-wider text-xs shadow-neon-magenta/30">
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="accent" onClick={handleFinish} disabled={!canProceed() || saving} className="gap-1 font-mono uppercase tracking-wider text-xs shadow-neon-magenta/30">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Scanning...</> : <><Zap className="w-4 h-4" /> Launch Scanner</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
