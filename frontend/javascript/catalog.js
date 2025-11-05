/**
 * Se ejecuta cuando el contenido del HTML ha sido cargado.
 * Se encarga de proteger la ruta, obtener productos de la API,
 * renderizarlos y manejar la lógica del carrito de compras.
 */
document.addEventListener('DOMContentLoaded', () => {

  // --- 1. ESTADO Y AUTENTICACIÓN ---
  const token = localStorage.getItem('token');
  const usuarioStr = localStorage.getItem('usuario');
  
  // (Variable 'cart') Obtenemos el carrito de localStorage si existe, o creamos uno vacío.
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // --- 2. GUARDIA DE SEGURIDAD (SOLO CLIENTES) --- Fue borrado y ahora esta en client-layout.js
  

  // --- 3. SELECCIÓN DE ELEMENTOS DEL DOM ---
  const catalogGrid = document.getElementById('catalog-grid');
  const emptyMessage = document.getElementById('empty');
  const cartButton = document.getElementById('btn-cart');
  const cartCount = cartButton.querySelector('.count');
  const cartTotal = cartButton.querySelector('.total');
  const clearCartButton = document.getElementById('btn-cart-clear');

  // --- 4. FUNCIÓN PRINCIPAL: OBTENER PRODUCTOS ---
  async function fetchProducts() {
    try {
      // Esta API es pública, no requiere token, pero la página sí.
      const respuesta = await fetch('http://localhost:3000/api/productos');
      
      if (!respuesta.ok) {
        throw new Error('No se pudieron cargar los productos.');
      }
      
      const productos = await respuesta.json();
      renderProducts(productos);

    } catch (error) {
      console.error(error.message);
      emptyMessage.textContent = error.message;
      emptyMessage.hidden = false;
    }
  }

  // --- 5. RENDERIZADO: DIBUJAR LOS PRODUCTOS ---
  function renderProducts(productos) {
    catalogGrid.innerHTML = ''; // Limpiamos la cuadrícula
    
    if (!productos || productos.length === 0) {
      emptyMessage.hidden = false; // Mostramos "No hay productos"
      return;
    }
    
    emptyMessage.hidden = true;

    productos.forEach(prod => {
      // Creamos la tarjeta del producto
      const card = document.createElement('div');
      card.className = 'card';
      // Guardamos los datos del producto en el elemento
      card.dataset.id = prod.id_producto;
      card.dataset.nombre = prod.nombre_producto;
      card.dataset.precio = prod.precio_unitario;

      // Usamos el HTML de tu maqueta
      card.innerHTML = `
        <div class="card-image-placeholder"></div>
        <div class="card-content">
            <h3>${prod.nombre_producto}</h3>
            <p>${prod.descripcion || 'Descripción no disponible.'}</p>
            <p class="price">$${prod.precio_unitario}</p>
            <div class="actions">
                <button class="btn-qty btn-remove" data-id="${prod.id_producto}">-</button>
                <span class="qty" data-id="${prod.id_producto}">0</span>
                <button class="btn-qty btn-add" data-id="${prod.id_producto}">+</button>
            </div>
        </div>
      `;
      catalogGrid.appendChild(card);
    });

    // Actualizamos los contadores (ej. '0') con los datos del carrito
    updateQuantitiesInUI();
  }

  // --- 6. LÓGICA DEL CARRITO ---
  function addToCart(productId) {
    // Buscamos el producto en el array 'cart'
    let itemInCart = cart.find(item => item.id_producto == productId);
    
    // Obtenemos los datos de la tarjeta que renderizamos
    const productCard = catalogGrid.querySelector(`.card[data-id='${productId}']`);
    const nombre = productCard.dataset.nombre;
    const precio = parseFloat(productCard.dataset.precio);

    if (itemInCart) {
      // Si ya existe, solo aumentamos las unidades
      itemInCart.unidades++;
    } else {
      // Si es nuevo, lo añadimos al array
      cart.push({ 
        id_producto: parseInt(productId), 
        nombre: nombre, 
        precio_unitario: precio, 
        unidades: 1 
      });
    }
    saveCart();
  }

  function removeFromCart(productId) {
    let itemInCart = cart.find(item => item.id_producto == productId);
    
    if (itemInCart) {
      itemInCart.unidades--;
      if (itemInCart.unidades <= 0) {
        // Si las unidades llegan a 0, lo eliminamos del array
        cart = cart.filter(item => item.id_producto != productId);
      }
      saveCart();
    }
  }

  function saveCart() {
    // Guardamos el estado actual del carrito en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    // Actualizamos el botón flotante
    updateCartButton();
    // Actualizamos los contadores ('0') de las tarjetas
    updateQuantitiesInUI();
  }

  function clearCart() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      cart = []; // Vaciamos el array
      saveCart();  // Guardamos y actualizamos la UI
    }
  }

  // --- 7. LÓGICA DE UI (ACTUALIZAR BOTONES Y CONTADORES) ---
  function updateCartButton() {
    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach(item => {
      totalItems += item.unidades;
      totalPrice += item.precio_unitario * item.unidades;
    });

    if (totalItems > 0) {
      cartCount.textContent = totalItems;
      cartTotal.textContent = `$${totalPrice.toFixed(2)}`;
      cartButton.hidden = false;
      clearCartButton.hidden = false;
    } else {
      // Si el carrito está vacío, ocultamos los botones
      cartButton.hidden = true;
      clearCartButton.hidden = true;

    // Reiniciamos el texto a sus valores por defecto
    cartCount.textContent = '0';
    cartTotal.textContent = '$0.00';

    }
  }

  function updateQuantitiesInUI() {
    // 1. Reiniciamos todos los contadores a '0'
    document.querySelectorAll('.qty').forEach(span => {
      span.textContent = '0';
    });

    // 2. Actualizamos solo los que están en el carrito
    cart.forEach(item => {
      const span = document.querySelector(`.qty[data-id='${item.id_producto}']`);
      if (span) {
        span.textContent = item.unidades;
      }
    });
  }

  // --- 8. EVENT LISTENERS (ESCUCHAR CLICS) ---
  
  // Usamos delegación de eventos en la cuadrícula
  catalogGrid.addEventListener('click', (e) => {
    const id = e.target.dataset.id;
    if (e.target.classList.contains('btn-add')) {
      addToCart(id);
    }
    if (e.target.classList.contains('btn-remove')) {
      removeFromCart(id);
    }
  });

  // Botón flotante para ir a pagar
  cartButton.addEventListener('click', () => {
    // Guardamos una última vez (por si acaso)
    saveCart();
    // Redirigimos a la página de facturación
    window.location.href = 'billing.html';
  });

  // Botón de vaciar carrito
  clearCartButton.addEventListener('click', () => {
    clearCart();
  });

  // --- 9. EJECUCIÓN INICIAL ---
  fetchProducts(); // Cargar productos de la API
  updateCartButton(); // Mostrar el estado del carrito guardado
});