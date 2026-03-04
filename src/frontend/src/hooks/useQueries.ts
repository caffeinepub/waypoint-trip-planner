import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  BudgetCategory,
  BudgetEntry,
  ChecklistCategory,
  ChecklistItem,
  Folder,
  ItineraryDay,
  ItineraryEvent,
  MediaItem,
  MediaType,
  Subfolder,
  Trip,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

// =================== USER PROFILE ===================
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currentUserProfile"] }),
  });
}

// =================== TRIPS ===================
export function useListTrips() {
  const { actor, isFetching } = useActor();
  return useQuery<Trip[]>({
    queryKey: ["trips"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTrips();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTrip() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      name,
      notes,
    }: { id: string; name: string; notes: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createTrip(id, name, notes);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}

export function useUpdateTrip() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      name,
      notes,
    }: { id: string; name: string; notes: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateTrip(id, name, notes);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["trips"] });
      qc.invalidateQueries({ queryKey: ["trip", vars.id] });
    },
  });
}

export function useDeleteTrip() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteTrip(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}

export function useGetTrip(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Trip>({
    queryKey: ["trip", id],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getTrip(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

// =================== FOLDERS ===================
export function useListFolders(tripId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Folder[]>({
    queryKey: ["folders", tripId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listFoldersByTrip(tripId);
    },
    enabled: !!actor && !isFetching && !!tripId,
  });
}

export function useCreateFolder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      tripId,
      name,
    }: { id: string; tripId: string; name: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createFolder(id, tripId, name);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["folders", vars.tripId] }),
  });
}

export function useUpdateFolder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      name,
      tripId: _tripId,
    }: { id: string; name: string; tripId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateFolder(id, name);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["folders", vars.tripId] }),
  });
}

export function useDeleteFolder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tripId: _tripId }: { id: string; tripId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteFolder(id);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["folders", vars.tripId] }),
  });
}

// =================== SUBFOLDERS ===================
export function useListSubfolders(folderId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Subfolder[]>({
    queryKey: ["subfolders", folderId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSubfoldersByFolder(folderId);
    },
    enabled: !!actor && !isFetching && !!folderId,
  });
}

export function useCreateSubfolder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      folderId,
      name,
    }: { id: string; folderId: string; name: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createSubfolder(id, folderId, name);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["subfolders", vars.folderId] }),
  });
}

export function useUpdateSubfolder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      name,
      folderId: _folderId,
    }: { id: string; name: string; folderId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateSubfolder(id, name);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["subfolders", vars.folderId] }),
  });
}

export function useDeleteSubfolder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      folderId: _folderId,
    }: { id: string; folderId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteSubfolder(id);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["subfolders", vars.folderId] }),
  });
}

// =================== MEDIA ===================
export function useListMedia(parentType: string, parentId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<MediaItem[]>({
    queryKey: ["media", parentType, parentId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMediaItemsByParent(parentType, parentId);
    },
    enabled: !!actor && !isFetching && !!parentId,
  });
}

export function useCreateMediaItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      parentType,
      parentId,
      blobId,
      fileName,
      mediaType,
    }: {
      id: string;
      parentType: string;
      parentId: string;
      blobId: string;
      fileName: string;
      mediaType: MediaType;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createMediaItem(
        id,
        parentType,
        parentId,
        blobId,
        fileName,
        mediaType,
      );
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["media", vars.parentType, vars.parentId],
      }),
  });
}

export function useDeleteMediaItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      parentType: _parentType,
      parentId: _parentId,
    }: { id: string; parentType: string; parentId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteMediaItem(id);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["media", vars.parentType, vars.parentId],
      }),
  });
}

// =================== CHECKLISTS ===================
export function useListChecklist(tripId: string, category: ChecklistCategory) {
  const { actor, isFetching } = useActor();
  return useQuery<ChecklistItem[]>({
    queryKey: ["checklist", tripId, category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listChecklistItemsByTripAndCategory(tripId, category);
    },
    enabled: !!actor && !isFetching && !!tripId,
  });
}

