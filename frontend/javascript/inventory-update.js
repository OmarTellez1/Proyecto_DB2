/**
 * Se ejecuta cuando el contenido del HTML ha sido cargado.
 * 1. Protege la ruta (Guardia de Admin).
 * 2. Obtiene el ID del producto desde la URL.
 * 3. Rellena el formulario con los datos de ese producto (GET).
 * 4. Maneja el envío del formulario para actualizar (PUT).
 */
document.addEventListener('DOMContentLoaded', async () => {

  // --- 1. ESTADO Y AUTENTICACIÓN ---
  const token = localStorage.getItem('token');
  const usuarioStr = localStorage.getItem('usuario');

  //Aqui solia estar el guardia de seguridad que ahora se encuentra en admin-layout.js como 2.

  // --- 3. OBTENER ID DEL PRODUCTO DE LA URL ---
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    alert('No se especificó un ID de producto.');
    window.location.href = 'inventory.html'; // Devolver a la lista
    return;
  }

  // --- 4. SELECCIÓN DE ELEMENTOS DEL DOM ---
  const productForm = document.getElementById('form');
  const nombreInput = document.getElementById('nombre_producto');
  const descripcionInput = document.getElementById('descripcion');
  const precioInput = document.getElementById('precio_unitario');
  const unidadesInput = document.getElementById('unidades_disponibles');
  const errorMessage = document.getElementById('error');

  // --- 5. RELLENAR EL FORMULARIO (GET /api/productos/:id) ---
  try {
    // Esta API es pública, no necesitamos token para el GET
    const respuesta = await fetch(`http://localhost:3000/api/productos/${productId}`);
    
    if (!respuesta.ok) {
      throw new Error('No se pudo cargar la información del producto.');
    }

    const producto = await respuesta.json();

    // Rellenamos el formulario con los datos
    nombreInput.value = producto.nombre_producto;
    descripcionInput.value = producto.descripcion || '';
    precioInput.value = producto.precio_unitario;
    unidadesInput.value = producto.unidades_disponibles;

  } catch (error) {
    console.error('Error al cargar producto:', error.message);
    errorMessage.textContent = error.message;
    errorMessage.hidden = false;
  }

  // --- 6. MANEJAR EL ENVÍO (PUT /api/productos/:id) ---
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.hidden = true;

    // Recolectamos los datos actualizados del formulario
    const datosActualizados = {
      nombre_producto: nombreInput.value,
      descripcion: descripcionInput.value,
      precio_unitario: parseFloat(precioInput.value),
      unidades_disponibles: parseInt(unidadesInput.value)
    };

    // Validamos que los números sean válidos
    if (isNaN(datosActualizados.precio_unitario) || isNaN(datosActualizados.unidades_disponibles)) {
        errorMessage.textContent = 'Precio y Unidades deben ser números válidos.';
        errorMessage.hidden = false;
        return;
    }

    // Llamamos a la API para actualizar (PUT)
    try {
      const respuesta = await fetch(`http://localhost:3000/api/productos/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // ¡Token de Admin requerido!
        },
        body: JSON.stringify(datosActualizados)
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.message || 'Error al actualizar el producto.');
      }

      // ¡Éxito!
      alert('Producto actualizado exitosamente.');
      window.location.href = 'inventory.html'; // Volvemos a la lista

    } catch (error) {
      console.error('Error al actualizar producto:', error.message);
      errorMessage.textContent = error.message;
      errorMessage.hidden = false;
    }
  });

});