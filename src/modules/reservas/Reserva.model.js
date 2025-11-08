import { model, Schema } from "mongoose";

const ReservaSchema = new Schema({
  usuario: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "El usuario es obligatorio"]
  },
  libro: {
    type: Schema.Types.ObjectId,
    ref: "Libro",
    required: [true, "El libro es obligatorio"]
  },
  fechaReserva: {
    type: Date,
    required: true,
    default: Date.now
  },
  fechaEntrega: {
    type: Date,
    required: true,
    // Fecha de entrega predeterminada: 15 días después
    default: () => new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) 
  },
  estado: {
    type: String,
    enum: ["activa", "completada", "cancelada"],
    default: "activa"
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Crear índices para búsquedas rápidas
ReservaSchema.index({ usuario: 1, estado: 1 });
ReservaSchema.index({ libro: 1, estado: 1 });

// Virtuals para datos relacionados
ReservaSchema.virtual('usuario_info', {
  ref: 'User',
  localField: 'usuario',
  foreignField: '_id',
  justOne: true,
  options: { select: 'nombre email' }
});

ReservaSchema.virtual('libro_info', {
  ref: 'Libro',
  localField: 'libro',
  foreignField: '_id',
  justOne: true,
  options: { select: 'titulo autor' }
});

const ReservaModel = model("Reserva", ReservaSchema);

export { ReservaModel, ReservaSchema };