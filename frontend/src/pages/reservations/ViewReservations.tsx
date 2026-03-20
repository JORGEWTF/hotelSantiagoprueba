import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import CreateReservation from './CreateReservation';
import ViewDetailsReserve from './ViewDetailsReserve';

// --- Interfaces ---
interface Habitacion {
  id: number;
  numero: number;
  piso: number;
  tipo_habitacion: string;
  estado: string;
}

interface Reserva {
  id: number;
  habitacion_id: number;
  fecha_entrada: string;
  fecha_salida: string;
  cantidad_personas: number;
  adelanto: number;
  ingreso: number;
  total: number;
  metodo_adelanto: string;
  metodo_ingreso: string;
  observacion: string;
  hora_entrada?: string;
  hora_salida?: string;
  huespedes_detalle: any[];
}

interface ApiResponse {
  total: number;
  habitaciones: Habitacion[];
}

const ViewReservations: React.FC = () => {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [fechasBase, setFechasBase] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filtroNumero, setFiltroNumero] = useState('');
  const [filtroPiso, setFiltroPiso] = useState('');
  const [fechaInicioFiltro, setFechaInicioFiltro] = useState(new Date().toISOString().split('T')[0]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const [selectedData, setSelectedData] = useState<{ habId: string | number; fecha: string } | null>(null);
  const [selectedReservaId, setSelectedReservaId] = useState<number | null>(null);

  const cargarDatos = async () => {
    try {
      const [resHab, resRes] = await Promise.all([
        axios.get<ApiResponse>('http://localhost:3000/api/habitaciones'),
        axios.get<Reserva[]>('http://localhost:3000/api/reservas')
      ]);
      const listaHab = Array.isArray(resHab.data) ? resHab.data : resHab.data.habitaciones;
      if (listaHab) setHabitaciones(listaHab);
      if (resRes.data) setReservas(resRes.data);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const [year, month, day] = fechaInicioFiltro.split('-').map(Number);
    const start = new Date(year, month - 1, day, 0, 0, 0, 0);
    const lista = [];
    for (let i = 0; i < 20; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      lista.push(d);
    }
    setFechasBase(lista);
    cargarDatos();
  }, [fechaInicioFiltro]);

  const habitacionesFiltradas = useMemo(() => {
    return habitaciones.filter(hab => {
      const coincideNumero = hab.numero.toString().includes(filtroNumero);
      const coincidePiso = filtroPiso === '' || hab.piso.toString() === filtroPiso;
      return coincideNumero && coincidePiso;
    });
  }, [habitaciones, filtroNumero, filtroPiso]);

  const infoReserva = (habitacionId: number, fechaColumna: Date) => {
    const fechaActual = new Date(fechaColumna);
    fechaActual.setHours(0, 0, 0, 0);

    const reservasEnFecha = reservas.filter(res => {
      if (res.habitacion_id !== habitacionId) return false;
      const inicio = new Date(res.fecha_entrada.split('T')[0].replace(/-/g, '\/'));
      const fin = new Date(res.fecha_salida.split('T')[0].replace(/-/g, '\/'));
      inicio.setHours(0,0,0,0);
      fin.setHours(0,0,0,0);
      return fechaActual >= inicio && fechaActual <= fin;
    });

    if (reservasEnFecha.length === 0) return null;

    return reservasEnFecha.map(res => {
      const inicio = new Date(res.fecha_entrada.split('T')[0].replace(/-/g, '\/'));
      const fin = new Date(res.fecha_salida.split('T')[0].replace(/-/g, '\/'));
      inicio.setHours(0,0,0,0);
      fin.setHours(0,0,0,0);

      const esInicio = fechaActual.getTime() === inicio.getTime();
      const esFin = fechaActual.getTime() === fin.getTime();

      const colores = ['bg-rose-500', 'bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-violet-600'];
      const color = colores[res.id % colores.length];

      return { ...res, esInicio, esFin, color };
    });
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse uppercase tracking-widest">Sincronizando Recepción...</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Recepción</h1>
        <button 
          onClick={() => { setSelectedData(null); setIsCreateModalOpen(true); }} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold shadow-xl transition-all"
        >
          + NUEVA RESERVA
        </button>
      </div>

      {/* FILTROS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-200">
        <input type="text" placeholder="Buscar Habitación..." className="p-3 bg-gray-50 rounded-xl text-sm font-bold border-none" value={filtroNumero} onChange={(e) => setFiltroNumero(e.target.value)} />
        <select className="p-3 bg-gray-50 rounded-xl text-sm font-bold border-none" value={filtroPiso} onChange={(e) => setFiltroPiso(e.target.value)}>
          <option value="">Todos los pisos</option>
          {[...new Set(habitaciones.map(h => h.piso))].sort().map(p => <option key={p} value={p}>Piso {p}</option>)}
        </select>
        <input type="date" className="p-3 bg-gray-50 rounded-xl text-sm font-bold border-none" value={fechaInicioFiltro} onChange={(e) => setFechaInicioFiltro(e.target.value)} />
        <button onClick={() => { setFiltroNumero(''); setFiltroPiso(''); setFechaInicioFiltro(new Date().toISOString().split('T')[0]); }} className="text-xs font-black text-blue-500 underline uppercase">Restablecer</button>
      </div>

      {/* TABLA GANTT */}
      <div className="bg-white shadow-2xl rounded-[2.5rem] border border-gray-200 isolate overflow-hidden">
        <div className="overflow-x-auto max-h-[65vh]">
          <table className="w-full text-sm text-left border-separate border-spacing-0">
            <thead className="bg-gray-900 text-white sticky top-0 z-40">
              <tr>
                <th className="px-6 py-6 sticky left-0 bg-gray-900 min-w-[200px] z-50 border-r border-gray-800 text-center uppercase text-[10px] font-black">Habitación</th>
                {fechasBase.map(f => (
                  <th key={f.toISOString()} className="px-4 py-4 text-center min-w-[100px] border-r border-gray-800">
                    <div className="text-[10px] opacity-40 uppercase font-black">{f.toLocaleDateString('es-ES', { weekday: 'short' })}</div>
                    <div className="text-xl font-black">{f.getDate()}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habitacionesFiltradas.map(hab => (
                <tr key={hab.id} className="group">
                  <td className="px-6 py-6 sticky left-0 bg-white z-20 font-black border-r border-b group-hover:bg-blue-50 text-center transition-colors">
                    <div className="text-blue-600 text-lg">#{hab.numero}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-tighter">{hab.tipo_habitacion}</div>
                  </td>
                  {fechasBase.map(fecha => {
                    const listaRes = infoReserva(hab.id, fecha);
                    return (
                      <td key={`${hab.id}-${fecha.toISOString()}`} className="p-0 h-20 border-r border-b relative">
                        {listaRes ? (
                          <div className="flex h-full w-full py-2">
                            {/* Corregido: Usamos b para el ordenamiento y evitamos el warning */}
                            {listaRes.sort((a, b) => (a.esFin && !b.esFin ? -1 : 1)).map((res) => {
                              const isSharedDay = listaRes.length > 1;
                              const widthClass = isSharedDay ? 'w-1/2' : 'w-full';

                              return (
                                <div 
                                  key={res.id}
                                  onClick={(e) => { e.stopPropagation(); setSelectedReservaId(res.id); setIsDetailModalOpen(true); }}
                                  className={`h-full ${widthClass} ${res.color} text-white flex flex-col items-center justify-center cursor-pointer hover:brightness-110 transition-all z-10 relative
                                    ${res.esInicio ? 'rounded-l-2xl' : ''} 
                                    ${res.esFin ? 'rounded-r-2xl' : ''}
                                    ${isSharedDay ? 'mx-0.5' : 'mx-1'}`}
                                >
                                  <span className="text-[7px] font-black uppercase truncate px-1 italic">
                                    {res.esInicio ? 'Entrada' : res.esFin ? 'Salida' : 'Ocupado'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <button 
                            onClick={() => { setSelectedData({ habId: hab.numero, fecha: fecha.toISOString().split('T')[0] }); setIsCreateModalOpen(true); }} 
                            className="w-full h-full hover:bg-blue-50 transition-all text-transparent hover:text-blue-400 font-black text-xl"
                          > + </button>
                        )}
                      </td>
                    );
                    })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto relative p-2">
            <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-8 right-10 text-4xl text-gray-300 hover:text-red-500 z-50 font-black">&times;</button>
            <CreateReservation initialData={selectedData} onClose={() => { setIsCreateModalOpen(false); cargarDatos(); }} />
          </div>
        </div>
      )}

      {/* MODAL DETALLE */}
      {isDetailModalOpen && selectedReservaId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-2">
            <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-8 right-10 text-4xl text-gray-300 hover:text-red-500 z-50 font-black">&times;</button>
            {(() => {
              const reservaEncontrada = reservas.find(r => r.id === selectedReservaId);
              return reservaEncontrada ? (
                <ViewDetailsReserve reserva={reservaEncontrada} onClose={() => { setIsDetailModalOpen(false); cargarDatos(); }} />
              ) : null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewReservations;