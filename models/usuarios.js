import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    identification: { type: String, required: true, unique: true }, // Cambiar a unique: true
    dv: { type: String, required: true },
    company: { type: String, default: '' },
    tradeName: { type: String, default: '' },
    names: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    legalOrganizationId: { type: String, required: true },
    tributeId: { type: String, required: true },
    identificationDocumentId: { type: String, required: true },
    municipalityId: { type: String, required: true }
}, { timestamps: true });

// Crear índices para asegurar unicidad
UserSchema.index({ identification: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });

export default mongoose.model('Usuarios', UserSchema);