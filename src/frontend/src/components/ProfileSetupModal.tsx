import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Compass } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveUserProfile } from "../hooks/useQueries";

export default function ProfileSetupModal() {
  const [name, setName] = useState("");
  const saveProfile = useSaveUserProfile();

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      await saveProfile.mutateAsync({ name: name.trim() });
      toast.success("Welcome to Waypoint!");
    } catch {
      toast.error("Could not save profile. Please try again.");
    }
  };

  return (
    <Dialog open>
      <DialogContent
        className="sm:max-w-sm"
        data-ocid="profile.dialog"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Compass className="w-6 h-6 text-teal" strokeWidth={1.5} />
            </div>
          </div>
          <DialogTitle className="font-display text-2xl font-light">
            Welcome, traveller
          </DialogTitle>
          <DialogDescription>What should we call you?</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Your name</Label>
            <Input
              id="profile-name"
              placeholder="e.g. Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
              data-ocid="profile.input"
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || saveProfile.isPending}
            className="w-full"
            data-ocid="profile.submit_button"
          >
            {saveProfile.isPending ? "Saving..." : "Get started"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
