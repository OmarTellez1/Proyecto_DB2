// En: backend/src/models/factura.model.js
// ¡Importante! Este modelo NO importa el pool, recibirá el 'client'

const FacturaModel = {};

/**
 * Crea la cabecera de la factura.
 * @param {number} idCliente - ID del usuario que compra.
 * @param {number} total - El total calculado de la compra.
 * @param {object} client - La conexión activa de la transacción.
 * @returns {number} El ID de la nueva factura.
 */
FacturaModel.createFactura = async (idCliente, total, client) => {
  const query = `
    INSERT INTO factura (id_cliente, total)
    VALUES ($1, $2)
    RETURNING id_factura;
  `;
  const values = [idCliente, total];
  const result = await client.query(query, values);
  return result.rows[0].id_factura;
};

/**
 * Inserta un ítem en el detalle de la factura.
 * @param {number} idFactura - El ID devuelto por createFactura.
 * @param {object} item - El ítem del carrito (ej. { id_producto: 2, unidades: 3 }).
 * @param {number} precio - El precio unitario (obtenido de la BD).
 * @param {object} client - La conexión activa de la transacción.
 */
FacturaModel.createDetalle = async (idFactura, item, precio, client) => {
  const query = `
    INSERT INTO detalle_factura (id_factura, id_producto, unidades, precio_unitario)
    VALUES ($1, $2, $3, $4);
  `;
  const values = [idFactura, item.id_producto, item.unidades, precio];
  await client.query(query, values);
};

export default FacturaModel;