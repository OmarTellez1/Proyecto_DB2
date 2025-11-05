const form = document.getElementById("form");
const btn = document.getElementById("btnSubmit");
const errorBox = document.getElementById("error");

function setLoading(v){ btn.disabled = v; btn.textContent = v ? "Guardando..." : "Confirmar"; }
function onlyDigits(s){ return String(s||"").replace(/\D+/g,""); }
function isEmail(s){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s||"").toLowerCase()); }
function showErr(msg){ errorBox.textContent = msg; errorBox.hidden = false; }
function clearErr(){ errorBox.textContent = ""; errorBox.hidden = true; }

let pending = false;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (pending) return;
  clearErr();

  // Lee y valida primero (no bloquees con pending aún)
  const firstName = document.getElementById("firstName").value.trim();
  const lastName  = document.getElementById("lastName").value.trim();
  const ciOrRuc   = onlyDigits(document.getElementById("ciOrRuc").value);
  const phone     = onlyDigits(document.getElementById("phone").value);
  const email     = document.getElementById("email").value.trim();
  const password  = document.getElementById("password")?.value || "";

  if (!firstName || !lastName) { showErr("Nombre y apellido son requeridos."); return; }
  if (!(ciOrRuc.length === 10 || ciOrRuc.length === 13)) { showErr("RUC/CI debe tener 10 o 13 dígitos."); return; }
  if (phone.length < 9 || phone.length > 10) { showErr("Celular debe tener 9-10 dígitos."); return; }
  if (!isEmail(email)) { showErr("E-mail inválido."); return; }

  // Mapea a los nombres que espera el backend
  const payload = {
    nombre: firstName,
    apellido: lastName,
    cedula: ciOrRuc,
    celular: phone,
    correo: email,
    contrasena: password
  };

  pending = true;
  setLoading(true);
  try{
    const token = localStorage.getItem("token") || "";

    const resp = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(data.message || (resp.status === 403 ? "No autorizado" : `HTTP ${resp.status}`));

    alert("Usuario creado correctamente.");
    // Redirige donde corresponda en tu app
    window.location.href = "/admin/usuarios";
  }catch(err){
    showErr(err.message || "No se pudo crear el usuario.");
  }finally{
    setLoading(false);
    pending = false;
  }
});