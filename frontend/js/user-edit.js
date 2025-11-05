const L = document.getElementById("list");
const E = document.getElementById("empty");

// Helper: Authorization y prefijo /api
function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token") || "";
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  const url = path.startsWith("/api") ? path : `/api${path.startsWith("/") ? "" : "/"}${path}`;
  return fetch(url, { ...options, headers });
}

// Carga lista para "Modificar usuarios"
async function load() {
  try {
    const r = await apiFetch("/users?limit=100");
    const data = r.ok ? await r.json() : [];
    render(Array.isArray(data) ? data : []);
  } catch {
    render([]);
  }
}

function field(label, type, value, cls = "") {
  const wrap = document.createElement("div");
  wrap.className = "row";
  wrap.innerHTML = `<label>${label}</label><input class="${cls}" type="${type}" value="${value ?? ""}">`;
  return wrap;
}

function select(label, value, options) {
  const wrap = document.createElement("div");
  wrap.className = "row";
  const opts = options.map(o => `<option value="${o}" ${o === value ? "selected" : ""}>${o}</option>`).join("");
  wrap.innerHTML = `<label>${label}</label><select>${opts}</select>`;
  return wrap;
}

function render(rows) {
  L.innerHTML = "";
  if (!rows.length) {
    E.hidden = false;
    return;
  }
  E.hidden = true;

  for (const u of rows) {
    // Mapeo de campos reales del backend
    const id = u.id ?? u.id_usuario;
    const nombre = u.nombre ?? "";
    const apellido = u.apellido ?? "";
    const cedula = u.cedula ?? "";
    const celular = u.celular ?? "";
    const correo = (u.correo ?? u.correo_electronico) ?? "";
    const rol = u.rol ?? "Cliente";

    const card = document.createElement("div");
    card.className = "card";

    const avatar = document.createElement("div");
    avatar.className = "avatar";

    const grid = document.createElement("div");
    grid.className = "grid";

    const fNombre = field("Nombre:", "text", nombre);
    const fApellido = field("Apellido:", "text", apellido);
    const fCedula = field("CI o RUC:", "text", cedula, "ci");
    const fCelular = field("Celular:", "text", celular, "cel");
    const fCorreo = field("E-mail:", "email", correo, "mail");
    const fRol = select("Rol:", rol, ["Cliente", "Admin", "Administrador"]);

    grid.append(fNombre, fApellido, fCedula, fCelular, fCorreo, fRol);

    const meta = document.createElement("div");
    meta.className = "meta";

    const btnSave = document.createElement("button");
    btnSave.className = "btn primary";
    btnSave.textContent = "Guardar";
    btnSave.addEventListener("click", async () => {
      btnSave.disabled = true;
      btnSave.textContent = "Guardando...";
      try {
        const payload = {
          nombre: fNombre.querySelector("input").value.trim(),
          apellido: fApellido.querySelector("input").value.trim(),
          cedula: fCedula.querySelector("input").value.replace(/\D+/g, ""),
          celular: fCelular.querySelector("input").value.replace(/\D+/g, ""),
          correo: fCorreo.querySelector("input").value.trim().toLowerCase(),
          rol: fRol.querySelector("select").value
        };
        const res = await apiFetch(`/users/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(d.message || `HTTP ${res.status}`);
        alert("Usuario actualizado");
      } catch (e) {
        alert(e.message || "No se pudo actualizar");
      } finally {
        btnSave.disabled = false;
        btnSave.textContent = "Guardar";
      }
    });

    const btnDel = document.createElement("button");
    btnDel.className = "icon-btn";
    btnDel.title = "Eliminar usuario";
    btnDel.innerHTML = "🗑️";
    btnDel.addEventListener("click", async () => {
      if (!confirm("¿Eliminar este usuario?")) return;
      btnDel.disabled = true;
      try {
        const r = await apiFetch(`/users/${id}`, { method: "DELETE" });
        if (!(r.ok || r.status === 204)) {
          const d = await r.json().catch(() => ({}));
          throw new Error(d.message || `HTTP ${r.status}`);
        }
        card.remove();
      } catch (e) {
        alert(e.message || "No se pudo eliminar");
      } finally {
        btnDel.disabled = false;
      }
    });

    // Botones visibles (quitado reset-password y PATCH inexistentes)
    meta.append(btnSave, btnDel);
    card.append(avatar, grid, meta);
    L.appendChild(card);
  }
}

document.addEventListener("DOMContentLoaded", load);