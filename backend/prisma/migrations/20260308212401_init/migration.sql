-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "apellido" VARCHAR(255) NOT NULL,
    "carnet" INTEGER NOT NULL,
    "celular" INTEGER NOT NULL,
    "genero" VARCHAR(50) NOT NULL,
    "cargo" VARCHAR(100) NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gasto" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "producto" VARCHAR(255) NOT NULL,
    "precio" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habitacion" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "piso" INTEGER NOT NULL,
    "tipo_habitacion" VARCHAR(100) NOT NULL,
    "ocupado" BOOLEAN NOT NULL DEFAULT false,
    "estado" VARCHAR(100) NOT NULL DEFAULT 'Disponible',

    CONSTRAINT "habitacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "huesped" (
    "id" SERIAL NOT NULL,
    "nombres" VARCHAR(255) NOT NULL,
    "apellidos" VARCHAR(255) NOT NULL,
    "carnet" INTEGER NOT NULL,
    "complemento" VARCHAR(50),
    "celular" INTEGER NOT NULL,
    "genero" VARCHAR(50) NOT NULL,
    "profesion" VARCHAR(255) NOT NULL,
    "fecha_nacimiento" DATE NOT NULL,
    "nacionalidad" VARCHAR(100) NOT NULL,
    "ciudad_nacimiento" VARCHAR(100) NOT NULL,
    "estado_civil" VARCHAR(50) NOT NULL,
    "nivel" INTEGER NOT NULL,
    "dias_visitado" INTEGER NOT NULL,

    CONSTRAINT "huesped_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "limpieza" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "habitacion_id" INTEGER NOT NULL,
    "fecha_hora" TIMESTAMP(6) NOT NULL,
    "observacion" VARCHAR(255),

    CONSTRAINT "limpieza_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lista_negra" (
    "id" SERIAL NOT NULL,
    "huesped_id" INTEGER NOT NULL,
    "motivo" VARCHAR(255) NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lista_negra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserva" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "habitacion_id" INTEGER NOT NULL,
    "fecha_entrada" DATE NOT NULL,
    "fecha_salida" DATE NOT NULL,
    "hora_entrada" TIME(6),
    "hora_salida" TIME(6),
    "cantidad_personas" INTEGER,
    "adelanto" INTEGER NOT NULL DEFAULT 0,
    "ingreso" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "metodo_adelanto" VARCHAR(100),
    "metodo_ingreso" VARCHAR(100),
    "observacion" VARCHAR(255),

    CONSTRAINT "reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalle_reserva_huesped" (
    "id" SERIAL NOT NULL,
    "reserva_id" INTEGER NOT NULL,
    "huesped_id" INTEGER NOT NULL,
    "es_titular" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "detalle_reserva_huesped_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_carnet_key" ON "usuario"("carnet");

-- CreateIndex
CREATE UNIQUE INDEX "habitacion_numero_key" ON "habitacion"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "huesped_carnet_key" ON "huesped"("carnet");

-- AddForeignKey
ALTER TABLE "gasto" ADD CONSTRAINT "fk_gasto_usuario" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "limpieza" ADD CONSTRAINT "fk_limpieza_habitacion" FOREIGN KEY ("habitacion_id") REFERENCES "habitacion"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "limpieza" ADD CONSTRAINT "fk_limpieza_usuario" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lista_negra" ADD CONSTRAINT "fk_lista_negra_huesped" FOREIGN KEY ("huesped_id") REFERENCES "huesped"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reserva" ADD CONSTRAINT "reserva_habitacion_id_fkey" FOREIGN KEY ("habitacion_id") REFERENCES "habitacion"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reserva" ADD CONSTRAINT "reserva_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalle_reserva_huesped" ADD CONSTRAINT "detalle_reserva_huesped_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reserva"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalle_reserva_huesped" ADD CONSTRAINT "detalle_reserva_huesped_huesped_id_fkey" FOREIGN KEY ("huesped_id") REFERENCES "huesped"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
