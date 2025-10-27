// En: backend/src/services/factura.service.js

import pool from '../config/db.js';
import ProductModel from '../models/product.model.js';
import FacturaModel from '../models/factura.model.js';
import UserModel from '../models/user.model.js';
import { config } from '../config/env.js';
// --- 1. IMPORTACIÓN ACTUALIZADA ---
// Importamos el objeto oficial de SendGrid
import sgMail from '../config/mailer.js'; 
// ----------------------------------

const FacturaService = {};

FacturaService.createFactura = async (idCliente, items) => {
  const client = await pool.connect();

  let totalGeneral = 0;
  const detallesParaRespuesta = [];
  const productosParaActualizar = [];
  let cliente = null; 
  let idFactura = null; 

  try {
    // 2. Iniciar la transacción
    await client.query('BEGIN');

    // 3. PRIMER BUCLE: Verificar stock y calcular total
    for (const item of items) {
      // (Esta lógica no cambia)
      const producto = await ProductModel.findForBilling(item.id_producto, client);
      if (!producto) throw new Error(`El producto con ID ${item.id_producto} no existe.`);
      if (producto.unidades_disponibles < item.unidades) {
        throw new Error(`Stock insuficiente para '${producto.nombre_producto}'. Disponible: ${producto.unidades_disponibles}`);
      }
      const totalLinea = producto.precio_unitario * item.unidades;
      totalGeneral += totalLinea;
      productosParaActualizar.push({ ...item, precio_unitario: producto.precio_unitario });
      detallesParaRespuesta.push({
        id_producto: item.id_producto,
        descripcion: producto.nombre_producto,
        unidades: item.unidades,
        precio_unitario: producto.precio_unitario,
        total_linea: Number(totalLinea).toFixed(2)
      });
    }

    // 4. OBTENER DATOS DEL CLIENTE
    cliente = await UserModel.findDetailsForEmail(idCliente, client);
    if (!cliente) throw new Error('Cliente no encontrado.');

    // 5. Crear la cabecera de la factura
    idFactura = await FacturaModel.createFactura(idCliente, Number(totalGeneral.toFixed(2)), client);

    // 6. SEGUNDO BUCLE: Insertar detalles y actualizar stock
    for (const prod of productosParaActualizar) {
      // (Esta lógica no cambia)
      await FacturaModel.createDetalle(idFactura, prod, prod.precio_unitario, client);
      await ProductModel.updateStock(prod.id_producto, prod.unidades, client);
    }

    // 7. ¡ÉXITO! Confirmar la transacción
    await client.query('COMMIT');

  } catch (error) {
    // 8. ¡ERROR! Revertir todos los cambios
    await client.query('ROLLBACK');
    throw error; 
  } finally {
    // 9. ¡MUY IMPORTANTE! Devolver la conexión al pool
    client.release();
  }

 // --- 10. PREPARAR Y ENVIAR CORREO (Lógica Actualizada) ---

  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const fechaLocal = `${year}-${month}-${day}`;
  const totalFormateado = Number(totalGeneral).toFixed(2);

  try {
    
// --- 'htmlCorreo' ACTUALIZADO ---
    const htmlCorreo = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
        
        <h2 style="color: #333;">¡Gracias por tu compra, ${cliente.nombre} ${cliente.apellido}!</h2>
        <p>Tu factura #${idFactura} ha sido procesada exitosamente.</p>
        
        <h3 style="border-bottom: 2px solid #f4f4f4; padding-bottom: 5px;">Resumen de la Compra</h3>
        <p>
          <strong>Cliente:</strong> ${cliente.nombre} ${cliente.apellido}<br>
          <strong>Cédula:</strong> ${cliente.cedula}<br>
          <strong>Celular:</strong> ${cliente.celular ? cliente.celular : 'N/A'}<br>
          <strong>Correo:</strong> ${cliente.correo_electronico}<br>
          <strong>Fecha:</strong> ${fechaLocal}<br>
          <strong style="font-size: 1.1em;">Total Pagado:</strong> <strong style="font-size: 1.1em; color: #000;">$${totalFormateado}</strong>
        </p>
        
        <h3 style="border-bottom: 2px solid #f4f4f4; padding-bottom: 5px;">Detalles</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f4f4f4;">
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Descripción</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Unidades</th>
              <th style="padding: 10px; border: 1px solid #ddd;">P. Unitario</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${detallesParaRespuesta.map(d => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${d.descripcion}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${d.unidades}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">$${d.precio_unitario}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">$${d.total_linea}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p style="margin-top: 20px; font-size: 0.9em; color: #777;">
          Este es un correo automático. Por favor, no respondas a esta dirección.
        </p>
      </div>
    `;
    // --- FIN DE LA ACTUALIZACIÓN ---

    // Preparamos el 'mensaje' que pide @sendgrid/mail
    const msg = {
      to: cliente.correo_electronico, 
      from: {
        name: 'Proyecto_DB2', 
        email: config.email.fromEmail 
      },
      subject: `Gracias por comprar en nuestra tienda online, eres nuestra factura #${idFactura}`,
      html: htmlCorreo // <-- Ahora usa la plantilla detallada
    };
    
    await sgMail.send(msg);
    // -------------------------------------

  } catch (emailError) {
    console.error(`ERROR AL ENVIAR CORREO (Factura #${idFactura}):`, emailError.response ? emailError.response.body : emailError.message);
    
    // Devolvemos la respuesta de éxito (compra) pero con el aviso del email
    return {
      mensaje: "Compra procesada exitosamente. Hubo un error al enviar la factura a tu correo.",
      factura_generada: { /* ... (datos de la factura) ... */ }
    };
  }
  
  // 11. Devolver la respuesta exitosa (si todo salió bien)
  return {
    mensaje: "Compra procesada exitosamente. Se ha enviado la factura a tu correo.",
    factura_generada: {
      id_factura: idFactura,
      id_cliente: idCliente,
      fecha: fechaLocal, 
      total: totalFormateado,
      detalles: detallesParaRespuesta
    }
  };
};

export default FacturaService;