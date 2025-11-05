/**
 * Se ejecuta cuando el contenido del HTML ha sido cargado.
 * 1. Protege la ruta (Guardia de Admin).
 * 2. Maneja el botón de "Cerrar Sesión".
 */
document.addEventListener('DOMContentLoaded', () => {

  // --- 1. GUARDIA DE SEGURIDAD (SOLO ADMIN) ---
  const token = localStorage.getItem('token');
  const usuarioStr = localStorage.getItem('usuario');

  if (!token || !usuarioStr || JSON.parse(usuarioStr).rol !== 'Admin') {
    alert('Acceso denegado. Debes ser administrador.');
    window.location.href = 'login.html';
    return; // Detenemos la ejecución
  }

  // --- 2. LÓGICA DE CERRAR SESIÓN ---
  const logoutButton = document.getElementById('logout-button');

  if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
      e.preventDefault(); // Prevenimos que el enlace '#' recargue la página

      if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        // Borramos los datos de sesión del navegador
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        
        // Enviamos al login
        window.location.href = 'login.html';
      }
    });
  }

});