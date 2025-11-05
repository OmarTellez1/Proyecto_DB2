const API = "";

function headers(json = true) {
  const h = {};
  if (json) h["Content-Type"] = "application/json";
  const t = localStorage.getItem("token");
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

export async function login(ciOrRuc, password) {
  const r = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ ciOrRuc, password }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.message || `HTTP ${r.status}`);
  return d;
}

export async function getProducts() {
  const r = await fetch(`${API}/api/products`, { headers: headers(false) });
  const d = await r.json().catch(() => ([]));
  if (!r.ok) throw new Error(d.message || `HTTP ${r.status}`);
  return d;
}

export async function createInvoice(items, currency = "USD") {
  const r = await fetch(`${API}/api/invoices`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ items, currency }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.message || `HTTP ${r.status}`);
  return d;
}