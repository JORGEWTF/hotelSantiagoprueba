import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HuespedesSection, { type Huesped } from './HuespedesSection';

interface Props {
  initialData?: { habId: string | number; fecha: string } | null;
  onClose: () => void;
}

const CreateReservation: React.FC<Props> = ({ initialData, onClose }) => {
  const [loading, setLoading] = useState(false);
  
  // Estado inicial de la reserva
  const [reserva, setReserva] = useState({
    habitacion_numero: initialData?.habId || '', // Ahora guardamos el NÚMERO
    fecha_entrada: initialData?.fecha || '',
    fecha_salida: '',
    adelanto: 0,
    ingreso: 0,
    metodo_adelanto: 'Efectivo',
    metodo_ingreso: 'Efectivo',
    observacion: '',
    huespedes: [
      {
        nombres: '', apellidos: '', carnet: '', complemento: 'LP', celular: '',
        genero: 'Masculino', profesion: '', fecha_nacimiento: '',
        nacionalidad: 'Boliviano', ciudad_nacimiento: '', estado_civil: 'Soltero'
      }
    ] as Huesped[]
  });

  // Sincronizar con datos del Diagrama de Gantt
  useEffect(() => {
    if (initialData) {
      setReserva(prev => ({
        ...prev,
        habitacion_numero: initialData.habId, // El Gantt debe enviar el nro_habitacion
        fecha_entrada: initialData.fecha.split('T')[0] 
      }));
    }
  }, [initialData]);

  // Manejador de cambios para campos simples
  const handleChangeReserva = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReserva(prev => ({ ...prev, [name]: value }));
  };

  /**
   * FUNCIÓN PUENTE PARA HUÉSPEDES
   * Soporta actualizaciones funcionales para evitar solapamientos 
   * durante la búsqueda por carnet en tiempo real.
   */
  const updateHuespedes = (update: Huesped[] | ((prev: Huesped[]) => Huesped[])) => {
    setReserva(prev => {
      const nuevosHuespedes = typeof update === 'function' 
        ? update(prev.huespedes) 
        : update;

      return {
        ...prev,
        huespedes: nuevosHuespedes
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica de fechas
    if (new Date(reserva.fecha_salida) <= new Date(reserva.fecha_entrada)) {
      return alert("La fecha de salida debe ser posterior a la de entrada.");
    }

    setLoading(true);
    try {
      // Preparamos los datos convirtiendo strings a números donde el backend los requiere
      const dataToSend = {
        ...reserva,
        habitacion_numero: Number(reserva.habitacion_numero),
        adelanto: Number(reserva.adelanto),
        ingreso: Number(reserva.ingreso),
        huespedes: reserva.huespedes.map(h => ({
          ...h,
          carnet: Number(h.carnet),
          celular: Number(h.celular)
        }))
      };

      const response = await axios.post('http://localhost:3000/api/reservas', dataToSend);
      alert(response.data.message || "¡Reserva Confirmada!");
      onClose();
      window.location.reload(); 
    } catch (error: any) {
      alert("Error: " + (error.response?.data?.message || "Ocurrió un problema en el servidor"));
    } finally {
      setLoading(false);
    }
  };

  const totalCalculado = Number(reserva.adelanto) + Number(reserva.ingreso);

  return (
    <div className="p-10 bg-white rounded-[3rem] shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
      {/* Estilos personalizados para el scroll y limpieza de inputs */}
      <style>{`
        /* Ocultar flechas en inputs numéricos */
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button {
          -webkit-appearance: none; margin: 0;
        }
        input[type=number] { -moz-appearance: textfield; }

        /* Estética del Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db; /* Gris suave */
          border-radius: 10px;
          border: 2px solid #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af; /* Gris más oscuro al hacer hover */
        }
      `}</style>

      {/* CABECERA (Botón "Cerrar" eliminado) */}
      <div className="flex justify-between items-center mb-8 border-l-4 border-blue-600 pl-4">
        <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">Nueva Reserva</h2>
        {/* El botón de cerrar se quitó de aquí para usar el del modal padre */}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECCIÓN ESTANCIA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-blue-50/30 p-8 rounded-[2rem]">
           <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-blue-400 uppercase ml-2 tracking-widest">Número Habitación</label>
            <input 
              name="habitacion_numero" 
              type="number" 
              placeholder="Ej: 101"
              value={reserva.habitacion_numero} 
              onChange={handleChangeReserva} 
              className="p-4 rounded-2xl border-none shadow-sm font-bold bg-white focus:ring-2 focus:ring-blue-400 transition-all" 
              required 
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-blue-400 uppercase ml-2 tracking-widest">Fecha Entrada</label>
            <input name="fecha_entrada" type="date" value={reserva.fecha_entrada} onChange={handleChangeReserva} className="p-4 rounded-2xl border-none shadow-sm font-bold focus:ring-2 focus:ring-blue-400 transition-all" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-blue-400 uppercase ml-2 tracking-widest">Fecha Salida</label>
            <input name="fecha_salida" type="date" value={reserva.fecha_salida} onChange={handleChangeReserva} className="p-4 rounded-2xl border-none shadow-sm font-bold focus:ring-2 focus:ring-blue-400 transition-all" required />
          </div>
        </div>

        {/* SECCIÓN HUÉSPEDES */}
        <HuespedesSection 
          huespedes={reserva.huespedes} 
          setHuespedes={updateHuespedes} 
        />

        {/* SECCIÓN PAGOS */}
        <div className="bg-green-50/40 p-10 rounded-[2.5rem] border-2 border-green-100/50">
          <h3 className="text-xl font-black text-green-800 uppercase mb-6 flex items-center gap-2">
            <span className="bg-green-600 text-white p-1 rounded-md text-[10px]">Bs</span> 
            Detalle de Pagos
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Adelanto */}
            <div className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border border-green-50">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-green-600 uppercase ml-2">Monto Adelanto</label>
                <input name="adelanto" type="number" value={reserva.adelanto} onChange={handleChangeReserva} className="p-4 bg-green-50/30 rounded-2xl border-none font-black text-2xl text-green-700 w-full focus:ring-2 focus:ring-green-400 outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Método Adelanto</label>
                <select name="metodo_adelanto" value={reserva.metodo_adelanto} onChange={handleChangeReserva} className="p-4 bg-gray-50 rounded-2xl border-none font-bold w-full cursor-pointer focus:ring-2 focus:ring-green-400 outline-none transition-all">
                  <option value="Efectivo">Efectivo</option>
                  <option value="QR">Pago QR</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Transferencia">Transferencia</option>
                </select>
              </div>
            </div>

            {/* Ingreso */}
            <div className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border border-green-50">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-green-600 uppercase ml-2">Monto Ingreso</label>
                <input name="ingreso" type="number" value={reserva.ingreso} onChange={handleChangeReserva} className="p-4 bg-green-50/30 rounded-2xl border-none font-black text-2xl text-green-700 w-full focus:ring-2 focus:ring-green-400 outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Método Ingreso</label>
                <select name="metodo_ingreso" value={reserva.metodo_ingreso} onChange={handleChangeReserva} className="p-4 bg-gray-50 rounded-2xl border-none font-bold w-full cursor-pointer focus:ring-2 focus:ring-green-400 outline-none transition-all">
                  <option value="Efectivo">Efectivo</option>
                  <option value="QR">Pago QR</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Transferencia">Transferencia</option>
                </select>
              </div>
            </div>

            {/* Total */}
            <div className="md:col-span-2 flex justify-between items-center bg-green-600 p-6 rounded-[2rem] text-white shadow-xl shadow-green-200/50 transition-transform active:scale-[0.98]">
              <span className="text-[11px] font-black uppercase tracking-widest">Total General Estancia</span>
              <div className="text-4xl font-black italic">{totalCalculado} <span className="text-xl not-italic font-bold">Bs.</span></div>
            </div>
          </div>

          <textarea 
            name="observacion" 
            placeholder="Notas adicionales (Ej: Paga al salir, requiere factura...)" 
            value={reserva.observacion} 
            onChange={handleChangeReserva} 
            className="mt-8 p-6 bg-white rounded-[2rem] border-none h-28 shadow-sm w-full text-sm font-medium focus:ring-2 focus:ring-green-400 outline-none transition-all" 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className={`w-full text-white py-8 rounded-[2.5rem] font-black text-2xl shadow-xl transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 active:translate-y-0'}`}
        >
          {loading ? 'PROCESANDO RESERVA...' : 'FINALIZAR Y CONFIRMAR'}
        </button>
      </form>
    </div>
  );
};

export default CreateReservation;