# Backend – Sistema PMS Hotel Santiago

Backend del **Sistema PMS (Property Management System)** para el Hotel Santiago.
Este servicio expone la API REST y gestiona la lógica de negocio del sistema.

---

## 🧰 Tecnologías

- Node.js 18
- Express
- TypeScript
- PostgreSQL
- JWT (autenticación)
- Docker

---

## 🐳 Ejecución con Docker

El backend se ejecuta mediante Docker Compose desde la raíz del proyecto.

Variables de entorno utilizadas:

```env
PORT=8000
DATABASE_URL=postgresql://hotel_user:hotel_pass@postgres:5432/hotel_db

