import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Explore from "../pages/Explore";
import Login from "../components/auth/Login";
import SignUp from "../components/auth/SignUp";
import Profile from "../pages/Profile";
import Navbar from "../components/ui/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/ui/Footer";
import SignUpSuccess from "../pages/SignUpSuccess";
import EditProfile from "../components/user/EditProfile";
import AccountConfirmed from "../components/auth/AccountConfirmed";
import LandingPage from "../pages/LandingPage";
import Followers from "../components/profiles/Followers";

const AppRouter = () => {
  return (
    <Router>
      <Navbar />
      <main className="flex-grow p-4">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signup-success" element={<SignUpSuccess />} />
          {/* <Route path="/followers" element={<Followers />} /> */}
          {/* Rutas protegidas */}
          {/* <Route path="/followers" element={<ProtectedRoute><Followers /></ProtectedRoute>} /> */}
          <Route path="/account-confirmed" element={<ProtectedRoute><AccountConfirmed /></ProtectedRoute>} />
          <Route path="/edit-profile/:id" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/profile/:identifier" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default AppRouter;
