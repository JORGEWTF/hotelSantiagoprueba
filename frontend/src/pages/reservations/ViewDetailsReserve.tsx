import React, { useState } from 'react';
import axios from 'axios';
import CheckInForm from './CheckInForm';
import EditReservationForm from "./EditReservationForm";

interface Props {
  reserva: any; 
  onClose: () => void;
  onDeleteSuccess?: () => void; 
}

const ViewDetailsReserve: React.FC<Props> = ({ reserva, onClose, onDeleteSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  if (!reserva) return null;

  // Función para formatear la hora (HH:MM) o devolver ---
  const formatearHora = (hora: any) => {
    if (!hora) return "---";
    const valor = typeof hora === 'string' && hora.includes('T') 
      ? hora.split('T')[1] 
      : hora;
    return valor.substring(0, 5);
  };

  // --- NUEVA FUNCIÓN PARA CHECK-OUT ---
  const handleCheckOut = async () => {
    const confirmar = window.confirm(
      `¿Confirmar salida (Check-Out) para la habitación ${reserva.habitacion_id}?\nLa habitación pasará a estado 'Sucio'.`
    );
    if (!confirmar) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/reservas/${reserva.id}/checkout`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Check-Out realizado correctamente.");
      onClose();
      window.location.reload();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al realizar el Check-Out");
    } finally {
      setLoading(false);
    }
  };

  if (showCheckIn) {
    return (
      <CheckInForm 
        reserva={reserva} 
        onClose={() => setShowCheckIn(false)} 
        onSuccess={() => {
          onClose();
          window.location.reload();
        }} 
      />
    );
  }

  if (showEdit) {
    return (
      <EditReservationForm
        reserva={reserva}
        onClose={() => setShowEdit(false)}
        onSuccess={() => {
          onClose();
          window.location.reload();
        }}
      />
    );
  }

  const handleEliminar = async () => {
    const confirmar = window.confirm(
      `¿Estás seguro de eliminar la reserva #RES-${reserva.id}?\nEsta acción no se puede deshacer.`
    );
    if (!confirmar) return;

    setLoading(true);
    try {
      await axios.delete(`http://localhost:3000/api/reservas/${reserva.id}`);
      if (onDeleteSuccess) onDeleteSuccess();
      onClose();
      window.location.reload();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al eliminar la reserva");
    } finally {
      setLoading(false);
    }
  };

  const formatearFechaLocal = (fechaISO: string) => {
    if (!fechaISO) return "N/A";
    const [year, month, day] = fechaISO.split('T')[0].split('-').map(Number);
    const fechaLocal = new Date(year, month - 1, day);
    return fechaLocal.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="p-8">
      {/* CABECERA */}
      <div className="flex justify-between items-start mb-8 border-l-4 border-blue-600 pl-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">
            Detalle Reserva
          </h2>
          <p className="text-blue-600 font-bold text-sm mt-2 uppercase tracking-wide">
            #RES-{reserva.id} • Habitación {reserva.habitacion_id}
          </p>
        </div>
      </div>

      {/* GRID DE INFORMACIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* CARD: ESTANCIA */}
        <div className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest italic">Estancia</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[9px] text-gray-400 uppercase font-black">Entrada</p>
              <p className="font-bold text-gray-800 text-sm">{formatearFechaLocal(reserva.fecha_entrada)}</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 uppercase font-black">Salida</p>
              <p className="font-bold text-gray-800 text-sm">{formatearFechaLocal(reserva.fecha_salida)}</p>
            </div>
            
            {/* Sección de Horas Reales */}
            <div className="pt-2 border-t border-gray-200">
              <p className="text-[9px] text-blue-500 uppercase font-black">Hora Ingreso</p>
              <p className="font-black text-gray-800 text-sm">{formatearHora(reserva.hora_entrada)}</p>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <p className="text-[9px] text-red-500 uppercase font-black">Hora Salida</p>
              <p className="font-black text-gray-800 text-sm">{formatearHora(reserva.hora_salida)}</p>
            </div>
          </div>
        </div>

        {/* CARD: CONTABILIDAD DETALLADA */}
        <div className="bg-green-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-green-100 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black text-green-200 uppercase mb-4 tracking-widest italic">Pagos y Totales</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[9px] text-green-200 uppercase font-black">Adelanto ({reserva.metodo_adelanto || 'S/M'})</p>
                  <p className="font-bold text-lg">{reserva.adelanto} Bs.</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-green-200 uppercase font-black">Ingreso ({reserva.metodo_ingreso || 'S/M'})</p>
                  <p className="font-bold text-lg">{reserva.ingreso} Bs.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-green-500 flex justify-between items-end">
            <p className="text-[10px] text-green-200 uppercase font-black">Total General</p>
            <p className="text-4xl font-black leading-none">{reserva.total || (reserva.adelanto + reserva.ingreso)} <span className="text-sm font-normal">Bs.</span></p>
          </div>
        </div>
      </div>

      {/* SECCIÓN: OBSERVACIONES */}
      {reserva.observacion && (
        <div className="mb-8 bg-yellow-50/50 p-6 rounded-[2rem] border-2 border-dashed border-yellow-200">
          <p className="text-[10px] font-black text-yellow-600 uppercase mb-2 tracking-widest">Observaciones</p>
          <p className="text-gray-700 font-medium text-sm italic">"{reserva.observacion}"</p>
        </div>
      )}

      {/* SECCIÓN: HUÉSPEDES */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Huéspedes ({reserva.cantidad_personas})
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {reserva.huespedes_detalle?.map((item: any) => (
            <div key={item.id} className={`p-4 rounded-3xl flex justify-between items-center ${item.es_titular ? 'bg-white border-2 border-blue-500 shadow-md' : 'bg-gray-50 border border-gray-100'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${item.es_titular ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-200 text-gray-500'}`}>
                  {item.huesped.nombres[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-gray-800 uppercase text-sm leading-none">{item.huesped.nombres} {item.huesped.apellidos}</p>
                    {item.es_titular && <span className="bg-blue-100 text-blue-600 text-[8px] px-2 py-0.5 rounded-full font-black uppercase">Titular</span>}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tighter">
                    {item.huesped.nacionalidad} • CI: {item.huesped.carnet} {item.huesped.complemento}
                  </p>
                </div>
              </div>
              <div className="text-right pr-2">
                <p className="text-[9px] text-gray-400 font-black uppercase">Celular</p>
                <p className="text-xs font-bold text-gray-700">{item.huesped.celular}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN ACCIONES */}
      <div className="flex flex-col gap-3">
        {/* BOTÓN EDITAR RESERVA */}
        <button 
          onClick={() => setShowEdit(true)}
          className="w-full bg-blue-600 text-white py-5 rounded-[2.5rem] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98] border-b-4 border-blue-800"
        >
          Editar Reserva
        </button>
        {/* BOTÓN CHECK-IN (Solo si no ha entrado) */}
        {!reserva.hora_entrada && (
          <button 
            onClick={() => setShowCheckIn(true)}
            className="w-full bg-green-600 text-white py-5 rounded-[2.5rem] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl shadow-green-100 active:scale-[0.98] border-b-4 border-green-800"
          >
            Realizar Check-In
          </button>
        )}

        {/* BOTÓN CHECK-OUT (Solo si ya entró pero no ha salido) */}
        {reserva.hora_entrada && !reserva.hora_salida && (
          <button 
            onClick={handleCheckOut}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-5 rounded-[2.5rem] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-100 active:scale-[0.98] border-b-4 border-orange-700"
          >
            {loading ? "PROCESANDO..." : "Finalizar Estancia (Check-Out)"}
          </button>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={onClose} 
            disabled={loading}
            className="bg-gray-900 text-white py-5 rounded-[2.5rem] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-[0.98] border-b-4 border-gray-700 disabled:opacity-50 text-xs"
          >
            Cerrar
          </button>

          <button 
            onClick={handleEliminar}
            disabled={loading}
            className="bg-red-50 text-red-600 py-5 rounded-[2.5rem] font-black uppercase tracking-widest hover:bg-red-100 transition-all active:scale-[0.98] border-b-4 border-red-200 text-xs"
          >
            {loading ? "..." : "Anular"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDetailsReserve;