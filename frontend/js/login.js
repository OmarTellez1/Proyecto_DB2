import { login } from "./api.js";

const form = document.querySelector("form");

// Asegura el contenedor de errores (si no existe, créalo sin romper el layout)
let err =
  document.getElementById("err") ||
  document.querySelector(".error");

if (!err && form) {
  err = document.createElement("div");
  err.id = "err";
  err.className = "error";
  err.hidden = true;
  const btn = form.querySelector('button[type="submit"], button');
  (btn?.parentNode || form).insertBefore(err, btn?.nextSibling || null);
}

function getUserInput() {
  // intenta por id y por name
  const u =
    document.getElementById("user") ||
    document.getElementById("username") ||
    document.querySelector('[name="user"]') ||
    document.querySelector('[name="username"]') ||
    document.querySelector('[name="email"]') ||
    document.querySelector('[name="ci"]') ||
    document.querySelector('[name="cedula"]') ||
    document.querySelector('[name="celular"]') ||
    document.querySelector('input[type="text"]') ||
    document.querySelector('input[type="tel"]') ||
    document.querySelector('input[inputmode="numeric"]');
  const p =
    document.getElementById("password") ||
    document.querySelector('[name="password"]') ||
    document.querySelector('[name="pass"]') ||
    document.querySelector('[name="contrasena"]') ||
    document.querySelector('input[type="password"]');

  return { u, p };
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (err) { err.textContent = ""; err.hidden = true; }   // ← evita el null

  const { u, p } = getUserInput();
  const user = (u?.value || "").trim();
  const password = (p?.value || "").trim();
  if (!user || !password) {
    err.textContent = "Usuario y contraseña requeridos";
    err.hidden = false;
    return;
  }

  try {
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, password })
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.message || "No se pudo iniciar sesión");

    localStorage.setItem("token", d.token);
    localStorage.setItem("user", JSON.stringify(d.user));

    const role = String(d.user?.role || "").toLowerCase();
    // admin → /admin/invoices, cliente/usuario → /catalog
    location.href = (role === "administrador" || role === "admin")
      ? "/admin/invoices"
      : "/catalog";
  } catch (e2) {
    if (err) { err.textContent = e2.message || "No se pudo iniciar sesión"; err.hidden = false; }
  }
});