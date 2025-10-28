// En: backend/src/models/factura.model.js
// ¡Importante! Este modelo NO importa el pool, recibirá el 'client'
import pool from '../config/db.js';
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
// --- NUEVA FUNCIÓN ---
/**
 * Busca una factura completa por su ID, uniendo todas las tablas.
 * Utiliza funciones JSON de PostgreSQL para agrupar los detalles.
 * @param {number} idFactura - El ID de la factura a buscar.
 * @returns {object | null} La factura completa o null si no se encuentra.
 */
FacturaModel.findCompleteById = async (idFactura) => {
  const query = `
    SELECT
      f.id_factura,
      f.fecha,
      f.total,
      -- 1. Construir el objeto JSON para el cliente
      json_build_object(
        'nombre_completo', u.nombre || ' ' || u.apellido,
        'cedula', u.cedula,
        'celular', u.celular,
        'correo', u.correo_electronico
      ) AS cliente,
      
      -- 2. Agrupar todos los detalles y productos en un array JSON
      json_agg(
        json_build_object(
          'descripcion', p.nombre_producto,
          'unidades', df.unidades,
          'precio_unitario', df.precio_unitario,
          'total_linea', df.total -- Usamos la columna 'total' generada de detalle_factura
        )
      ) AS detalles
    FROM
      factura f
    -- 3. Unir las tablas
    JOIN
      usuarios u ON f.id_cliente = u.id_usuario
    LEFT JOIN -- Usamos LEFT JOIN por si una factura no tuviera detalles (aunque no debería pasar)
      detalle_factura df ON f.id_factura = df.id_factura
    LEFT JOIN
      productos p ON df.id_producto = p.id_producto
    WHERE
      f.id_factura = $1
    -- 4. Agrupar todo en una sola fila
    GROUP BY
      f.id_factura, u.id_usuario;
  `;
  
  const result = await pool.query(query, [idFactura]);
  
  // pool.query devuelve la fila (o undefined si no se encontró)
  return result.rows[0];
};
// ---------------------
export default FacturaModel;