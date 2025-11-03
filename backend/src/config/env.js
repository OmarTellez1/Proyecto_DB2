// Importamos la librería dotenv
import 'dotenv/config';

// Creamos un objeto 'config' para almacenar nuestras variables de entorno
// Usamos process.env para acceder a las variables cargadas desde .env
export const config = {
  db: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
  },
  // Aquí podrías añadir otras configuraciones, como el puerto del servidor
   server: {
     port: process.env.PORT || 3000
   },
   jwt: {
    secret: process.env.JWT_SECRET
  },
  email: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: 'otellez@est.ecotec.edu.ec' // El correo que verificaste
  }
};