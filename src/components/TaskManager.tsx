import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import EmptyState from "@/components/EmptyState";
import { Plus, Trash2, ListChecks, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  idea_id: string | null;
  sort_order: number;
}

interface Idea {
  id: string;
  title: string;
}

const TaskManager = ({ ideas }: { ideas: Idea[] }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [selectedIdea, setSelectedIdea] = useState<string>("all");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchTasks = async () => {
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("sort_order", { ascending: true });
      if (data) setTasks(data as Task[]);
    };
    fetchTasks();
  }, [user]);

  const handleAdd = async () => {
    if (!user || !newTask.trim()) return;
    setAdding(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          user_id: user.id,
          title: newTask.trim(),
          idea_id: selectedIdea !== "all" && selectedIdea !== "general" ? selectedIdea : null,
          sort_order: tasks.length,
        })
        .select()
        .single();
      if (error) throw error;
      setTasks((prev) => [...prev, data as Task]);
      setNewTask("");
      toast.success("Task added!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    await supabase.from("tasks").update({ completed: !completed }).eq("id", id);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t)));
  };

  const handleDelete = async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTasks = tasks.filter((t) => {
    if (selectedIdea === "all") return true;
    if (selectedIdea === "general") return !t.idea_id;
    return t.idea_id === selectedIdea;
  });

  const completedCount = filteredTasks.filter((t) => t.completed).length;
  const totalCount = filteredTasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Progress overview */}
      <div className="bg-card rounded-xl border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-accent" />
            <span className="font-display font-semibold text-foreground">
              {completedCount}/{totalCount} tasks done
            </span>
          </div>
          <span className="text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Filter by idea */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select
          value={selectedIdea}
          onChange={(e) => setSelectedIdea(e.target.value)}
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
        >
          <option value="all">All Tasks</option>
          <option value="general">General</option>
          {ideas.map((idea) => (
            <option key={idea.id} value={idea.id}>{idea.title}</option>
          ))}
        </select>
      </div>

      {/* Add task */}
      <div className="flex gap-2">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1"
        />
        <Button variant="accent" onClick={handleAdd} disabled={adding || !newTask.trim()} size="icon">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const linkedIdea = ideas.find((i) => i.id === task.idea_id);
              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-3 bg-card rounded-lg border px-4 py-3 group hover:shadow-sm transition-all"
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleComplete(task.id, task.completed)}
                  />
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {task.title}
                    </span>
                    {linkedIdea && (
                      <span className="block text-xs text-accent">{linkedIdea.title}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })
          ) : (
            <EmptyState type="tasks" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TaskManager;
