/**
 * Se ejecuta cuando el contenido del HTML ha sido cargado.
 * 1. Protege la ruta (solo Admin).
 * 2. Obtiene los productos de la API.
 * 3. Renderiza los productos usando la plantilla <template>.
 * 4. Maneja los clics de 'Editar' y 'Eliminar'.
 */
document.addEventListener('DOMContentLoaded', () => {

  // --- 1. ESTADO Y AUTENTICACIÓN ---
  const token = localStorage.getItem('token');
  const usuarioStr = localStorage.getItem('usuario');

  //Aqui solia estar el guardia de seguridad que ahora se encuentra en admin-layout.js como 2.
  
  // --- 3. SELECCIÓN DE ELEMENTOS DEL DOM ---
  const grid = document.getElementById('grid');
  const template = document.getElementById('card-tpl');

  // --- 4. FUNCIÓN PRINCIPAL: OBTENER PRODUCTOS ---
  async function fetchProducts() {
    try {
      // La API GET /api/productos es pública, no necesita token
      const respuesta = await fetch('http://localhost:3000/api/productos');
      
      if (!respuesta.ok) {
        throw new Error('No se pudieron cargar los productos.');
      }
      
      const productos = await respuesta.json();
      renderProducts(productos);

    } catch (error) {
      console.error(error.message);
      grid.innerHTML = `<p class="error">${error.message}</p>`;
    }
  }

  // --- 5. RENDERIZADO: DIBUJAR LOS PRODUCTOS ---
  function renderProducts(productos) {
    grid.innerHTML = ''; // Limpiamos la cuadrícula
    
    if (!productos || productos.length === 0) {
      grid.innerHTML = '<p>No hay productos en el inventario.</p>';
      return;
    }

    productos.forEach(prod => {
      // 1. Clonamos el contenido de la plantilla
      const card = template.content.cloneNode(true);

      // 2. Rellenamos los datos del clon
      card.querySelector('.name').textContent = prod.nombre_producto;
      card.querySelector('.desc').textContent = prod.descripcion || 'Sin descripción';
      card.querySelector('.stock').value = prod.unidades_disponibles;

      // 3. Añadimos los IDs a los botones y a la tarjeta
      // (Usamos .closest('.card') en el listener, pero es bueno tenerlo)
      card.querySelector('.card').dataset.id = prod.id_producto;
      card.querySelector('.edit').dataset.id = prod.id_producto;
      card.querySelector('.del').dataset.id = prod.id_producto;

      // 4. Añadimos el clon a la cuadrícula
      grid.appendChild(card);
    });
  }

  // --- 6. MANEJADORES DE EVENTOS (Editar y Eliminar) ---
  grid.addEventListener('click', async (e) => {
    // Usamos .closest() para asegurarnos de capturar el clic
    // incluso si se hace sobre el ícono SVG dentro del botón.
    
    // Botón EDITAR
    if (e.target.closest('.edit')) {
      const id = e.target.closest('.edit').dataset.id;
      // Redirigimos a la página de edición con el ID en la URL
      window.location.href = `inventory-update.html?id=${id}`;
      return; // Salimos
    }

    // Botón ELIMINAR (DEL)
    if (e.target.closest('.del')) {
      const id = e.target.closest('.del').dataset.id;
      
      if (confirm(`¿Estás seguro de que quieres eliminar el producto ID ${id}? Esta acción es permanente.`)) {
        try {
          await deleteProduct(id, token);
          // Si tiene éxito, eliminamos la tarjeta del DOM
          e.target.closest('.card').remove();
          
          if (grid.children.length === 0) {
            grid.innerHTML = '<p>No hay productos en el inventario.</p>';
          }

        } catch (error) {
          alert(`Error al eliminar: ${error.message}`);
        }
      }
    }
  });
  
  // --- 7. FUNCIÓN DE BORRADO ---
  async function deleteProduct(id, token) {
    // Recordar: Estamos haciendo HARD DELETE (borrado físico) para productos.
    const respuesta = await fetch(`http://localhost:3000/api/productos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}` // ¡Enviamos el token de Admin!
      }
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(data.message || 'Error al eliminar el producto.');
    }
    
    return data;
  }

  // --- 8. EJECUCIÓN INICIAL ---
  fetchProducts();

});