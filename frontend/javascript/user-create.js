/**
 * Se ejecuta cuando el contenido del HTML ha sido cargado.
 * Protege la página y maneja el formulario de creación de usuarios.
 */
document.addEventListener('DOMContentLoaded', () => {

  // 1. Guardia de Seguridad:
  // (Esta es la misma lógica de 'user-list.js' para proteger la página)
  const token = localStorage.getItem('token');
  const usuarioStr = localStorage.getItem('usuario');
  
  if (!token || !usuarioStr || JSON.parse(usuarioStr).rol !== 'Admin') {
    // Si no es Admin, lo expulsamos al login
    alert('Acceso denegado.');
    window.location.href = 'login.html'; 
    return; // Detenemos la ejecución
  }

  // 2. Seleccionamos los elementos del DOM (de user-create.html)
  const userForm = document.getElementById('form');
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  const ciOrRucInput = document.getElementById('ciOrRuc');
  const phoneInput = document.getElementById('phone');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rolInput = document.getElementById('rol'); // El <select> que añadiremos
  const errorMessage = document.getElementById('error');

  // 3. Escuchamos el evento 'submit' del formulario
  userForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevenimos el envío tradicional

    // Ocultamos errores previos
    errorMessage.hidden = true;
    errorMessage.textContent = '';

    // 4. Recolectamos los datos del formulario
    const datosUsuario = {
      nombre: firstNameInput.value,
      apellido: lastNameInput.value,
      cedula: ciOrRucInput.value,
      celular: phoneInput.value,
      correo_electronico: emailInput.value,
      contrasena: passwordInput.value,
      rol: rolInput.value
    };

    // 5. Validación simple (nuestra API también valida, pero esto es más rápido)
    // Nota: Nuestra API requiere la contraseña
    if (!datosUsuario.nombre || !datosUsuario.apellido || !datosUsuario.cedula || !datosUsuario.correo_electronico || !datosUsuario.contrasena || !datosUsuario.rol) {
      errorMessage.textContent = 'Todos los campos (incluyendo contraseña y rol) son obligatorios.';
      errorMessage.hidden = false;
      return;
    }

    // 6. Intentamos llamar a la API para crear el usuario
    try {
      const respuesta = await fetch('http://localhost:3000/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // ¡Enviamos el token de Admin!
        },
        body: JSON.stringify(datosUsuario)
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        // Si la API devuelve un error (ej. 409 "Cédula ya existe")
        throw new Error(data.message || 'Error al crear el usuario.');
      }

      // 7. ¡Éxito!
      alert('¡Usuario creado exitosamente!');
      window.location.href = 'user-list.html'; // Devolvemos al admin a la lista

    } catch (error) {
      // 8. Manejo de errores (de red o de la API)
      console.error('Error al crear usuario:', error.message);
      errorMessage.textContent = error.message;
      errorMessage.hidden = false;
    }
  });
});