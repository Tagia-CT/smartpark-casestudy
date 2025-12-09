import React, { useState } from 'react';

const LotForm = ({ onSubmit, onCancel, initialData = {} }) => {
    // State akan menyimpan data yang diisi user
    const [name, setName] = useState(initialData.name || '');
    const [capacity, setCapacity] = useState(initialData.total_capacity || '');
    const [prefix, setPrefix] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Mengecek apakah form ini sedang mode Edit
    const isEditing = !!initialData.id;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ id: initialData.id, name, capacity: parseInt(capacity), setIsLoading });
    };

    return (
        <form onSubmit={handleSubmit} className="form-container" style={{ maxWidth: '450px', margin: '20px auto' }}>
            <h2 className="text-center">{isEditing ? 'Edit Lot' : 'Tambah Lot Baru'}</h2>
            
            <div style={{ marginBottom: '10px' }}>
                <label>Nama Gedung / Lokasi:</label>
                <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Contoh: Mall Grand Indonesia"
                    required 
                />
            </div>
            
            {!isEditing && (
                <>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Awalan Slot (Prefix):</label>
                        <input 
                            type="text" 
                            value={prefix} 
                            onChange={(e) => setPrefix(e.target.value)} 
                            placeholder="Contoh: A atau L1 (Opsional)"
                        />
                        <small style={{color: '#666', fontSize: '0.8em'}}>
                            Jika diisi "A-", hasil slot: A-1, A-2, A-3...
                        </small>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <label>Kapasitas Total:</label>
                        <input 
                            type="number" 
                            value={capacity} 
                            onChange={(e) => setCapacity(e.target.value)} 
                            required 
                            min="1"
                        />
                    </div>
                </>
            )}

            {isEditing && (
                <div style={{ marginBottom: '10px' }}>
                    <label>Kapasitas Total:</label>
                    <input type="text" value={initialData.total_capacity} disabled style={{backgroundColor: '#eee'}} />
                    <small style={{color: '#7f8c8d'}}>Kapasitas & Prefix tidak bisa diubah setelah dibuat.</small>
                </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" disabled={isLoading} style={{ flex: 1 }}>
                    {isLoading ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Buat Lot')}
                </button>
                <button type="button" onClick={onCancel} className="action-button delete" style={{ flex: 1 }}>
                    Batal
                </button>
            </div>
        </form>
    );
};

export default LotForm;