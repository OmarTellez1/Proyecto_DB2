/**
 * Modelo para la gestión de Facturas.
 * Este archivo es un 'híbrido':
 * 1. Funciones (createFactura, createDetalle) que reciben un 'client'
 * para ser usadas dentro de transacciones (desde factura.service.js).
 * 2. Funciones (findCompleteById) que usan el 'pool' global
 * para consultas simples e independientes.
 */
import pool from '../config/db.js';
const FacturaModel = {};

/* ------------------------------------------------------------------------------------------------ */
//Metodo #1
/**
 * -----Esto son comentarios JSDoc-------
 * Inserta la cabecera de una nueva factura (ej. total, id_cliente).
 * Esta función está diseñada para ser ejecutada DENTRO de una transacción.
 * @param {number} idCliente - ID del usuario que compra.
 * @param {number} total - El total calculado de la compra.
 * @param {object} client - Una conexión (client) activa de PostgreSQL, no el pool.
 * @returns {number} El ID de la nueva factura creada.
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
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
//Metodo #2
/**
 * -----Esto son comentarios JSDoc-------
 * Inserta un ítem (producto) en la tabla detalle_factura.
 * Esta función está diseñada para ser ejecutada DENTRO de una transacción.
 * @param {number} idFactura - El ID devuelto por createFactura.
 * @param {object} item - El ítem del carrito (ej. { id_producto: 2, unidades: 3 }).
 * @param {number} precio - El precio unitario (obtenido de la BD).
 * @param {object} client - Una conexión (client) activa de PostgreSQL.
 */
FacturaModel.createDetalle = async (idFactura, item, precio, client) => {
  const query = `
    INSERT INTO detalle_factura (id_factura, id_producto, unidades, precio_unitario)
    VALUES ($1, $2, $3, $4);
  `;
  const values = [idFactura, item.id_producto, item.unidades, precio];
  await client.query(query, values);
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
//Metodo #3
/**
 * -----Esto son comentarios JSDoc-------
 * Busca una factura completa por su ID (para la vista de Admin).
 * Esta es una consulta independiente (READ-ONLY) que SÍ usa el pool global.
 * Une 4 tablas (factura, usuarios, detalle_factura, productos) y agrupa
 * los resultados en un JSON usando funciones de PostgreSQL.
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
/* ------------------------------------------------------------------------------------------------ */
export default FacturaModel;