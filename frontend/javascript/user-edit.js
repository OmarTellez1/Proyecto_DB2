/**
 * Se ejecuta cuando el contenido del HTML ha sido cargado.
 * 1. Protege la página (Guardia de Admin).
 * 2. Obtiene el ID del usuario desde la URL.
 * 3. Rellena el formulario con los datos de ese usuario (GET).
 * 4. Maneja el envío del formulario para actualizar (PUT).
 */
document.addEventListener('DOMContentLoaded', async () => {

  
  const token = localStorage.getItem('token');
  const usuarioStr = localStorage.getItem('usuario');
  
//Aqui solia estar el guardia de seguridad que ahora se encuentra en admin-layout.js como 1.

  // 2. Obtener el ID del usuario desde la URL
  // (Si la URL es ?id=16, esto nos dará "16")
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('id');

  if (!userId) {
    alert('No se especificó un ID de usuario.');
    window.location.href = 'user-list.html';
    return;
  }

  // 3. Seleccionamos los elementos del DOM
  const userForm = document.getElementById('form');
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  const ciOrRucInput = document.getElementById('ciOrRuc');
  const phoneInput = document.getElementById('phone');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rolInput = document.getElementById('rol');
  const errorMessage = document.getElementById('error');

  // 4. Rellenar el formulario (Función GET)
  try {
    const respuesta = await fetch(`http://localhost:3000/api/usuarios/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!respuesta.ok) {
      throw new Error('No se pudo cargar la información del usuario.');
    }

    const usuario = await respuesta.json();

    // Rellenamos el formulario con los datos del usuario
    firstNameInput.value = usuario.nombre;
    lastNameInput.value = usuario.apellido;
    ciOrRucInput.value = usuario.cedula;
    phoneInput.value = usuario.celular || ''; // Usamos || '' por si es nulo
    emailInput.value = usuario.correo_electronico;
    rolInput.value = usuario.rol;
    // La contraseña se deja en blanco intencionalmente

  } catch (error) {
    console.error('Error al cargar usuario:', error.message);
    errorMessage.textContent = error.message;
    errorMessage.hidden = false;
  }

  // 5. Manejar el envío del formulario (Función PUT)
  userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.hidden = true;

    // Recolectamos los datos del formulario
    const datosActualizados = {
      nombre: firstNameInput.value,
      apellido: lastNameInput.value,
      cedula: ciOrRucInput.value,
      celular: phoneInput.value,
      correo_electronico: emailInput.value,
      rol: rolInput.value
    };

    // ¡IMPORTANTE! Solo añadimos la contraseña al objeto
    // si el usuario escribió algo en el campo.
    if (passwordInput.value && passwordInput.value.length > 0) {
      datosActualizados.contrasena = passwordInput.value;
    }

    // Llamamos a la API para actualizar (PUT)
    try {
      const respuesta = await fetch(`http://localhost:3000/api/usuarios/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosActualizados)
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        // Si falla (ej. 409 Cédula duplicada)
        throw new Error(data.message || 'Error al actualizar.');
      }

      // ¡Éxito!
      alert('Usuario actualizado exitosamente.');
      window.location.href = 'user-list.html'; // Volvemos a la lista

    } catch (error) {
      console.error('Error al actualizar usuario:', error.message);
      errorMessage.textContent = error.message;
      errorMessage.hidden = false;
    }
  });

});