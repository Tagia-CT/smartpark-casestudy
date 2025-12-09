import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import LotForm from '../../components/forms/LotForm';
import { Link } from 'react-router-dom';

const LotManagementPage = () => {
    const { logout } = useContext(AuthContext);
    const [lots, setLots] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingLot, setEditingLot] = useState(null);
    const [apiError, setApiError] = useState(null);

    // [C] CREATE & [U] UPDATE Handlers
    const handleFormSubmit = async (formData) => {
        formData.setIsLoading(true);
        setApiError(null);
        try {
            if (formData.id) {
                await api.put(`/admin/lots/${formData.id}`, { name: formData.name });
                alert('Lot berhasil diperbarui!');
            } else {
                await api.post('/admin/lots', { name: formData.name, capacity: formData.capacity, prefix: formData.prefix });
                alert('Lot baru dan slot parkir berhasil dibuat!');
            }
            setEditingLot(null);
            fetchLots();
        } catch (err) {
            setApiError('Gagal menyimpan: ' + (err.response?.data?.message || 'Server error'));
        } finally {
            formData.setIsLoading(false);
        }
    };

    // [D] DELETE Handler
    const handleDeleteLot = async (lotId) => {
        if (!window.confirm(`Yakin ingin menghapus Lot ID ${lotId} secara permanen? Slot di dalamnya juga akan terhapus!`)) {
            return;
        }
        try {
            await api.delete(`/admin/lots/${lotId}`);
            alert('Lot berhasil dihapus!');
            fetchLots();
        } catch (err) {
            setApiError('Gagal menghapus Lot: ' + (err.response?.data?.message || 'Server error'));
        }
    };

    // [R] READ Handler
    const fetchLots = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get('/admin/lots');
            setLots(response.data);
        } catch (err) {
            setError('Gagal memuat data tempat parkir. Token mungkin kadaluarsa.');
            console.error(err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                logout();
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLots();
    }, []);

    // Tampilkan Modal (Form)
    if (editingLot !== null) {
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    {apiError && <p className="text-red">Error: {apiError}</p>}
                    <LotForm
                        onSubmit={handleFormSubmit}
                        onCancel={() => setEditingLot(null)}
                        initialData={editingLot}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <header className="header-admin">
                <h2>⚙️ Manajemen Tempat Parkir</h2>
                <button onClick={logout} className="logout-button">Logout</button>
            </header>

            <main className="page-container">
                {error && <p className="text-red">Error: {error}</p>}
                {apiError && <p className="text-red">Error API: {apiError}</p>}

                {/* --- TOMBOL KEMBALI KE DASHBOARD --- */}
                <div style={{ marginBottom: '20px' }}>
                    <Link to="/admin/dashboard">
                        <button style={{ backgroundColor: '#7f8c8d' }}>&larr; Kembali ke Dashboard</button>
                    </Link>
                </div>

                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={() => setEditingLot({})}>+ Tambah Lot Baru</button>
                    <button onClick={fetchLots}>Refresh Data</button>
                </div>

                {isLoading && <p>Memuat daftar tempat parkir...</p>}

                {!isLoading && lots.length === 0 && (
                    <p>Belum ada tempat parkir yang terdaftar.</p>
                )}

                {!isLoading && lots.length > 0 && (
                    <table className="lot-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nama Lot</th>
                                <th>Kapasitas Total</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lots.map((lot) => (
                                <tr key={lot.id}>
                                    <td>{lot.id}</td>
                                    <td>{lot.name}</td>
                                    <td>{lot.total_capacity}</td>
                                    <td>
                                        <Link to={`/admin/lots/${lot.id}`}>
                                            <button className="action-button detail">
                                                Detail
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => setEditingLot(lot)}
                                            className="action-button edit">
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteLot(lot.id)}
                                            className="action-button delete">
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </main>
        </div>
    );
};

export default LotManagementPage;