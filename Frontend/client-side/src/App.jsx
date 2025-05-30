import React from "react";
import "./assets/global.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Signup from "./pages/signup/Signup";
import Login from "./pages/login/login";
import Footer from "./pages/components/footer/footer";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import StudyGroups from "./pages/StudyGroups/StudyGroups";
import GroupChatPage from "./pages/group-chat/GroupChatPage";
import AdminRoutes from "./routes/AdminRoutes";


// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return <Layout>{children}</Layout>;
};

// Public Route wrapper component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

// Combined component for StudyGroups and GroupChatPage
const GroupChatLayout = () => (
  <div className="flex h-screen">
    <div className="w-1/3 border-r">
      <StudyGroups />
    </div>
    <div className="w-2/3">
      <Routes>
        <Route path="/group-chat/:groupId" element={<GroupChatPage />} />
        <Route path="/" element={<div>Select a group to start chatting</div>} />
      </Routes>
    </div>
  </div>
);

const App = () => {
  const GOOGLE_CLIENT_ID =
    "1074394630882-qvdnqvr0aqbg6sj5l5aqj3h0c0dqt0kn.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/group-chat/*"
              element={
                <ProtectedRoute>
                  <GroupChatLayout />
                </ProtectedRoute>
              }
            />

            <Route path="/admin/*" element={<AdminRoutes />} />

            {/* Catch all - Redirect to login */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
          <Footer />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;
