// components/Marketplace.jsx
import React, { useState } from 'react';

// Shared styling constants for a cleaner look
const styles = {
    // --- Overall Layout ---
    marketplace: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
    },
    slotsList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
        marginTop: '20px',
    },
    // --- Slot Card ---
    slotCard: {
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '15px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
        backgroundColor: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    slotTitle: {
        fontSize: '1.2em',
        color: '#007BFF',
        marginBottom: '5px',
    },
    slotTime: {
        color: '#555',
        fontSize: '0.9em',
        marginBottom: '10px',
    },
    swapButton: {
        padding: '10px 15px',
        borderRadius: '5px',
        border: 'none',
        backgroundColor: '#007BFF',
        color: 'white',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginTop: '10px',
        transition: 'background-color 0.2s',
    },
    // --- Modal ---
    modalBackdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        maxWidth: '450px',
        width: '90%',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    },
    radioLabel: {
        display: 'block',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginBottom: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.1s',
    },
    radioInput: {
        marginRight: '10px',
    },
    submitButton: {
        padding: '10px 15px',
        borderRadius: '5px',
        border: 'none',
        backgroundColor: '#4CAF50',
        color: 'white',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginRight: '10px',
        marginTop: '20px',
    },
    cancelButton: {
        padding: '10px 15px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        backgroundColor: 'white',
        color: '#333',
        cursor: 'pointer',
        marginTop: '20px',
    }
};

const Marketplace = () => {
    // Dummy Data - In a real app, this would come from GET /api/swappable-slots (excluding own)
    const availableSlots = [
        { id: 101, title: "User A: Team Meeting", time: "Tue 10-11 AM", ownerId: 'user-a' },
        { id: 102, title: "User B: Focus Block", time: "Wed 2-3 PM", ownerId: 'user-b' },
    ];

    // Dummy Data - User's own swappable slots (used in the modal)
    const userSwappableSlots = [
        { id: 2, title: "My Focus Block", time: "Wed 2-3 PM" },
        { id: 4, title: "My Lunch Slot", time: "Mon 1-2 PM" },
    ];

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedOfferSlot, setSelectedOfferSlot] = useState(null);
    const [targetSlot, setTargetSlot] = useState(null);

    // **Frontend Requirement:** Add a "Request Swap" button to each slot.
    const handleRequestSwap = (slot) => {
        setTargetSlot(slot);
        setSelectedOfferSlot(null); // Reset selection when opening modal
        setModalOpen(true);
    };

    const handleOfferSubmit = (e) => {
        e.preventDefault();
        if (!selectedOfferSlot || !targetSlot) return;

        console.log(`Requesting swap: Offering ${selectedOfferSlot.id} for ${targetSlot.id}`);
        
        // 1. **Call your Backend API here:**
        // POST /api/swap-request 
        // Request Body: { mySlotId: selectedOfferSlot.id, desiredSlotId: targetSlot.id }

        // 2. State update (e.g., show a success message)
        setModalOpen(false);
        setSelectedOfferSlot(null);
        setTargetSlot(null);
    };

    // Modal UI to select own SWAPPABLE slot
    const SwapOfferModal = () => (
        <div style={styles.modalBackdrop}>
            <div style={styles.modalContent}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    Offer Slot for: <span style={{ color: '#007BFF' }}>{targetSlot.title}</span>
                </h3>
                <p style={{ marginTop: '15px' }}>Select **your** swappable slot to offer in exchange:</p>
                <form onSubmit={handleOfferSubmit}>
                    {userSwappableSlots.map(slot => (
                        <label 
                            key={slot.id} 
                            htmlFor={`slot-${slot.id}`} 
                            style={{ 
                                ...styles.radioLabel, 
                                backgroundColor: selectedOfferSlot && selectedOfferSlot.id === slot.id ? '#e6f7ff' : 'white',
                                borderColor: selectedOfferSlot && selectedOfferSlot.id === slot.id ? '#007BFF' : '#ddd',
                            }}
                        >
                            <input 
                                type="radio" 
                                id={`slot-${slot.id}`} 
                                name="offerSlot" 
                                value={slot.id} 
                                style={styles.radioInput}
                                onChange={() => setSelectedOfferSlot(slot)}
                                checked={selectedOfferSlot && selectedOfferSlot.id === slot.id} 
                                required
                            />
                            {slot.title} ({slot.time})
                        </label>
                    ))}
                    <div style={styles.actionContainer}>
                        <button type="submit" style={styles.submitButton} disabled={!selectedOfferSlot}>
                            Confirm Swap Request
                        </button>
                        <button type="button" style={styles.cancelButton} onClick={() => setModalOpen(false)}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div style={styles.marketplace}>
            <h2 style={{ color: '#333' }}>🤝 Available Slot Marketplace</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                View time slots other users have made available for swapping.
            </p>
            <div style={styles.slotsList}>
                {availableSlots.map(slot => (
                    <div key={slot.id} style={styles.slotCard}>
                        <div>
                            <h4 style={styles.slotTitle}>{slot.title}</h4>
                            <p style={styles.slotTime}>Time: **{slot.time}**</p>
                        </div>
                        <button 
                            style={styles.swapButton} 
                            onClick={() => handleRequestSwap(slot)}
                        >
                            Request Swap
                        </button>
                    </div>
                ))}
            </div>
            {modalOpen && <SwapOfferModal />}
        </div>
    );
};

export default Marketplace;