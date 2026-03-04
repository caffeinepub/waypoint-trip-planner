import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import ProfileSetupModal from "./components/ProfileSetupModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import LoginPage from "./pages/LoginPage";
import TripDetailPage from "./pages/TripDetailPage";
import TripsPage from "./pages/TripsPage";

export type AppRoute =
  | { page: "trips" }
  | { page: "trip"; tripId: string; tripName: string };

export default function App() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const [route, setRoute] = useState<AppRoute>({ page: "trips" });

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    setRoute({ page: "trips" });
  };

  const showProfileSetup =
    isAuthenticated &&
    !profileLoading &&
    profileFetched &&
    userProfile === null;

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  return (
    <>
      {showProfileSetup && <ProfileSetupModal />}
      {route.page === "trips" && (
        <TripsPage
          userName={userProfile?.name}
          onNavigateToTrip={(tripId, tripName) =>
            setRoute({ page: "trip", tripId, tripName })
          }
          onLogout={handleLogout}
        />
      )}
      {route.page === "trip" && (
        <TripDetailPage
          tripId={route.tripId}
          tripName={route.tripName}
          onBack={() => setRoute({ page: "trips" })}
          onLogout={handleLogout}
          userName={userProfile?.name}
        />
      )}
      <Toaster />
    </>
  );
}
