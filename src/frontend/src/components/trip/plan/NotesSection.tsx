import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, FileText, Save } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useGetTrip, useUpdateTrip } from "../../../hooks/useQueries";

interface NotesSectionProps {
  tripId: string;
  tripName: string;
}

export default function NotesSection({ tripId, tripName }: NotesSectionProps) {
  const { data: trip, isLoading } = useGetTrip(tripId);
  const updateTrip = useUpdateTrip();

  const [notes, setNotes] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize notes from trip data on first load
  const currentNotes = notes !== null ? notes : (trip?.notes ?? "");

  const handleSave = useCallback(
    async (value: string) => {
      if (!trip) return;
      try {
        await updateTrip.mutateAsync({
          id: trip.id,
          name: trip.name,
          notes: value,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch {
        toast.error("Could not save notes.");
      }
    },
    [trip, updateTrip],
  );

  const handleChange = (value: string) => {
    setNotes(value);
    setSaved(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSave(value);
    }, 1500);
  };

  const handleBlur = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (notes !== null && notes !== trip?.notes) {
      handleSave(notes);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-teal">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="font-display text-xl font-light">Notes</h3>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <div
              className="flex items-center gap-1.5 text-xs text-teal"
              data-ocid="notes.success_state"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Saved
            </div>
          )}
          {updateTrip.isPending && (
            <span
              className="text-xs text-muted-foreground"
              data-ocid="notes.loading_state"
            >
              Saving...
            </span>
          )}
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => handleSave(currentNotes)}
            disabled={updateTrip.isPending}
            data-ocid="notes.save_button"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" data-ocid="notes.loading_state" />
      ) : (
        <Textarea
          placeholder={`Jot down anything about your ${tripName} trip — ideas, reminders, tips, impressions...`}
          value={currentNotes}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          className="min-h-[320px] resize-y text-sm leading-relaxed rounded-xl"
          data-ocid="notes.textarea"
        />
      )}

      <p className="text-xs text-muted-foreground mt-2">
        Auto-saves 1.5s after you stop typing, or click Save.
      </p>
    </div>
  );
}
