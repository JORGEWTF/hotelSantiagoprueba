import { useState } from "react";
import { X, Trash2, Ban } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  habitacion: { id: number; numero: number } | null;
  onDeletedOrUpdated: () => void; // para refrescar lista
}

export default function RoomDeleteModal({ open, onClose, habitacion, onDeletedOrUpdated }: Props) {
  const API = "http://localhost:3000/api";
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open || !habitacion) return null;

  const eliminarFisico = async () => {
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/habitaciones/${habitacion.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setMessage(data.mensaje || `Habitación ${habitacion.numero} eliminada`);
        setTimeout(() => {
          onDeletedOrUpdated();
          onClose();
        }, 1200);
        return;
      }

      // Mensajes de negocio (ocupada / historial)
      setMessage(`Error: ${data.error || "No se pudo eliminar"}`);
    } catch (e) {
      setMessage("Error: Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const marcarInactiva = async () => {
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/habitaciones/${habitacion.id}/desactivar`, { method: "PATCH" });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setMessage(data.mensaje || `Habitación ${habitacion.numero} marcada como Inactiva`);
        setTimeout(() => {
          onDeletedOrUpdated();
          onClose();
        }, 1200);
        return;
      }

      setMessage(`Error: ${data.error || "No se pudo marcar como Inactiva"}`);
    } catch (e) {
      setMessage("Error: Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Eliminar habitación {habitacion.numero}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-600">
            ¿Está seguro de eliminar permanentemente la habitación <b>{habitacion.numero}</b>?
            <br />
            Si tiene historial, se recomienda marcarla como <b>Inactiva</b>.
          </p>

          {message && (
            <div
              className={`p-3 rounded text-sm font-medium ${
                message.startsWith("Error")
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-green-50 text-green-600 border border-green-200"
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={eliminarFisico}
              disabled={loading}
              className="w-1/2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Trash2 size={18} />
              {loading ? "Procesando..." : "Eliminar"}
            </button>

            <button
              onClick={marcarInactiva}
              disabled={loading}
              className="w-1/2 bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Ban size={18} />
              {loading ? "Procesando..." : "Marcar Inactiva"}
            </button>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full mt-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}