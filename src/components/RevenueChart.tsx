import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EmptyState from "@/components/EmptyState";
import { DollarSign, Plus, Trash2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format, parseISO, startOfMonth } from "date-fns";

interface RevenueLog {
  id: string;
  amount: number;
  description: string;
  idea_id: string | null;
  logged_at: string;
}

interface Idea {
  id: string;
  title: string;
}

const RevenueChart = ({ ideas }: { ideas: Idea[] }) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<RevenueLog[]>([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIdea, setSelectedIdea] = useState("");
  const [logDate, setLogDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("revenue_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: true });
      if (data) setLogs(data as RevenueLog[]);
    };
    fetchLogs();
  }, [user]);

  const handleAdd = async () => {
    if (!user || !amount || parseFloat(amount) <= 0) return;
    setAdding(true);
    try {
      const { data, error } = await supabase
        .from("revenue_logs")
        .insert({
          user_id: user.id,
          amount: parseFloat(amount),
          description: description || null,
          idea_id: selectedIdea || null,
          logged_at: logDate,
        })
        .select()
        .single();
      if (error) throw error;
      setLogs((prev) => [...prev, data as RevenueLog].sort((a, b) => a.logged_at.localeCompare(b.logged_at)));
      setAmount("");
      setDescription("");
      setSelectedIdea("");
      setShowForm(false);
      toast.success("Revenue logged!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("revenue_logs").delete().eq("id", id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
    toast.success("Entry removed");
  };

  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};
    logs.forEach((log) => {
      const month = format(startOfMonth(parseISO(log.logged_at)), "MMM yyyy");
      grouped[month] = (grouped[month] || 0) + Number(log.amount);
    });
    let cumulative = 0;
    return Object.entries(grouped).map(([month, total]) => {
      cumulative += total;
      return { month, total: Number(total.toFixed(2)), cumulative: Number(cumulative.toFixed(2)) };
    });
  }, [logs]);

  const totalRevenue = logs.reduce((sum, l) => sum + Number(l.amount), 0);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <DollarSign className="w-4 h-4" /> Total Revenue
          </div>
          <div className="font-display text-2xl font-bold text-foreground">${totalRevenue.toFixed(2)}</div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <TrendingUp className="w-4 h-4" /> Entries
          </div>
          <div className="font-display text-2xl font-bold text-foreground">{logs.length}</div>
        </div>
        <div className="bg-card rounded-xl border p-4 flex items-center justify-center">
          <Button variant="accent" className="gap-2" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4" /> Log Revenue
          </Button>
        </div>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card rounded-xl border p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Amount ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="50.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Date</label>
                  <Input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Description (optional)</label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="First freelance payment..." />
              </div>
              {ideas.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Linked Idea (optional)</label>
                  <select
                    value={selectedIdea}
                    onChange={(e) => setSelectedIdea(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">None</option>
                    {ideas.map((idea) => (
                      <option key={idea.id} value={idea.id}>{idea.title}</option>
                    ))}
                  </select>
                </div>
              )}
              <Button variant="accent" onClick={handleAdd} disabled={adding || !amount} className="w-full gap-2">
                {adding ? "Saving..." : "Save Entry"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="bg-card rounded-xl border p-4">
          <h3 className="font-display font-semibold text-foreground mb-4">Revenue Growth</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38, 90%, 55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(38, 90%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 20%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(230, 15%, 50%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(230, 15%, 50%)" tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  background: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(230, 20%, 90%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
              />
              <Area type="monotone" dataKey="cumulative" stroke="hsl(38, 90%, 55%)" fill="url(#colorRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState type="revenue" />
      )}

      {/* Recent entries */}
      {logs.length > 0 && (
        <div className="bg-card rounded-xl border p-4">
          <h3 className="font-display font-semibold text-foreground mb-3">Recent Entries</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {[...logs].reverse().map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 group transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground">${Number(log.amount).toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground">{format(parseISO(log.logged_at), "MMM d, yyyy")}</span>
                  </div>
                  {log.description && <p className="text-xs text-muted-foreground truncate">{log.description}</p>}
                </div>
                <button
                  onClick={() => handleDelete(log.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;
