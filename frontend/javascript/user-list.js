/**
 * Se ejecuta cuando el contenido del HTML ha sido cargado.
 * Protege la página y luego obtiene y muestra la lista de usuarios.
 */
document.addEventListener('DOMContentLoaded', () => {

  const token = localStorage.getItem('token');
  const usuarioStr = localStorage.getItem('usuario');
  
  //Aqui solia estar el guardia de seguridad que ahora se encuentra en admin-layout.js como 1.
 

  // 2. Cargamos los usuarios
  fetchUsers(token);

  // 3. Manejador de Clics para 'Editar' y 'Desactivar'
  const tbody = document.getElementById('tbody');
  tbody.addEventListener('click', async (e) => {
    
    // --- LÓGICA DE DESACTIVAR (Ya existe) ---
    if (e.target.classList.contains('btn-delete')) {
      const id = e.target.dataset.id; 
      
      if (confirm(`¿Estás seguro de que quieres desactivar al usuario con ID ${id}?`)) {
        try {
          await deleteUser(id, token);
          e.target.closest('tr').remove();
          
          if (tbody.rows.length === 0) {
            document.getElementById('empty').hidden = false;
          }
        } catch (error) {
          alert(error.message); 
        }
      }
    }

    // --- ¡NUEVO! LÓGICA DE EDITAR ---
    if (e.target.classList.contains('btn-edit')) {
      const id = e.target.dataset.id; // Obtenemos el ID del botón

      // Redirigimos al navegador a la página de edición,
      // pasando el ID como un "parámetro de consulta" (query param)
      window.location.href = `user-edit.html?id=${id}`;
    }
    // --- FIN DE LO NUEVO ---

  });

});

/**
 * Llama a la API de 'GET /api/usuarios' enviando el token
 * y luego llama a la función para renderizar la tabla.
 */
async function fetchUsers(token) {
  // ... (Esta función no cambia) ...
  try {
    const respuesta = await fetch('http://localhost:3000/api/usuarios', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!respuesta.ok) {
      throw new Error('Error al obtener los usuarios. Código: ' + respuesta.status);
    }

    const usuarios = await respuesta.json();
    renderUserTable(usuarios);

  } catch (error) {
    console.error('Error en fetchUsers:', error.message);
    alert('No se pudieron cargar los usuarios. ¿Tu token expiró?');
    window.location.href = 'login.html';
  }
}

/**
 * Toma el array de usuarios y construye las filas de la tabla
 * en el <tbody> con id="tbody".
 */
function renderUserTable(usuarios) {
  // ... (Esta función no cambia, ya que los botones ya están incluidos) ...
  const tbody = document.getElementById('tbody');
  const emptyMessage = document.getElementById('empty');
  tbody.innerHTML = '';

  if (usuarios.length === 0) {
    emptyMessage.hidden = false;
    return;
  }

  emptyMessage.hidden = true;

  usuarios.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${user.id_usuario}</td>
      <td>${user.nombre}</td>
      <td>${user.apellido}</td>
      <td>${user.cedula}</td>
      <td>${user.celular || 'N/A'}</td>
      <td>${user.correo_electronico}</td>
      <td>${user.rol}</td>
      <td>${user.estado ? 'Activo' : 'Inactivo'}</td>
      <td>
        <button class="btn-edit" data-id="${user.id_usuario}">Editar</button>
        <button class="btn-delete" data-id="${user.id_usuario}">Desactivar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Llama a la API 'DELETE /api/usuarios/:id' para el borrado lógico.
 */
async function deleteUser(id, token) {
  // ... (Esta función no cambia) ...
  const respuesta = await fetch(`http://localhost:3000/api/usuarios/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.message);
  }

  return data;
}