const L = document.getElementById("list");
const E = document.getElementById("empty");
const Q = document.getElementById("q");
const R = document.getElementById("reload");

const CURRENCY = "USD";
const fmt = v => new Intl.NumberFormat("es-EC",{style:"currency",currency:CURRENCY}).format(Number(v||0));

function authHeaders(){
  const h = { "Content-Type":"application/json" };
  const t = localStorage.getItem("token");
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

// Normaliza distintas formas de la API
function normalize(inv, idx=0){
  const id = String(inv.id ?? inv.id_factura ?? idx+1);
  const code = inv.code ?? String(id).padStart(6,"0");
  const date = inv.date ?? inv.fecha ?? null;
  const total = Number(inv.total ?? 0);
  const customerName = inv.customerName ?? inv.cliente ?? "";
  const customerCi = inv.customerCi ?? inv.ci ?? "";
  return { id, code, date, total, currency: "USD", customerName, customerCi };
}

async function fetchInvoices(){
  try{
    const r = await fetch("/api/invoices", { headers: authHeaders() });
    if (!r.ok) return [];
    const d = await r.json().catch(()=>[]);
    return Array.isArray(d) ? d.map(normalize) : [];
  }catch{ return []; }
}

function render(rows){
  L.innerHTML = "";
  if (!rows.length){ E.hidden=false; return; }
  E.hidden = true;

  for (const inv of rows){
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="meta">
        <div class="small">Código: ${inv.code}</div>
        <div class="row">
          <div><strong>Cliente:</strong></div><div>${inv.customerName || "-"}</div>
          <div><strong>Fecha:</strong></div><div>${inv.date ? new Date(inv.date).toLocaleDateString() : "-"}</div>
          <div><strong>CI:</strong></div><div>${inv.customerCi || "-"}</div>
          <div><strong>Total:</strong></div><div>${fmt(inv.total)}</div>
        </div>
      </div>
      <div class="actions">
        <button class="icon-btn view" title="Ver detalle">👁️</button>
      </div>
    `;
    card.querySelector(".view").addEventListener("click", () => {
      const idOrCode = encodeURIComponent(inv.id || inv.code);
      location.href = `/admin/invoices/${idOrCode}`;
    });
    L.appendChild(card);
  }
}

function filter(rows, q){
  if (!q) return rows;
  const s = q.toLowerCase();
  return rows.filter(x =>
    String(x.code).toLowerCase().includes(s) ||
    String(x.id).toLowerCase().includes(s) ||
    (x.customerName||"").toLowerCase().includes(s) ||
    (x.customerCi||"").toLowerCase().includes(s)
  );
}

let DATA = [];
async function load(){
  DATA = await fetchInvoices();
  render(filter(DATA, Q.value.trim()));
}

Q.addEventListener("keydown", e => { if (e.key === "Enter") load(); });
R.addEventListener("click", load);
load();