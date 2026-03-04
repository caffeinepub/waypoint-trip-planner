# Trip Memory & Planner App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Private app with login/authorization (single user, personal data)
- Trip management: create, rename, delete trips
- Hierarchical folder structure: Trip > Folders > Subfolders (all custom-named, 3 levels deep)
- Media uploads (photos, videos) into any folder or subfolder
- Trip planner per trip with the following sections:
  - Packing checklist (add/check/remove items)
  - Places to visit checklist (add/check/remove items)
  - Things to do checklist (add/check/remove items)
  - Itinerary (day-by-day entries with events per day)
  - Budget tracker (categories: flights, hotels, food, activities; each with planned vs. spent amounts)
  - Notes (freeform text per trip)

### Modify
None.

### Remove
None.

## Implementation Plan

**Backend (Motoko)**
- Authorization component for private access
- Blob storage component for media files
- Data types: Trip, Folder, Subfolder, MediaItem, ChecklistItem, ItineraryDay, ItineraryEvent, BudgetCategory, BudgetEntry
- CRUD for trips
- CRUD for folders (linked to a trip)
- CRUD for subfolders (linked to a folder)
- CRUD for media items (linked to folder or subfolder, stored via blob storage)
- CRUD for checklist items per trip (type: packing | places | todos)
- CRUD for itinerary days and events per trip
- CRUD for budget entries per trip (by category)
- CRUD for trip notes (text field on trip)

**Frontend**
- Login screen (authorization component)
- Trips dashboard: list all trips, create/rename/delete trip
- Trip detail view with two tabs: "Memories" and "Plan"
  - Memories tab: folder/subfolder browser, media upload, media gallery grid
  - Plan tab: sections for Packing, Places, Things To Do, Itinerary, Budget, Notes
- Folder browser: create/rename/delete folders and subfolders inline
- Media viewer: lightbox for photos/videos
- Checklist UI: add items, toggle checked, delete items
- Itinerary UI: add days, add events per day, reorder/delete
- Budget UI: per-category rows with planned and spent inputs, total summary
- Notes: textarea that auto-saves
