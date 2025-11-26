/**
 * Se ejecuta cuando el contenido del HTML ha sido cargado.
 * 1. Protege la ruta (Guardia de Admin).
 * 2. Maneja la búsqueda de facturas por ID.
 */
document.addEventListener('DOMContentLoaded', () => {

  // --- 1. ESTADO Y AUTENTICACIÓN ---
  const token = localStorage.getItem('token');
  const usuarioStr = localStorage.getItem('usuario');

 //Aqui solia estar el guardia de seguridad que ahora se encuentra en admin-layout.js como 2.

  // --- 3. SELECCIÓN DE ELEMENTOS DEL DOM ---
  const searchInput = document.getElementById('q');
  const searchButton = document.getElementById('reload');
  const listSection = document.getElementById('list');
  const emptyMessage = document.getElementById('empty');

  // --- 4. MANEJADOR DE EVENTO (Clic en "Buscar") ---
  searchButton.addEventListener('click', async () => {
    const invoiceId = searchInput.value.trim();

    // Limpiamos resultados anteriores
    listSection.innerHTML = '';
    emptyMessage.hidden = true;

    // Validación simple
    if (!invoiceId) {
      emptyMessage.textContent = 'Por favor, ingrese un ID de factura.';
      emptyMessage.hidden = false;
      return;
    }

    try {
      // 5. Llamamos a la API
      const factura = await fetchInvoice(invoiceId, token);
      
      // 6. Mostramos los datos
      renderInvoice(factura);

    } catch (error) {
      // 7. Manejamos errores (ej. "Factura no encontrada")
      console.error('Error al buscar factura:', error.message);
      emptyMessage.textContent = error.message;
      emptyMessage.hidden = false;
    }
  });

  // --- 5. FUNCIÓN DE FETCH (Llamada a la API) ---
  /**
   * Llama a la API GET /api/facturas/:id (Protegida)
   */
  async function fetchInvoice(id, token) {
    const respuesta = await fetch(`http://localhost:3000/api/facturas/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}` // ¡Token de Admin!
      }
    });
    
    const data = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(data.message || 'Error al buscar la factura.');
    }
    return data;
  }

  // --- 6. FUNCIÓN DE RENDERIZADO (Dibuja la factura) ---
  /**
   * Renderiza la factura encontrada en la sección 'list'.
   * Reutiliza las clases 'card' y 'table' que ya tenemos.
   */
  function renderInvoice(factura) {
    listSection.innerHTML = ''; // Limpiamos

    // Formateamos la tabla de detalles
    const detallesHtml = factura.detalles.map(d => `
      <tr>
        <td>${d.unidades}</td>
        <td>${d.descripcion}</td>
        <td>$${d.precio_unitario}</td>
        <td>$${d.total_linea}</td>
      </tr>
    `).join('');

    // Creamos el HTML de la factura (similar al correo)
    const facturaHtml = `
      <div class="card" style="margin-top: 20px;">
        <div style="padding: 20px;">
          <h3>Factura #${factura._id} (Fecha: ${factura.fecha})</h3>
          
          <h4 style="margin-top: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Cliente</h4>
          <p>
            <strong>Nombre:</strong> ${factura.cliente.nombre_completo}<br>
            <strong>Cédula:</strong> ${factura.cliente.cedula}<br>
            <strong>Correo:</strong> ${factura.cliente.correo}<br>
            <strong>Celular:</strong> ${factura.cliente.celular || 'N/A'}
          </p>
          
          <h4 style="margin-top: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Detalles de la Compra</h4>
          <table class="table" style="margin-top: 10px;">
            <thead>
              <tr>
                <th>Cantidad</th>
                <th>Descripción</th>
                <th>P. Unitario</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${detallesHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align: right; font-weight: bold;">Total Pagado:</td>
                <td style="font-weight: bold;">$${factura.total}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;
    
    listSection.innerHTML = facturaHtml;
  }
});