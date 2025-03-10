import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
    numberingRangeId: { type: Number, },
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
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        discountRate: { type: Number, default: 0 },
        withholdingTaxes: [{
            code: { type: String, required: true },
            withholdingTaxRate: { type: Number, required: true }
        }]
    }]
}, { timestamps: true });

export default mongoose.model('Invoice', InvoiceSchema);
