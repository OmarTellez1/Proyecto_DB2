// En: backend/src/services/factura.service.js

import pool from '../config/db.js';
import ProductModel from '../models/product.model.js';
import FacturaModel from '../models/factura.model.js';

const FacturaService = {};

/**
 * Procesa una compra completa como una transacción.
 * @param {number} idCliente - ID del usuario (obtenido del token).
 * @param {Array} items - El carrito (ej. [{ id_producto: 2, unidades: 3 }]).
 * @returns {object} La factura generada.
 */
FacturaService.createFactura = async (idCliente, items) => {
  // 1. Obtener una conexión del pool
  const client = await pool.connect();

  try {
    // 2. Iniciar la transacción
    await client.query('BEGIN');

    let totalGeneral = 0;
    const detallesParaRespuesta = [];
    const productosParaActualizar = [];

    // 3. PRIMER BUCLE: Verificar stock y calcular total
    for (const item of items) {
      const producto = await ProductModel.findForBilling(item.id_producto, client);
      
      if (!producto) {
        throw new Error(`El producto con ID ${item.id_producto} no existe.`);
      }
      if (producto.unidades_disponibles < item.unidades) {
        throw new Error(`Stock insuficiente para '${producto.nombre_producto}'. Disponible: ${producto.unidades_disponibles}`);
      }

      // Cálculo del total de la línea
      const totalLinea = producto.precio_unitario * item.unidades;
      totalGeneral += totalLinea;

      // Guardamos info para el siguiente paso
      productosParaActualizar.push({ ...item, precio_unitario: producto.precio_unitario });
      
      // Guardamos la info para la respuesta
      detallesParaRespuesta.push({
        id_producto: item.id_producto,
        descripcion: producto.nombre_producto,
        unidades: item.unidades,
        // precio_unitario viene bien de la BD (es DECIMAL(10,2))
        precio_unitario: producto.precio_unitario, 
        // --- CORRECCIÓN DECIMAL 1 ---
        // Aplicamos .toFixed(2) al total de la línea
        total_linea: Number(totalLinea).toFixed(2)
      });
    }

    // 4. Crear la cabecera de la factura
    const idFactura = await FacturaModel.createFactura(idCliente, totalGeneral, client);

    // 5. SEGUNDO BUCLE: Insertar detalles y actualizar stock
    for (const prod of productosParaActualizar) {
      await FacturaModel.createDetalle(idFactura, prod, prod.precio_unitario, client);
      await ProductModel.updateStock(prod.id_producto, prod.unidades, client);
    }

    // 6. ¡ÉXITO! Confirmar la transacción
    await client.query('COMMIT');

    // --- CORRECCIÓN FECHA ---
    // Obtenemos la fecha local actual del servidor
    const now = new Date();
    const year = now.getFullYear();
    // getMonth() es 0-11, por eso +1. padStart asegura 2 dígitos (ej. '05')
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    // Creamos la cadena YYYY-MM-DD local
    const fechaLocal = `${year}-${month}-${day}`;
    // -----------------------

    // 7. Devolver la respuesta diseñada y formateada
    return {
      mensaje: "Compra procesada exitosamente.",
      factura_generada: {
        id_factura: idFactura,
        id_cliente: idCliente,
        fecha: fechaLocal, // <-- Usamos la fecha local formateada
        // --- CORRECCIÓN DECIMAL 2 ---
        // Aplicamos .toFixed(2) al total general
        total: Number(totalGeneral).toFixed(2),
        detalles: detallesParaRespuesta
      }
    };

  } catch (error) {
    // 8. ¡ERROR! Revertir todos los cambios
    await client.query('ROLLBACK');
    throw error;
  } finally {
    // 9. ¡MUY IMPORTANTE! Devolver la conexión al pool
    client.release();
  }
};

export default FacturaService;