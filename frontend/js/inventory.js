const grid = document.getElementById("grid");
const tpl = document.getElementById("card-tpl");
const logoutBtn = document.getElementById("logout");

let products = []; // se llena desde API o mock

function money(v,c="USD"){try{return new Intl.NumberFormat("es-ES",{style:"currency",currency:c}).format(v);}catch{return `$${Number(v||0).toFixed(2)}`}}

async function loadProducts(){
  try{
    const res = await fetch("/api/products");
    products = res.ok ? await res.json() : [];
  }catch{ products = []; }
  if (!products.length){
    // mock si no hay backend
    products = [
      { id:"p1", name:"Producto 1", description:"Lorem ipsum", stock:100, price:12.5, currency:"USD" },
      { id:"p2", name:"Producto 2", description:"Lorem ipsum", stock:80,  price:9.99, currency:"USD" },
      { id:"p3", name:"Producto 3", description:"Lorem ipsum", stock:65,  price:25,   currency:"USD" },
      { id:"p4", name:"Producto 4", description:"Lorem ipsum", stock:42,  price:11.7, currency:"USD" },
    ];
  }
}

function render(){
  grid.innerHTML = "";
  const frag = document.createDocumentFragment();
  for (const p of products){
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.id = p.id;
    node.querySelector(".name").textContent = p.name;
    node.querySelector(".desc").textContent = p.description ?? "";
    node.querySelector(".stock").value = String(p.stock ?? 0);
    node.querySelector(".thumb").textContent = money(p.price, p.currency || "USD");

    node.querySelector(".edit").addEventListener("click", () => {
      window.location.href = `/admin/inventory/update?id=${encodeURIComponent(p.id)}`;
    });
    node.querySelector(".del").addEventListener("click", async () => {
      if (!confirm(`¿Eliminar ${p.name}?`)) return;
      try{
        const res = await fetch(`/api/products/${p.id}`, { method:"DELETE" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        products = products.filter(x => x.id !== p.id);
        render();
      }catch(e){ alert("No se pudo eliminar."); }
    });

    frag.appendChild(node);
  }
  grid.appendChild(frag);
}

logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
});

window.addEventListener("DOMContentLoaded", async () => {
  await loadProducts();
  render();
});