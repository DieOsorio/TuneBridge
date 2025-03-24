import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Explore from "../pages/Explore";
import Login from "../components/auth/Login";
import SignUp from "../components/auth/SignUp";
import Profile from "../pages/Profile";
import Navbar from "../components/ui/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";
import Footer from "../components/ui/Footer";
import SignUpSuccess from "../pages/SignUpSuccess";
import EditProfile from "../components/user/EditProfile";
import RedirectAfterLogin from "../utilis/RedirectAfterLogin";
import AccountConfirmed from "../components/auth/AccountConfirmed";

const AppRouter = () => {
  return (
    <Router>
      <Navbar />
      <main className="flex-grow p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signup-success" element={<SignUpSuccess />} />
          <Route path="/edit-profile/:id" element={<EditProfile />} />
          <Route path="/redirect" element={<RedirectAfterLogin />} />
          <Route path="/account-confirmed" element={<AccountConfirmed />} />
          {/* Rutas protegidas */}
          <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default AppRouter;
