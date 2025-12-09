import React, { useContext, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import AuthForm from '../../components/forms/AuthForm';
import { AuthContext } from '../../context/AuthContext';

const LoginPage = () => {
    const { login, isLoggedIn, user } = useContext(AuthContext);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Pengaman: Jika sudah login, alihkan ke dashboard yang sesuai
    if (isLoggedIn) {
        if (user && user.role === 'ADMIN') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        return <Navigate to="/lots" replace />;
    }

    const handleLogin = async (formData) => {
        setIsLoading(true);
        setError(null);
        try {
            await login(formData.email, formData.password);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container">
            {error && <p className="text-red text-center">Error: {error}</p>}
            <AuthForm
                type="login"
                onSubmit={handleLogin}
                isLoading={isLoading}
            />
            <p className="text-center">
                Belum punya akun? <Link to="/register">Daftar di sini</Link>
            </p>
        </div>
    );
};

export default LoginPage;