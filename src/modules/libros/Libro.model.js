import { model, Schema } from "mongoose";

const LibroSchema = new Schema({
  titulo: {
    type: String,
    required: [true, "El título es obligatorio"],
    trim: true,
    index: true,  // Para búsquedas eficientes
    maxlength: [200, "El título no puede exceder los 200 caracteres"]
  },
  autor: {
    type: String,
    required: [true, "El autor es obligatorio"]
  },
  genero: {
    type: String,
    required: [true, "El género es obligatorio"],
  },
  editorial: {
    type: String,
    required: [true, "La editorial es obligatoria"]
  },
  fechaPublicacion: {
    type: Date,
    required: [true, "La fecha de publicación es obligatoria"],
    validate: {
      validator: function(v) {
        return v <= new Date();  // No permitir fechas futuras
      },
      message: "La fecha de publicación no puede ser futura"
    }
  },
  disponible: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  creadoPor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  modificadoPor: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  versionKey: false
});

const LibroModel = model("Libro", LibroSchema);

export { LibroModel, LibroSchema };