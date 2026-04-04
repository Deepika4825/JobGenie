import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ResumeProvider } from './context/ResumeContext';
import { ProfileProvider } from './context/ProfileContext';
import Layout from './components/Layout';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Analyze from './pages/Analyze';
import Jobs from './pages/Jobs';
import Profile from './pages/Profile';
import ProfileSetup from './pages/ProfileSetup';

function isLoggedIn() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return !!(user && user.email);
  } catch {
    localStorage.removeItem('user');
    return false;
  }
}

function isProfileComplete() {
  try {
    const p = JSON.parse(localStorage.getItem('jg_profile') || 'null');
    return !!(p && p.name && p.name.trim());
  } catch { return false; }
}

function PublicRoute({ children }) {
  return isLoggedIn() ? <Navigate to="/analyze" replace /> : children;
}

function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ProfileProvider>
        <ResumeProvider>
          <Routes>
            <Route path="/"       element={<PublicRoute><Welcome /></PublicRoute>} />
            <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

            <Route element={<Layout />}>
              <Route path="/analyze" element={<PrivateRoute><Analyze /></PrivateRoute>} />
              <Route path="/jobs"    element={<PrivateRoute><Jobs /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/setup"   element={<PrivateRoute><ProfileSetup /></PrivateRoute>} />
              <Route path="/dashboard" element={<Navigate to="/analyze" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ResumeProvider>
      </ProfileProvider>
    </BrowserRouter>
  );
}
