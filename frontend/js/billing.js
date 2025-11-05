import { createInvoice } from "./api.js";

const EL = {
  code: document.getElementById("inv-code"),
  tbody: document.getElementById("tbody"),
  total: document.getElementById("grand-total"),
  form: document.getElementById("form"),
  err: document.getElementById("err"),
  c_name: document.getElementById("c_name"),
  c_ci: document.getElementById("c_ci"),
  c_phone: document.getElementById("c_phone"),
  c_mail: document.getElementById("c_mail"),
  btnClear: document.getElementById("btn-clear"),
};

const LS_CART = "cart";
const CURRENCY = "USD";

function fmt(v){ return new Intl.NumberFormat("es-EC",{style:"currency",currency:CURRENCY}).format(Number(v||0)); }
function getCart(){ try { return JSON.parse(localStorage.getItem(LS_CART)) || {}; } catch { return {}; } }
function setCart(c){ localStorage.setItem(LS_CART, JSON.stringify(c)); }
function clearCart(){ localStorage.removeItem(LS_CART); }
function onlyDigits(s){ return String(s||"").replace(/\D+/g,""); }
function isEmail(s){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s||"").trim()); }

function normalizeProduct(p){
  return {
    id: String(p.id ?? p.id_producto ?? ""),
    name: p.name ?? p.nombre_producto ?? "Producto",
    price: Number(p.price ?? p.precio_unitario ?? 0),
  };
}

async function fetchProducts(){
  try{
    const r = await fetch("/api/products");
    if(!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d.map(normalizeProduct) : [];
  }catch{ return []; }
}

function generateCode(){
  const t = Date.now().toString().slice(-6);
  return t.padStart(6,"0");
}

function prefillUser(){
  try{
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (u){
      EL.c_name.value = [u.firstName, u.lastName].filter(Boolean).join(" ");
      EL.c_ci.value = u.ciOrRuc || "";
      EL.c_phone.value = u.phone || "";
      EL.c_mail.value = u.email || "";
      EL.c_userId = u.id || u.id_usuario || null; // guardar auxiliar
    }
  }catch{}
}

function renderRows(cart, index){
  EL.tbody.innerHTML = "";
  let grand = 0;
  const ids = Object.keys(cart);
  if (!ids.length){
    EL.total.textContent = fmt(0);
    return;
  }

  for (const id of ids){
    const qty = Number(cart[id] || 0);
    const p = index[id];
    if (!p) continue;
    const subtotal = qty * p.price;
    grand += subtotal;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input class="qty" type="number" min="1" step="1" value="${qty}"></td>
      <td>${p.name}</td>
      <td>${fmt(p.price)}</td>
      <td class="row-total">${fmt(subtotal)}</td>
      <td><button type="button" class="rm" title="Quitar">✖</button></td>
    `;

    const qtyI = tr.querySelector(".qty");
    const rmBtn = tr.querySelector(".rm");
    qtyI.addEventListener("input", () => {
      const newQty = Math.max(1, Number(qtyI.value||1));
      const c = getCart();
      c[id] = newQty;
      setCart(c);
      renderRows(c, index);
    });

    rmBtn.addEventListener("click", () => {
      const c = getCart();
      delete c[id];
      Object.keys(c).length ? setCart(c) : clearCart();
      renderRows(getCart() || {}, index);
    });

    EL.tbody.appendChild(tr);
  }
  EL.total.textContent = fmt(grand);
}

async function init(){
  EL.code.textContent = generateCode();
  prefillUser();

  EL.c_ci.addEventListener("input", () => {
    EL.c_ci.value = onlyDigits(EL.c_ci.value).slice(0, 13);
  });
  EL.c_phone.addEventListener("input", () => {
    EL.c_phone.value = onlyDigits(EL.c_phone.value).slice(0, 10);
  });

  const products = await fetchProducts();
  const index = Object.fromEntries(products.map(p => [p.id, p]));
  const cart = getCart();

  // limpia ítems inexistentes
  for (const id of Object.keys(cart)) if (!index[id]) delete cart[id];
  Object.keys(cart).length ? setCart(cart) : clearCart();

  renderRows(cart, index);

  // Vaciar carrito
  EL.btnClear.addEventListener("click", () => {
    if (!confirm("¿Vaciar todo el carrito?")) return;
    clearCart();
    renderRows({}, index);
  });

  // Comprar
  EL.form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    EL.err.hidden = true;

    const c = getCart();
    if (!c || !Object.keys(c).length){
      EL.err.textContent="No hay productos en el carrito"; EL.err.hidden=false; return;
    }

    const ci = onlyDigits(EL.c_ci.value);
    const ph = onlyDigits(EL.c_phone.value);
    const mail = EL.c_mail.value.trim().toLowerCase();

    if (ci.length < 10 || ci.length > 13){ EL.err.textContent = "La cédula/RUC debe tener entre 10 y 13 dígitos"; EL.err.hidden = false; return; }
    if (ph.length !== 10){ EL.err.textContent = "El celular debe tener 10 dígitos"; EL.err.hidden = false; return; }
    if (!isEmail(mail)){ EL.err.textContent = "E-mail inválido"; EL.err.hidden = false; return; }

    const payload = {
      customer: { name: EL.c_name.value.trim(), ci, phone: ph, email: mail,
        userId: JSON.parse(localStorage.getItem("user")||"null")?.id_usuario || null
      },
      // No enviar precios desde el front; el backend usa el precio real de BD
      items: Object.entries(c).map(([id, qty]) => ({
        productId: Number(id),
        quantity: Number(qty||0)
      })),
      currency: CURRENCY
    };

    try{
      const r = await fetch("/api/invoices", {
        method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload)
      });
      if (!r.ok){
        const d = await r.json().catch(()=> ({}));
        // Mostrar faltantes/insuficientes si vienen del backend
        if (r.status === 409 && d?.details?.insuficientes?.length){
          const msg = d.details.insuficientes.map(x => `• ${x.nombre} (stock ${x.stock}, solicitó ${x.necesita})`).join("\n");
          throw new Error(`Stock insuficiente:\n${msg}`);
        }
        throw new Error(d.message || `HTTP ${r.status}`);
      }
      clearCart();
      alert("Compra realizada. Recibirá la factura por e-mail.");
      location.href = "/catalog";
    }catch(e){
      EL.err.textContent = e.message || "No se pudo generar la factura";
      EL.err.hidden = false;
    }
  });
}

init();