import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { ChecklistCategory, ChecklistItem } from "../../../backend.d";
import {
  useCreateChecklistItem,
  useDeleteChecklistItem,
  useListChecklist,
  useUpdateChecklistItem,
} from "../../../hooks/useQueries";

interface ChecklistSectionProps {
  tripId: string;
  category: ChecklistCategory;
  title: string;
  placeholder: string;
  icon: React.ReactNode;
}

export default function ChecklistSection({
  tripId,
  category,
  title,
  placeholder,
  icon,
}: ChecklistSectionProps) {
  const { data: items, isLoading } = useListChecklist(tripId, category);
  const createItem = useCreateChecklistItem();
  const updateItem = useUpdateChecklistItem();
  const deleteItem = useDeleteChecklistItem();

  const [newText, setNewText] = useState("");

  const checkedCount = items?.filter((i) => i.checked).length ?? 0;
  const totalCount = items?.length ?? 0;

  const handleAdd = async () => {
    if (!newText.trim()) return;
    try {
      const id = crypto.randomUUID();
      await createItem.mutateAsync({
        id,
        tripId,
        category,
        text: newText.trim(),
      });
      setNewText("");
    } catch {
      toast.error("Could not add item.");
    }
  };

  const handleToggle = async (item: ChecklistItem) => {
    try {
      await updateItem.mutateAsync({
        id: item.id,
        text: item.text,
        checked: !item.checked,
        tripId,
        category,
      });
    } catch {
      toast.error("Could not update item.");
    }
  };

  const handleDelete = async (item: ChecklistItem) => {
    try {
      await deleteItem.mutateAsync({ id: item.id, tripId, category });
    } catch {
      toast.error("Could not delete item.");
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-teal">
          {icon}
        </div>
        <div>
          <h3 className="font-display text-xl font-light">{title}</h3>
          {totalCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {checkedCount} / {totalCount} done
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="mb-5 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-teal rounded-full transition-all duration-500"
            style={{ width: `${(checkedCount / totalCount) * 100}%` }}
          />
        </div>
      )}

      {/* Add input */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder={placeholder}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1"
          data-ocid="checklist.input"
        />
        <Button
          onClick={handleAdd}
          disabled={!newText.trim() || createItem.isPending}
          className="gap-1.5 shrink-0"
          data-ocid="checklist.add_button"
        >
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {["sk1", "sk2", "sk3"].map((k) => (
            <Skeleton key={k} className="h-10 rounded-lg" />
          ))}
        </div>
      ) : !items || items.length === 0 ? (
        <div
          className="py-10 text-center text-muted-foreground text-sm"
          data-ocid="checklist.empty_state"
        >
          <p>Nothing added yet. Start by typing above.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          <AnimatePresence mode="popLayout">
            {/* Unchecked first */}
            {[...items]
              .sort((a, b) => {
                if (a.checked === b.checked) return 0;
                return a.checked ? 1 : -1;
              })
              .map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
                  data-ocid={`checklist.item.${idx + 1}`}
                >
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => handleToggle(item)}
                    className="shrink-0"
                    data-ocid={`checklist.checkbox.${idx + 1}`}
                  />
                  <span
                    className={cn(
                      "flex-1 text-sm transition-all",
                      item.checked && "line-through text-muted-foreground",
                    )}
                  >
                    {item.text}
                  </span>
                  <button
                    type="button"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:text-destructive"
                    onClick={() => handleDelete(item)}
                    data-ocid={`checklist.delete_button.${idx + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
