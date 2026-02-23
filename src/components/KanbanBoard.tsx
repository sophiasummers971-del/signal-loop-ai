import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ChevronLeft, ChevronRight, GripVertical } from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  match_score: number;
  stage: "idea" | "validate" | "build" | "monetize" | "scale";
  sort_order: number;
}

const stages = [
  { key: "idea", label: "💡 Idea", color: "border-accent/30 bg-accent/5" },
  { key: "validate", label: "✅ Validate", color: "border-success/30 bg-success/5" },
  { key: "build", label: "🔨 Build", color: "border-primary/30 bg-primary/5" },
  { key: "monetize", label: "💰 Monetize", color: "border-accent/30 bg-accent/5" },
  { key: "scale", label: "🚀 Scale", color: "border-success/30 bg-success/5" },
];

const stageKeys = stages.map((s) => s.key);

const SortableCard = ({
  item,
  onStageChange,
}: {
  item: Opportunity;
  onStageChange?: (id: string, stage: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: { stage: item.stage, type: "card" },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const currentIndex = stageKeys.indexOf(item.stage);
  const canMoveLeft = currentIndex > 0;
  const canMoveRight = currentIndex < stageKeys.length - 1;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card rounded-lg p-3 border shadow-sm hover:shadow-md transition-shadow group"
      role="listitem"
      aria-label={`${item.title}, ${item.match_score}% match, in ${item.stage} stage`}
    >
      <div className="flex items-start gap-2">
        <div
          {...listeners}
          {...attributes}
          className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-none"
          aria-label={`Drag ${item.title}`}
          tabIndex={0}
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-foreground">{item.title}</div>
          <div className="text-xs text-muted-foreground mt-1">{item.match_score}% match</div>
        </div>
      </div>
      {onStageChange && (
        <div className="flex items-center justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
          <button
            onClick={() => canMoveLeft && onStageChange(item.id, stageKeys[currentIndex - 1])}
            disabled={!canMoveLeft}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            aria-label={`Move to ${canMoveLeft ? stages[currentIndex - 1].label : "previous stage"}`}
            tabIndex={0}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-muted-foreground/60 select-none">{stages[currentIndex].label}</span>
          <button
            onClick={() => canMoveRight && onStageChange(item.id, stageKeys[currentIndex + 1])}
            disabled={!canMoveRight}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            aria-label={`Move to ${canMoveRight ? stages[currentIndex + 1].label : "next stage"}`}
            tabIndex={0}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

const DroppableColumn = ({
  stage,
  items,
  isOver,
  onStageChange,
}: {
  stage: (typeof stages)[0];
  items: Opportunity[];
  isOver: boolean;
  onStageChange?: (id: string, stage: string) => void;
}) => {
  const { setNodeRef } = useDroppable({ id: stage.key });
  const itemIds = useMemo(() => items.map((i) => i.id), [items]);

  return (
    <div className="flex-1 min-w-[200px]" role="region" aria-label={`${stage.label} column, ${items.length} items`}>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-display font-semibold text-sm text-foreground">{stage.label}</h3>
        <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
          {items.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        role="list"
        className={`rounded-xl border-2 border-dashed ${stage.color} p-3 min-h-[200px] space-y-3 transition-all duration-200 ${
          isOver ? "ring-2 ring-accent/50 scale-[1.02]" : ""
        }`}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {items.length > 0 ? (
            items.map((item) => (
              <SortableCard key={item.id} item={item} onStageChange={onStageChange} />
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground/50 py-8">
              Drop ideas here
            </div>
          )}
        </SortableContext>
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
  onReorder,
}: {
  opportunities: Opportunity[];
  onStageChange?: (ideaId: string, newStage: string) => void;
  onReorder?: (reordered: Opportunity[]) => void;
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const activeItem = activeId ? opportunities.find((o) => o.id === activeId) : null;

  // Group items by stage, sorted by sort_order
  const itemsByStage = useMemo(() => {
    const map: Record<string, Opportunity[]> = {};
    stages.forEach((s) => {
      map[s.key] = opportunities
        .filter((o) => o.stage === s.key)
        .sort((a, b) => a.sort_order - b.sort_order);
    });
    return map;
  }, [opportunities]);

  const findStageOfItem = (itemId: string): string | null => {
    for (const [stageKey, items] of Object.entries(itemsByStage)) {
      if (items.some((i) => i.id === itemId)) return stageKey;
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setOverColumn(null);
      return;
    }
    const overId = over.id as string;
    // Over a column directly
    if (stages.some((s) => s.key === overId)) {
      setOverColumn(overId);
    } else {
      // Over another card — find which column it's in
      const stage = findStageOfItem(overId);
      setOverColumn(stage);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverColumn(null);

    if (!over) return;

    const activeItemData = opportunities.find((o) => o.id === active.id);
    if (!activeItemData) return;

    const overId = over.id as string;
    const isOverColumn = stages.some((s) => s.key === overId);
    const targetStage = isOverColumn ? overId : findStageOfItem(overId);

    if (!targetStage) return;

    if (activeItemData.stage !== targetStage) {
      // Cross-column move
      if (onStageChange) {
        onStageChange(activeItemData.id, targetStage);
      }
    } else {
      // Same-column reorder
      const columnItems = [...itemsByStage[targetStage]];
      const oldIndex = columnItems.findIndex((i) => i.id === active.id);
      const newIndex = isOverColumn
        ? columnItems.length - 1
        : columnItems.findIndex((i) => i.id === overId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(columnItems, oldIndex, newIndex);
        const updated = reordered.map((item, idx) => ({ ...item, sort_order: idx }));
        if (onReorder) {
          onReorder(updated);
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements: {
          onDragStart({ active }) {
            const item = opportunities.find((o) => o.id === active.id);
            return `Picked up ${item?.title}. Use arrow keys to reorder or move between columns.`;
          },
          onDragOver({ active, over }) {
            const item = opportunities.find((o) => o.id === active.id);
            const overId = over?.id as string;
            const stage = stages.find((s) => s.key === overId);
            if (stage) return `${item?.title} is over ${stage.label} column.`;
            const overItem = opportunities.find((o) => o.id === overId);
            return overItem ? `${item?.title} is over ${overItem.title}.` : "";
          },
          onDragEnd({ active, over }) {
            const item = opportunities.find((o) => o.id === active.id);
            const overId = over?.id as string;
            const stage = stages.find((s) => s.key === overId);
            return stage
              ? `Dropped ${item?.title} in ${stage.label} column.`
              : `${item?.title} was reordered.`;
          },
          onDragCancel({ active }) {
            const item = opportunities.find((o) => o.id === active.id);
            return `Dragging ${item?.title} was cancelled.`;
          },
        },
      }}
    >
      <div className="overflow-x-auto" role="group" aria-label="Kanban board with stages: Idea, Validate, Build, Monetize, Scale">
        <div className="flex gap-4 min-w-[900px]">
          {stages.map((stage) => (
            <DroppableColumn
              key={stage.key}
              stage={stage}
              items={itemsByStage[stage.key]}
              isOver={overColumn === stage.key}
              onStageChange={onStageChange}
            />
          ))}
        </div>
      </div>
      <DragOverlay>
        {activeItem ? <OverlayCard item={activeItem} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
