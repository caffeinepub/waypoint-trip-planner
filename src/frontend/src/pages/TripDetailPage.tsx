import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Camera,
  Compass,
  LogOut,
  MapIcon,
  User,
} from "lucide-react";
import { useState } from "react";
import MemoriesTab from "../components/trip/MemoriesTab";
import PlanTab from "../components/trip/PlanTab";

interface TripDetailPageProps {
  tripId: string;
  tripName: string;
  onBack: () => void;
  onLogout: () => void;
  userName?: string;
}

export default function TripDetailPage({
  tripId,
  tripName,
  onBack,
  onLogout,
  userName,
}: TripDetailPageProps) {
  const [activeTab, setActiveTab] = useState<"memories" | "plan">("memories");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="shrink-0"
            data-ocid="nav.button"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Compass className="w-4 h-4 text-teal shrink-0" strokeWidth={1.5} />
            <span className="font-display text-lg font-semibold tracking-tight truncate">
              {tripName}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {userName && (
              <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
                <User className="w-3.5 h-3.5" />
                <span>{userName}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-muted-foreground hover:text-foreground gap-1.5"
              data-ocid="nav.button"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main tabs */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "memories" | "plan")}
          className="flex flex-col h-full"
        >
          <TabsList className="mb-6 w-fit bg-secondary rounded-xl p-1 h-10">
            <TabsTrigger
              value="memories"
              className="rounded-lg gap-2 px-4 data-[state=active]:bg-card data-[state=active]:shadow-xs"
              data-ocid="memories.tab"
            >
              <Camera className="w-4 h-4" />
              Memories
            </TabsTrigger>
            <TabsTrigger
              value="plan"
              className="rounded-lg gap-2 px-4 data-[state=active]:bg-card data-[state=active]:shadow-xs"
              data-ocid="plan.tab"
            >
              <MapIcon className="w-4 h-4" />
              Plan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="memories" className="mt-0 flex-1">
            <MemoriesTab tripId={tripId} />
          </TabsContent>

          <TabsContent value="plan" className="mt-0 flex-1">
            <PlanTab tripId={tripId} tripName={tripName} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center border-t border-border/50">
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
    </div>
  );
}
