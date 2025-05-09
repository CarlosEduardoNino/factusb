import express from 'express';
import { 
  createInvoice, 
  validateInvoiceWithFactus, 
  createAndValidateInvoice, 
  transformInvoiceData, 
  getAllInvoices, 
  getInvoiceById 
} from "../controllers/facturasc.js";

const router = express.Router();


router.post("/local", transformInvoiceData, createInvoice);


router.post("/validate", transformInvoiceData, validateInvoiceWithFactus);


router.post("/createAndValidate", transformInvoiceData, createAndValidateInvoice);


router.get("/", getAllInvoices);


router.get("/:id", getInvoiceById);

export default router;
