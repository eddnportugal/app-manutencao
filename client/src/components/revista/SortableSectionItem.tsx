import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SortableSectionItemProps {
  id: string;
  children: ReactNode;
  isHidden?: boolean;
}

export function SortableSectionItem({ id, children, isHidden }: SortableSectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isHidden) {
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isDragging && "z-50 opacity-90"
      )}
    >
      {/* Handle de arrastar */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2 cursor-grab active:cursor-grabbing",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          "flex items-center justify-center",
          isDragging && "opacity-100"
        )}
        title="Arrastar para reordenar"
      >
        <div className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 shadow-sm">
          <GripVertical className="w-4 h-4 text-slate-500" />
        </div>
      </div>
      
      {/* Conteúdo da secção */}
      <div className={cn(
        isDragging && "ring-2 ring-primary ring-offset-2 rounded-2xl"
      )}>
        {children}
      </div>
    </div>
  );
}

export default SortableSectionItem;
