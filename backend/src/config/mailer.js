// En: backend/src/config/mailer.js
import sgMail from '@sendgrid/mail';
import { config } from './env.js';

// ¡Y listo! Le decimos a la librería cuál es nuestra clave secreta.
sgMail.setApiKey(config.email.apiKey);

// Exportamos el objeto 'sgMail' ya configurado.
export default sgMail;