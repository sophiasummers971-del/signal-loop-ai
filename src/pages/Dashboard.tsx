import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import OpportunityCard from "@/components/OpportunityCard";
import KanbanBoard from "@/components/KanbanBoard";
import { Sparkles, TrendingUp, Lightbulb, BarChart3 } from "lucide-react";

const sampleOpportunities = [
  {
    id: "1",
    title: "AI Writing Newsletter",
    audience: "Content marketers & solopreneurs",
    problem: "Marketers struggle to keep up with AI writing tools and best practices",
    monetization: "Paid newsletter ($7/mo) + Affiliate links",
    mvpSteps: ["Set up Substack or Beehiiv", "Write 5 foundational posts", "Promote on Twitter/LinkedIn", "Add paid tier at 500 subscribers"],
    match: 94,
    stage: "idea" as const,
  },
  {
    id: "2",
    title: "Notion Template Store",
    audience: "Freelancers & small teams",
    problem: "Setting up project management from scratch is time-consuming",
    monetization: "Template sales ($15-$49 each) on Gumroad",
    mvpSteps: ["Design 3 premium templates", "Create demo videos", "List on Gumroad", "Promote in Notion communities"],
    match: 88,
    stage: "idea" as const,
  },
  {
    id: "3",
    title: "Micro-SaaS: Social Proof Widget",
    audience: "E-commerce store owners",
    problem: "Small stores lack social proof to build buyer trust",
    monetization: "SaaS subscription ($9-$29/mo)",
    mvpSteps: ["Build embeddable widget", "Add Shopify integration", "Create landing page", "Offer free tier for feedback"],
    match: 82,
    stage: "idea" as const,
  },
  {
    id: "4",
    title: "1:1 Design Coaching",
    audience: "Aspiring UI/UX designers",
    problem: "Juniors lack personalized feedback on their portfolio",
    monetization: "Coaching calls ($75-$150/session)",
    mvpSteps: ["Set up Calendly booking", "Create a portfolio review framework", "Post 3 free teardowns on Twitter", "Launch with intro pricing"],
    match: 79,
    stage: "idea" as const,
  },
];

const Dashboard = () => {
  const [view, setView] = useState<"opportunities" | "roadmap">("opportunities");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold text-foreground mb-1">
              Good morning! 👋
            </h1>
            <p className="text-muted-foreground">Here are your AI-generated opportunities based on your profile.</p>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: Lightbulb, label: "Opportunities", value: "4", color: "text-accent" },
            { icon: Sparkles, label: "Best Match", value: "94%", color: "text-success" },
            { icon: TrendingUp, label: "Est. Revenue", value: "$1.2K/mo", color: "text-accent" },
            { icon: BarChart3, label: "Active Ideas", value: "0", color: "text-muted-foreground" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-4 border">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <div className="font-display text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={view === "opportunities" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("opportunities")}
          >
            <Sparkles className="w-4 h-4 mr-1" /> Opportunities
          </Button>
          <Button
            variant={view === "roadmap" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("roadmap")}
          >
            <BarChart3 className="w-4 h-4 mr-1" /> Roadmap
          </Button>
        </div>

        {/* Content */}
        {view === "opportunities" ? (
          <div className="grid md:grid-cols-2 gap-6">
            {sampleOpportunities.map((opp, i) => (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.1 }}
              >
                <OpportunityCard opportunity={opp} />
              </motion.div>
            ))}
          </div>
        ) : (
          <KanbanBoard opportunities={sampleOpportunities} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
