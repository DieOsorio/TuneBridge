import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Explore from "../pages/Explore";
import Login from "../components/auth/Login";
import SignUp from "../components/auth/SignUp";
import Profile from "../pages/Profile";
import Navbar from "../components/ui/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/ui/Footer";
import SignUpSuccess from "../pages/SignUpSuccess";
import AccountConfirmed from "../components/auth/AccountConfirmed";
import LandingPage from "../pages/LandingPage";
import ChatPage from "../components/social/chat/ChatPage";
import ProfileGroup from "../pages/ProfileGroup";
import Hashtag from "../pages/Hashtag";
import AdsPage from "../components/social/ads/AdsPage";
import AdDetailsPage from "../components/social/ads/AdDetailsPage";
import AdCreateEditPage from "../components/social/ads/AdCreateEditPage";
import MediaSection from "../components/music/MediaSection"
import MediaSettings from "../components/music/MediaSettings";
import TermsPage from "../components/ui/TermsPage"
import DiscoverMatches from "../pages/DiscoverMatches";
import PostForm from "../components/social/PostForm";
import GroupForm from "../components/profiles/group/GroupForm";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";
import ResetPasswordForm from "../components/auth/ResetPasswordForm";
import Settings from "../pages/Settings";

const AppRouter = () => {
    

  return (
    <Router>
      <Navbar />
      <main className="flex-grow p-4">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore/*" element={<Explore />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signup-success" element={<SignUpSuccess />} />
          <Route path="/ads" element={<AdsPage />} />
          <Route path="/ads/:id" element={<AdDetailsPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/reset-password"  element={<ResetPasswordForm />} />
          {/* <Route path="/followers" element={<Followers />} /> */}
          {/* Rutas protegidas */}
          {/* <Route path="/followers" element={<ProtectedRoute><Followers /></ProtectedRoute>} /> */}
          <Route path="/settings/*" element={<ProtectedRoute><Settings /></ProtectedRoute>} />          
          <Route path="/matches" element={<ProtectedRoute><DiscoverMatches  /></ProtectedRoute>} />
          <Route path="/media/create" element={<ProtectedRoute><MediaSettings  /></ProtectedRoute>} />
          <Route path="/media/edit/:id" element={<ProtectedRoute><MediaSettings  /></ProtectedRoute>} />
          <Route path="/media/:id" element={<ProtectedRoute><MediaSection  /></ProtectedRoute>} />
          <Route path="/ads/edit/:id" element={<ProtectedRoute><AdCreateEditPage  /></ProtectedRoute>} />
          <Route path="/ads/new" element={<ProtectedRoute><AdCreateEditPage /></ProtectedRoute>} />
          <Route path="/create-post" element={<ProtectedRoute><PostForm /></ProtectedRoute>} />
          <Route path="/group/:groupId" element={<ProtectedRoute><ProfileGroup /></ProtectedRoute>} />
          <Route path="/create-profile-group" element={<ProtectedRoute><GroupForm /></ProtectedRoute>} />
          <Route path="/account-confirmed" element={<ProtectedRoute><AccountConfirmed /></ProtectedRoute>} />          
          <Route path="/chat/" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/edit-post/:postId" element={<ProtectedRoute><PostForm /></ProtectedRoute>} />
          <Route path="/chat/:conversationId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/profile/:identifier/*" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/hashtag/:hashtag" element={<Hashtag />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default AppRouter;
