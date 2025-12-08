import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // 1. Importamos la librería aquí

// 1. Definimos el Esquema
const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  cedula: { type: String, required: true, unique: true },
  celular: { type: String },
  correo_electronico: { type: String, required: true, unique: true },
  rol: { type: String, enum: ['Cliente', 'Admin'], required: true },
  contrasena: { type: String, required: true },
  estado: { type: Boolean, default: true }
}, {
  versionKey: false
});

/* ------------------------------------------------------------------------------------------------ */
// --- MIDDLEWARES (HOOKS) DE SEGURIDAD ---

// A. Hook para CREAR usuarios (.save)
userSchema.pre('save', async function() { 
  const usuario = this;

  // Si la contraseña no se ha modificado, terminamos la función aquí 
  if (!usuario.isModified('contrasena')) return;

  // Hasheamos la contraseña
  const hash = await bcrypt.hash(usuario.contrasena, 10);
  usuario.contrasena = hash;
  
});

// B. Hook para ACTUALIZAR usuarios (.findOneAndUpdate)
userSchema.pre('findOneAndUpdate', async function() {
  // Obtenemos los datos que se van a actualizar
  const update = this.getUpdate();

  // Si la actualización contiene una contraseña, la hasheamos
  if (update.contrasena) {
    update.contrasena = await bcrypt.hash(update.contrasena, 10);
  }
});
/* ------------------------------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------------------------------ */

// 2. Creamos el Modelo
const User = mongoose.model('User', userSchema);

const UserModel = {};

/* ------------------------------------------------------------------------------------------------ */
// Metodo #1
UserModel.create = async (userData) => {
  const newUser = new User(userData);
  // Al ejecutar .save(), se dispara el middleware 'pre save' automáticamente
  const savedUser = await newUser.save();
  
  const result = savedUser.toObject();
  delete result.contrasena;
  return result;
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #2
UserModel.findAll = async () => {
  return await User.find({ estado: true }).select('-contrasena');
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #3
UserModel.findById = async (id) => {
  return await User.findById(id).select('-contrasena');
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #4
UserModel.update = async (id, dataToUpdate) => {
  // Al ejecutar findByIdAndUpdate, se dispara el middleware 'pre findOneAndUpdate'
  return await User.findByIdAndUpdate(id, dataToUpdate, { new: true }).select('-contrasena');
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #5
UserModel.findByCedula = async (cedula) => {
  return await User.findOne({ cedula: cedula });
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #6
UserModel.findDetailsForEmail = async (id) => {
  return await User.findById(id).select('nombre apellido cedula celular correo_electronico');
};
/* ------------------------------------------------------------------------------------------------ */

export default UserModel;