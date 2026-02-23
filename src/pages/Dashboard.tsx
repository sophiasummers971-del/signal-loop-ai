import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import OpportunityCard from "@/components/OpportunityCard";
import KanbanBoard from "@/components/KanbanBoard";
import RevenueChart from "@/components/RevenueChart";
import TaskManager from "@/components/TaskManager";
import { Sparkles, TrendingUp, Lightbulb, BarChart3, DollarSign, ListChecks, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Idea {
  id: string;
  title: string;
  audience: string;
  problem: string;
  monetization: string;
  mvp_steps: string[];
  match_score: number;
  stage: "idea" | "validate" | "build" | "monetize" | "scale";
}

type ViewTab = "opportunities" | "roadmap" | "tasks" | "revenue";

const Dashboard = () => {
  const { user } = useAuth();
  const [view, setView] = useState<ViewTab>("opportunities");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ name: string } | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [{ data: profileData }, { data: ideasData }] = await Promise.all([
        supabase.from("profiles").select("name").eq("user_id", user.id).single(),
        supabase.from("ideas").select("*").eq("user_id", user.id).order("match_score", { ascending: false }),
      ]);

      if (profileData) setProfile(profileData);
      if (ideasData) setIdeas(ideasData as Idea[]);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const updateStage = async (ideaId: string, stage: string) => {
    await supabase.from("ideas").update({ stage }).eq("id", ideaId);
    setIdeas((prev) => prev.map((i) => (i.id === ideaId ? { ...i, stage: stage as Idea["stage"] } : i)));
  };

  const bestMatch = ideas.length ? Math.max(...ideas.map((i) => i.match_score)) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const tabs: { key: ViewTab; label: string; icon: React.ElementType }[] = [
    { key: "opportunities", label: "Opportunities", icon: Sparkles },
    { key: "roadmap", label: "Roadmap", icon: BarChart3 },
    { key: "tasks", label: "Tasks", icon: ListChecks },
    { key: "revenue", label: "Revenue", icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold text-foreground mb-1">
              {profile?.name ? `Hey ${profile.name}! 👋` : "Your Dashboard 👋"}
            </h1>
            <p className="text-muted-foreground">
              {ideas.length > 0 ? "Here are your AI-generated opportunities." : "Complete onboarding to get personalized opportunities."}
            </p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Lightbulb, label: "Opportunities", value: String(ideas.length), color: "text-accent" },
            { icon: Sparkles, label: "Best Match", value: bestMatch ? `${bestMatch}%` : "—", color: "text-success" },
            { icon: TrendingUp, label: "In Progress", value: String(ideas.filter((i) => i.stage !== "idea").length), color: "text-accent" },
            { icon: BarChart3, label: "Launched", value: String(ideas.filter((i) => i.stage === "monetize" || i.stage === "scale").length), color: "text-muted-foreground" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-4 border">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <div className="font-display text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={view === tab.key ? "default" : "ghost"}
              size="sm"
              onClick={() => setView(tab.key)}
              className="shrink-0"
            >
              <tab.icon className="w-4 h-4 mr-1" /> {tab.label}
            </Button>
          ))}
        </div>

        {view === "opportunities" && (
          ideas.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {ideas.map((opp, i) => (
                <motion.div key={opp.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.1 }}>
                  <OpportunityCard opportunity={opp} onStartIdea={() => updateStage(opp.id, "validate")} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No opportunities yet. Complete the onboarding to generate ideas!</p>
            </div>
          )
        )}

        {view === "roadmap" && <KanbanBoard opportunities={ideas} />}

        {view === "tasks" && <TaskManager ideas={ideas.map((i) => ({ id: i.id, title: i.title }))} />}

        {view === "revenue" && <RevenueChart ideas={ideas.map((i) => ({ id: i.id, title: i.title }))} />}
      </div>
    </div>
  );
};

export default Dashboard;
