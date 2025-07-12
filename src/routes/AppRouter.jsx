import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

// UI that lives in every view 
import Navbar from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import Loading from "../utils/Loading";
import GroupSettings from "../components/profiles/group/group-settings/GroupSettings";

// 🔥  Split‑per‑route 
const LandingPage          = lazy(() => import("../pages/LandingPage"));
const Explore              = lazy(() => import("../pages/Explore"));
const Login                = lazy(() => import("../components/auth/Login"));
const SignUp               = lazy(() => import("../components/auth/SignUp"));
const SignUpSuccess        = lazy(() => import("../pages/SignUpSuccess"));
const TermsPage            = lazy(() => import("../components/ui/TermsPage"));
const ForgotPasswordForm   = lazy(() => import("../components/auth/ForgotPasswordForm"));
const ResetPasswordForm    = lazy(() => import("../components/auth/ResetPasswordForm"));

// Protected routes 
const Settings             = lazy(() => import("../pages/Settings"));
const DiscoverMatches      = lazy(() => import("../pages/DiscoverMatches"));
const MediaSection         = lazy(() => import("../components/music/MediaSection"));
const MediaSettings        = lazy(() => import("../components/music/MediaSettings"));
const AdsPage              = lazy(() => import("../components/social/ads/AdsPage"));
const AdDetailsPage        = lazy(() => import("../components/social/ads/AdDetailsPage"));
const AdCreateEditPage     = lazy(() => import("../components/social/ads/AdCreateEditPage"));
const PostForm             = lazy(() => import("../components/social/PostForm"));
const GroupForm            = lazy(() => import("../components/profiles/group/GroupForm"));
const ProfileGroup         = lazy(() => import("../pages/ProfileGroup"));
const ChatPage             = lazy(() => import("../components/social/chat/ChatPage"));
const AccountConfirmed     = lazy(() => import("../components/auth/AccountConfirmed"));
const Profile              = lazy(() => import("../pages/Profile"));
const Hashtag              = lazy(() => import("../pages/Hashtag"));

// Loading component to show while routes are being loaded
function PageLoader() {
  return (
    <Loading />
  );
}

export default function AppRouter() {
  return (
    <Router>
      <Navbar />

      <main className="flex-grow p-4">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/*  Public Routes */}
            <Route path="/"                 element={<LandingPage />} />
            <Route path="/explore/*"        element={<Explore />} />
            <Route path="/login"            element={<Login />} />
            <Route path="/signup"           element={<SignUp />} />
            <Route path="/signup-success"   element={<SignUpSuccess />} />
            <Route path="/ads"              element={<AdsPage />} />
            <Route path="/ads/:id"          element={<AdDetailsPage />} />
            <Route path="/terms"            element={<TermsPage />} />
            <Route path="/forgot-password"  element={<ForgotPasswordForm />} />
            <Route path="/reset-password"   element={<ResetPasswordForm />} />
            <Route path="/hashtag/:hashtag" element={<Hashtag />} />

            {/*  Protected Routes */}
            <Route path="/group/:groupId/settings/*" element={<ProtectedRoute><GroupSettings /></ProtectedRoute>} />
            <Route path="/settings/*"                element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/matches"                   element={<ProtectedRoute><DiscoverMatches /></ProtectedRoute>} />
            <Route path="/media/create"              element={<ProtectedRoute><MediaSettings /></ProtectedRoute>} />
            <Route path="/media/edit/:id"            element={<ProtectedRoute><MediaSettings /></ProtectedRoute>} />
            <Route path="/media/:id"                 element={<ProtectedRoute><MediaSection /></ProtectedRoute>} />
            <Route path="/ads/edit/:id"              element={<ProtectedRoute><AdCreateEditPage /></ProtectedRoute>} />
            <Route path="/ads/new"                   element={<ProtectedRoute><AdCreateEditPage /></ProtectedRoute>} />
            <Route path="/edit-post/:postId"         element={<ProtectedRoute><PostForm /></ProtectedRoute>} />
            <Route path="/create-post"               element={<ProtectedRoute><PostForm /></ProtectedRoute>} />
            <Route path="/group/:groupId/*"          element={<ProtectedRoute><ProfileGroup /></ProtectedRoute>} />
            <Route path="/create-profile-group"      element={<ProtectedRoute><GroupForm /></ProtectedRoute>} />
            <Route path="/account-confirmed"         element={<ProtectedRoute><AccountConfirmed /></ProtectedRoute>} />
            <Route path="/chat/"                     element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/chat/:conversationId"      element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/profile/:identifier/*"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </Router>
  );
}