export function useCreateChecklistItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      tripId,
      category,
      text,
    }: {
      id: string;
      tripId: string;
      category: ChecklistCategory;
      text: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createChecklistItem(id, tripId, category, text);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["checklist", vars.tripId, vars.category],
      }),
  });
}

export function useUpdateChecklistItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      text,
      checked,
      tripId: _tripId,
      category: _category,
    }: {
      id: string;
      text: string;
      checked: boolean;
      tripId: string;
      category: ChecklistCategory;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateChecklistItem(id, text, checked);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["checklist", vars.tripId, vars.category],
      }),
  });
}

export function useDeleteChecklistItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      tripId: _tripId,
      category: _category,
    }: {
      id: string;
      tripId: string;
      category: ChecklistCategory;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteChecklistItem(id);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["checklist", vars.tripId, vars.category],
      }),
  });
}

// =================== ITINERARY ===================
export function useListItineraryDays(tripId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<ItineraryDay[]>({
    queryKey: ["itinerary-days", tripId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listItineraryDaysByTrip(tripId);
    },
    enabled: !!actor && !isFetching && !!tripId,
  });
}

export function useCreateItineraryDay() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      tripId,
      date,
      title,
      sortOrder,
    }: {
      id: string;
      tripId: string;
      date: string;
      title: string;
      sortOrder: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createItineraryDay(id, tripId, date, title, sortOrder);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["itinerary-days", vars.tripId] }),
  });
}

export function useUpdateItineraryDay() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      date,
      title,
      sortOrder,
      tripId: _tripId,
    }: {
      id: string;
      date: string;
      title: string;
      sortOrder: bigint;
      tripId: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateItineraryDay(id, date, title, sortOrder);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["itinerary-days", vars.tripId] }),
  });
}

export function useDeleteItineraryDay() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tripId: _tripId }: { id: string; tripId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteItineraryDay(id);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["itinerary-days", vars.tripId] }),
  });
}

export function useListItineraryEvents(dayId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<ItineraryEvent[]>({
    queryKey: ["itinerary-events", dayId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listItineraryEventsByDay(dayId);
    },
    enabled: !!actor && !isFetching && !!dayId,
  });
}

export function useCreateItineraryEvent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      dayId,
      time,
      description,
      sortOrder,
    }: {
      id: string;
      dayId: string;
      time: string;
      description: string;
      sortOrder: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createItineraryEvent(
        id,
        dayId,
        time,
        description,
        sortOrder,
      );
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["itinerary-events", vars.dayId] }),
  });
}

export function useUpdateItineraryEvent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      time,
      description,
      sortOrder,
      dayId: _dayId,
    }: {
      id: string;
      time: string;
      description: string;
      sortOrder: bigint;
      dayId: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateItineraryEvent(id, time, description, sortOrder);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["itinerary-events", vars.dayId] }),
  });
}

export function useDeleteItineraryEvent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dayId: _dayId }: { id: string; dayId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteItineraryEvent(id);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["itinerary-events", vars.dayId] }),
  });
}

// =================== BUDGET ===================
export function useListBudget(tripId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<BudgetEntry[]>({
    queryKey: ["budget", tripId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listBudgetEntriesByTrip(tripId);
    },
    enabled: !!actor && !isFetching && !!tripId,
  });
}

export function useCreateBudgetEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      tripId,
      category,
      title,
      plannedAmount,
      spentAmount,
    }: {
      id: string;
      tripId: string;
      category: BudgetCategory;
      title: string;
      plannedAmount: number;
      spentAmount: number;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createBudgetEntry(
        id,
        tripId,
        category,
        title,
        plannedAmount,
        spentAmount,
      );
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["budget", vars.tripId] }),
  });
}

export function useUpdateBudgetEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      title,
      plannedAmount,
      spentAmount,
      tripId: _tripId,
    }: {
      id: string;
      title: string;
      plannedAmount: number;
      spentAmount: number;
      tripId: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateBudgetEntry(id, title, plannedAmount, spentAmount);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["budget", vars.tripId] }),
  });
}

export function useDeleteBudgetEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tripId: _tripId }: { id: string; tripId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteBudgetEntry(id);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["budget", vars.tripId] }),
  });
}
