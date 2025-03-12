import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    codeReference: { type: String,   required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    taxRate: { type: Number, required: true },
    unitMeasureId: { type: Number, required: true },
    standardCodeId: { type: Number, required: true },
    isExcluded: { type: Boolean, required: true, default: false },
    tributeId: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('servicio', ProductSchema);
