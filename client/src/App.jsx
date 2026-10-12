import { useState } from 'react';
import Auth from './components/Auth';
import TripList from './components/TripList';
import TripDetail from './components/TripDetail';

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [tripId, setTripId] = useState(null); // null = show trip list

  const onLogin = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };
  const logout = () => {
    localStorage.clear();
    setUser(null);
    setTripId(null);
  };

  return (
    <>
      <header>
        <h1>🪺 TripNest</h1>
        {user && (
          <div>
            <span>👤 {user.name}</span> <button className="ghost" onClick={logout}>Logout</button>
          </div>
        )}
      </header>
      <main>
        {!user ? (
          <Auth onLogin={onLogin} />
        ) : tripId ? (
          <TripDetail id={tripId} user={user} onBack={() => setTripId(null)} />
        ) : (
          <TripList user={user} onOpen={setTripId} onLogout={logout} />
        )}
      </main>
    </>
  );
}
