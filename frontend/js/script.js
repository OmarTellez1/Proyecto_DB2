// Config: ajusta si tu backend expone otra ruta base
const API_BASE = `${window.location.origin}/api/tasks`;

// DOM refs
const form = document.getElementById("task-form");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const list = document.getElementById("tasks");
const tpl = document.getElementById("task-item-tpl");

// Estado simple en memoria
let tasks = [];

// Utils
const getId = (t) => String(t?.id ?? t?.task_id ?? "");
const json = async (res) => {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      if (err?.message) msg += ` - ${err.message}`;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
};

// Render
function render() {
  list.innerHTML = "";
  const frag = document.createDocumentFragment();
  for (const t of tasks) {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.id = getId(t);
    node.querySelector(".title").textContent = t.title ?? "";
    node.querySelector(".description").textContent = t.description ?? "";
    frag.appendChild(node);
  }
  list.appendChild(frag);
}

// CRUD
async function fetchTasks() {
  try {
    const data = await fetch(API_BASE).then(json);
    tasks = Array.isArray(data) ? data : data?.rows ?? [];
    render();
  } catch (e) {
    console.error(e);
    alert("No se pudo cargar el listado.");
  }
}

async function createTask(payload) {
  try {
    const created = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(json);
    tasks.push(created);
    render();
  } catch (e) {
    console.error(e);
    alert("No se pudo crear la tarea.");
  }
}

async function updateTask(id, payload) {
  try {
    const updated = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(json);
    const idx = tasks.findIndex((t) => getId(t) === String(id));
    if (idx >= 0) tasks[idx] = updated;
    render();
  } catch (e) {
    console.error(e);
    alert("No se pudo actualizar la tarea.");
  }
}

async function deleteTask(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    tasks = tasks.filter((t) => getId(t) !== String(id));
    render();
  } catch (e) {
    console.error(e);
    alert("No se pudo eliminar la tarea.");
  }
}

// Eventos
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  if (!title) return;
  await createTask({ title, description });
  form.reset();
  titleInput.focus();
});

list.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const li = e.target.closest("li.task");
  const id = li?.dataset?.id;
  if (!id) return;

  if (btn.classList.contains("delete")) {
    if (confirm("¿Eliminar tarea?")) {
      await deleteTask(id);
    }
    return;
  }

  if (btn.classList.contains("edit")) {
    const current = tasks.find((t) => getId(t) === String(id));
    const newTitle = prompt("Nuevo título:", current?.title ?? "");
    if (newTitle === null) return;
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    const newDesc = prompt("Nueva descripción:", current?.description ?? "");
    await updateTask(id, { title: trimmed, description: newDesc ?? current?.description ?? "" });
    return;
  }
});

// Init
window.addEventListener("DOMContentLoaded", fetchTasks);
