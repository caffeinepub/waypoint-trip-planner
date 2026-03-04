import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  // Initialize the access control state
  let accessControlState = AccessControl.initState();
  
  // Include authorization and blob storage mixins
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User profile type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Type definitions
  type MediaType = { #image; #video };
  type ChecklistCategory = { #packing; #places; #todos };
  type BudgetCategory = { #flights; #hotels; #food; #activities; #other };

  // Data structures
  type Trip = {
    id : Text;
    name : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  type Folder = {
    id : Text;
    tripId : Text;
    name : Text;
    createdAt : Time.Time;
  };

  type Subfolder = {
    id : Text;
    folderId : Text;
    name : Text;
    createdAt : Time.Time;
  };

  type MediaItem = {
    id : Text;
    parentType : Text; // "folder" | "subfolder"
    parentId : Text;
    blobId : Text;
    fileName : Text;
    mediaType : MediaType;
    createdAt : Time.Time;
  };

  type ChecklistItem = {
    id : Text;
    tripId : Text;
    category : ChecklistCategory;
    text : Text;
    checked : Bool;
    createdAt : Time.Time;
  };

  type ItineraryDay = {
    id : Text;
    tripId : Text;
    date : Text;
    title : Text;
    sortOrder : Nat;
  };

  type ItineraryEvent = {
    id : Text;
    dayId : Text;
    time : Text;
    description : Text;
    sortOrder : Nat;
  };

  type BudgetEntry = {
    id : Text;
    tripId : Text;
    category : BudgetCategory;
    title : Text;
    plannedAmount : Float;
    spentAmount : Float;
  };

  // Persistent maps
  let trips = Map.empty<Text, Trip>();
  let folders = Map.empty<Text, Folder>();
  let subfolders = Map.empty<Text, Subfolder>();
  let mediaItems = Map.empty<Text, MediaItem>();
  let checklistItems = Map.empty<Text, ChecklistItem>();
  let itineraryDays = Map.empty<Text, ItineraryDay>();
  let itineraryEvents = Map.empty<Text, ItineraryEvent>();
  let budgetEntries = Map.empty<Text, BudgetEntry>();

  // Trip CRUD operations
  public shared ({ caller }) func createTrip(id : Text, name : Text, notes : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create trips");
    };
    if (trips.containsKey(id)) {
      Runtime.trap("Trip with this ID already exists");
    };
    let trip : Trip = {
      id;
      name;
      notes;
      createdAt = Time.now();
    };
    trips.add(id, trip);
  };

  public query ({ caller }) func listTrips() : async [Trip] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list trips");
    };
    trips.values().toArray();
  };

  public query ({ caller }) func getTrip(id : Text) : async Trip {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view trips");
    };
    switch (trips.get(id)) {
      case (null) { Runtime.trap("Trip not found") };
      case (?trip) { trip };
    };
  };

  public shared ({ caller }) func updateTrip(id : Text, name : Text, notes : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update trips");
    };
    switch (trips.get(id)) {
      case (null) { Runtime.trap("Trip not found") };
      case (?trip) {
        let updatedTrip : Trip = {
          id;
          name;
          notes;
          createdAt = trip.createdAt;
        };
        trips.add(id, updatedTrip);
      };
    };
  };

  public shared ({ caller }) func deleteTrip(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete trips");
    };
    if (not trips.containsKey(id)) {
      Runtime.trap("Trip not found");
    };
    trips.remove(id);
  };

  // Folder CRUD operations
  public shared ({ caller }) func createFolder(id : Text, tripId : Text, name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create folders");
    };
    if (folders.containsKey(id)) {
      Runtime.trap("Folder with this ID already exists");
    };
    if (not trips.containsKey(tripId)) {
      Runtime.trap("Trip not found for this folder");
    };
    let folder : Folder = {
      id;
      tripId;
      name;
      createdAt = Time.now();
    };
    folders.add(id, folder);
  };

  public query ({ caller }) func listFoldersByTrip(tripId : Text) : async [Folder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list folders");
    };
    folders.values().toArray().filter(func(f) { f.tripId == tripId });
  };

  public shared ({ caller }) func updateFolder(id : Text, name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update folders");
    };
    switch (folders.get(id)) {
      case (null) { Runtime.trap("Folder not found") };
      case (?folder) {
        let updatedFolder : Folder = {
          id;
          tripId = folder.tripId;
          name;
          createdAt = folder.createdAt;
        };
        folders.add(id, updatedFolder);
      };
    };
  };

  public shared ({ caller }) func deleteFolder(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete folders");
    };
    if (not folders.containsKey(id)) {
      Runtime.trap("Folder not found");
    };
    folders.remove(id);
  };

  // Subfolder CRUD operations
  public shared ({ caller }) func createSubfolder(id : Text, folderId : Text, name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create subfolders");
    };
    if (subfolders.containsKey(id)) {
      Runtime.trap("Subfolder with this ID already exists");
    };
    if (not folders.containsKey(folderId)) {
      Runtime.trap("Folder not found for this subfolder");
    };
    let subfolder : Subfolder = {
      id;
      folderId;
      name;
      createdAt = Time.now();
    };
    subfolders.add(id, subfolder);
  };

  public query ({ caller }) func listSubfoldersByFolder(folderId : Text) : async [Subfolder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list subfolders");
    };
    subfolders.values().toArray().filter(func(s) { s.folderId == folderId });
  };

  public shared ({ caller }) func updateSubfolder(id : Text, name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update subfolders");
    };
    switch (subfolders.get(id)) {
      case (null) { Runtime.trap("Subfolder not found") };
      case (?subfolder) {
        let updatedSubfolder : Subfolder = {
          id;
          folderId = subfolder.folderId;
          name;
          createdAt = subfolder.createdAt;
        };
        subfolders.add(id, updatedSubfolder);
      };
    };
  };

  public shared ({ caller }) func deleteSubfolder(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete subfolders");
    };
    if (not subfolders.containsKey(id)) {
      Runtime.trap("Subfolder not found");
    };
    subfolders.remove(id);
  };

  // MediaItem CRUD operations
  public shared ({ caller }) func createMediaItem(
    id : Text,
    parentType : Text,
    parentId : Text,
    blobId : Text,
    fileName : Text,
    mediaType : MediaType
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create media items");
    };
    if (mediaItems.containsKey(id)) {
      Runtime.trap("MediaItem with this ID already exists");
    };
    if (parentType != "folder" and parentType != "subfolder") {
      Runtime.trap("Invalid parentType for MediaItem");
    };
    let mediaItem : MediaItem = {
      id;
      parentType;
      parentId;
      blobId;
      fileName;
      mediaType;
      createdAt = Time.now();
    };
    mediaItems.add(id, mediaItem);
  };

  public query ({ caller }) func listMediaItemsByParent(parentType : Text, parentId : Text) : async [MediaItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list media items");
    };
    if (parentType != "folder" and parentType != "subfolder") {
      Runtime.trap("Invalid parentType for MediaItem");
    };
    mediaItems.values().toArray().filter(func(m) { m.parentType == parentType and m.parentId == parentId });
  };

  public shared ({ caller }) func deleteMediaItem(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete media items");
    };
    if (not mediaItems.containsKey(id)) {
      Runtime.trap("MediaItem not found");
    };
    mediaItems.remove(id);
  };

  // ChecklistItem CRUD operations
  public shared ({ caller }) func createChecklistItem(
    id : Text,
    tripId : Text,
    category : ChecklistCategory,
    text : Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checklist items");
    };
    if (checklistItems.containsKey(id)) {
      Runtime.trap("ChecklistItem with this ID already exists");
    };
    if (not trips.containsKey(tripId)) {
      Runtime.trap("Trip not found for this checklist item");
    };
    let item : ChecklistItem = {
      id;
      tripId;
      category;
      text;
      checked = false;
      createdAt = Time.now();
    };
    checklistItems.add(id, item);
  };

  public query ({ caller }) func listChecklistItemsByTripAndCategory(tripId : Text, category : ChecklistCategory) : async [ChecklistItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list checklist items");
    };
    checklistItems.values().toArray().filter(func(c) { c.tripId == tripId and c.category == category });
  };

  public shared ({ caller }) func updateChecklistItem(id : Text, text : Text, checked : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update checklist items");
    };
    switch (checklistItems.get(id)) {
      case (null) { Runtime.trap("ChecklistItem not found") };
      case (?item) {
        let updatedItem : ChecklistItem = {
          id;
          tripId = item.tripId;
          category = item.category;
          text;
          checked;
          createdAt = item.createdAt;
        };
        checklistItems.add(id, updatedItem);
      };
    };
  };

  public shared ({ caller }) func deleteChecklistItem(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete checklist items");
    };
    if (not checklistItems.containsKey(id)) {
      Runtime.trap("ChecklistItem not found");
    };
    checklistItems.remove(id);
  };

  // ItineraryDay CRUD operations
  public shared ({ caller }) func createItineraryDay(
    id : Text,
    tripId : Text,
    date : Text,
    title : Text,
    sortOrder : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create itinerary days");
    };
    if (itineraryDays.containsKey(id)) {
      Runtime.trap("ItineraryDay with this ID already exists");
    };
    if (not trips.containsKey(tripId)) {
      Runtime.trap("Trip not found for this itinerary day");
    };
    let day : ItineraryDay = {
      id;
      tripId;
      date;
      title;
      sortOrder;
    };
    itineraryDays.add(id, day);
  };

  public query ({ caller }) func listItineraryDaysByTrip(tripId : Text) : async [ItineraryDay] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list itinerary days");
    };
    itineraryDays.values().toArray().filter(func(d) { d.tripId == tripId });
  };

  public shared ({ caller }) func updateItineraryDay(id : Text, date : Text, title : Text, sortOrder : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update itinerary days");
    };
    switch (itineraryDays.get(id)) {
      case (null) { Runtime.trap("ItineraryDay not found") };
      case (?day) {
        let updatedDay : ItineraryDay = {
          id;
          tripId = day.tripId;
          date;
          title;
          sortOrder;
        };
        itineraryDays.add(id, updatedDay);
      };
    };
  };

  public shared ({ caller }) func deleteItineraryDay(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete itinerary days");
    };
    if (not itineraryDays.containsKey(id)) {
      Runtime.trap("ItineraryDay not found");
    };
    itineraryDays.remove(id);
  };

  // ItineraryEvent CRUD operations
  public shared ({ caller }) func createItineraryEvent(
    id : Text,
    dayId : Text,
    time : Text,
    description : Text,
    sortOrder : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create itinerary events");
    };
    if (itineraryEvents.containsKey(id)) {
      Runtime.trap("ItineraryEvent with this ID already exists");
    };
    if (not itineraryDays.containsKey(dayId)) {
      Runtime.trap("ItineraryDay not found for this event");
    };
    let event : ItineraryEvent = {
      id;
      dayId;
      time;
      description;
      sortOrder;
    };
    itineraryEvents.add(id, event);
  };

  public query ({ caller }) func listItineraryEventsByDay(dayId : Text) : async [ItineraryEvent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list itinerary events");
    };
    itineraryEvents.values().toArray().filter(func(e) { e.dayId == dayId });
  };

  public shared ({ caller }) func updateItineraryEvent(id : Text, time : Text, description : Text, sortOrder : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update itinerary events");
    };
    switch (itineraryEvents.get(id)) {
      case (null) { Runtime.trap("ItineraryEvent not found") };
      case (?event) {
        let updatedEvent : ItineraryEvent = {
          id;
          dayId = event.dayId;
          time;
          description;
          sortOrder;
        };
        itineraryEvents.add(id, updatedEvent);
      };
    };
  };

  public shared ({ caller }) func deleteItineraryEvent(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete itinerary events");
    };
    if (not itineraryEvents.containsKey(id)) {
      Runtime.trap("ItineraryEvent not found");
    };
    itineraryEvents.remove(id);
  };

  // BudgetEntry CRUD operations
  public shared ({ caller }) func createBudgetEntry(
    id : Text,
    tripId : Text,
    category : BudgetCategory,
    title : Text,
    plannedAmount : Float,
    spentAmount : Float,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create budget entries");
    };
    if (budgetEntries.containsKey(id)) {
      Runtime.trap("BudgetEntry with this ID already exists");
    };
    if (not trips.containsKey(tripId)) {
      Runtime.trap("Trip not found for this budget entry");
    };
    let entry : BudgetEntry = {
      id;
      tripId;
      category;
      title;
      plannedAmount;
      spentAmount;
    };
    budgetEntries.add(id, entry);
  };

  public query ({ caller }) func listBudgetEntriesByTrip(tripId : Text) : async [BudgetEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list budget entries");
    };
    budgetEntries.values().toArray().filter(func(e) { e.tripId == tripId });
  };

  public shared ({ caller }) func updateBudgetEntry(id : Text, title : Text, plannedAmount : Float, spentAmount : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update budget entries");
    };
    switch (budgetEntries.get(id)) {
      case (null) { Runtime.trap("BudgetEntry not found") };
      case (?entry) {
        let updatedEntry : BudgetEntry = {
          id;
          tripId = entry.tripId;
          category = entry.category;
          title;
          plannedAmount;
          spentAmount;
        };
        budgetEntries.add(id, updatedEntry);
      };
    };
  };

  public shared ({ caller }) func deleteBudgetEntry(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete budget entries");
    };
    if (not budgetEntries.containsKey(id)) {
      Runtime.trap("BudgetEntry not found");
    };
    budgetEntries.remove(id);
  };
};
