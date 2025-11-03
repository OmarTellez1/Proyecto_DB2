// En: backend/src/controllers/factura.controller.js
import FacturaService from '../services/factura.service.js';

const FacturaController = {};
/* ------------------------------------------------------------------------------------------------ */
//Metodo #1
//Maneja la petición POST para crear una nueva factura (compra).
FacturaController.create = async (req, res) => {
  try {
    // 1. Obtenemos el carrito del body
    const { items } = req.body;
    
    // 2. Obtenemos el ID del cliente ¡del middleware! (No del body)
    const idCliente = req.user.id; 
    // 3. (Opcional) Verificamos el rol
    if (req.user.rol !== 'Cliente') {
        return res.status(403).json({ message: 'Acción no permitida. Solo los clientes pueden comprar.' });
    }

    // 4. Validación de entrada
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'El carrito (items) es inválido o está vacío.' });
    }

    // 5. Llamar al servicio transaccional
    const nuevaFactura = await FacturaService.createFactura(idCliente, items);

    // 6. ¡Éxito!
    res.status(201).json(nuevaFactura);

  } catch (error) {
    // 7. Manejo de errores (ej. "Stock insuficiente")
    console.error('Error en FacturaController.create:', error.message);
    
    // 409 Conflict (Errores de lógica de negocio)
    if (error.message.includes('Stock insuficiente') || error.message.includes('no existe')) {
      res.status(409).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }
};
/* ------------------------------------------------------------------------------------------------ */
//Metodo #2
//Maneja la petición GET para obtener una factura por su ID.
//Solo accesible para Admins.
 
FacturaController.getById = async (req, res) => {
  try {
    // 1. Verificación de Rol (¡Importante!)
    if (req.user.rol !== 'Admin') {
      return res.status(403).json({ message: 'Acceso denegado. Solo los administradores pueden ver esta información.' });
    }

    // 2. Obtener el ID de la factura
    const { id } = req.params;

    // 3. Llamar al servicio
    const factura = await FacturaService.getFacturaDetails(id);

    // 4. Enviar respuesta
    res.status(200).json(factura);

  } catch (error) {
    // 5. Manejo de errores
    console.error('Error en FacturaController.getById:', error.message);
    
    if (error.message.includes('Factura no encontrada')) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }
};
/* ------------------------------------------------------------------------------------------------ */
export default FacturaController;