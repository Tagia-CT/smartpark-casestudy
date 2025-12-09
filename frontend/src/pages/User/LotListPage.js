import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import socket from '../../services/socket'; 
import { AuthContext } from '../../context/AuthContext';

const LotListPage = () => {
    // Ambil user dan fungsi logout dari context
    const { isLoggedIn, user, logout } = useContext(AuthContext);
    const [lots, setLots] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLots = async () => {
        try {
            const response = await api.get('/lots');
            setLots(response.data);
        } catch (error) {
            console.error("Gagal memuat data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLots();
    }, []);

    useEffect(() => {
        socket.on('spotUpdate', () => {
            fetchLots();
        });
        return () => {
            socket.off('spotUpdate');
        };
    }, []);

    // Fungsi Logout Helper
    const handleLogout = () => {
        if (window.confirm('Apakah Anda yakin ingin keluar?')) {
            logout();
        }
    };

    return (
        // Wrapper utama Full Height
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            
            {/* HEADER STYLE ADMIN (Konsisten) */}
            <header className="header-admin">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h1 style={{ margin: 0, fontSize: '1.5em' }}>SmartPark Info</h1>
                    <small style={{ color: '#ecf0f1', marginTop: '5px' }}>
                        Pantau ketersediaan parkir secara Real-time
                    </small>
                </div>
                
                <div className="user-info">
                    {isLoggedIn ? (
                        <>
                            <span style={{ marginRight: '15px', color: 'white' }}>
                                Halo, <strong>{user?.username}</strong>
                            </span>
                            <button onClick={handleLogout} className="logout-button">
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login">
                            <button style={{ backgroundColor: '#3498db' }}>Login Petugas</button>
                        </Link>
                    )}
                </div>
            </header>

            {/* KONTEN UTAMA */}
            <main className="page-container">
                
                <h2 style={{ marginTop: '30px', marginBottom: '20px' }}>Pilih Lokasi Parkir</h2>

                {isLoading ? (
                    <p className="text-center mt-50">Memuat data lokasi...</p>
                ) : (
                    <div className="card-container" style={{ justifyContent: 'center' }}>
                        {lots.map((lot) => (
                            <Link to={`/lots/${lot.id}`} key={lot.id} className="card dashboard-card">
                                <h3>{lot.name}</h3>

                                <div style={{ marginTop: '15px' }}>
                                    <p>Kapasitas Total: <strong>{lot.total_capacity}</strong></p>

                                    <p className={lot.available_slots > 0 ? "text-green text-bold" : "text-red text-bold"}>
                                        Tersedia: {lot.available_slots} Slot
                                    </p>
                                </div>

                                <button style={{ width: '100%', marginTop: '15px' }}>
                                    Lihat Detail Lokasi
                                </button>
                            </Link>
                        ))}

                        {lots.length === 0 && (
                            <p className="text-center mt-50">Belum ada lokasi parkir terdaftar.</p>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default LotListPage;