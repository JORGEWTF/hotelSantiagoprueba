import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import habitacionRoutes from "./routes/habitacion.routes";
import gastoRoutes from "./routes/gasto.routes";
import authRoutes from "./routes/auth.routes";
import reservationRoutes from "./routes/reservation.routes";
import checkinRoutes from "./routes/checkin.routes";
import huespedRoutes from "./routes/huesped.routes";
import listaNegraRoutes from "./routes/lista_negra.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend funcionando con TypeScript 🚀");
});

// Rutas
app.use("/api/reservas", checkinRoutes);
app.use("/api/reservas", reservationRoutes);
app.use("/api/huespedes", huespedRoutes);
app.use("/api", habitacionRoutes);
app.use("/api", gastoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", listaNegraRoutes);

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});