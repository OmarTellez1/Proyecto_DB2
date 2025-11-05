const T = document.getElementById("tbody");
const E = document.getElementById("empty");
const Q = document.getElementById("q");
const R = document.getElementById("reload");

function normalize(p){
  return {
    id: String(p.id ?? p.id_producto ?? ""),
    name: p.name ?? p.nombre_producto ?? "",
    price: Number(p.price ?? p.precio_unitario ?? 0),
    stock: Number(p.stock ?? p.unidades_disponibles ?? 0),
  };
}

async function getProducts(){
  try{
    const r = await fetch("/api/products");
    if(!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d) ? d.map(normalize) : [];
  }catch{ return []; }
}

async function saveProduct(p){
  const body = { name: p.name, price: p.price, stock: p.stock };
  const r = await fetch(`/api/products/${encodeURIComponent(p.id)}`, {
    method:"PATCH",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(body)
  });
  if(!r.ok){
    const d = await r.json().catch(()=> ({}));
    throw new Error(d.message || `HTTP ${r.status}`);
  }
}

function render(rows){
  T.innerHTML = "";
  if(!rows.length){ E.hidden=false; return; }
  E.hidden = true;

  for(const p of rows){
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td><input value="${p.name}"></td>
      <td><input type="number" step="0.01" value="${p.price}"></td>
      <td><input type="number" step="1" value="${p.stock}"></td>
      <td class="row-actions">
        <button class="btn save">Guardar</button>
      </td>
    `;
    const [nameI, priceI, stockI] = tr.querySelectorAll("input");
    tr.querySelector(".save").addEventListener("click", async ()=>{
      const payload = {
        id: p.id,
        name: nameI.value.trim(),
        price: Number(priceI.value),
        stock: Number(stockI.value),
      };
      try{
        tr.querySelector(".save").disabled = true;
        await saveProduct(payload);
        alert("Producto actualizado");
      }catch(e){ alert(e.message || "No se pudo actualizar"); }
      finally{ tr.querySelector(".save").disabled = false; }
    });
    T.appendChild(tr);
  }
}

function filter(rows, q){
  if(!q) return rows;
  const s = q.toLowerCase();
  return rows.filter(p => String(p.id).toLowerCase().includes(s) || (p.name||"").toLowerCase().includes(s));
}

let DATA = [];
async function load(){ DATA = await getProducts(); render(filter(DATA, Q.value.trim())); }
Q.addEventListener("input", () => render(filter(DATA, Q.value.trim())));
R.addEventListener("click", load);
load();