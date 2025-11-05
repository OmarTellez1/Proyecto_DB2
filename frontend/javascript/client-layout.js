/**
 * Se ejecuta cuando el contenido del HTML ha sido cargado.
 * 1. Protege la ruta (Guardia de Cliente).
 * 2. Maneja el botón de "Cerrar Sesión".
 */
document.addEventListener('DOMContentLoaded', () => {

  // --- 1. GUARDIA DE SEGURIDAD (SOLO CLIENTE) ---
  const token = localStorage.getItem('token');
  const usuarioStr = localStorage.getItem('usuario');

  if (!token || !usuarioStr) {
    alert('Acceso denegado. Por favor, inicia sesión.');
    window.location.href = 'login.html'; // Usamos ruta relativa
    return; // Detenemos la ejecución
  }

  // Verificamos el ROL
  const usuario = JSON.parse(usuarioStr);
  if (usuario.rol !== 'Cliente') {
    alert('Acceso denegado. Esta página es solo para clientes.');
    window.location.href = 'login.html'; // Lo sacamos
    return;
  }

  // --- 2. LÓGICA DE CERRAR SESIÓN ---
  const logoutButton = document.getElementById('logout-button');

  if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
      e.preventDefault(); // Prevenimos que el enlace '#' recargue

      if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        // Borramos los datos de sesión del navegador
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        // ¡Importante! Borramos el carrito también
        localStorage.removeItem('cart'); 
        
        // Enviamos al login
        window.location.href = 'login.html';
      }
    });
  }
});