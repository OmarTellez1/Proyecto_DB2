const EL = {
  code: document.getElementById("code"),
  date: document.getElementById("date"),
  total: document.getElementById("total"),
  c_name: document.getElementById("c_name"),
  c_ci: document.getElementById("c_ci"),
  c_phone: document.getElementById("c_phone"),
  c_mail: document.getElementById("c_mail"),
  tbody: document.getElementById("tbody"),
};

const CURRENCY = "USD";
const fmt = v => new Intl.NumberFormat("es-EC",{ style:"currency", currency:CURRENCY }).format(Number(v||0));

async function load(){
  const id = decodeURIComponent(location.pathname.split("/").pop());
  try{
    const r = await fetch(`/api/invoices/${encodeURIComponent(id)}`);
    if (!r.ok) throw new Error("No se pudo cargar la factura");
    const v = await r.json();

    EL.code.textContent = v.code || String(v.id).padStart(6,"0");
    EL.date.textContent = v.date ? new Date(v.date).toLocaleDateString() : "-";
    EL.total.textContent = fmt(v.total);
    EL.c_name.textContent = v.customer?.name || "-";
    EL.c_ci.textContent = v.customer?.ci || "-";
    EL.c_phone.textContent = v.customer?.phone || "-";
    EL.c_mail.textContent = v.customer?.email || "-";

    EL.tbody.innerHTML = "";
    for (const it of v.items || []){
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${Number(it.qty)}</td>
        <td>${it.name || ""}</td>
        <td>${fmt(it.unit)}</td>
        <td>${fmt(it.total ?? (Number(it.qty)*Number(it.unit)))}</td>
      `;
      EL.tbody.appendChild(tr);
    }
  }catch(e){
    alert(e.message || "Error");
    history.back();
  }
}

load();