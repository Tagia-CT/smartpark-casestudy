import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import LotListPage from './pages/User/LotListPage';
import LotDetailPage from './pages/User/LotDetailPage';
import LotManagementPage from './pages/Admin/LotManagementPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminLotDetail from './pages/Admin/AdminLotDetail';

const ProtectedRoute = ({ children, role = 'USER' }) => {
    const { isLoggedIn, isAdmin } = useContext(AuthContext);

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    if (role === 'ADMIN' && !isAdmin) {
        return <Navigate to="/lots" replace />;
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Redirect ke Login jika mencoba akses root tanpa login */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* USER & ADMIN Routes (Hanya perlu Login) */}
                <Route path="/lots" element={<ProtectedRoute><LotListPage /></ProtectedRoute>} />
                <Route path="/lots/:id" element={<ProtectedRoute><LotDetailPage /></ProtectedRoute>} />

                {/* ADMIN Routes (Perlu Login + Role ADMIN) */}
                <Route path="/admin/dashboard" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/lots" element={<ProtectedRoute role="ADMIN"><LotManagementPage /></ProtectedRoute>} />
                <Route path="/admin/lots/:id" element={<ProtectedRoute role="ADMIN"><AdminLotDetail /></ProtectedRoute>} />

                {/* Jika ada rute yang tidak ditemukan */}
                <Route path="*" element={<h1>404 Not Found</h1>} />
            </Routes>
        </AuthProvider>
    );
}

export default App;