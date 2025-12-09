import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import socket from '../../services/socket';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [stats, setStats] = useState({
        totalLots: 0,
        totalCapacity: 0,
        totalAvailable: 0,
        totalOccupied: 0,
        totalReserved: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    const handleLogout = () => {
        if (window.confirm('Apakah Anda yakin ingin keluar?')) {
            logout();
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/lots');
            const lots = response.data;
            
            // Hitung Statistik Global
            const totalLots = lots.length;
            const totalCapacity = lots.reduce((acc, lot) => acc + lot.total_capacity, 0);
            const totalAvailable = lots.reduce((acc, lot) => acc + lot.available_count, 0);
            const totalOccupied = lots.reduce((acc, lot) => acc + lot.occupied_count, 0);
            const totalReserved = lots.reduce((acc, lot) => acc + lot.reserved_count, 0);

            setStats({ totalLots, totalCapacity, totalAvailable, totalOccupied, totalReserved });
        } catch (error) {
            console.error("Gagal memuat statistik");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        // Real-time update
        socket.on('spotUpdate', () => {
            fetchStats();
        });
        return () => {
            socket.off('spotUpdate');
        };
    }, []);

    // Hitung Okupansi
    const occupancyRate = stats.totalCapacity > 0 
        ? Math.round(((stats.totalOccupied + stats.totalReserved) / stats.totalCapacity) * 100) 
        : 0;

    let progressColor = '#27ae60'; // Hijau
    if (occupancyRate > 50) progressColor = '#f39c12'; 
    if (occupancyRate > 80) progressColor = '#c0392b'; 

    return (
        <div className="admin-page">
            <header className="header-admin">
                <h1 style={{ margin: 0 }}>🛡️ Admin Dashboard</h1>
                <div className="user-info">
                    <span style={{ marginRight: '15px' }}>
                        Halo, <strong>{user?.username}</strong>
                    </span>
                    <button onClick={handleLogout} className="logout-button">Logout</button>
                </div>
            </header>

            <main className="page-container">
                <h2>Monitor Sistem Real-time</h2>

                {/* KARTU STATISTIK */}
                <div className="card-container" style={{ flexWrap: 'nowrap', gap: '15px', marginBottom: '30px' }}>
                    
                    <div className="stat-card spot-available">
                        <h3 style={{ fontSize: '1.8em', margin: '0 0 10px 0' }}>Tersedia</h3>
                        <div className="stat-number" style={{ fontSize: '3.5em', fontWeight: '800' }}>{stats.totalAvailable}</div>
                        <small style={{ fontSize: '1.2em' }}>Slot Kosong</small>
                    </div>
                    <div className="stat-card spot-reserved">
                        <h3 style={{ fontSize: '1.8em', margin: '0 0 10px 0' }}>Booking</h3>
                        <div className="stat-number" style={{ fontSize: '3.5em', fontWeight: '800' }}>{stats.totalReserved}</div>
                        <small style={{ fontSize: '1.2em' }}>Akan Datang</small>
                    </div>
                    <div className="stat-card spot-occupied">
                        <h3 style={{ fontSize: '1.8em', margin: '0 0 10px 0' }}>Terisi</h3>
                        <div className="stat-number" style={{ fontSize: '3.5em', fontWeight: '800' }}>{stats.totalOccupied}</div>
                        <small style={{ fontSize: '1.2em' }}>Mobil Parkir</small>
                    </div>
                     <div className="stat-card bg-blue">
                        <h3 style={{ fontSize: '1.8em', margin: '0 0 10px 0' }}>Total Kapasitas</h3>
                        <div className="stat-number" style={{ fontSize: '3.5em', fontWeight: '800' }}>{stats.totalCapacity}</div>
                        <small style={{ fontSize: '1.2em' }}>Dari {stats.totalLots} Gedung</small>
                    </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="card" style={{ padding: '20px', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h3>Tingkat Kepadatan Parkir</h3>
                        <h3>{occupancyRate}%</h3>
                    </div>
                    <div className="progress-container">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${occupancyRate}%`, backgroundColor: progressColor }}
                        ></div>
                    </div>
                    <p style={{ marginTop: '10px', color: '#666', fontSize: '0.9em' }}>
                        Menggabungkan jumlah mobil fisik dan booking aktif.
                    </p>
                </div>

                {/* MENU */}
                <h2>Menu Utama</h2>
                <div className="card-container">
                    <Link to="/admin/lots" className="card dashboard-card" style={{ borderLeft: '5px solid #2980b9', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3>Kelola & Simulasi Parkir</h3>
                                <p style={{ marginTop: '5px', color: '#666' }}>
                                    Tambah gedung, edit slot, dan kontrol sensor IoT.
                                </p>
                            </div>
                            <span style={{ fontSize: '2em' }}>&rarr;</span>
                        </div>
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;