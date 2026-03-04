import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Backpack,
  Calendar,
  CheckSquare,
  DollarSign,
  FileText,
  MapPin,
} from "lucide-react";
import { ChecklistCategory } from "../../backend.d";
import BudgetSection from "./plan/BudgetSection";
import ChecklistSection from "./plan/ChecklistSection";
import ItinerarySection from "./plan/ItinerarySection";
import NotesSection from "./plan/NotesSection";

interface PlanTabProps {
  tripId: string;
  tripName: string;
}

export default function PlanTab({ tripId, tripName }: PlanTabProps) {
  return (
    <Tabs defaultValue="packing" className="w-full">
      <TabsList className="flex flex-wrap gap-1 h-auto bg-secondary rounded-xl p-1 mb-6">
        <TabsTrigger
          value="packing"
          className="flex items-center gap-1.5 rounded-lg text-xs sm:text-sm"
          data-ocid="plan.packing_tab"
        >
          <Backpack className="w-3.5 h-3.5" />
          <span>Packing</span>
        </TabsTrigger>
        <TabsTrigger
          value="places"
          className="flex items-center gap-1.5 rounded-lg text-xs sm:text-sm"
          data-ocid="plan.places_tab"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Places</span>
        </TabsTrigger>
        <TabsTrigger
          value="todos"
          className="flex items-center gap-1.5 rounded-lg text-xs sm:text-sm"
          data-ocid="plan.todos_tab"
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>To-Do</span>
        </TabsTrigger>
        <TabsTrigger
          value="itinerary"
          className="flex items-center gap-1.5 rounded-lg text-xs sm:text-sm"
          data-ocid="plan.itinerary_tab"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Itinerary</span>
        </TabsTrigger>
        <TabsTrigger
          value="budget"
          className="flex items-center gap-1.5 rounded-lg text-xs sm:text-sm"
          data-ocid="plan.budget_tab"
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Budget</span>
        </TabsTrigger>
        <TabsTrigger
          value="notes"
          className="flex items-center gap-1.5 rounded-lg text-xs sm:text-sm"
          data-ocid="plan.notes_tab"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Notes</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="packing">
        <ChecklistSection
          tripId={tripId}
          category={ChecklistCategory.packing}
          title="Packing List"
          placeholder="e.g. Passport, sunscreen, adapter..."
          icon={<Backpack className="w-4 h-4" />}
        />
      </TabsContent>

      <TabsContent value="places">
        <ChecklistSection
          tripId={tripId}
          category={ChecklistCategory.places}
          title="Places to Visit"
          placeholder="e.g. Eiffel Tower, Shibuya Crossing..."
          icon={<MapPin className="w-4 h-4" />}
        />
      </TabsContent>

      <TabsContent value="todos">
        <ChecklistSection
          tripId={tripId}
          category={ChecklistCategory.todos}
          title="Things To Do"
          placeholder="e.g. Book restaurant, buy travel insurance..."
          icon={<CheckSquare className="w-4 h-4" />}
        />
      </TabsContent>

      <TabsContent value="itinerary">
        <ItinerarySection tripId={tripId} />
      </TabsContent>

      <TabsContent value="budget">
        <BudgetSection tripId={tripId} />
      </TabsContent>

      <TabsContent value="notes">
        <NotesSection tripId={tripId} tripName={tripName} />
      </TabsContent>
    </Tabs>
  );
}
