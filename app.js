import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import facturasr from "./routes/facturasr.js";
import userRoutes from "./routes/usuariosr.js"; 
import usersericios from "./routes/serviciosr.js"


dotenv.config();


const app = express();


app.use(express.json()); 
app.use(cors()); 
app.use(express.static("public"))

mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log("✅ Conectado a MongoDB"))
    .catch((error) => console.error("❌ Error al conectar a MongoDB:", error));

// Rutas
app.use("/api/facturas", facturasr);
app.use("/api/usuarios", userRoutes);       
app.use("/api/servicios",usersericios)

// Puerto del servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
