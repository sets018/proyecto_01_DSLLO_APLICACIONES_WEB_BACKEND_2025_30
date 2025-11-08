import { model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new Schema({
  nombre: {
    type: String,
    required: [true, "El nombre es obligatorio"],
    trim: true,
    minlength: [2, "El nombre debe tener al menos 2 caracteres"]
  },
  email: {
    type: String,
    required: [true, "El email es obligatorio"],
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        // EXPRESIÓN REGULAR CORREGIDA (añadido $ y escape del punto)
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} no es un email válido!`
    }
  },
  password: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
    minlength: [4, "La contraseña debe tener al menos 4 caracteres"],
    select: false
  },
  permisos: {
    type: [String],
    default: [],
    enum: {
      values: [
        "crear_libros", "modificar_libros", "inhabilitar_libros", 
        "modificar_usuarios", "inhabilitar_usuarios"
      ],
      message: "Permiso `{VALUE}` no permitido"
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false 
});


// Hashea la contraseña antes de guardarla
UserSchema.pre('save', async function(next) {
  // Solo hashealo si es nuevo o se esta modificando a uno nuevo
  if (!this.isModified('password')) return next();

  try {
    // Salt y hash
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// DECLARE MONGO MODEL
const UserModel = model("User", UserSchema);

// EXPORT ALL
export { UserModel, UserSchema};