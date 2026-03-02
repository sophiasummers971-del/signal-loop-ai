import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown, ChevronUp, Search, Mail, MessageSquare, Zap, BarChart3, Shield, HelpCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FaqItem[] = [
  // Platform basics
  { category: "Platform", question: "What is SignalLoop?", answer: "SignalLoop is an AI-powered opportunity scanner that matches your skills and interests with monetizable business ideas. It generates personalized opportunities, helps you validate them, and tracks your progress from idea to revenue." },
  { category: "Platform", question: "How do I get started?", answer: "Sign up, complete the onboarding questionnaire (your skills, interests, and goals), and SignalLoop's AI will generate tailored business opportunities for you. You can then manage them through the Kanban board on your dashboard." },
  { category: "Platform", question: "How does the dashboard work?", answer: "The dashboard has four main views: Opportunities (AI-generated ideas ranked by match score), Roadmap (Kanban board to track stages), Tasks (action items for each idea), and Revenue (income tracking and charts)." },
  { category: "Platform", question: "Can I regenerate my ideas?", answer: "Currently you can update your profile skills/interests in Settings and the AI will factor those into future idea generation. Full regeneration is coming in a future update." },

  // Ideas & opportunities
  { category: "Ideas", question: "How are match scores calculated?", answer: "Match scores (0–100) are calculated by the AI based on how well an opportunity aligns with your skills, interests, available time, and income goals. Higher scores mean better alignment." },
  { category: "Ideas", question: "What do the idea stages mean?", answer: "Ideas progress through 5 stages: Idea (initial concept), Validate (market research), Build (creating MVP), Monetize (generating revenue), and Scale (growing the business)." },
  { category: "Ideas", question: "Can I add my own ideas?", answer: "The current version focuses on AI-generated ideas. Manual idea creation is planned for a future release." },
  { category: "Ideas", question: "How do I move ideas between stages?", answer: "Use the Roadmap view on your dashboard. Drag and drop ideas between columns, or click the stage actions on each idea card to advance them." },

  // Account & billing
  { category: "Account", question: "Is SignalLoop free to use?", answer: "SignalLoop offers a free tier with core features. Premium features and higher idea generation limits may be available in future paid plans." },
  { category: "Account", question: "How do I change my password?", answer: "Go to Settings → Security tab and enter your new password. You can also use the 'Forgot Password' link on the login page to reset via email." },
  { category: "Account", question: "Can I export my data?", answer: "Yes! Go to Settings → Account tab and click 'Export'. This downloads all your ideas, tasks, and revenue logs as a JSON file." },
  { category: "Account", question: "How do I delete my account?", answer: "Go to Settings → Account tab and use the 'Delete All Data' button in the Danger Zone. This permanently removes all your data and signs you out." },

  // Contact support
  { category: "Contact", question: "How can I report a bug?", answer: "Use the contact form below or email us at support@signalloop.app. Include as much detail as possible — screenshots, steps to reproduce, and your browser info help us fix issues faster." },
  { category: "Contact", question: "Can I request a feature?", answer: "Absolutely! Use the contact form below with the subject 'Feature Request' and describe what you'd like to see. We review every suggestion." },
];

const categories = ["All", "Platform", "Ideas", "Account", "Contact"];

const Support = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [sending, setSending] = useState(false);

  const filtered = faqData.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = !search || item.question.toLowerCase().includes(search.toLowerCase()) || item.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setSending(true);
    // Simulate sending (no backend endpoint yet)
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Message sent! We'll get back to you soon.");
    setContactName("");
    setContactEmail("");
    setContactMessage("");
    setSending(false);
  };

  const categoryIcons: Record<string, typeof Zap> = {
    All: HelpCircle,
    Platform: Zap,
    Ideas: BarChart3,
    Account: Shield,
    Contact: Mail,
  };

  return (
    <div className="min-h-screen bg-background cyber-grid relative">
      <Navbar />
      <div className="fixed top-1/4 -left-32 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 -right-32 w-64 h-64 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 pt-24 pb-12 max-w-3xl relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/settings">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground text-neon-glow tracking-wider">Support & FAQ</h1>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider">Find answers or get in touch</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQ..."
            className="pl-10 h-12 bg-card/60 border-primary/20 focus:border-primary font-mono"
            maxLength={100}
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat];
            return (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-200 border whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-primary/15 text-primary border-primary/40"
                    : "bg-card/60 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat}
              </button>
            );
          })}
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3 mb-12">
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground font-mono text-sm">No results found. Try a different search term.</p>
            </div>
          )}
          {filtered.map((item, i) => (
            <motion.div
              key={item.question}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card/60 backdrop-blur-sm rounded-xl border border-primary/10 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-primary/50 bg-primary/10 px-2 py-0.5 rounded">{item.category}</span>
                  <span className="text-sm font-mono text-foreground">{item.question}</span>
                </div>
                {openIndex === i ? <ChevronUp className="w-4 h-4 text-primary shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
              </button>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 pb-4"
                >
                  <p className="text-sm text-muted-foreground leading-relaxed pl-[calc(0.5rem+2px)] border-l-2 border-primary/20 ml-1">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="bg-card/60 backdrop-blur-sm rounded-xl p-6 border border-accent/10">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-5 h-5 text-accent" />
            <h2 className="font-display text-lg font-semibold text-foreground tracking-wider">Contact Support</h2>
          </div>
          <p className="text-muted-foreground text-sm font-mono mb-5">Can't find your answer? Send us a message.</p>

          <form onSubmit={handleContact} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono font-medium text-primary/80 mb-1.5 block uppercase tracking-wider">Name</label>
                <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Your name"
                  className="h-11 bg-background/50 border-primary/20 focus:border-primary" maxLength={100} />
              </div>
              <div>
                <label className="text-xs font-mono font-medium text-primary/80 mb-1.5 block uppercase tracking-wider">Email</label>
                <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="you@email.com"
                  className="h-11 bg-background/50 border-primary/20 focus:border-primary" maxLength={255} />
              </div>
            </div>
            <div>
              <label className="text-xs font-mono font-medium text-primary/80 mb-1.5 block uppercase tracking-wider">Message</label>
              <Textarea value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} placeholder="Describe your issue or question..."
                className="min-h-[120px] bg-background/50 border-primary/20 focus:border-primary" maxLength={1000} />
            </div>
            <Button type="submit" variant="accent" disabled={sending}
              className="w-full gap-2 font-mono uppercase tracking-wider text-xs shadow-neon-magenta/30">
              {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Mail className="w-4 h-4" /> Send Message</>}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Support;
