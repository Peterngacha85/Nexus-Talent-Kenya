import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, roles }) => {
    const { user, isLoggedIn } = useAuth();

    if (!isLoggedIn) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
    return children;
};

export default PrivateRoute;
