const GRID = document.getElementById("catalog-grid");
const EMPTY = document.getElementById("empty");
const BTN = document.getElementById("btn-cart");
const CLR = document.getElementById("btn-cart-clear"); // NUEVO

const LS_CART = "cart";
const CURRENCY = "USD";

function getCart(){ try { return JSON.parse(localStorage.getItem(LS_CART)) || {}; } catch { return {}; } }
function setCart(c){ localStorage.setItem(LS_CART, JSON.stringify(c)); }
function clearCart(){ localStorage.removeItem(LS_CART); } // NUEVO
function fmt(v){ return new Intl.NumberFormat("es-EC",{style:"currency",currency:CURRENCY}).format(Number(v||0)); }

function normalize(p){
  return {
    id: String(p.id ?? p.id_producto ?? ""),
    name: p.name ?? p.nombre_producto ?? "Producto",
    description: p.description ?? p.descripcion ?? "",
    price: Number(p.price ?? p.precio_unitario ?? 0),
    stock: Number(p.stock ?? p.unidades_disponibles ?? 0),
    thumb: p.thumb || null,
  };
}

async function fetchProducts(){
  try{
    const r = await fetch("/api/products");
    if (!r.ok) return [];
    const data = await r.json();
    return Array.isArray(data) ? data.map(normalize) : [];
  } catch { return []; }
}

function render(products){
  GRID.innerHTML = "";
  if (!products.length){ EMPTY.hidden = false; BTN.hidden = true; CLR.hidden = true; return; }
  EMPTY.hidden = true;

  const cart = getCart();
  const frag = document.createDocumentFragment();

  for (const p of products){
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="thumb">${p.thumb ? `<img src="${p.thumb}" alt="">` : ""}</div>
      <div class="body">
        <h3>${p.name}</h3>
        <p class="desc">${p.description || ""}</p>
        <div class="meta">
          <span class="price">${fmt(p.price)}</span>
          <span class="stock">${p.stock > 0 ? `Stock: ${p.stock}` : "Sin stock"}</span>
        </div>
        <button class="btn" ${p.stock <= 0 ? "disabled" : ""}>Agregar</button>
        <button class="link-remove" type="button" style="display:${cart[p.id] ? "inline" : "none"}">Quitar</button>
      </div>
    `;

    // Agregar
    card.querySelector(".btn").addEventListener("click", () => {
      const c = getCart();
      c[p.id] = (c[p.id] || 0) + 1;
      setCart(c);
      // mostrar "Quitar" cuando haya cantidad
      card.querySelector(".link-remove").style.display = "inline";
      updateCartButton(products);
    });

    // Quitar (eliminar completamente del carrito)
    card.querySelector(".link-remove").addEventListener("click", () => {
      const c = getCart();
      if (c[p.id] != null) {
        delete c[p.id];
        Object.keys(c).length ? setCart(c) : clearCart();
      }
      card.querySelector(".link-remove").style.display = "none";
      updateCartButton(products);
    });

    frag.appendChild(card);
  }
  GRID.appendChild(frag);

  updateCartButton(products);
}

function updateCartButton(products){
  const cart = getCart() || {};
  let count = 0, total = 0;
  const index = Object.fromEntries(products.map(p => [p.id, p]));
  for (const [id, qty] of Object.entries(cart)){
    const p = index[id];
    if (!p) continue;
    count += Number(qty||0);
    total += Number(qty||0) * Number(p.price||0);
  }
  if (count > 0){
    BTN.querySelector(".count").textContent = String(count);
    BTN.querySelector(".total").textContent = fmt(total);
    BTN.hidden = false;
    CLR.hidden = false;
  } else {
    BTN.hidden = true;
    CLR.hidden = true;
  }
}

BTN.addEventListener("click", () => location.href = "/billing");

// NUEVO: vaciar carrito
CLR.addEventListener("click", () => {
  if (!confirm("¿Vaciar carrito?")) return;
  clearCart();
  // Re-render para ocultar enlaces "Quitar"
  (async () => {
    const products = await fetchProducts();
    render(products);
  })();
});

(async function init(){
  const products = await fetchProducts();
  render(products);
})();