// src/components/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../App';

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:5000';

/* -------------------- Event Card -------------------- */
const EventCard = ({ event, onStatusToggled }) => {
  const { token } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const isPending = event.status === 'SWAP_PENDING';
  const isBusy = event.status === 'BUSY';
  const nextStatus = isBusy ? 'SWAPPABLE' : 'BUSY';

  const toggleSwappable = async () => {
    if (!token || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/events/${event._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || 'Failed to update status.');
      }
      onStatusToggled?.();
    } catch (e) {
      console.error(e);
      alert(e.message || 'Failed to update event status.');
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (ts) =>
    new Date(ts).toLocaleString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      day: '2-digit',
      month: 'short',
    });

  return (
    <div className="event-card" style={styles.card}>
      <div style={styles.cardHeader}>
        <h4 style={{ margin: 0 }}>{event.title}</h4>
        <span style={styles.badge}>{event.status}</span>
      </div>

      <p style={styles.when}>
        {fmt(event.startTime)} — {fmt(event.endTime)}
      </p>

      {!isPending && (
        <button
          onClick={toggleSwappable}
          disabled={submitting}
          style={isBusy ? styles.btnBlue : styles.btnGreen}
        >
          {submitting ? 'Updating…' : isBusy ? 'Make Swappable' : 'Set to BUSY'}
        </button>
      )}
      {isPending && (
        <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
          This event has a pending swap. Status cannot be changed.
        </p>
      )}
    </div>
  );
};

/* -------------------- Create Event Form -------------------- */
const CreateEventForm = ({ onCreated, onCancel }) => {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (!title || !startTime || !endTime) {
      alert('Please fill all fields');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Failed to create event.');
      onCreated?.(data);
    } catch (e) {
      console.error(e);
      alert(e.message || 'Failed to create event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} style={styles.form}>
      <h3 style={{ marginTop: 0 }}>Create New Event</h3>
      <input
        type="text"
        placeholder="Title (e.g., Standup)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={styles.input}
        required
      />
      <label style={styles.label}>Start time</label>
      <input
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        style={styles.input}
        required
      />
      <label style={styles.label}>End time</label>
      <input
        type="datetime-local"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        style={styles.input}
        required
      />
      <div style={styles.row}>
        <button type="submit" disabled={submitting} style={styles.btnBlue}>
          {submitting ? 'Creating…' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} style={styles.btnRed}>
          Cancel
        </button>
      </div>
    </form>
  );
};

/* -------------------- Dashboard -------------------- */
const Dashboard = () => {
  const { user, token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErr('');
    try {
      const res = await fetch(`${API_BASE}/api/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch events.');
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Failed to fetch events.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="dashboard" style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ margin: 0 }}>
          Your Calendar {user?.name ? `(${user.name})` : ''}
        </h2>
        <button
          onClick={() => setShowCreate((s) => !s)}
          style={styles.btnBlue}
        >
          {showCreate ? 'Close' : '+ Create New Event'}
        </button>
      </div>

      {showCreate && (
        <CreateEventForm
          onCreated={() => {
            setShowCreate(false);
            fetchEvents();
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {loading && <p style={{ marginTop: 16 }}>Loading your schedule…</p>}
      {err && (
        <p role="alert" style={{ color: 'red', marginTop: 8 }}>
          {err}
        </p>
      )}

      {!loading && !err && (
        <div className="events-list" style={styles.grid}>
          {events.length > 0 ? (
            events.map((ev) => (
              <EventCard key={ev._id} event={ev} onStatusToggled={fetchEvents} />
            ))
          ) : (
            <p>No events found. Click “Create New Event” to add one!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

/* -------------------- Updated Button Colors -------------------- */
const styles = {
  container: { maxWidth: 900, margin: '0 auto', padding: 16 },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 12,
    marginTop: 12,
  },
  card: {
    border: '1px solid #eee',
    borderRadius: 12,
    padding: 12,
    background: '#fff',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 6,
  },
  badge: {
    fontSize: 12,
    padding: '2px 8px',
    borderRadius: 999,
    background: '#f4f4f4',
  },
  when: { marginTop: 4, marginBottom: 10, color: '#555' },
  form: {
    border: '1px solid #eee',
    borderRadius: 12,
    padding: 12,
    background: '#fafafa',
    marginTop: 12,
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    border: '1px solid #ddd',
  },
  label: { fontSize: 12, color: '#666', margin: '4px 0' },
  row: { display: 'flex', gap: 8 },

  /* -------- Buttons -------- */
  btnBlue: {
    padding: '8px 14px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #394fd4, #4b6cff)',
    color: '#fff',
    fontWeight: 600,
  },
  btnGreen: {
    padding: '8px 14px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #27a978, #2bb98b)',
    color: '#fff',
    fontWeight: 600,
  },
  btnRed: {
    padding: '8px 14px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #e15d5d, #e57b73)',
    color: '#fff',
    fontWeight: 600,
  },
};
