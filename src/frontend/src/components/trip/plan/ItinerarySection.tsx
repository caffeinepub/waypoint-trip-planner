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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { ItineraryDay, ItineraryEvent } from "../../../backend.d";
import {
  useCreateItineraryDay,
  useCreateItineraryEvent,
  useDeleteItineraryDay,
  useDeleteItineraryEvent,
  useListItineraryDays,
  useListItineraryEvents,
  useUpdateItineraryDay,
  useUpdateItineraryEvent,
} from "../../../hooks/useQueries";

interface ItinerarySectionProps {
  tripId: string;
}

export default function ItinerarySection({ tripId }: ItinerarySectionProps) {
  const { data: days, isLoading } = useListItineraryDays(tripId);
  const createDay = useCreateItineraryDay();
  const updateDay = useUpdateItineraryDay();
  const deleteDay = useDeleteItineraryDay();

  const [showAddDay, setShowAddDay] = useState(false);
  const [newDayDate, setNewDayDate] = useState("");
  const [newDayTitle, setNewDayTitle] = useState("");
  const [editingDay, setEditingDay] = useState<ItineraryDay | null>(null);
  const [editDayDate, setEditDayDate] = useState("");
  const [editDayTitle, setEditDayTitle] = useState("");
  const [deletingDay, setDeletingDay] = useState<ItineraryDay | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const sortedDays = days
    ? [...days].sort((a, b) => {
        if (a.sortOrder !== b.sortOrder)
          return Number(a.sortOrder) - Number(b.sortOrder);
        return a.date.localeCompare(b.date);
      })
    : [];

  const toggleDay = (id: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddDay = async () => {
    if (!newDayDate) return;
    try {
      const id = crypto.randomUUID();
      const sortOrder = BigInt(sortedDays.length);
      await createDay.mutateAsync({
        id,
        tripId,
        date: newDayDate,
        title: newDayTitle.trim() || `Day ${sortedDays.length + 1}`,
        sortOrder,
      });
      setNewDayDate("");
      setNewDayTitle("");
      setShowAddDay(false);
      setExpandedDays((prev) => new Set([...prev, id]));
      toast.success("Day added.");
    } catch {
      toast.error("Could not add day.");
    }
  };

  const handleUpdateDay = async () => {
    if (!editingDay || !editDayDate) return;
    try {
      await updateDay.mutateAsync({
        id: editingDay.id,
        date: editDayDate,
        title: editDayTitle.trim() || editingDay.title,
        sortOrder: editingDay.sortOrder,
        tripId,
      });
      setEditingDay(null);
      toast.success("Day updated.");
    } catch {
      toast.error("Could not update day.");
    }
  };

  const handleDeleteDay = async () => {
    if (!deletingDay) return;
    try {
      await deleteDay.mutateAsync({ id: deletingDay.id, tripId });
      setDeletingDay(null);
      toast.success("Day deleted.");
    } catch {
      toast.error("Could not delete day.");
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-teal">
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="font-display text-xl font-light">Itinerary</h3>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => setShowAddDay(true)}
          data-ocid="itinerary.add_button"
        >
          <Plus className="w-4 h-4" />
          Add Day
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {["sk1", "sk2"].map((k) => (
            <Skeleton key={k} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : sortedDays.length === 0 ? (
        <div
          className="py-12 text-center text-muted-foreground text-sm"
          data-ocid="itinerary.empty_state"
        >
          <Calendar
            className="w-10 h-10 mx-auto text-muted-foreground/20 mb-3"
            strokeWidth={1}
          />
          <p>No days planned yet. Add your first day to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {sortedDays.map((day, idx) => (
              <motion.div
                key={day.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                data-ocid={`itinerary.item.${idx + 1}`}
              >
                <DayCard
                  day={day}
                  index={idx + 1}
                  isExpanded={expandedDays.has(day.id)}
                  onToggle={() => toggleDay(day.id)}
                  onEdit={() => {
                    setEditingDay(day);
                    setEditDayDate(day.date);
                    setEditDayTitle(day.title);
                  }}
                  onDelete={() => setDeletingDay(day)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add day dialog */}
      <Dialog open={showAddDay} onOpenChange={setShowAddDay}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-light">
              Add Day
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={newDayDate}
                onChange={(e) => setNewDayDate(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Label (optional)</Label>
              <Input
                placeholder="e.g. Arrival in Tokyo"
                value={newDayTitle}
                onChange={(e) => setNewDayTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddDay()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDay(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddDay}
              disabled={!newDayDate || createDay.isPending}
            >
              {createDay.isPending ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit day dialog */}
      <Dialog open={!!editingDay} onOpenChange={() => setEditingDay(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-light">
              Edit Day
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={editDayDate}
                onChange={(e) => setEditDayDate(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Label</Label>
              <Input
                value={editDayTitle}
                onChange={(e) => setEditDayTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUpdateDay()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDay(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDay} disabled={!editDayDate}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete day confirm */}
      <AlertDialog
        open={!!deletingDay}
        onOpenChange={() => setDeletingDay(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete day?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deletingDay?.title}&rdquo; and all its events will be
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDay}
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

// =================== DAY CARD ===================
interface DayCardProps {
  day: ItineraryDay;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function DayCard({
  day,
  index,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
}: DayCardProps) {
  const { data: events } = useListItineraryEvents(day.id);
  const createEvent = useCreateItineraryEvent();
  const updateEvent = useUpdateItineraryEvent();
  const deleteEvent = useDeleteItineraryEvent();

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [editingEvent, setEditingEvent] = useState<ItineraryEvent | null>(null);
  const [editEventTime, setEditEventTime] = useState("");
  const [editEventDesc, setEditEventDesc] = useState("");
  const [deletingEvent, setDeletingEvent] = useState<ItineraryEvent | null>(
    null,
  );

  const sortedEvents = events
    ? [...events].sort((a, b) => {
        if (a.sortOrder !== b.sortOrder)
          return Number(a.sortOrder) - Number(b.sortOrder);
        return a.time.localeCompare(b.time);
      })
    : [];

  const formatDate = (d: string) => {
    try {
      return new Date(`${d}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };

  const handleAddEvent = async () => {
    if (!newEventDesc.trim()) return;
    try {
      const id = crypto.randomUUID();
      const sortOrder = BigInt(sortedEvents.length);
      await createEvent.mutateAsync({
        id,
        dayId: day.id,
        time: newEventTime,
        description: newEventDesc.trim(),
        sortOrder,
      });
      setNewEventTime("");
      setNewEventDesc("");
      setShowAddEvent(false);
      toast.success("Event added.");
    } catch {
      toast.error("Could not add event.");
    }
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent || !editEventDesc.trim()) return;
    try {
      await updateEvent.mutateAsync({
        id: editingEvent.id,
        time: editEventTime,
        description: editEventDesc.trim(),
        sortOrder: editingEvent.sortOrder,
        dayId: day.id,
      });
      setEditingEvent(null);
      toast.success("Event updated.");
    } catch {
      toast.error("Could not update event.");
    }
  };

  const handleDeleteEvent = async () => {
    if (!deletingEvent) return;
    try {
      await deleteEvent.mutateAsync({ id: deletingEvent.id, dayId: day.id });
      setDeletingEvent(null);
      toast.success("Event deleted.");
    } catch {
      toast.error("Could not delete event.");
    }
  };

  return (
    <>
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        {/* Day header */}
        <div
          className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-secondary/40 transition-colors"
          onClick={onToggle}
          onKeyDown={(e) => e.key === "Enter" && onToggle()}
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-teal shrink-0 text-xs font-bold">
            {index}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">{day.title}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDate(day.date)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-1">
              {sortedEvents.length > 0 &&
                `${sortedEvents.length} event${sortedEvents.length !== 1 ? "s" : ""}`}
            </span>
            <button
              type="button"
              className="p-1 rounded hover:bg-secondary transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button
              type="button"
              className="p-1 rounded hover:bg-secondary transition-colors text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Events */}
        {isExpanded && (
          <div className="border-t border-border px-4 py-3 space-y-2">
            {sortedEvents.map((event) => (
              <div
                key={event.id}
                className="group flex items-start gap-3 py-2 border-b border-border/50 last:border-b-0"
              >
                <div className="flex items-center gap-1.5 w-20 shrink-0">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {event.time || "—"}
                  </span>
                </div>
                <span className="flex-1 text-sm leading-relaxed">
                  {event.description}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-secondary transition-colors"
                    onClick={() => {
                      setEditingEvent(event);
                      setEditEventTime(event.time);
                      setEditEventDesc(event.description);
                    }}
                  >
                    <Pencil className="w-3 h-3 text-muted-foreground" />
                  </button>
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-secondary transition-colors text-destructive"
                    onClick={() => setDeletingEvent(event)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}

            {/* Add event form */}
            {showAddEvent ? (
              <div className="flex gap-2 mt-2 items-start">
                <Input
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className="w-28 h-8 text-sm shrink-0"
                  placeholder="Time"
                />
                <Input
                  placeholder="Description"
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddEvent()}
                  className="flex-1 h-8 text-sm"
                  autoFocus
                />
                <Button
                  size="sm"
                  className="h-8 shrink-0"
                  onClick={handleAddEvent}
                  disabled={!newEventDesc.trim()}
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 shrink-0"
                  onClick={() => {
                    setShowAddEvent(false);
                    setNewEventTime("");
                    setNewEventDesc("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground w-full justify-start mt-1"
                onClick={() => setShowAddEvent(true)}
              >
                <Plus className="w-3.5 h-3.5" />
                Add event
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Edit event dialog */}
      <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-light">
              Edit Event
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input
                type="time"
                value={editEventTime}
                onChange={(e) => setEditEventTime(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={editEventDesc}
                onChange={(e) => setEditEventDesc(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUpdateEvent()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEvent(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateEvent}
              disabled={!editEventDesc.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete event confirm */}
      <AlertDialog
        open={!!deletingEvent}
        onOpenChange={() => setDeletingEvent(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event?</AlertDialogTitle>
            <AlertDialogDescription>
              This event will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
