import React, { useState } from 'react';

const AuthForm = ({ type, onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    const isLogin = type === 'login';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="form-container" style={{ maxWidth: '400px' }}>
            <h2 className="text-center">{isLogin ? 'Masuk ke SmartPark' : 'Daftar Akun Baru'}</h2>

            {!isLogin && (
                <div style={{ marginBottom: '10px' }}>
                    <label>Username:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
            )}

            <div style={{ marginBottom: '10px' }}>
                <label>Email:</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>

            <div style={{ marginBottom: '10px' }}>
                <label>Password:</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
            </div>

            <button type="submit" disabled={isLoading} style={{ width: '100%', marginTop: '10px' }}>
                {isLoading ? 'Memproses...' : (isLogin ? 'Masuk' : 'Daftar')}
            </button>
        </form>
    );
};

export default AuthForm;