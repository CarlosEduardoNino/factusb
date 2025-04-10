import facturas from "../models/facturas.js";
import Users from "../models/usuarios.js";
import Product from "../models/servicios.js";
import axios from "axios";

const FACTUS_API_URL = "https://api-sandbox.factus.com.co/v1/bills";
const FACTUS_VALIDATE_URL = "https://api-sandbox.factus.com.co/v1/bills/validate";

/**
 * Middleware para validar y transformar datos según el formato requerido.
 */
const transformInvoiceData = async (req, res, next) => {
  try {
    // Si la petición viene en formato API (datos completos)
    if (req.body.customer && req.body.customer.identification) {
      // Buscar o crear usuario basado en la identificación
      const userData = {
        identification: req.body.customer.identification,
        dv: req.body.customer.dv,
        company: req.body.customer.company,
        tradeName: req.body.customer.trade_name,
        names: req.body.customer.names,
        address: req.body.customer.address,
        email: req.body.customer.email,
        phone: req.body.customer.phone,
        legalOrganizationId: req.body.customer.legal_organization_id,
        tributeId: req.body.customer.tribute_id,
        identificationDocumentId: req.body.customer.identification_document_id,
        municipalityId: req.body.customer.municipality_id
      };

      let customer = await Users.findOne({ identification: userData.identification });
      if (!customer) {
        customer = await Users.create(userData);
      }

      // Transformar productos
      const transformedItems = await Promise.all(
        req.body.items.map(async (item) => {
          const productData = {
            codeReference: item.code_reference,
            name: item.name,
            price: item.price,
            taxRate: parseFloat(item.tax_rate),
            unitMeasureId: item.unit_measure_id,
            standardCodeId: item.standard_code_id,
            isExcluded: item.is_excluded === 1,
            tributeId: item.tribute_id
          };

          let product = await Product.findOne({ codeReference: productData.codeReference });
          if (!product) {
            product = await Product.create(productData);
          }

          return {
            product: product._id,
            quantity: item.quantity,
            discountRate: item.discount_rate,
            withholdingTaxes: item.withholding_taxes.map(tax => ({
              code: tax.code,
              withholdingTaxRate: parseFloat(tax.withholding_tax_rate)
            }))
          };
        })
      );

      // Transformar datos de factura al formato local
      req.invoiceData = {
        numberingRangeId: req.body.numbering_range_id,
        referenceCode: req.body.reference_code,
        observation: req.body.observation,
        paymentForm: req.body.payment_form,
        paymentDueDate: req.body.payment_due_date,
        paymentMethodCode: req.body.payment_method_code,
        billingPeriod: {
          startDate: req.body.billing_period.start_date,
          startTime: req.body.billing_period.start_time,
          endDate: req.body.billing_period.end_date,
          endTime: req.body.billing_period.end_time
        },
        customer: customer._id,
        items: transformedItems
      };
    }
    // Si la petición viene en formato local (con IDs)
    else {
      const customer = await Users.findById(req.body.customer);
      if (!customer) {
        return res.status(400).json({ message: "Cliente no encontrado" });
      }

      const populatedItems = await Promise.all(
        req.body.items.map(async (item) => {
          const product = await Product.findById(item.product);
          if (!product) {
            throw new Error(`Producto no encontrado: ${item.product}`);
          }
          return {
            product: product._id,
            quantity: item.quantity,
            discountRate: item.discountRate,
            withholdingTaxes: item.withholdingTaxes
          };
        })
      );

      req.invoiceData = {
        ...req.body,
        items: populatedItems
      };
    }
    next();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Función auxiliar para convertir datos al formato requerido por Factus.
 */
const convertToFactusFormat = async (invoiceData) => {
  // Obtener datos del cliente
  const customer = await Users.findById(invoiceData.customer);

  // Transformar cada item para que cumpla con la estructura requerida
  const items = await Promise.all(
    invoiceData.items.map(async (item) => {
      const product = await Product.findById(item.product);
      return {
        code_reference: product.codeReference, // ejemplo: "12345"
        name: product.name,                      // ejemplo: "producto de prueba"
        quantity: item.quantity,                 // ejemplo: 1
        discount_rate: item.discountRate || 0,   // ejemplo: 20
        price: product.price,                    // ejemplo: 50000
        tax_rate: product.taxRate.toFixed(2),      // ejemplo: "19.00"
        unit_measure_id: product.unitMeasureId,    // ejemplo: 70
        standard_code_id: product.standardCodeId,  // ejemplo: 1
        is_excluded: product.isExcluded ? 1 : 0,     // ejemplo: 0
        tribute_id: product.tributeId,             // ejemplo: 1
        // Para cada retención, convertir el rate a string si es necesario
        withholding_taxes: item.withholdingTaxes.map(tax => ({
          code: tax.code,
          withholding_tax_rate: tax.withholdingTaxRate.toString()
        }))
      };
    })
  );

  // Retornar el objeto con la estructura que espera Factus
  return {
    reference_code: invoiceData.referenceCode,
    observation: invoiceData.observation,
    payment_form: invoiceData.paymentForm,
    payment_due_date: invoiceData.paymentDueDate,
    payment_method_code: invoiceData.paymentMethodCode,
    billing_period: {
      start_date: invoiceData.billingPeriod.startDate,
      start_time: invoiceData.billingPeriod.startTime,
      end_date: invoiceData.billingPeriod.endDate,
      end_time: invoiceData.billingPeriod.endTime
    },
    customer: {
      identification: customer.identification,
      dv: customer.dv,
      company: customer.company,
      trade_name: customer.tradeName,
      names: customer.names,
      address: customer.address,
      email: customer.email,
      phone: customer.phone,
      legal_organization_id: customer.legalOrganizationId,
      tribute_id: customer.tributeId,
      identification_document_id: customer.identificationDocumentId,
      municipality_id: customer.municipalityId
    },
    items: items
  };
};

/**
 * Controlador para crear factura local.
 */
const createInvoice = async (req, res) => {
  try {
    const newInvoice = new facturas(req.invoiceData);
    const savedInvoice = await newInvoice.save();
    res.status(201).json({ message: "Factura guardada localmente", data: savedInvoice });
  } catch (error) {
    res.status(500).json({ message: "Error al guardar la factura", error: error.message });
  }
};

/**
 * Controlador para validar la factura con Factus (flujo separado, sin actualizar la factura local).
 */
const validateInvoiceWithFactus = async (req, res) => {
  try {
    const authToken = req.headers.authorization;
    if (!authToken || !authToken.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token de autenticación no proporcionado o inválido" });
    }

    // Convertir datos al formato de Factus.
    const factusInvoice = await convertToFactusFormat(req.invoiceData);

    // Enviar a Factus.
    const response = await axios.post(FACTUS_API_URL, factusInvoice, {
      headers: { Authorization: authToken, "Content-Type": "application/json" }
    });

    const invoiceId = response.data.invoice_id;
    const factusInvoiceURL = `https://api-sandbox.factus.com.co/v1/bills/${invoiceId}`;

    res.status(201).json({
      message: "Factura validada con Factus",
      invoice_id: invoiceId,
      factus_url: factusInvoiceURL
    });
  } catch (error) {
    console.error("Error al registrar la factura en Factus:", error.response?.data || error.message);
    res.status(500).json({
      message: "Error al registrar la factura en Factus",
      error: error.response?.data || error.message
    });
  }
};


const createAndValidateInvoice = async (req, res) => {
  try {
    // 1. Guardar la factura localmente
    const newInvoice = new facturas(req.invoiceData);
    const savedInvoice = await newInvoice.save();

    // 2. Convertir datos al formato que requiere Factus
    const factusInvoice = await convertToFactusFormat(req.invoiceData);
    console.log("Objeto enviado a Factus:", JSON.stringify(factusInvoice, null, 2));

    // 3. Validar con Factus usando el endpoint de validación
    const authToken = req.headers.authorization;
    if (!authToken || !authToken.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token de autenticación no proporcionado o inválido" });
    }

    const factusResponse = await axios.post(FACTUS_VALIDATE_URL, factusInvoice, {
      headers: { Authorization: authToken, "Content-Type": "application/json" }
    });

    
    const factusData = {
      invoice_id: factusResponse.data.invoice_id,
      ...factusResponse.data.data.bill  
    };

    // 5. Actualizar la factura local con los datos devueltos
    const updatedInvoice = await facturas.findByIdAndUpdate(
      savedInvoice._id,
      { 
        factusData: factusData, 
        status: 'validated' 
      },
      { new: true }
    );

    res.status(201).json({
      message: "Factura guardada localmente y validada con éxito",
      data: updatedInvoice
    });
  } catch (error) {
    console.error("Error al procesar la factura:", error.response?.data || error.message);
    res.status(500).json({
      message: "Error al procesar la factura",
      error: error.response?.data || error.message
    });
  }
};

/**
 * Controlador para obtener todas las facturas.
 */
const getAllInvoices = async (req, res) => {
  try {
    const invoices = await facturas.find()
      .populate('customer')
      .populate('items.product');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener facturas", error: error.message });
  }
};

/**
 * Controlador para obtener una factura por ID.
 */
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await facturas.findById(req.params.id)
      .populate('customer')
      .populate('items.product');

    if (!invoice) {
      return res.status(404).json({ message: "Factura no encontrada" });
    }

    res.json(invoice);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "ID de factura inválido" });
    }
    res.status(500).json({ message: "Error al obtener la factura", error: error.message });
  }
};

export {
  createInvoice,
  validateInvoiceWithFactus,
  transformInvoiceData,
  getAllInvoices,
  getInvoiceById,
  createAndValidateInvoice
};