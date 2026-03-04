import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { DollarSign, Pencil, Plus, Trash2, TrendingUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { BudgetCategory, type BudgetEntry } from "../../../backend.d";
import {
  useCreateBudgetEntry,
  useDeleteBudgetEntry,
  useListBudget,
  useUpdateBudgetEntry,
} from "../../../hooks/useQueries";

interface BudgetSectionProps {
  tripId: string;
}

const CATEGORY_LABELS: Record<BudgetCategory, string> = {
  [BudgetCategory.flights]: "Flights",
  [BudgetCategory.hotels]: "Hotels",
  [BudgetCategory.food]: "Food",
  [BudgetCategory.activities]: "Activities",
  [BudgetCategory.other]: "Other",
};

const CATEGORY_COLORS: Record<BudgetCategory, string> = {
  [BudgetCategory.flights]: "bg-blue-100 text-blue-700 border-blue-200",
  [BudgetCategory.hotels]: "bg-purple-100 text-purple-700 border-purple-200",
  [BudgetCategory.food]: "bg-orange-100 text-orange-700 border-orange-200",
  [BudgetCategory.activities]: "bg-green-100 text-green-700 border-green-200",
  [BudgetCategory.other]: "bg-gray-100 text-gray-700 border-gray-200",
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

interface EntryForm {
  category: BudgetCategory;
  title: string;
  planned: string;
  spent: string;
}

const defaultForm: EntryForm = {
  category: BudgetCategory.flights,
  title: "",
  planned: "",
  spent: "",
};

export default function BudgetSection({ tripId }: BudgetSectionProps) {
  const { data: entries, isLoading } = useListBudget(tripId);
  const createEntry = useCreateBudgetEntry();
  const updateEntry = useUpdateBudgetEntry();
  const deleteEntry = useDeleteBudgetEntry();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [form, setForm] = useState<EntryForm>(defaultForm);
  const [editingEntry, setEditingEntry] = useState<BudgetEntry | null>(null);
  const [editForm, setEditForm] = useState<EntryForm>(defaultForm);
  const [deletingEntry, setDeletingEntry] = useState<BudgetEntry | null>(null);

  const totalPlanned = entries?.reduce((s, e) => s + e.plannedAmount, 0) ?? 0;
  const totalSpent = entries?.reduce((s, e) => s + e.spentAmount, 0) ?? 0;
  const overBudget = totalSpent > totalPlanned;

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    try {
      const id = crypto.randomUUID();
      await createEntry.mutateAsync({
        id,
        tripId,
        category: form.category,
        title: form.title.trim(),
        plannedAmount: Number.parseFloat(form.planned) || 0,
        spentAmount: Number.parseFloat(form.spent) || 0,
      });
      setForm(defaultForm);
      setShowAddDialog(false);
      toast.success("Entry added.");
    } catch {
      toast.error("Could not add entry.");
    }
  };

  const handleUpdate = async () => {
    if (!editingEntry || !editForm.title.trim()) return;
    try {
      await updateEntry.mutateAsync({
        id: editingEntry.id,
        title: editForm.title.trim(),
        plannedAmount: Number.parseFloat(editForm.planned) || 0,
        spentAmount: Number.parseFloat(editForm.spent) || 0,
        tripId,
      });
      setEditingEntry(null);
      toast.success("Entry updated.");
    } catch {
      toast.error("Could not update entry.");
    }
  };

  const handleDelete = async () => {
    if (!deletingEntry) return;
    try {
      await deleteEntry.mutateAsync({ id: deletingEntry.id, tripId });
      setDeletingEntry(null);
      toast.success("Entry deleted.");
    } catch {
      toast.error("Could not delete entry.");
    }
  };

  // Group by category
  const grouped = entries
    ? Object.values(BudgetCategory).reduce(
        (acc, cat) => {
          acc[cat] = entries.filter((e) => e.category === cat);
          return acc;
        },
        {} as Record<BudgetCategory, BudgetEntry[]>,
      )
    : null;

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-teal">
            <DollarSign className="w-4 h-4" />
          </div>
          <h3 className="font-display text-xl font-light">Budget</h3>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => setShowAddDialog(true)}
          data-ocid="budget.add_button"
        >
          <Plus className="w-4 h-4" />
          Add Entry
        </Button>
      </div>

      {/* Summary cards */}
      {(entries?.length ?? 0) > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          <div className="bg-card border border-border rounded-xl px-4 py-3">
            <p className="text-xs text-muted-foreground mb-0.5">Planned</p>
            <p className="font-display text-lg font-light text-foreground">
              {formatCurrency(totalPlanned)}
            </p>
          </div>
          <div
            className={cn(
              "border rounded-xl px-4 py-3",
              overBudget
                ? "bg-destructive/5 border-destructive/20"
                : "bg-card border-border",
            )}
          >
            <p className="text-xs text-muted-foreground mb-0.5">Spent</p>
            <p
              className={cn(
                "font-display text-lg font-light",
                overBudget ? "text-destructive" : "text-foreground",
              )}
            >
              {formatCurrency(totalSpent)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl px-4 py-3">
            <div className="flex items-center gap-1.5 mb-0.5">
              <TrendingUp className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
            <p
              className={cn(
                "font-display text-lg font-light",
                overBudget ? "text-destructive" : "text-teal",
              )}
            >
              {formatCurrency(totalPlanned - totalSpent)}
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {["sk1", "sk2", "sk3"].map((k) => (
            <Skeleton key={k} className="h-12 rounded-lg" />
          ))}
        </div>
      ) : !entries || entries.length === 0 ? (
        <div
          className="py-12 text-center text-muted-foreground text-sm"
          data-ocid="budget.empty_state"
        >
          <DollarSign
            className="w-10 h-10 mx-auto text-muted-foreground/20 mb-3"
            strokeWidth={1}
          />
          <p>No budget entries yet. Track your expenses above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {grouped &&
              Object.entries(grouped).map(([cat, catEntries]) => {
                if (catEntries.length === 0) return null;
                const catTotal = catEntries.reduce(
                  (s, e) => s + e.spentAmount,
                  0,
                );
                const catPlanned = catEntries.reduce(
                  (s, e) => s + e.plannedAmount,
                  0,
                );
                return (
                  <motion.div
                    key={cat}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                          CATEGORY_COLORS[cat as BudgetCategory],
                        )}
                      >
                        {CATEGORY_LABELS[cat as BudgetCategory]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(catPlanned)} planned ·{" "}
                        {formatCurrency(catTotal)} spent
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {catEntries.map((entry, idx) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="group flex items-center gap-3 px-3 py-2.5 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
                          data-ocid={`budget.row.${idx + 1}`}
                        >
                          <span className="flex-1 text-sm truncate">
                            {entry.title}
                          </span>
                          <div className="flex items-center gap-3 text-sm shrink-0">
                            <div className="text-right hidden sm:block">
                              <p className="text-xs text-muted-foreground">
                                Planned
                              </p>
                              <p className="font-medium">
                                {formatCurrency(entry.plannedAmount)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">
                                Spent
                              </p>
                              <p
                                className={cn(
                                  "font-medium",
                                  entry.spentAmount > entry.plannedAmount
                                    ? "text-destructive"
                                    : "",
                                )}
                              >
                                {formatCurrency(entry.spentAmount)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                className="p-1 rounded hover:bg-secondary transition-colors"
                                onClick={() => {
                                  setEditingEntry(entry);
                                  setEditForm({
                                    category: entry.category,
                                    title: entry.title,
                                    planned: entry.plannedAmount.toString(),
                                    spent: entry.spentAmount.toString(),
                                  });
                                }}
                              >
                                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                              <button
                                type="button"
                                className="p-1 rounded hover:bg-secondary transition-colors text-destructive"
                                onClick={() => setDeletingEntry(entry)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>
      )}

      {/* Add entry dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-light">
              Add Budget Entry
            </DialogTitle>
          </DialogHeader>
          <EntryFormFields form={form} onChange={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!form.title.trim() || createEntry.isPending}
            >
              {createEntry.isPending ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit entry dialog */}
      <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-light">
              Edit Entry
            </DialogTitle>
          </DialogHeader>
          <EntryFormFields
            form={editForm}
            onChange={setEditForm}
            disableCategory
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEntry(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={!editForm.title.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog
        open={!!deletingEntry}
        onOpenChange={() => setDeletingEntry(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete entry?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deletingEntry?.title}&rdquo; will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface EntryFormFieldsProps {
  form: EntryForm;
  onChange: (f: EntryForm) => void;
  disableCategory?: boolean;
}

function EntryFormFields({
  form,
  onChange,
  disableCategory,
}: EntryFormFieldsProps) {
  return (
    <div className="space-y-3 py-1">
      {!disableCategory && (
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select
            value={form.category}
            onValueChange={(v) =>
              onChange({ ...form, category: v as BudgetCategory })
            }
            data-ocid="budget.select"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                <SelectItem key={cat} value={cat}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-1.5">
        <Label>Title</Label>
        <Input
          placeholder="e.g. Flight to Rome"
          value={form.title}
          onChange={(e) => onChange({ ...form, title: e.target.value })}
          autoFocus={!disableCategory}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Planned ($)</Label>
          <Input
            type="number"
            placeholder="0"
            min="0"
            step="0.01"
            value={form.planned}
            onChange={(e) => onChange({ ...form, planned: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Spent ($)</Label>
          <Input
            type="number"
            placeholder="0"
            min="0"
            step="0.01"
            value={form.spent}
            onChange={(e) => onChange({ ...form, spent: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
