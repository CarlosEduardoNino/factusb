import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  numberingRangeId: { type: Number },
  referenceCode: { type: String, required: true },
  observation: { type: String, default: '' },
  paymentForm: { type: String, required: true },
  paymentDueDate: { type: Date, required: true },
  paymentMethodCode: { type: String, required: true },
  billingPeriod: {
    startDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endDate: { type: Date, required: true },
    endTime: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['pending', 'validated', 'error'],
    default: 'pending'
  },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'servicio', required: true },
    quantity: { type: Number, required: true },
    discountRate: { type: Number, default: 0 },
    withholdingTaxes: [{
      code: { type: String, required: true },
      withholdingTaxRate: { type: Number, required: true }
    }]
  }],
  // Nuevos campos para almacenar datos devueltos por Factus
  factusData: {
    invoice_id: { type: String },
    cufe: { type: String },
    qr: { type: String },
    public_url: { type: String }
  },
  isValidated: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('facturass', InvoiceSchema);
