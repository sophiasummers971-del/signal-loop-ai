import { useState } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface Opportunity {
  id: string;
  title: string;
  match_score: number;
  stage: "idea" | "validate" | "build" | "monetize" | "scale";
}

const stages = [
  { key: "idea", label: "💡 Idea", color: "border-accent/30 bg-accent/5" },
  { key: "validate", label: "✅ Validate", color: "border-success/30 bg-success/5" },
  { key: "build", label: "🔨 Build", color: "border-primary/30 bg-primary/5" },
  { key: "monetize", label: "💰 Monetize", color: "border-accent/30 bg-accent/5" },
  { key: "scale", label: "🚀 Scale", color: "border-success/30 bg-success/5" },
];

const DraggableCard = ({ item }: { item: Opportunity }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { stage: item.stage },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-card rounded-lg p-3 border shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing touch-none"
    >
      <div className="font-medium text-sm text-foreground">{item.title}</div>
      <div className="text-xs text-muted-foreground mt-1">{item.match_score}% match</div>
    </div>
  );
};

const DroppableColumn = ({
  stage,
  items,
  isOver,
}: {
  stage: (typeof stages)[0];
  items: Opportunity[];
  isOver: boolean;
}) => {
  const { setNodeRef } = useDroppable({ id: stage.key });

  return (
    <div className="flex-1 min-w-[200px]">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-display font-semibold text-sm text-foreground">{stage.label}</h3>
        <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
          {items.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`rounded-xl border-2 border-dashed ${stage.color} p-3 min-h-[200px] space-y-3 transition-all duration-200 ${
          isOver ? "ring-2 ring-accent/50 scale-[1.02]" : ""
        }`}
      >
        {items.length > 0 ? (
          items.map((item) => (
            <DraggableCard key={item.id} item={item} />
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground/50 py-8">
            Drop ideas here
          </div>
        )}
      </div>
    </div>
  );
};

const OverlayCard = ({ item }: { item: Opportunity }) => (
  <div className="bg-card rounded-lg p-3 border shadow-lg w-[200px] rotate-2">
    <div className="font-medium text-sm text-foreground">{item.title}</div>
    <div className="text-xs text-muted-foreground mt-1">{item.match_score}% match</div>
  </div>
);

const KanbanBoard = ({
  opportunities,
  onStageChange,
}: {
  opportunities: Opportunity[];
  onStageChange?: (ideaId: string, newStage: string) => void;
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const activeItem = activeId ? opportunities.find((o) => o.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: any) => {
    const overId = event.over?.id as string | null;
    if (overId && stages.some((s) => s.key === overId)) {
      setOverColumn(overId);
    } else {
      setOverColumn(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverColumn(null);

    if (!over || !onStageChange) return;

    const overId = over.id as string;
    const draggedItem = opportunities.find((o) => o.id === active.id);

    if (!draggedItem) return;

    // Dropped on a column
    if (stages.some((s) => s.key === overId)) {
      if (draggedItem.stage !== overId) {
        onStageChange(draggedItem.id, overId);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto">
        <div className="flex gap-4 min-w-[900px]">
          {stages.map((stage) => {
            const items = opportunities.filter((o) => o.stage === stage.key);
            return (
              <DroppableColumn
                key={stage.key}
                stage={stage}
                items={items}
                isOver={overColumn === stage.key}
              />
            );
          })}
        </div>
      </div>
      <DragOverlay>
        {activeItem ? <OverlayCard item={activeItem} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
