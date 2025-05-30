import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/login/login";
import Signup from "./pages/signup/Signup";
import Dashboard from "./pages/dashboard/dashboard";
import Activities from "./pages/activities/activities";
import TopHost from "./pages/tophost/tophost.jsx";
import Profile from "./pages/profile/profile";
import HostProfile from "./pages/tophost/hostProfile";
import StudyGroups from "./pages/StudyGroups/StudyGroups";
import GroupChatPage from "./pages/group-chat/GroupChat";
import AdminRoutes from "./routes/AdminRoutes";
import "./index.css";

// Combined component for StudyGroups and GroupChatPage
const GroupChatLayout = () => {
  const { groupId } = useParams(); // Correct way to extract groupId from URL

  return (
    <div className="flex h-full">
      {/* Left side: List of Groups */}
      <div className="w-1/3 bg-white border-r">
        <StudyGroups />
      </div>

      {/* Right side: Group Chat */}
      <div className="flex-1 p-4 bg-gray-100">
        {groupId ? (
          <GroupChatPage groupId={groupId} />
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500 text-lg">Join a group to see chats</p>
          </div>
        )}
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes - Wrapped in Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/activities"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Activities />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/tophost"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TopHost />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/tophost/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <HostProfile />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/group-chat"
              element={
                <ProtectedRoute>
                  <Layout>
                    <StudyGroups />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route path="/admin/*" element={<AdminRoutes />} />

            <Route
              path="/group-chat/:groupId" // Use a dynamic path with groupId
              element={
                <ProtectedRoute>
                  <Layout>
                    <GroupChatLayout />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Redirect any unknown routes to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
