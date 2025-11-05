/**
 * Se ejecuta cuando el contenido del HTML ha sido cargado.
 * Protege la página y luego obtiene y muestra la lista de usuarios.
 */
document.addEventListener('DOMContentLoaded', () => {

  const token = localStorage.getItem('token');
  const usuarioStr = localStorage.getItem('usuario');
  
  // 1. Guardia de Seguridad:
  // Verificamos si el usuario es Admin. Si no, lo expulsamos.
  if (!token || !usuarioStr) {
    // Si no hay token o usuario, redirige a login
    window.location.href = 'login.html';
    return; // Detenemos la ejecución
  }
  
  const usuario = JSON.parse(usuarioStr);
  
  if (usuario.rol !== 'Admin') {
    // Si el rol no es Admin, redirige a la tienda (o donde sea)
    alert('Acceso denegado. No tienes permisos de administrador.');
    window.location.href = 'catalog.html';
    return; // Detenemos la ejecución
  }

  // Si llegamos aquí, el usuario es un Admin. Procedemos a cargar los datos.
  fetchUsers(token);
});

/**
 * Llama a la API de 'GET /api/usuarios' enviando el token
 * y luego llama a la función para renderizar la tabla.
 */
async function fetchUsers(token) {
  try {
    const respuesta = await fetch('http://localhost:3000/api/usuarios', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}` // ¡Clave de seguridad!
      }
    });

    if (!respuesta.ok) {
      // Si el token expiró o algo salió mal
      throw new Error('Error al obtener los usuarios. Código: ' + respuesta.status);
    }

    const usuarios = await respuesta.json();
    renderUserTable(usuarios);

  } catch (error) {
    console.error('Error en fetchUsers:', error.message);
    alert('No se pudieron cargar los usuarios. ¿Tu token expiró?');
    window.location.href = 'login.html'; // Enviar a login si falla
  }
}

/**
 * Toma el array de usuarios y construye las filas de la tabla
 * en el <tbody> con id="tbody".
 */
function renderUserTable(usuarios) {
  const tbody = document.getElementById('tbody');
  const emptyMessage = document.getElementById('empty');

  // Limpiamos cualquier contenido previo
  tbody.innerHTML = '';

  // 1. Verificamos si la respuesta está vacía
  if (usuarios.length === 0) {
    emptyMessage.hidden = false; // Mostramos el mensaje "No hay usuarios"
    return;
  }

  // 2. Si hay datos, ocultamos el mensaje de vacío
  emptyMessage.hidden = true;

  // 3. Creamos una fila (<tr>) por cada usuario
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
    `;
    // (Opcional) Aquí puedes añadir botones de Editar/Borrar
    // tr.innerHTML += '<td><button>Editar</button></td>';

    tbody.appendChild(tr);
  });
}