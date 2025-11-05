const u = JSON.parse(localStorage.getItem("user") || "null");
if (!u) location.replace("/login");
const r = String(u.role || "").toLowerCase();
if (!(r === "administrador" || r === "admin")) location.replace("/catalog");