import mongoose from 'mongoose';
import ProductModel from '../models/product.model.js';
import FacturaModel from '../models/factura.model.js';
import UserModel from '../models/user.model.js';
import { config } from '../config/env.js';
import sgMail from '../config/mailer.js';

const FacturaService = {};

/* ------------------------------------------------------------------------------------------------ */
// Metodo #1
// En esta funcion creamos la factura

FacturaService.createFactura = async (idCliente, items) => {
  // 1. Iniciar la Sesión de Mongoose (Reemplaza al pool.connect)
  const session = await mongoose.startSession();
  
  let totalGeneral = 0;
  const detallesParaRespuesta = [];
  const productosParaActualizar = [];
  let cliente = null; 
  let idFactura = null; 

  try {
    // 2. Iniciar la Transacción
    session.startTransaction();

    // 3. PRIMER BUCLE: Verificar stock y calcular total
    for (const item of items) {
      // Pasamos la 'session' a la consulta
      const producto = await ProductModel.findForBilling(item.id_producto, session);
      
      if (!producto) throw new Error(`El producto con ID ${item.id_producto} no existe.`);
      
      if (producto.unidades_disponibles < item.unidades) {
        throw new Error(`Stock insuficiente para '${producto.nombre_producto}'. Disponible: ${producto.unidades_disponibles}`);
      }

      const totalLinea = producto.precio_unitario * item.unidades;
      totalGeneral += totalLinea;

      productosParaActualizar.push({ ...item, precio_unitario: producto.precio_unitario });
      
      // Preparamos el detalle (Nota: Mongo guarda esto dentro de la factura)
      detallesParaRespuesta.push({
        id_producto: item.id_producto,
        descripcion: producto.nombre_producto,
        unidades: item.unidades,
        precio_unitario: producto.precio_unitario,
        total_linea: Number(totalLinea).toFixed(2)
      });
    }

    // 4. OBTENER DATOS DEL CLIENTE
    // (Nota: No necesitamos pasar 'session' para lecturas simples, pero no hace daño)
    cliente = await UserModel.findDetailsForEmail(idCliente);
    if (!cliente) throw new Error('Cliente no encontrado.');

    // 5. Crear la FACTURA (Cabecera + Detalles juntos)
    // Preparamos el objeto completo para Mongo
    const datosFactura = {
      id_cliente: idCliente,
      total: Number(totalGeneral.toFixed(2)),
      detalles: detallesParaRespuesta // ¡Mongo guarda el array aquí mismo!
    };

    // Llamamos al modelo pasando la sesión
    const facturaGuardada = await FacturaModel.create(datosFactura, session);
    idFactura = facturaGuardada._id; // Mongo nos da el ID (ObjectId)

    // 6. SEGUNDO BUCLE: Actualizar Stock
    for (const prod of productosParaActualizar) {
      // Ya no necesitamos 'createDetalle', solo actualizar stock
      await ProductModel.updateStock(prod.id_producto, prod.unidades, session);
    }

    // 7. ¡ÉXITO! Confirmar la transacción
    await session.commitTransaction();

  } catch (error) {
    // 8. ¡ERROR! Revertir
    await session.abortTransaction();
    throw error;
  } finally {
    // 9. Finalizar sesión
    session.endSession();
  }

  // --- 10. PREPARAR Y ENVIAR CORREO (Igual que antes) ---
  
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const fechaLocal = `${year}-${month}-${day}`;
  const totalFormateado = Number(totalGeneral).toFixed(2);

  try {
    // --- 'htmlCorreo' ---
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
    // --- FIN html correo ---

    const msg = {
      to: cliente.correo_electronico, 
      from: {
        name: 'Proyecto_DB2', 
        email: config.email.fromEmail 
      },
      subject: `Gracias por comprar en nuestra tienda online, eres nuestra factura #${idFactura}`,
      html: htmlCorreo
    };
    
    await sgMail.send(msg);

  } catch (emailError) {
    console.error(`ERROR AL ENVIAR CORREO (Factura #${idFactura}):`, emailError.response ? emailError.response.body : emailError.message);
    
    return {
      mensaje: "Compra procesada exitosamente. Hubo un error al enviar la factura a tu correo.",
      factura_generada: {
        id_factura: idFactura,
        id_cliente: idCliente,
        fecha: fechaLocal, 
        total: totalFormateado,
        detalles: detallesParaRespuesta
      }
    };
  }
  
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
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #2
// Obtiene los detalles completos de una factura por su ID.

/**
 * @param {string} idFactura - El ID de la factura (ObjectId).
 * @returns {object} La factura completa formateada.
 */

FacturaService.getFacturaDetails = async (idFactura) => {
  try {
    const factura = await FacturaModel.findById(idFactura);

    if (!factura) {
      throw new Error('Factura no encontrada.');
    }

    // Formateo para que el frontend reciba el mismo formato que antes
    // Mongo devuelve objetos complejos, así que lo simplificamos
    
    const clienteObj = factura.id_cliente; // Gracias al populate, esto es el objeto usuario

    // Construimos el objeto de respuesta plano
    const respuestaFormateada = {
      id_factura: factura._id,
      fecha: new Date(factura.fecha).toISOString().split('T')[0],
      total: Number(factura.total).toFixed(2),
      cliente: {
        nombre_completo: `${clienteObj.nombre} ${clienteObj.apellido}`,
        cedula: clienteObj.cedula,
        celular: clienteObj.celular,
        correo: clienteObj.correo_electronico
      },
      // Mapeamos los detalles para que coincidan con el formato esperado
      detalles: factura.detalles.map(d => ({
        descripcion: d.descripcion, // Guardamos el nombre histórico en el modelo
        unidades: d.unidades,
        precio_unitario: d.precio_unitario,
        total_linea: d.total_linea
      }))
    };

    return respuestaFormateada;

  } catch (error) {
    if (error.name === 'CastError') {
       throw new Error('Factura no encontrada.');
    }
    throw error;
  }
};
/* ------------------------------------------------------------------------------------------------ */

export default FacturaService;