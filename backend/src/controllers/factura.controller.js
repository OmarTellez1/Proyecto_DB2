// En: backend/src/controllers/factura.controller.js
import FacturaService from '../services/factura.service.js';

const FacturaController = {};

/**
 * Maneja la petición POST para crear una nueva factura (compra).
 */
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

export default FacturaController;