(function () {
  const aside = document.querySelector(".sidebar");
  if (!aside) return;

  const links = [
    { href: "/catalog", label: "Catalogo" },
    { href: "/admin/inventory/update", label: "Actualizar inventario" },
    { href: "/admin/invoices", label: "Ver facturas" }, // ← admin
    { href: "/admin/inventory", label: "Ver inventario" },
    { href: "/admin/users", label: "Usuarios" },
    { href: "/admin/users/edit", label: "Modificar usuarios" },
    { href: "/admin/users/new", label: "Agregar usuario" },
  ];

  const path = location.pathname.replace(/\/+$/,"");
  const isActive = href => path === href || path.startsWith(href + "/");

  aside.innerHTML = `
    <div class="brand">Vista administrador</div>
    <nav class="nav">
      ${links.map(l => `<a href="${l.href}" class="${isActive(l.href) ? "active" : ""}">${l.label}</a>`).join("")}
    </nav>
    <button id="btn-logout" class="logout">Cerrar sesión</button>
  `;

  aside.querySelector("#btn-logout")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    location.href = "/login";
  });

  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (u?.firstName) {
      const pill = document.createElement("div");
      pill.className = "user-pill";
      pill.innerHTML = `<span class="dot"></span><span>${u.firstName} ${u.lastName || ""}</span>`;
      document.body.appendChild(pill);
    }
  } catch {}
})();