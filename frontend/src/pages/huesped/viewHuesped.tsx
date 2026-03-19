import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

import HuespedSearch from '../../components/common/HuespedSearch';
import { Trash2, Users, ShieldAlert, ShieldCheck, Pencil } from 'lucide-react';

interface Huesped {
  id: number;
  nombres: string;
  apellidos: string;
  carnet: number;
  complemento: string;
  celular: number;
  genero: string;
  profesion: string;
  fecha_nacimiento: string;
  nacionalidad: string;
  ciudad_nacimiento: string;
  estado_civil: string;
  nivel: number;
  dias_visitado: number;
  lista_negra?: { id: number; motivo: string; fecha: string }[];
}

const ViewHuesped: React.FC = () => {
  const [huespedes, setHuespedes] = useState<Huesped[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"todos" | "lista_negra" | "limpios">("todos");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingHuesped, setEditingHuesped] = useState<Huesped | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchHuespedes();
  }, []);

  const fetchHuespedes = async () => {
    try {
      const response = await axiosInstance.get('/huespedes');
      setHuespedes(response.data);
    } catch (error) {
      console.error("Error al cargar huéspedes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (h: Huesped) => {
    setEditingHuesped(h);
    setFormData(h);
  };

  const handleUpdate = async () => {
    try {
      const response = await axiosInstance.put(`/huespedes/${editingHuesped?.id}`, formData);
  
      if (response.status === 200) {
        fetchHuespedes();
        setEditingHuesped(null);
      }
    } catch (error) {
      console.error("Error actualizando huésped", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este huésped? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      const response = await axiosInstance.delete(`/huespedes/${id}`);
      if (response.status === 200) {
        setDeletingId(id);
        setTimeout(() => {
          setHuespedes((prev: Huesped[]) => prev.filter((h: Huesped) => h.id !== id));
          setDeletingId(null);
        }, 500); // Duración de la animación
      }
    } catch (error: any) {
      console.error("Error al eliminar huésped:", error);
      alert(error.response?.data?.message || "Error al eliminar el huésped");
    }
  };

  // Filtro por nombre, apellido o carnet + filtro de estado
  const filteredHuespedes = huespedes.filter((h: Huesped) => {
    const matchesSearch =
      h.nombres.toLowerCase().includes(search.toLowerCase()) ||
      h.apellidos.toLowerCase().includes(search.toLowerCase()) ||
      h.carnet.toString().includes(search);

    const isBlacklisted = h.lista_negra && h.lista_negra.length > 0;
    const matchesStatus =
      filterStatus === "todos" ||
      (filterStatus === "lista_negra" && isBlacklisted) ||
      (filterStatus === "limpios" && !isBlacklisted);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-10">
      {/* SECCIÓN DE VERIFICACIÓN / BÚSQUEDA RÁPIDA */}
      <div className="max-w-7xl mx-auto">
        <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
            <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider">Verificar Antecedentes</h2>
          </div>
          <HuespedSearch onRefresh={fetchHuespedes} />
        </section>
      </div>

      <hr className="border-gray-200 max-w-7xl mx-auto" />

      {/* CABECERA LISTADO */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">
            Huéspedes Registrados
          </h1>
          <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mt-1">
            Gestión de Lealtad y Directorio
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Filtros de Estado */}
          <div className="flex bg-white p-1 rounded-2xl shadow-xl border border-gray-100 w-full sm:w-auto">
            <button
              onClick={() => setFilterStatus("todos")}
              className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl transition-all font-bold text-[10px] uppercase tracking-wider ${filterStatus === "todos" ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <Users size={14} />
              <span>Todos</span>
            </button>
            <button
              onClick={() => setFilterStatus("lista_negra")}
              className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl transition-all font-bold text-[10px] uppercase tracking-wider ${filterStatus === "lista_negra" ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <ShieldAlert size={14} />
              <span>Lista Negra</span>
            </button>
            <button
              onClick={() => setFilterStatus("limpios")}
              className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl transition-all font-bold text-[10px] uppercase tracking-wider ${filterStatus === "limpios" ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <ShieldCheck size={14} />
              <span>Limpios</span>
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Buscar por nombre o CI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white border-none shadow-xl rounded-2xl w-full font-bold text-sm focus:ring-2 focus:ring-blue-500"
            />
            <svg className="w-5 h-5 absolute left-4 top-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* GRID DE HUESPEDES */}
      {loading ? (
        <div className="text-center py-20 font-black text-gray-300 animate-pulse">CARGANDO DIRECTORIO...</div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHuespedes.map((h: any) => {
            const isBlacklisted = h.lista_negra && h.lista_negra.length > 0;
            const isDeleting = deletingId === h.id;

            return (
              <div
                key={h.id}
                className={`bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all border-2 group relative overflow-hidden ${isBlacklisted ? 'border-red-500 bg-red-50/30' : 'border-gray-100'} ${isDeleting ? 'scale-90 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'} duration-500`}
                style={{ transitionProperty: 'transform, opacity' }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ${isBlacklisted ? 'bg-red-600 text-white animate-pulse' : h.genero === 'Femenino' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                    {h.nombres[0]}
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    {isBlacklisted && (
                      <span className="bg-red-600 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase shadow-lg shadow-red-200">
                        LISTA NEGRA ⚠️
                      </span>
                    )}
                    <span className="bg-gray-900 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase">
                      Nivel {h.nivel}
                    </span>
                    <p className="text-[9px] font-black text-gray-400 mt-1 uppercase">Visitas: {h.dias_visitado}</p>

                    <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition">

                      <button
                        onClick={() => handleEdit(h)}
                        className="p-2 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-100"
                        title="Editar Huésped"
                      >
                        <Pencil size={14}/>
                      </button>

                      <button
                        onClick={() => handleDelete(h.id)}
                        className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100"
                        title="Eliminar Huésped"
                      >
                        <Trash2 size={14}/>
                      </button>

                    </div>
                  </div>
                </div>

                <h2 className={`text-xl font-black uppercase leading-none mb-1 ${isBlacklisted ? 'text-red-700' : 'text-gray-800'}`}>
                  {h.nombres} {h.apellidos}
                </h2>
                <p className={`${isBlacklisted ? 'text-red-500' : 'text-blue-600'} font-bold text-xs uppercase mb-4 italic`}>
                  {h.profesion || 'Sin Profesión'}
                </p>

                <div className={`grid grid-cols-2 gap-4 border-t pt-4 ${isBlacklisted ? 'border-red-100' : 'border-gray-50'}`}>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase">Carnet de Identidad</p>
                    <p className={`text-sm font-bold ${isBlacklisted ? 'text-red-900' : 'text-gray-700'}`}>{h.carnet} {h.complemento}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase">Celular</p>
                    <p className={`text-sm font-bold ${isBlacklisted ? 'text-red-900' : 'text-gray-700'}`}>{h.celular}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase">Nacionalidad / Origen</p>
                    <p className={`text-sm font-bold ${isBlacklisted ? 'text-red-900' : 'text-gray-700'}`}>{h.nacionalidad} - {h.ciudad_nacimiento}</p>
                  </div>
                </div>

                <button className={`w-full mt-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${isBlacklisted ? 'bg-red-600 text-white border-2 border-red-700 shadow-lg shadow-red-100 hover:bg-red-700' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-600 group-hover:text-white'}`}>
                  {isBlacklisted ? 'Ver Detalles Antecedentes' : 'Ver Historial de Estancias'}
                </button>
              </div>
            );
          })}
          {editingHuesped && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white p-8 rounded-2xl w-[520px] max-h-[90vh] overflow-y-auto space-y-4 shadow-xl">

            <h2 className="text-xl font-bold text-gray-800">Editar Huésped</h2>

            <div className="grid grid-cols-2 gap-3">

            <input
            placeholder="Nombres"
            value={formData.nombres}
            onChange={(e)=>setFormData({...formData,nombres:e.target.value})}
            className="border p-2 rounded w-full"
            />

            <input
            placeholder="Apellidos"
            value={formData.apellidos}
            onChange={(e)=>setFormData({...formData,apellidos:e.target.value})}
            className="border p-2 rounded w-full"
            />

            <input
            placeholder="Carnet"
            value={formData.carnet}
            onChange={(e)=>setFormData({...formData,carnet:Number(e.target.value)})}
            className="border p-2 rounded w-full"
            />

            <input
            placeholder="Complemento"
            value={formData.complemento || ""}
            onChange={(e)=>setFormData({...formData,complemento:e.target.value})}
            className="border p-2 rounded w-full"
            />

            <input
            placeholder="Celular"
            value={formData.celular}
            onChange={(e)=>setFormData({...formData,celular:Number(e.target.value)})}
            className="border p-2 rounded w-full"
            />

            <select
            value={formData.genero}
            onChange={(e)=>setFormData({...formData,genero:e.target.value})}
            className="border p-2 rounded w-full"
            >
            <option value="">Género</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            </select>

            <input
            placeholder="Profesión"
            value={formData.profesion}
            onChange={(e)=>setFormData({...formData,profesion:e.target.value})}
            className="border p-2 rounded w-full"
            />

            <input
            type="date"
            value={formData.fecha_nacimiento?.split("T")[0]}
            onChange={(e)=>setFormData({...formData,fecha_nacimiento:e.target.value})}
            className="border p-2 rounded w-full"
            />

            <input
            placeholder="Nacionalidad"
            value={formData.nacionalidad}
            onChange={(e)=>setFormData({...formData,nacionalidad:e.target.value})}
            className="border p-2 rounded w-full"
            />

            <input
            placeholder="Ciudad de nacimiento"
            value={formData.ciudad_nacimiento}
            onChange={(e)=>setFormData({...formData,ciudad_nacimiento:e.target.value})}
            className="border p-2 rounded w-full"
            />

            <select
            value={formData.estado_civil}
            onChange={(e)=>setFormData({...formData,estado_civil:e.target.value})}
            className="border p-2 rounded w-full col-span-2"
            >
            <option value="">Estado civil</option>
            <option value="Soltero">Soltero</option>
            <option value="Casado">Casado</option>
            <option value="Divorciado">Divorciado</option>
            <option value="Viudo">Viudo</option>
            </select>

            </div>

            <div className="flex justify-end gap-3 pt-3">

            <button
            onClick={()=>setEditingHuesped(null)}
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
            >
            Cancelar
            </button>

            <button
            onClick={handleUpdate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
            Guardar
            </button>

            </div>

            </div>

            </div>
          )}
        </div>
      )}

      {!loading && filteredHuespedes.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[3rem] shadow-inner border-2 border-dashed border-gray-100">
          <p className="text-gray-400 font-black uppercase italic">No se encontraron huéspedes con ese criterio.</p>
        </div>
      )}
    </div>
  );
};

export default ViewHuesped;