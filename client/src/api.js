// Helper used by all components to call the Express backend
export async function api(path, method = 'GET', body) {
  const token = localStorage.getItem('token');
  const res = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: 'Bearer ' + token }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

// Turn a form into an object (skips empty fields, converts number fields)
export function toData(form, numbers = []) {
  const d = {};
  new FormData(form).forEach((v, k) => {
    if (v !== '') d[k] = numbers.includes(k) ? Number(v) : v;
  });
  return d;
}

export const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
export const day = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
