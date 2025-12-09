import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import socket from '../../services/socket';
import { AuthContext } from '../../context/AuthContext';

const LotDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    // Tambahkan 'logout' dari context
    const { isLoggedIn, user, logout } = useContext(AuthContext);
    const [lot, setLot] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(Date.now());

    // Fetch Data
    useEffect(() => {
        const fetchLotData = async () => {
            try {
                const response = await api.get(`/lots/${id}`);
                setLot(response.data);
            } catch (error) {
                console.error("Gagal memuat data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLotData();
    }, [id]);

    // Real-time Listener
    useEffect(() => {
        socket.on('spotUpdate', (updatedSpot) => {
            setLot((prevLot) => {
                if (!prevLot) return null;
                const newSpots = prevLot.spots.map(spot => 
                    spot.id === updatedSpot.id 
                        ? { ...spot, status: updatedSpot.status, user_id: updatedSpot.user_id, booking_time: updatedSpot.booking_time } 
                        : spot
                );
                return { ...prevLot, spots: newSpots };
            });
        });
        return () => { socket.off('spotUpdate'); };
    }, []);

    // Timer Detak Jantung
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fungsi Hitung Sisa Waktu Booking
    const getRemainingTime = (bookingTimeStr) => {
        if (!bookingTimeStr) return null;
        const bookingTime = new Date(bookingTimeStr).getTime();
        const duration = 1 * 60 * 1000; 
        const expiryTime = bookingTime + duration;
        const diff = expiryTime - currentTime;
        
        if (diff <= 0) return "00m 00s"; 
        
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return `${minutes}m ${seconds}s`;
    };

    // Fungsi Booking Spot
    const handleSpotClick = async (spot) => {
        if (!isLoggedIn) {
            alert("Silakan Login terlebih dahulu.");
            return navigate('/login');
        }

        if (spot.user_id === user.id && spot.status === 'RESERVED') {
            alert("Anda sudah membooking slot ini. Gunakan tombol 'Batalkan' di bawah jika ingin membatalkan.");
            return;
        }

        if (spot.status !== 'AVAILABLE') {
            alert("Slot tidak tersedia.");
            return;
        }

        if (window.confirm(`Booking slot ${spot.spot_number}?`)) {
            try {
                await api.post('/lots/book', { spotId: spot.id });
            } catch (error) {
                alert(error.response?.data?.message || "Booking Gagal");
            }
        }
    };

    // Fungsi Batalkan Booking
    const handleCancel = async (spotId) => {
        if (window.confirm("Apakah Anda yakin ingin membatalkan booking ini? Slot akan dibuka untuk orang lain.")) {
            try {
                await api.post('/lots/cancel', { spotId });
            } catch (error) {
                alert("Gagal membatalkan booking.");
            }
        }
    };

    // Fungsi Logout Helper
    const handleLogout = () => {
        if (window.confirm('Apakah Anda yakin ingin keluar?')) {
            logout();
        }
    };

    if (isLoading) return <div className="text-center" style={{ marginTop: '50px' }}>Memuat Denah...</div>;
    if (!lot) return <div className="text-center">Data tidak ditemukan</div>;

    const availableCount = lot.spots.filter(s => s.status === 'AVAILABLE').length;

    // Cek apakah user punya booking aktif
    const myBooking = isLoggedIn && user 
        ? lot.spots.find(s => s.user_id === user.id && s.status === 'RESERVED')
        : null;

    return (
        // Wrapper utama agar Header bisa Full Width (mirip layout Admin)
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            
            <header className="header-admin">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h1 style={{ margin: 0, fontSize: '1.5em' }}>{lot.name}</h1>
                    <small style={{ color: '#ecf0f1', marginTop: '5px' }}>
                        Tersedia: <strong>{availableCount}</strong> / {lot.total_capacity} Slot
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
                            <button style={{ backgroundColor: '#3498db' }}>Login</button>
                        </Link>
                    )}
                </div>
            </header>

            {/* KONTEN UTAMA */}
            <main className={`page-container ${myBooking ? 'pb-100' : ''}`}>
                
                {/* Tombol Kembali (Dipindah ke sini agar konsisten dengan Admin) */}
                <div style={{ marginBottom: '20px', marginTop: '20px' }}>
                    <Link to="/lots">
                        <button style={{ backgroundColor: '#7f8c8d' }}>&larr; Kembali ke Daftar</button>
                    </Link>
                </div>

                {/* Grid Area */}
                <div className="card">
                    <h3 className="text-center">Denah Parkir</h3>
                    
                    <div className="parking-grid">
                        {lot.spots.map((spot) => {
                            const isMine = myBooking && myBooking.id === spot.id;
                            let statusClass = '';
                            let statusLabel = '';

                            if (spot.status === 'AVAILABLE') {
                                statusClass = 'spot-available';
                                statusLabel = 'KOSONG';
                            } else if (spot.status === 'OCCUPIED') {
                                statusClass = 'spot-occupied';
                                statusLabel = 'TERISI';
                            } else if (spot.status === 'RESERVED') {
                                statusClass = 'spot-reserved';
                                statusLabel = isMine ? 'Booked' : 'BOOKED';
                            }

                            return (
                                <div
                                    key={spot.id}
                                    onClick={() => handleSpotClick(spot)}
                                    className={`parking-spot ${statusClass}`}
                                    style={{ 
                                        cursor: spot.status === 'AVAILABLE' ? 'pointer' : 'not-allowed',
                                        border: isMine ? '4px solid #2980b9' : 'none',
                                        transform: isMine ? 'scale(1.05)' : 'none',
                                        boxShadow: isMine ? '0 0 15px rgba(41, 128, 185, 0.5)' : ''
                                    }} 
                                >
                                    <div style={{ fontSize: '1.2em' }}>{spot.spot_number}</div>
                                    <div style={{ fontSize: '0.8em', marginTop: '5px', fontWeight: 'bold' }}>
                                        {statusLabel}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
                         <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="spot-available" style={{ width: '20px', height: '20px', marginRight: '8px', borderRadius: '4px' }}></div>
                            <span>Kosong</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="spot-occupied" style={{ width: '20px', height: '20px', marginRight: '8px', borderRadius: '4px' }}></div>
                            <span>Terisi</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="spot-reserved" style={{ width: '20px', height: '20px', marginRight: '8px', borderRadius: '4px' }}></div>
                            <span>Booked</span>
                        </div>
                    </div>
                </div>

                {/* --- PANEL STATUS KHUSUS + TOMBOL BATAL --- */}
                {myBooking && (
                    <div className="booking-status-bar">
                        <div className="booking-info">
                            <h4>Booking Aktif: Slot {myBooking.spot_number}</h4>
                            <small style={{color: '#666'}}>Segera tempati slot sebelum waktu habis.</small>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="booking-timer">
                                『{getRemainingTime(myBooking.booking_time)}』
                            </div>
                            
                            {/* TOMBOL BATALKAN */}
                            <button 
                                onClick={() => handleCancel(myBooking.id)} 
                                className="btn-cancel"
                            >
                                Batalkan
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default LotDetailPage;