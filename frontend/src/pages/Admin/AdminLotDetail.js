import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import socket from '../../services/socket';
import { AuthContext } from '../../context/AuthContext';

const AdminLotDetail = () => {
    const { id } = useParams();
    const { user, logout } = useContext(AuthContext);
    const [lot, setLot] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLotData = async () => {
        try {
            const response = await api.get(`/lots/${id}`);
            setLot(response.data);
        } catch (error) {
            alert("Gagal memuat data parkir.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLotData();
    }, [id]);

    useEffect(() => {
        socket.on('spotUpdate', (updatedSpot) => {
            console.log("Admin: Sinyal Real-time diterima", updatedSpot);
            
            setLot((prevLot) => {
                if (!prevLot) return null;
                const newSpots = prevLot.spots.map(spot => 
                    spot.id === updatedSpot.id 
                        ? { ...spot, status: updatedSpot.status } 
                        : spot
                );
                return { ...prevLot, spots: newSpots };
            });
        });

        return () => { socket.off('spotUpdate'); };
    }, []);

    const handleSpotClick = async (spot) => {
        const newStatus = spot.status === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE';

        const updatedSpots = lot.spots.map(s =>
            s.id === spot.id ? { ...s, status: newStatus } : s
        );
        setLot({ ...lot, spots: updatedSpots });

        try {
            await api.put(`/admin/spots/${spot.id}`, { status: newStatus });
        } catch (error) {
            alert("Gagal update status sensor!");
            fetchLotData();
        }
    };

    const handleLogout = () => {
        if (window.confirm('Apakah Anda yakin ingin keluar?')) {
            logout();
        }
    };

    if (isLoading) return <div className="text-center" style={{ marginTop: '50px' }}>Memuat Sensor...</div>;
    if (!lot) return <div className="text-center">Data tidak ditemukan</div>;

return (
        <div className="admin-page">
            <header className="header-admin">
                <h1 style={{ margin: 0 }}>🛡️ Simulasi IoT: {lot.name}</h1>
                <div className="user-info">
                    <span style={{ marginRight: '15px' }}>
                        Halo, <strong>{user?.username}</strong> ({user?.role})
                    </span>
                    <button onClick={handleLogout} className="logout-button">Logout</button>
                </div>
            </header>

            <main className="page-container">
                <div style={{ marginBottom: '20px' }}>
                    <Link to="/admin/lots">
                        <button style={{ backgroundColor: '#7f8c8d' }}>&larr; Kembali ke Daftar</button>
                    </Link>
                </div>

                <div className="card">
                    <h3 className="text-center">Panel Kontrol Sensor (IoT Simulation)</h3>
                    <p className="text-center" style={{ marginBottom: '20px', color: '#666' }}>
                        Klik kotak untuk mengubah status (Simulasi Mobil Masuk/Keluar).
                    </p>

                    <div className="parking-grid">
                        {lot.spots.map((spot) => (
                            <div
                                key={spot.id}
                                onClick={() => handleSpotClick(spot)}
                                className={`parking-spot ${
                                    spot.status === 'AVAILABLE' ? 'spot-available' : 
                                    spot.status === 'OCCUPIED' ? 'spot-occupied' : 
                                    'spot-reserved'
                                }`}
                            >
                                <div style={{ fontSize: '1.2em' }}>{spot.spot_number}</div>
                                <div style={{ fontSize: '0.8em', marginTop: '5px' }}>
                                    {spot.status === 'AVAILABLE' ? 'KOSONG' : 
                                     spot.status === 'OCCUPIED' ? 'TERISI' : 
                                     'BOOKED'}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div style={{ marginTop: '20px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
                         <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="spot-available" style={{ width: '20px', height: '20px', marginRight: '8px', borderRadius: '4px' }}></div>
                            <span>Kosong (Klik untuk isi)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="spot-occupied" style={{ width: '20px', height: '20px', marginRight: '8px', borderRadius: '4px' }}></div>
                            <span>Terisi (Klik untuk kosongkan)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="spot-reserved" style={{ width: '20px', height: '20px', marginRight: '8px', borderRadius: '4px' }}></div>
                            <span>Booked (Klik untuk batalkan)</span>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default AdminLotDetail;