import axios from "axios";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface Props {
  reserva: any;
  onClose: () => void;
  onSuccess: () => void;
}

const EditReservationForm: React.FC<Props> = ({ reserva, onClose, onSuccess }) => {

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    habitacion_numero: reserva.habitacion?.numero || "",
    fecha_entrada: reserva.fecha_entrada.split("T")[0],
    fecha_salida: reserva.fecha_salida.split("T")[0],
    adelanto: reserva.adelanto || 0,
    ingreso: reserva.ingreso || 0,
    metodo_adelanto: reserva.metodo_adelanto || "",
    metodo_ingreso: reserva.metodo_ingreso || "",
    observacion: reserva.observacion || ""
  });

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    
    // Calcular el ancho de la scrollbar
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Bloquear scroll y compensar el espacio de la scrollbar
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (new Date(formData.fecha_salida) <= new Date(formData.fecha_entrada)) {
      alert("La fecha de salida debe ser posterior a la fecha de entrada");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:3000/api/reservas/${reserva.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Reserva actualizada correctamente");
      onSuccess();

    } catch (error: any) {
      alert(error.response?.data?.error || "Error al actualizar la reserva");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(8px)",
        padding: "1rem"
      }}
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-3xl w-full shadow-2xl overflow-y-auto"
        style={{
          maxWidth: "520px",
          maxHeight: "calc(100vh - 2rem)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="p-8 space-y-6">

          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
            Editar Reserva
          </h2>

          {/* GRID FORM */}
          <div className="grid grid-cols-2 gap-4">

            <input
              name="habitacion_numero"
              value={formData.habitacion_numero}
              onChange={handleChange}
              placeholder="Habitación"
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <input
              type="date"
              name="fecha_entrada"
              value={formData.fecha_entrada}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <input
              type="date"
              name="fecha_salida"
              value={formData.fecha_salida}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <input
              name="adelanto"
              type="number"
              value={formData.adelanto}
              onChange={handleChange}
              placeholder="Adelanto"
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <input
              name="ingreso"
              type="number"
              value={formData.ingreso}
              onChange={handleChange}
              placeholder="Ingreso"
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <select
              name="metodo_adelanto"
              value={formData.metodo_adelanto}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Método adelanto</option>
              <option value="Efectivo">Efectivo</option>
              <option value="QR">QR</option>
              <option value="Transferencia">Transferencia</option>
            </select>

            <select
              name="metodo_ingreso"
              value={formData.metodo_ingreso}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Método ingreso</option>
              <option value="Efectivo">Efectivo</option>
              <option value="QR">QR</option>
              <option value="Transferencia">Transferencia</option>
            </select>

          </div>

          {/* OBSERVACION */}
          <textarea
            name="observacion"
            value={formData.observacion}
            onChange={handleChange}
            placeholder="Observaciones"
            className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />

          {/* BOTONES */}
          <div className="flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-gray-200 px-5 py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>

          </div>

        </div>

      </div>
    </div>
  );

  // Renderizar usando Portal directamente en document.body
  return createPortal(modalContent, document.body);
};

export default EditReservationForm;