import React, { useContext, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import AuthForm from '../../components/forms/AuthForm';
import { AuthContext } from '../../context/AuthContext';

const RegisterPage = () => {
    const { register, isLoggedIn } = useContext(AuthContext);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    if (isLoggedIn) {
        return <Navigate to="/lots" replace />;
    }

    const handleRegister = async (formData) => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const message = await register(
                formData.username,
                formData.email,
                formData.password
            );
            setSuccess(message);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container">
            {error && <p className="text-red text-center">Error: {error}</p>}
            {success && <p className="text-green text-center text-bold">{success} Silakan <Link to="/login">Masuk</Link>.</p>}

            <AuthForm
                type="register"
                onSubmit={handleRegister}
                isLoading={isLoading}
            />
            <p className="text-center">
                Sudah punya akun? <Link to="/login">Masuk di sini</Link>
            </p>
        </div>
    );
};

export default RegisterPage;