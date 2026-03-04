import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ItineraryEvent {
    id: string;
    sortOrder: bigint;
    time: string;
    description: string;
    dayId: string;
}
export interface Trip {
    id: string;
    name: string;
    createdAt: Time;
    notes: string;
}
export type Time = bigint;
export interface MediaItem {
    id: string;
    createdAt: Time;
    fileName: string;
    blobId: string;
    mediaType: MediaType;
    parentId: string;
    parentType: string;
}
export interface BudgetEntry {
    id: string;
    title: string;
    plannedAmount: number;
    tripId: string;
    category: BudgetCategory;
    spentAmount: number;
}
export interface ItineraryDay {
    id: string;
    title: string;
    sortOrder: bigint;
    date: string;
    tripId: string;
}
export interface ChecklistItem {
    id: string;
    checked: boolean;
    createdAt: Time;
    tripId: string;
    text: string;
    category: ChecklistCategory;
}
export interface Subfolder {
    id: string;
    name: string;
    createdAt: Time;
    folderId: string;
}
export interface Folder {
    id: string;
    name: string;
    createdAt: Time;
    tripId: string;
}
export interface UserProfile {
    name: string;
}
export enum BudgetCategory {
    other = "other",
    food = "food",
    activities = "activities",
    flights = "flights",
    hotels = "hotels"
}
export enum ChecklistCategory {
    todos = "todos",
    places = "places",
    packing = "packing"
}
export enum MediaType {
    video = "video",
    image = "image"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBudgetEntry(id: string, tripId: string, category: BudgetCategory, title: string, plannedAmount: number, spentAmount: number): Promise<void>;
    createChecklistItem(id: string, tripId: string, category: ChecklistCategory, text: string): Promise<void>;
    createFolder(id: string, tripId: string, name: string): Promise<void>;
    createItineraryDay(id: string, tripId: string, date: string, title: string, sortOrder: bigint): Promise<void>;
    createItineraryEvent(id: string, dayId: string, time: string, description: string, sortOrder: bigint): Promise<void>;
    createMediaItem(id: string, parentType: string, parentId: string, blobId: string, fileName: string, mediaType: MediaType): Promise<void>;
    createSubfolder(id: string, folderId: string, name: string): Promise<void>;
    createTrip(id: string, name: string, notes: string): Promise<void>;
    deleteBudgetEntry(id: string): Promise<void>;
    deleteChecklistItem(id: string): Promise<void>;
    deleteFolder(id: string): Promise<void>;
    deleteItineraryDay(id: string): Promise<void>;
    deleteItineraryEvent(id: string): Promise<void>;
    deleteMediaItem(id: string): Promise<void>;
    deleteSubfolder(id: string): Promise<void>;
    deleteTrip(id: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getTrip(id: string): Promise<Trip>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listBudgetEntriesByTrip(tripId: string): Promise<Array<BudgetEntry>>;
    listChecklistItemsByTripAndCategory(tripId: string, category: ChecklistCategory): Promise<Array<ChecklistItem>>;
    listFoldersByTrip(tripId: string): Promise<Array<Folder>>;
    listItineraryDaysByTrip(tripId: string): Promise<Array<ItineraryDay>>;
    listItineraryEventsByDay(dayId: string): Promise<Array<ItineraryEvent>>;
    listMediaItemsByParent(parentType: string, parentId: string): Promise<Array<MediaItem>>;
    listSubfoldersByFolder(folderId: string): Promise<Array<Subfolder>>;
    listTrips(): Promise<Array<Trip>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateBudgetEntry(id: string, title: string, plannedAmount: number, spentAmount: number): Promise<void>;
    updateChecklistItem(id: string, text: string, checked: boolean): Promise<void>;
    updateFolder(id: string, name: string): Promise<void>;
    updateItineraryDay(id: string, date: string, title: string, sortOrder: bigint): Promise<void>;
    updateItineraryEvent(id: string, time: string, description: string, sortOrder: bigint): Promise<void>;
    updateSubfolder(id: string, name: string): Promise<void>;
    updateTrip(id: string, name: string, notes: string): Promise<void>;
}
