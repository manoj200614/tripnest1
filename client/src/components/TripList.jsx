import { useEffect, useState } from 'react';
import { api, toData, money, day } from '../api';

export default function TripList({ user, onOpen, onLogout }) {
  const [trips, setTrips] = useState([]);

  const load = () => api('/trips').then(setTrips).catch(onLogout);
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api('/trips', 'POST', toData(e.target, ['budget']));
      e.target.reset();
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section>
      <div className="card">
        <h2>Plan a new trip</h2>
        <form className="row" onSubmit={create}>
          <input name="title" placeholder="Trip title (e.g. Goa Trip)" required />
          <input name="startDate" type="date" title="Start date" />
          <input name="endDate" type="date" title="End date" />
          <input name="budget" type="number" min="0" placeholder="Budget (₹)" />
          <button>Create</button>
        </form>
      </div>

      <h2>Your trips</h2>
      <div className="grid">
        {trips.length === 0 && <p className="muted">No trips yet. Create your first one above!</p>}
        {trips.map((t) => (
          <div key={t._id} className="card trip" onClick={() => onOpen(t._id)}>
            <h3>{t.title}</h3>
            <p className="muted">
              {day(t.startDate) || 'Dates not set'}{t.endDate && ' → ' + day(t.endDate)}
            </p>
            <p>Budget: <b>{money(t.budget)}</b></p>
            <p className="muted">
              {t.destinations.length} places · {t.members.length} shared
              {t.owner !== user.id && ' · shared with you'}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
