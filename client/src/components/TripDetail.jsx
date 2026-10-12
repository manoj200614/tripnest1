import { useEffect, useState } from 'react';
import { api, toData, money, day } from '../api';

// One row in a list, with a delete button
const Item = ({ children, onDelete }) => (
  <div className="item">
    <span>{children}</span>
    <button className="link" onClick={onDelete}>✕</button>
  </div>
);

// Small reusable "add" form
function AddForm({ numbers = [], onAdd, children }) {
  const submit = (e) => {
    e.preventDefault();
    onAdd(toData(e.target, numbers));
    e.target.reset();
  };
  return (
    <form className="row" onSubmit={submit}>
      {children}
      <button>Add</button>
    </form>
  );
}

export default function TripDetail({ id, user, onBack }) {
  const [trip, setTrip] = useState(null);
  const [sum, setSum] = useState(null);

  const load = async () => {
    try {
      setTrip(await api(`/trips/${id}`));
      setSum(await api(`/trips/${id}/expenses/summary`));
    } catch (err) {
      alert(err.message);
    }
  };
  useEffect(() => { load(); }, [id]);

  const run = async (fn) => {
    try { await fn(); await load(); } catch (err) { alert(err.message); }
  };
  const add = (path, data) => run(() => api(`/trips/${id}/${path}`, 'POST', data));
  const del = (path, itemId) => run(() => api(`/trips/${id}/${path}/${itemId}`, 'DELETE'));
  const share = (data) =>
    run(async () => alert((await api(`/trips/${id}/share`, 'POST', data)).message));
  const removeTrip = async () => {
    if (!confirm('Delete this trip permanently?')) return;
    try { await api('/trips/' + id, 'DELETE'); onBack(); } catch (err) { alert(err.message); }
  };

  if (!trip || !sum) return <p>Loading...</p>;
  const isOwner = trip.owner._id === user.id;
  const over = sum.remaining < 0;

  return (
    <section>
      <button className="back" onClick={onBack}>← All trips</button>

      <div className="card">
        <h2>{trip.title}</h2>
        <p className="muted">
          {day(trip.startDate)}{trip.endDate && ' → ' + day(trip.endDate)} · Owner: {trip.owner.name}
        </p>
        {isOwner && <button className="link" onClick={removeTrip}>Delete trip</button>}
      </div>

      <div className="card">
        <h3>📍 Destinations</h3>
        {trip.destinations.length === 0 && <p className="muted">No destinations yet</p>}
        {trip.destinations.map((d) => (
          <Item key={d._id} onDelete={() => del('destinations', d._id)}>
            <b>{d.name}</b> {d.country} <span className="muted">{d.notes}</span>
          </Item>
        ))}
        <AddForm onAdd={(d) => add('destinations', d)}>
          <input name="name" placeholder="Place" required />
          <input name="country" placeholder="Country" />
          <input name="notes" placeholder="Notes" />
        </AddForm>
      </div>

      <div className="card">
        <h3>🗓️ Itinerary</h3>
        {trip.itinerary.length === 0 && <p className="muted">Nothing planned yet</p>}
        {[...trip.itinerary].sort((a, b) => a.day - b.day).map((i) => (
          <Item key={i._id} onDelete={() => del('itinerary', i._id)}>
            <b>Day {i.day}</b> {i.time} — {i.title} <span className="muted">{i.location}</span>
          </Item>
        ))}
        <AddForm numbers={['day']} onAdd={(d) => add('itinerary', d)}>
          <input name="day" type="number" min="1" placeholder="Day #" required style={{ maxWidth: 90 }} />
          <input name="time" placeholder="Time (10:00 AM)" />
          <input name="title" placeholder="Activity" required />
          <input name="location" placeholder="Location" />
        </AddForm>
      </div>

      <div className="card">
        <h3>💰 Expenses</h3>
        <div className="stats">
          <div className="stat">Budget<b>{money(sum.budget)}</b></div>
          <div className="stat">Spent<b>{money(sum.totalSpent)}</b></div>
          <div className={'stat' + (over ? ' over' : '')}>
            {over ? 'Over budget by' : 'Remaining'}<b>{money(Math.abs(sum.remaining))}</b>
          </div>
          <div className="stat">Per person<b>{money(sum.perPerson)}</b></div>
        </div>
        <p className="muted">
          {Object.entries(sum.byCategory).map(([k, v]) => `${k}: ${money(v)}`).join(' · ')}
        </p>
        {trip.expenses.map((x) => (
          <Item key={x._id} onDelete={() => del('expenses', x._id)}>
            {x.title} <span className="muted">({x.category})</span> — <b>{money(x.amount)}</b>
          </Item>
        ))}
        <AddForm numbers={['amount']} onAdd={(d) => add('expenses', d)}>
          <input name="title" placeholder="Expense" required />
          <select name="category">
            {['Travel', 'Stay', 'Food', 'Activities', 'Shopping', 'Other'].map((c) => <option key={c}>{c}</option>)}
          </select>
          <input name="amount" type="number" min="0" placeholder="Amount" required />
        </AddForm>
      </div>

      <div className="card">
        <h3>👥 Share with friends</h3>
        <p className="muted">Shared with: {trip.members.map((m) => m.name).join(', ') || 'nobody yet'}</p>
        {isOwner && (
          <form className="row" onSubmit={(e) => { e.preventDefault(); share(toData(e.target)); e.target.reset(); }}>
            <input name="email" type="email" placeholder="Friend's registered email" required />
            <button>Share</button>
          </form>
        )}
      </div>
    </section>
  );
}
