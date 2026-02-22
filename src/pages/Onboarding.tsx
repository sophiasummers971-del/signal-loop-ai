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
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {step + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
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
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">Welcome to SignalLoop</h1>
                <p className="text-muted-foreground mb-8">Let's start with your name so we can personalize your experience.</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Your name</label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Alex Chen" className="h-12 text-base" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Portfolio or website (optional)</label>
                    <Input value={formData.portfolio} onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })} placeholder="https://yoursite.com" className="h-12 text-base" />
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">What are your skills?</h1>
                <p className="text-muted-foreground mb-8">Select at least 2 skills. These help us find the best opportunities.</p>
                <div className="flex flex-wrap gap-3">
                  {skillOptions.map((skill) => (
                    <button key={skill} onClick={() => toggleItem("skills", skill)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${formData.skills.includes(skill) ? "bg-accent text-accent-foreground border-accent shadow-md" : "bg-card text-muted-foreground border-border hover:border-accent/50"}`}>
                      {formData.skills.includes(skill) && <CheckCircle2 className="w-4 h-4 inline mr-1" />}{skill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">What interests you?</h1>
                <p className="text-muted-foreground mb-8">Pick topics you'd enjoy building around.</p>
                <div className="flex flex-wrap gap-3">
                  {interestOptions.map((interest) => (
                    <button key={interest} onClick={() => toggleItem("interests", interest)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${formData.interests.includes(interest) ? "bg-accent text-accent-foreground border-accent shadow-md" : "bg-card text-muted-foreground border-border hover:border-accent/50"}`}>
                      {formData.interests.includes(interest) && <CheckCircle2 className="w-4 h-4 inline mr-1" />}{interest}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">Your goals & style</h1>
                <p className="text-muted-foreground mb-8">Help us tailor your roadmap.</p>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block"><Clock className="w-4 h-4 inline mr-1" /> Hours/week</label>
                      <select value={formData.hoursPerWeek} onChange={(e) => setFormData({ ...formData, hoursPerWeek: e.target.value })} className="w-full h-12 rounded-lg border bg-card px-3 text-sm text-foreground">
                        <option value="">Select</option>
                        <option value="1-5">1–5 hours</option>
                        <option value="5-10">5–10 hours</option>
                        <option value="10-20">10–20 hours</option>
                        <option value="20+">20+ hours</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block"><Target className="w-4 h-4 inline mr-1" /> Monthly goal</label>
                      <select value={formData.incomeGoal} onChange={(e) => setFormData({ ...formData, incomeGoal: e.target.value })} className="w-full h-12 rounded-lg border bg-card px-3 text-sm text-foreground">
                        <option value="">Select</option>
                        <option value="100-500">$100–$500</option>
                        <option value="500-1000">$500–$1,000</option>
                        <option value="1000-3000">$1,000–$3,000</option>
                        <option value="3000+">$3,000+</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Work style</label>
                    <div className="grid grid-cols-3 gap-3">
                      {workStyleOptions.map((ws) => (
                        <button key={ws.id} onClick={() => setFormData({ ...formData, workStyle: ws.id })}
                          className={`p-4 rounded-xl border text-center transition-all ${formData.workStyle === ws.id ? "bg-accent/10 border-accent shadow-md" : "bg-card border-border hover:border-accent/50"}`}>
                          <ws.icon className={`w-6 h-6 mx-auto mb-2 ${formData.workStyle === ws.id ? "text-accent" : "text-muted-foreground"}`} />
                          <div className="text-sm font-medium text-foreground">{ws.label}</div>
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
          <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 0} className="gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>

          {step < totalSteps - 1 ? (
            <Button variant="accent" onClick={() => setStep(step + 1)} disabled={!canProceed()} className="gap-1">
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="accent" onClick={handleFinish} disabled={!canProceed() || saving} className="gap-1">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Zap className="w-4 h-4" /> Generate My Opportunities</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
