import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Zap, Target, BarChart3, Users, Rocket, ArrowRight, Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";

const features = [
  {
    icon: Sparkles,
    title: "AI Opportunity Engine",
    description: "Get 5–10 tailored micro-business ideas based on your skills, interests, and goals.",
  },
  {
    icon: Rocket,
    title: "Launch Roadmap",
    description: "Kanban-style board to track ideas from validation to monetization.",
  },
  {
    icon: Target,
    title: "Validation Tools",
    description: "Landing page generator, waitlist capture, and feedback surveys.",
  },
  {
    icon: TrendingUp,
    title: "Revenue Tracker",
    description: "Track your micro-income growth with visual charts and milestones.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Share ideas, get feedback, and join micro-mastermind groups.",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "AI-driven insights on what's working and where to double down.",
  },
];

const steps = [
  { step: "01", title: "Tell us about you", description: "Share your skills, interests, goals, and available time." },
  { step: "02", title: "Get AI ideas", description: "Our engine generates tailored micro-business opportunities." },
  { step: "03", title: "Validate & launch", description: "Follow step-by-step roadmaps to test and build your idea." },
  { step: "04", title: "Start earning", description: "Track revenue and scale what works with community support." },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        {/* Animated neon circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl animate-pulse-glow" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-primary/10 animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center pt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-2 mb-8">
              <Zap className="w-4 h-4 text-primary neon-flicker" />
              <span className="text-primary/80 text-sm font-medium font-mono tracking-wider uppercase">AI-Powered Micro-Income Discovery</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight max-w-4xl mx-auto text-neon-glow">
              Turn your skills into
              <span className="text-gradient-accent"> income signals</span>
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
              SignalLoop uses AI to detect micro-business opportunities hidden in your skills and interests. 
              Get actionable ideas, launch roadmaps, and start earning.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button variant="accent" size="xl" className="gap-2 shadow-neon-magenta">
                  Start Free <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline-hero" size="xl" className="border-primary/40 text-primary hover:bg-primary/10">
                  See How It Works
                </Button>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {[
              { value: "10K+", label: "Ideas Generated" },
              { value: "2.4K", label: "Active Users" },
              { value: "$480K", label: "Revenue Tracked" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl md:text-3xl font-bold text-primary text-neon-glow">{stat.value}</div>
                <div className="text-muted-foreground text-xs mt-1 font-mono uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-background relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold text-foreground mb-4 text-neon-glow">
              Everything you need to launch
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              From idea generation to revenue tracking, SignalLoop guides your entire journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card/80 backdrop-blur-sm rounded-xl p-6 border border-primary/10 hover:border-primary/40 hover:shadow-neon-cyan transition-all duration-500 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors group-hover:shadow-neon-cyan">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2 text-sm tracking-wider">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-gradient-warm relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold text-foreground mb-4 text-neon-glow">
              How SignalLoop works
            </h2>
            <p className="text-muted-foreground text-lg">Four steps to your first micro-income stream.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="font-display text-5xl font-bold text-primary/20 mb-4 text-neon-glow">{step.step}</div>
                <h3 className="font-display font-semibold text-foreground mb-2 text-sm tracking-wider">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-hero text-center relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 text-neon-glow">
              Ready to find your signal?
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
              Join thousands turning hidden skills into real income. It takes just 2 minutes to start.
            </p>
            <Link to="/auth">
              <Button variant="accent" size="xl" className="gap-2 shadow-neon-magenta">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-primary/10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary neon-flicker" />
            <span className="font-display font-bold text-foreground">SignalLoop</span>
          </div>
          <p className="text-muted-foreground text-sm font-mono">© 2026 SignalLoop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
