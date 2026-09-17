import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role === 'UNASSIGNED' && location.pathname !== '/complete-profile') {
        return <Navigate to="/complete-profile" replace />;
    }

    if (user?.role !== 'UNASSIGNED' && location.pathname === '/complete-profile') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
