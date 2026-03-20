import { useState, useEffect, useMemo } from 'react';
import { 
  Map as MapIcon, LayoutGrid, Search, 
  Trash2, Sparkles, RotateCcw
} from 'lucide-react';
import axiosInstance from '../../api/axios';
import RoomDeleteModal from './RoomDeleteModal';
import Map from './map';

export default function Rooms() {
  const [habitaciones, setHabitaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [pisoSeleccionado, setPisoSeleccionado] = useState(1);

  // --- Estados de Filtros ---
  const [filtroNumero, setFiltroNumero] = useState('');
  const [filtroPiso, setFiltroPiso] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<{ id: number; numero: number } | null>(null);

  const fetchHabitaciones = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/habitaciones');
      if (response.status === 200) {
        setHabitaciones(response.data.habitaciones || []);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabitaciones();
  }, []);

  const habitacionesFiltradas = useMemo(() => {
    return habitaciones.filter(hab => {
      const coincideNumero = hab.numero.toString().includes(filtroNumero);
      const coincidePiso = filtroPiso === 'todos' || hab.piso.toString() === filtroPiso;
      
      const coincideEstado = filtroEstado === 'todos' || 
        (filtroEstado === 'Libre' && (hab.estado === 'Disponible' || hab.ocupado === false)) ||
        (filtroEstado === 'Ocupado' && (hab.estado === 'Ocupado' || hab.ocupado === true)) ||
        (filtroEstado === 'Sucio' && (hab.estado === 'Mantenimiento' || hab.estado === 'Sucio'));
      
      return coincideNumero && coincidePiso && coincideEstado;
    });
  }, [habitaciones, filtroNumero, filtroPiso, filtroEstado]);

  const resetFiltros = () => {
    setFiltroNumero('');
    setFiltroPiso('todos');
    setFiltroEstado('todos');
  };

  const openDelete = (id: number, numero: number) => {
    setSelectedRoom({ id, numero });
    setDeleteOpen(true);
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 bg-gray-50/50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight uppercase">Habitaciones</h2>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            Sistema de Gestión Hotelera
          </p>
        </div>

        <button
          onClick={() => setShowMap(!showMap)}
          className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 shadow-lg ${
            showMap 
            ? 'bg-gray-800 text-white hover:bg-gray-900' 
            : 'bg-yellow-600 text-white hover:bg-yellow-700 shadow-yellow-100'
          }`}
        >
          {showMap ? <LayoutGrid size={18} /> : <MapIcon size={18} />}
          <span>{showMap ? 'Cerrar Mapa' : 'Mapa Interactivo'}</span>
        </button>
      </div>

      {/* FILTROS */}
      {!showMap && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="BUSCAR POR NÚMERO..."
                value={filtroNumero}
                onChange={(e) => setFiltroNumero(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
              />
            </div>

            <div className="md:col-span-3 flex items-center gap-2">
              <select 
                value={filtroPiso}
                onChange={(e) => setFiltroPiso(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="todos">TODOS LOS PISOS</option>
                <option value="1">PISO 1</option>
                <option value="2">PISO 2</option>
                <option value="3">PISO 3</option>
                <option value="4">PISO 4</option>
              </select>
            </div>

            <div className="md:col-span-3 flex items-center gap-2">
              <select 
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="todos">TODOS LOS ESTADOS</option>
                <option value="Libre">LIBRES / DISPONIBLES</option>
                <option value="Ocupado">OCUPADAS</option>
                <option value="Sucio">MANTENIMIENTO</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <button 
                onClick={resetFiltros}
                className="w-full flex items-center justify-center gap-2 p-2.5 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase hover:bg-gray-200 transition-colors"
              >
                <RotateCcw size={14} /> Limpiar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SELECTOR DE PISO (Solo en Mapa) */}
      {showMap && (
        <div className="flex justify-center animate-in zoom-in-95">
          <div className="bg-white p-2 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-2">
            {[1, 2, 3, 4].map((p) => (
              <button
                key={p}
                onClick={() => setPisoSeleccionado(p)}
                className={`w-12 h-12 rounded-xl font-black transition-all duration-300 ${
                  pisoSeleccionado === p 
                  ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-200 scale-105' 
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
              >
                P{p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="transition-all duration-300">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-100 border-t-yellow-600 mb-4"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cargando habitaciones...</p>
          </div>
        ) : showMap ? (
          <div className="animate-in zoom-in-95 duration-500">
            <Map habitaciones={habitaciones} pisoActual={pisoSeleccionado} />
          </div>
        ) : (
          <>
            {habitacionesFiltradas.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                <Search size={48} className="mx-auto text-gray-200 mb-4" />
                <h3 className="text-lg font-black text-gray-400 uppercase">Sin coincidencias</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {habitacionesFiltradas.map((hab) => (
                  <div
                    key={hab.id}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-yellow-200 transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-6">
                        <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em]
                          ${hab.estado === 'Disponible' ? 'bg-green-50 text-green-600 border border-green-100' :
                            hab.estado === 'Ocupado' ? 'bg-red-50 text-red-600 border border-red-100' :
                            'bg-yellow-50 text-yellow-700 border border-yellow-100'}`}
                        >
                          {hab.estado}
                        </div>
                        <span className="text-[10px] font-black text-gray-300 uppercase">PISO {hab.piso}</span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-3xl font-black text-gray-800 tracking-tighter italic">Nº {hab.numero}</h3>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{hab.tipo_habitacion}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50/50 px-5 py-4 flex justify-between items-center border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${hab.ocupado ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                        <span className={`text-[9px] font-black uppercase tracking-widest ${hab.ocupado ? 'text-red-600' : 'text-green-600'}`}>
                          {hab.ocupado ? 'Ocupado' : 'Disponible'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                        {/* ICONO CAMBIADO: Sparkles representa la limpieza impecable */}
                        <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-white rounded-lg transition-all" title="Gestionar Limpieza">
                          <Sparkles size={18} />
                        </button>
                        <button 
                          onClick={() => openDelete(hab.id, hab.numero)} 
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <RoomDeleteModal
        open={deleteOpen}
        habitacion={selectedRoom}
        onClose={() => setDeleteOpen(false)}
        onDeletedOrUpdated={fetchHabitaciones}
      />
    </div>
  );
}