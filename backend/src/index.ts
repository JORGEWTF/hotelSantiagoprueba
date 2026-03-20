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
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

// ──────────────────────────────────────────────────────────────────────────────
// SEED AUTOMÁTICO AL ARRANCAR: crea el admin y las habitaciones si no existen
// ──────────────────────────────────────────────────────────────────────────────
async function seedIfNeeded() {
  try {
    console.log("🔍 Verificando datos iniciales...");

    // 1. Admin por defecto
    const adminCarnet = 7477254;
    const existe = await prisma.usuario.findUnique({ where: { carnet: adminCarnet } });

    if (!existe) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await prisma.usuario.create({
        data: {
          nombre: "Abel",
          apellido: "Pacheco",
          carnet: adminCarnet,
          celular: 73892598,
          genero: "Masculino",
          cargo: "Administrador",
          password: hashedPassword,
        },
      });
      console.log("✅ Usuario administrador creado: carnet=7477254, password=admin123");
    } else {
      console.log("ℹ️  Usuario administrador ya existe.");
    }

    // 2. Habitaciones (solo si no hay ninguna)
    const totalHabitaciones = await prisma.habitacion.count();
    if (totalHabitaciones === 0) {
      const simples       = [1, 12, 18, 19, 28, 29, 30, 35, 45, 46, 47, 52, 53];
      const matrimoniales = [2, 4, 6, 10, 16, 17, 20, 21, 24, 25, 26, 36, 37, 39, 41, 43, 51, 57, 58];
      const dobles        = [9, 5, 14, 22, 23, 31, 32, 33, 38, 48, 49, 50, 54, 55];
      const familiares    = [11, 27, 34, 40, 42, 44];
      const triples       = [59];
      const cuadruples    = [56];
      const noSonHabitaciones = new Set([3, 7, 8, 13, 15]);

      for (let i = 1; i <= 59; i++) {
        if (noSonHabitaciones.has(i)) continue;

        let tipo = "Sencilla";
        if (simples.includes(i))       tipo = "Sencilla";
        else if (matrimoniales.includes(i)) tipo = "Matrimonial";
        else if (dobles.includes(i))   tipo = "Doble";
        else if (familiares.includes(i)) tipo = "Familiar";
        else if (triples.includes(i))  tipo = "Triple";
        else if (cuadruples.includes(i)) tipo = "Cuádruple";

        let piso = 1;
        if (i >= 18 && i <= 34) piso = 2;
        else if (i >= 35 && i <= 51) piso = 3;
        else if (i >= 52) piso = 4;

        await prisma.habitacion.create({
          data: { numero: i, piso, tipo_habitacion: tipo, ocupado: false, estado: "Disponible" },
        });
      }
      console.log("✅ Habitaciones creadas correctamente.");
    } else {
      console.log(`ℹ️  Habitaciones ya existentes (${totalHabitaciones} encontradas).`);
    }
  } catch (err) {
    console.error("❌ Error en seed automático:", err);
    // No detenemos el servidor aunque el seed falle
  }
}

app.use(cors());
app.use(express.json());

app.get("/", (_req: import("express").Request, res: import("express").Response) => {
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

// Arrancamos el servidor y ejecutamos el seed
app.listen(Number(PORT), "0.0.0.0", async () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
  await seedIfNeeded();
});