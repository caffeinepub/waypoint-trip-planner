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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Compass,
  LogOut,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Trip } from "../backend.d";
import {
  useCreateTrip,
  useDeleteTrip,
  useListTrips,
  useUpdateTrip,
} from "../hooks/useQueries";

interface TripsPageProps {
  userName?: string;
  onNavigateToTrip: (tripId: string, tripName: string) => void;
  onLogout: () => void;
}

function formatDate(time: bigint) {
  const date = new Date(Number(time) / 1_000_000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function TripsPage({
  userName,
  onNavigateToTrip,
  onLogout,
}: TripsPageProps) {
  const { data: trips, isLoading } = useListTrips();
  const createTrip = useCreateTrip();
  const updateTrip = useUpdateTrip();
  const deleteTrip = useDeleteTrip();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTripName, setNewTripName] = useState("");
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingTrip, setDeletingTrip] = useState<Trip | null>(null);

  const handleCreate = async () => {
    if (!newTripName.trim()) return;
    try {
      const id = crypto.randomUUID();
      await createTrip.mutateAsync({ id, name: newTripName.trim(), notes: "" });
      toast.success("Trip created!");
      setNewTripName("");
      setShowCreateDialog(false);
    } catch {
      toast.error("Could not create trip.");
    }
  };

  const handleRename = async () => {
    if (!editingTrip || !editName.trim()) return;
    try {
      await updateTrip.mutateAsync({
        id: editingTrip.id,
        name: editName.trim(),
        notes: editingTrip.notes,
      });
      toast.success("Trip renamed.");
      setEditingTrip(null);
    } catch {
      toast.error("Could not rename trip.");
    }
  };

  const handleDelete = async () => {
    if (!deletingTrip) return;
    try {
      await deleteTrip.mutateAsync(deletingTrip.id);
      toast.success("Trip deleted.");
      setDeletingTrip(null);
    } catch {
      toast.error("Could not delete trip.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-teal" strokeWidth={1.5} />
            <span className="font-display text-xl font-semibold tracking-tight">
              Waypoint
            </span>
          </div>
          <div className="flex items-center gap-3">
            {userName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{userName}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-muted-foreground hover:text-foreground gap-2"
              data-ocid="nav.button"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        {/* Hero section */}
        <div
          className="relative rounded-2xl overflow-hidden mb-10 h-44"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-bg.dim_1400x400.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.22 0.04 210 / 0.85) 0%, oklch(0.32 0.08 200 / 0.6) 100%)",
            }}
          />
          <div className="relative z-10 flex items-end h-full p-7">
            <div>
              <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-1">
                {userName ? `Welcome back, ${userName}` : "Welcome back"}
              </p>
              <h2 className="font-display text-3xl font-light text-white">
                Where to next?
              </h2>
            </div>
            <div className="ml-auto">
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="gap-2 shadow-teal font-medium"
                data-ocid="trips.primary_button"
              >
                <Plus className="w-4 h-4" />
                New Trip
              </Button>
            </div>
          </div>
        </div>

        {/* Trips grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {["sk1", "sk2", "sk3"].map((k) => (
              <Skeleton
                key={k}
                className="h-40 rounded-xl"
                data-ocid="trips.loading_state"
              />
            ))}
          </div>
        ) : !trips || trips.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 text-center"
            data-ocid="trips.empty_state"
          >
            <MapPin
              className="w-12 h-12 text-muted-foreground/30 mb-4"
              strokeWidth={1}
            />
            <h3 className="font-display text-2xl font-light text-foreground mb-2">
              No trips yet
            </h3>
            <p className="text-muted-foreground max-w-xs mb-6">
              Create your first trip to start collecting memories and planning
              adventures.
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="gap-2"
              data-ocid="trips.primary_button"
            >
              <Plus className="w-4 h-4" />
              Create first trip
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {trips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                >
                  <TripCard
                    trip={trip}
                    index={index + 1}
                    onClick={() => onNavigateToTrip(trip.id, trip.name)}
                    onEdit={() => {
                      setEditingTrip(trip);
                      setEditName(trip.name);
                    }}
                    onDelete={() => setDeletingTrip(trip)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Built with ♥ using caffeine.ai
          </a>
        </p>
      </footer>

      {/* Create trip dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-sm" data-ocid="trip.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-light">
              New Trip
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              placeholder="e.g. Tokyo Summer 2026"
              value={newTripName}
              onChange={(e) => setNewTripName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
              data-ocid="trip.input"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setNewTripName("");
              }}
              data-ocid="trip.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newTripName.trim() || createTrip.isPending}
              data-ocid="trip.submit_button"
            >
              {createTrip.isPending ? "Creating..." : "Create Trip"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename trip dialog */}
      <Dialog open={!!editingTrip} onOpenChange={() => setEditingTrip(null)}>
        <DialogContent className="sm:max-w-sm" data-ocid="trip.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-light">
              Rename Trip
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              autoFocus
              data-ocid="trip.input"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingTrip(null)}
              data-ocid="trip.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={!editName.trim() || updateTrip.isPending}
              data-ocid="trip.save_button"
            >
              {updateTrip.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <AlertDialog
        open={!!deletingTrip}
        onOpenChange={() => setDeletingTrip(null)}
      >
        <AlertDialogContent data-ocid="trip.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete trip?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deletingTrip?.name}&rdquo; and all its contents will be
              permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="trip.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="trip.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface TripCardProps {
  trip: Trip;
  index: number;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const _CARD_GRADIENTS = [
  "from-teal-700 to-teal-500",
  "from-amber-700 to-amber-500",
  "from-emerald-700 to-emerald-500",
  "from-rose-700 to-rose-500",
  "from-indigo-700 to-indigo-500",
  "from-violet-700 to-violet-500",
];

const getGradientStyle = (name: string) => {
  const gradients = [
    { from: "oklch(0.28 0.07 205)", to: "oklch(0.42 0.1 195)" },
    { from: "oklch(0.55 0.12 38)", to: "oklch(0.7 0.14 50)" },
    { from: "oklch(0.35 0.1 145)", to: "oklch(0.52 0.14 155)" },
    { from: "oklch(0.45 0.14 22)", to: "oklch(0.6 0.16 30)" },
    { from: "oklch(0.38 0.1 270)", to: "oklch(0.52 0.14 260)" },
  ];
  const idx =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    gradients.length;
  const g = gradients[idx];
  return `linear-gradient(135deg, ${g.from} 0%, ${g.to} 100%)`;
};

function TripCard({ trip, index, onClick, onEdit, onDelete }: TripCardProps) {
  return (
    <div
      className="group relative rounded-xl overflow-hidden cursor-pointer shadow-card hover:shadow-card-hover transition-all duration-200 animate-fade-in"
      data-ocid={`trip.item.${index}`}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      {/* Gradient bg */}
      <div
        className="h-28"
        style={{ background: getGradientStyle(trip.name) }}
      />
      {/* Card body */}
      <div className="bg-card px-4 py-3 border-x border-b border-border rounded-b-xl">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate leading-tight mb-1">
              {trip.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(trip.createdAt)}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -mr-1"
                data-ocid={`trip.edit_button.${index}`}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                data-ocid={`trip.edit_button.${index}`}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                data-ocid={`trip.delete_button.${index}`}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
