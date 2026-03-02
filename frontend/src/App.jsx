import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

import LandingPage        from './pages/LandingPage';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import EmployerDashboard  from './pages/EmployerDashboard';
import AdminDashboard     from './pages/AdminDashboard';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar />
                <Routes>
                    {/* Public */}
                    <Route path="/"         element={<LandingPage />} />
                    <Route path="/login"    element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* JobSeeker */}
                    <Route path="/jobseeker/dashboard" element={
                        <PrivateRoute roles={['jobseeker']}>
                            <JobSeekerDashboard />
                        </PrivateRoute>
                    } />

                    {/* Employer */}
                    <Route path="/employer/dashboard" element={
                        <PrivateRoute roles={['employer']}>
                            <EmployerDashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/employer/search" element={
                        <PrivateRoute roles={['employer']}>
                            <EmployerDashboard />
                        </PrivateRoute>
                    } />

                    {/* Admin */}
                    <Route path="/admin/dashboard" element={
                        <PrivateRoute roles={['admin']}>
                            <AdminDashboard />
                        </PrivateRoute>
                    } />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
