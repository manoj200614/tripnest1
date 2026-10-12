import { useState } from 'react';
import { api, toData } from '../api';

export default function Auth({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      onLogin(await api('/auth/' + (isRegister ? 'register' : 'login'), 'POST', toData(e.target)));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section className="card narrow">
      <h2>{isRegister ? 'Create account' : 'Login'}</h2>
      <form onSubmit={submit}>
        {isRegister && <input name="name" placeholder="Your name" required />}
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password (min 6)" required />
        <button>Continue</button>
      </form>
      <p className="muted">
        <a href="#" onClick={(e) => { e.preventDefault(); setIsRegister(!isRegister); }}>
          {isRegister ? 'Have an account? Login' : 'New here? Create an account'}
        </a>
      </p>
    </section>
  );
}
