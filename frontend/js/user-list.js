const TBody = document.getElementById("tbody");
const Empty = document.getElementById("empty");
const Q = document.getElementById("q");

function render(rows){
  TBody.innerHTML = "";
  if (!rows.length){ Empty.hidden = false; return; }
  Empty.hidden = true;
  const frag = document.createDocumentFragment();
  for (const u of rows){
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.firstName}</td>
      <td>${u.lastName}</td>
      <td>${u.ciOrRuc}</td>
      <td>${u.phone || ""}</td>
      <td>${u.email}</td>
      <td>${u.role || ""}</td>
      <td>${u.active === false ? "Inactivo" : "Activo"}</td>
    `;
    frag.appendChild(tr);
  }
  TBody.appendChild(frag);
}

function filter(rows, q){
  if (!q) return rows;
  const s = q.toLowerCase();
  return rows.filter(u =>
    String(u.id).includes(s) ||
    (u.firstName||"").toLowerCase().includes(s) ||
    (u.lastName||"").toLowerCase().includes(s) ||
    (u.ciOrRuc||"").toLowerCase().includes(s) ||
    (u.email||"").toLowerCase().includes(s)
  );
}

async function loadUsers() {
  const token = localStorage.getItem("token") || "";
  if (!token) return location.replace("/login");

  const limit = 50;
  const r = await fetch(`/api/users?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (r.status === 401 || r.status === 403) {
    return location.replace("/login");
  }
  if (!r.ok) {
    console.error("GET /api/users failed", r.status);
    return; // muestra vacío
  }

  const data = await r.json();
  // pinta filas en la tabla
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";
  for (const u of data) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.id ?? u.id_usuario ?? ""}</td>
      <td>${u.nombre ?? ""}</td>
      <td>${u.apellido ?? ""}</td>
      <td>${u.cedula ?? ""}</td>
      <td>${u.celular ?? ""}</td>
      <td>${u.correo ?? u.correo_electronico ?? ""}</td>
      <td>${u.rol ?? ""}</td>
      <td></td>`;
    tbody.appendChild(tr);
  }
}

document.addEventListener("DOMContentLoaded", loadUsers);

// ...existing code...