// components/Notifications.jsx
import React, { useState } from 'react';

// Shared styling constants for a cleaner look
const styles = {
    requestCard: {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '15px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        backgroundColor: '#fff',
    },
    actionContainer: {
        marginTop: '15px',
        display: 'flex',
        gap: '10px',
    },
    acceptButton: {
        padding: '8px 15px',
        borderRadius: '5px',
        border: 'none',
        backgroundColor: '#4CAF50', // Green
        color: 'white',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
    },
    rejectButton: {
        padding: '8px 15px',
        borderRadius: '5px',
        border: 'none',
        backgroundColor: '#F44336', // Red
        color: 'white',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
    },
    // Style for the bold text (slots/users)
    highlight: {
        fontWeight: '600',
        color: '#333',
    },
};


// SwapRequest component with improved structure and styling
const SwapRequest = ({ request, type, onRespond }) => {
    const handleResponse = (accepted) => {
        console.log(`${accepted ? 'Accepting' : 'Rejecting'} request ${request.id}`);
        
        // 1. Simulate API call
        // POST /api/swap-response 
        // Request Body: { requestId: request.id, accepted: accepted }
        
        // 2. Call the parent handler to update state (remove the request)
        onRespond(request.id, type); 
    };

    return (
        <div style={styles.requestCard}>
            {type === 'incoming' ? (
                <>
                    {/* Header/Summary */}
                    <p>
                        <span style={styles.highlight}>{request.fromUser}</span> has offered a swap for your time slot.
                    </p>
                    
                    {/* Details */}
                    <p style={{ fontSize: '14px', color: '#555' }}>
                        You give: <span style={styles.highlight}>{request.targetSlot}</span>
                        <br />
                        You receive: <span style={styles.highlight}>{request.offerSlot}</span>
                    </p>

                    {/* Action Buttons */}
                    <div style={styles.actionContainer}>
                        <button 
                            style={styles.acceptButton} 
                            onClick={() => handleResponse(true)}
                        >
                            Accept Swap
                        </button>
                        <button 
                            style={styles.rejectButton} 
                            onClick={() => handleResponse(false)}
                        >
                            Reject
                        </button>
                    </div>
                </>
            ) : (
                <>
                    {/* Outgoing Request View */}
                    <p>
                        Your request to <span style={styles.highlight}>{request.toUser}</span> is currently <span style={{ ...styles.highlight, color: '#FF9800' }}>PENDING</span> review.
                    </p>
                    <p style={{ fontSize: '14px', color: '#555' }}>
                        Your offer: <span style={styles.highlight}>{request.offerSlot}</span>
                        <br />
                        Requested slot: <span style={styles.highlight}>{request.targetSlot}</span>
                    </p>
                    {/* Optional: Add a Cancel Request button here if required */}
                </>
            )}
        </div>
    );
};

const Notifications = () => {
    // 1. Initialize state with dummy data
    const [incomingRequests, setIncomingRequests] = useState([
        { id: 1, fromUser: 'User Alpha', targetSlot: 'My Team Meeting (Tue 10-11)', offerSlot: 'Alpha\'s Project Slot', status: 'PENDING' },
    ]);

    // Note: Outgoing requests status usually changes upon response, but here we keep it as a separate list
    const [outgoingRequests, setOutgoingRequests] = useState([
        { id: 2, toUser: 'User Beta', offerSlot: 'My Lunch Slot (Mon 1-2)', targetSlot: 'Beta\'s Focus Slot', status: 'PENDING' },
    ]);

    // 2. Handler function to remove the request from the list after action
    const handleRemoveRequest = (requestId, type) => {
        if (type === 'incoming') {
            // Filter out the request that matches the given requestId
            setIncomingRequests(prevRequests => 
                prevRequests.filter(req => req.id !== requestId)
            );
        }
        // In a real app, you might also update outgoingRequests if the status changes
    };

    return (
        <div className="notifications" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', color: '#007BFF' }}>
                🔔 Swap Notifications
            </h2>
            
            <h3 style={{ marginTop: '20px', color: '#555' }}>Awaiting Your Response ({incomingRequests.length})</h3>
            <div className="request-list">
                {incomingRequests.length > 0 ? (
                    incomingRequests.map(req => (
                        <SwapRequest 
                            key={req.id} 
                            request={req} 
                            type="incoming" 
                            onRespond={handleRemoveRequest}
                        />
                    ))
                ) : (
                    <p style={{ fontStyle: 'italic', color: '#777' }}>No new swap requests requiring your approval.</p>
                )}
            </div>

            <h3 style={{ marginTop: '30px', color: '#555' }}>Your Active Requests ({outgoingRequests.length})</h3>
            <div className="request-list">
                {outgoingRequests.length > 0 ? (
                    outgoingRequests.map(req => (
                        <SwapRequest 
                            key={req.id} 
                            request={req} 
                            type="outgoing" 
                            onRespond={handleRemoveRequest}
                        />
                    ))
                ) : (
                    <p style={{ fontStyle: 'italic', color: '#777' }}>No pending outgoing requests.</p>
                )}
            </div>
        </div>
    );
};

export default Notifications;