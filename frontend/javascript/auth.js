/**
 * Se ejecuta cuando todo el contenido del HTML ha sido cargado.
 * Es la forma más segura de asegurarse de que 'login-form' existe
 * antes de intentar asignarle un 'listener'.
 */
document.addEventListener('DOMContentLoaded', () => {

  // 1. Seleccionamos los elementos del DOM (de login.html)
  const loginForm = document.getElementById('login-form');
  const userInput = document.getElementById('user');
  const passwordInput = document.getElementById('password');
  const errorMessage = document.getElementById('error');

  // 2. Escuchamos el evento 'submit' del formulario
  loginForm.addEventListener('submit', async (e) => {
    
    // 3. Prevenimos que el formulario se envíe de la forma tradicional (recargando la página)
    e.preventDefault();

    // Limpiamos errores anteriores
    errorMessage.textContent = '';
    errorMessage.hidden = true;

    // 4. Obtenemos los valores de los inputs
    // Aunque el ID del input es 'user', sabemos que el backend espera la 'cedula'
    const cedula = userInput.value;
    const contrasena = passwordInput.value;

    // 5. Intentamos hacer la petición fetch a la API de Login
    try {
      const respuesta = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          cedula: cedula, // Enviamos el valor de 'user' como 'cedula'
          contrasena: contrasena 
        })
      });

      // 6. Convertimos la respuesta a JSON
      const data = await respuesta.json();

      // 7. Si la respuesta NO fue exitosa (ej. 401 Credenciales inválidas)
      if (!respuesta.ok) {
        throw new Error(data.message || 'Error al iniciar sesión.');
      }

      // 8. ¡ÉXITO! Guardamos los datos en el navegador
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      // 9. Redirigimos según el ROL
      redirigirPorRol(data.usuario.rol);

    } catch (error) {
      // 10. Si algo falla (la red, o el error del paso 7)
      console.error('Error de login:', error.message);
      errorMessage.textContent = error.message;
      errorMessage.hidden = false; // Mostramos el elemento de error
    }
  });

  /**
   * Función de ayuda para redirigir al usuario basado en su rol.
   * Las rutas se basan en tu estructura de carpetas 'views/'.
   */
  function redirigirPorRol(rol) {
    if (rol === 'Admin') {
      // Si es Admin, lo enviamos a la lista de usuarios
      window.location.href = 'user-list.html'; // <-- RUTA CORREGIDA
    } else if (rol === 'Cliente') {
      // Si es Cliente, lo enviamos al catálogo de productos
      window.location.href = 'catalog.html'; // <-- RUTA CORREGIDA
    } else {
      console.error('Rol no reconocido:', rol);
    }
  }

});