/**
 * Se ejecuta cuando el contenido del HTML ha sido cargado.
 * 1. Protege la página (sólo Clientes).
 * 2. Carga los datos del usuario (desde la API) y del carrito (desde localStorage).
 * 3. Maneja la lógica de compra (API POST /facturas).
 */
document.addEventListener('DOMContentLoaded', async () => {

  // --- 1. OBTENER ESTADO Y SEGURIDAD ---
  const token = localStorage.getItem('token');
  const usuarioStr = localStorage.getItem('usuario');
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Guardia de Seguridad: ahora es client-layout.js
  // El layout ya verificó la seguridad, pero este script 
  // necesita definir la variable 'usuario' para usarla.
  if (!usuarioStr) {
    // Si algo falló y no hay usuario, nos detenemos.
    console.error("Error: No se encontró 'usuario' en localStorage.");
    return;
  }
  const usuario = JSON.parse(usuarioStr);

  // Guardia de Carrito:
  if (cart.length === 0) {
    alert('Tu carrito está vacío.');
    window.location.href = 'catalog.html'; // Devolver al catálogo
    return;
  }

  // --- 2. SELECCIONAR ELEMENTOS DEL DOM ---
  const form = document.getElementById('form');
  const inputName = document.getElementById('c_name');
  const inputCI = document.getElementById('c_ci');
  const inputPhone = document.getElementById('c_phone');
  const inputEmail = document.getElementById('c_mail');
  const tbody = document.getElementById('tbody');
  const grandTotalEl = document.getElementById('grand-total');
  const btnBuy = document.getElementById('btn-buy');
  const btnClear = document.getElementById('btn-clear');
  const errorEl = document.getElementById('err');

  // --- 3. FUNCIONES DE RENDERIZADO ---

  /**
   * Llama a la API GET /usuarios/:id para obtener los datos
   * completos del cliente y rellenar el formulario.
   */
  async function loadUserDetails() {
    try {
      const respuesta = await fetch(`http://localhost:3000/api/usuarios/${usuario.id_usuario}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!respuesta.ok) throw new Error('No se pudieron cargar los datos del usuario.');
      
      const userDetails = await respuesta.json();
      
      // Rellenamos el formulario
      inputName.value = `${userDetails.nombre} ${userDetails.apellido}`;
      inputCI.value = userDetails.cedula;
      inputPhone.value = userDetails.celular || '';
      inputEmail.value = userDetails.correo_electronico;
      
      // Deshabilitamos los campos para que el usuario no los cambie
      inputName.disabled = true;
      inputCI.disabled = true;
      inputEmail.disabled = true;

    } catch (error) {
      showError(error.message);
    }
  }

  /**
   * Dibuja la tabla de productos basada en el carrito (cart).
   */
  function renderCart() {
    tbody.innerHTML = ''; // Limpiamos la tabla
    let total = 0;

    cart.forEach(item => {
      const tr = document.createElement('tr');
      const itemTotal = item.precio_unitario * item.unidades;
      total += itemTotal;

      tr.innerHTML = `
        <td>${item.unidades}</td>
        <td>${item.nombre}</td>
        <td>$${Number(item.precio_unitario).toFixed(2)}</td>
        <td>$${itemTotal.toFixed(2)}</td>
        <td>
          <button type="button" class="btn-remove-item" data-id="${item.id_producto}">X</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Actualizamos el total general
    grandTotalEl.textContent = `$${total.toFixed(2)}`;
  }

  /**
   * Guarda el estado actual del carrito en localStorage.
   */
  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  // --- 4. MANEJADORES DE EVENTOS ---

  /**
   * Manejador del botón "Comprar" (submit).
   */
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evitamos que la página se recargue
    showError(''); // Limpiamos errores

    // Validamos que los campos (celular) estén llenos
    if (!inputPhone.value) {
      showError('Por favor, ingresa tu número de celular.');
      return;
    }

    // Deshabilitamos el botón para evitar doble clic
    btnBuy.disabled = true;
    btnBuy.textContent = 'Procesando...';

    // 1. Formateamos el carrito para la API (solo ID y unidades)
    const itemsParaAPI = cart.map(item => ({
      id_producto: item.id_producto,
      unidades: item.unidades
    }));

    // 2. Llamamos a la API de facturación
    try {
      const respuesta = await fetch('http://localhost:3000/api/facturas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: itemsParaAPI })
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        // Si falla (ej. 409 "Stock insuficiente"), mostramos el error
        throw new Error(data.message || 'Error al procesar la compra.');
      }

      // 3. ¡ÉXITO!
      alert('¡Compra exitosa! Tu factura ha sido enviada a tu correo.');
      localStorage.removeItem('cart'); // Limpiamos el carrito
      window.location.href = 'catalog.html'; // Enviamos de vuelta al catálogo

    } catch (error) {
      console.error('Error al comprar:', error.message);
      showError(error.message);
      btnBuy.disabled = false; // Reactivamos el botón
      btnBuy.textContent = 'Comprar';
    }
  });

  /**
   * Manejador para los botones "X" de la tabla.
   */
  tbody.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-remove-item')) {
      const id = e.target.dataset.id;
      // Quitamos el ítem del carrito
      cart = cart.filter(item => item.id_producto != id);
      
      // Si el carrito queda vacío, lo mandamos de vuelta al catálogo
      if (cart.length === 0) {
        alert('Carrito vacío.');
        localStorage.removeItem('cart');
        window.location.href = 'catalog.html';
      } else {
        // Si no, guardamos y redibujamos la tabla
        saveCart();
        renderCart();
      }
    }
  });

  /**
   * Manejador del botón "Vaciar carrito".
   */
  btnClear.addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      localStorage.removeItem('cart');
      window.location.href = 'catalog.html';
    }
  });


  // --- 5. EJECUCIÓN INICIAL ---
  loadUserDetails();
  renderCart();

});