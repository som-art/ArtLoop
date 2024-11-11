import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPannel";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {
  const { data: authUser, isLoading } = useQuery({
    // Unique key to identify the query and refer to it later for caching and re-fetching
    queryKey: ["authUser"],

    // Function to fetch user data
    queryFn: async () => {
      try {
        // Sending a GET request to fetch the authenticated user's information
        const res = await fetch("/api/auth/me", {
          method: "GET", // If method is GET no need to Explicitly specify the method
        });

        const data = await res.json();
        if (data.error) return null;
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        // Log and return the authenticated user data
        console.log("authUser is here:", data);
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },

    // Disables automatic retries on failure
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex mx-auto max-w-full">
      {authUser && <Sidebar />}
      {/* Main Content with Background Image and Overlay */}
      <div className="flex-1 relative bg-custom-pattern bg-cover bg-center overflow-y-auto">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black opacity-85 z-0"></div>

        {/* Routes and Content */}
        <div className="relative z-10 p-4">
          <Routes>
            <Route
              path="/"
              element={authUser ? <HomePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/login"
              element={!authUser ? <LoginPage /> : <Navigate to="/" />}
            />
            <Route
              path="/signup"
              element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
            />
            <Route
              path="/notifications"
              element={
                authUser ? <NotificationPage /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/profile/:userName"
              element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
            />
          </Routes>
        </div>
      </div>

      {authUser && <RightPanel />}
      <Toaster />
    </div>
  );
}

export default App;
