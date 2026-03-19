import React, { useEffect, useState, useMemo } from 'react';
import RegisterUser from './registerUser';
import { Trash, Search, Filter, X, UserPlus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  carnet: number;
  celular: number;
  cargo: string;
  genero: string;
}

const ViewUser: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCargo, setFilterCargo] = useState('todos');

  const fetchUsuarios = () => {
    setLoading(true);
    fetch('http://localhost:3000/api/auth/usuarios')
      .then(res => res.json())
      .then(data => {
        setUsuarios(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const matchesSearch =
        u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.carnet.toString().includes(searchTerm);
      const matchesCargo = filterCargo === 'todos' || u.cargo.toLowerCase() === filterCargo.toLowerCase();
      return matchesSearch && matchesCargo;
    });
  }, [usuarios, searchTerm, filterCargo]);

  const handleDelete = async (id: number, nombreCompleto: string) => {
    if (currentUser && id === currentUser.id) {
      alert("No puedes eliminar tu propia cuenta.");
      return;
    }
    if (window.confirm(`¿Está seguro de eliminar a:\n${nombreCompleto}?`)) {
      try {
        const res = await fetch(`http://localhost:3000/api/auth/usuario/${id}`, { method: 'DELETE' });
        if (res.ok) setUsuarios(usuarios.filter(u => u.id !== id));
        else alert("Error al eliminar el usuario");
      } catch (err) {
        alert("Error de conexión");
      }
    }
  };

  const getBadgeColor = (cargo: string) => {
    switch (cargo.toLowerCase().trim()) {
      case 'administrador': return 'bg-black text-[#d4af37] border border-[#d4af37]';
      case 'recepcion': return 'bg-blue-100 text-blue-700';
      case 'limpieza': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="relative bg-white rounded-sm shadow-xl border border-gray-100 overflow-hidden animate-in fade-in duration-500">

      {/* HEADER RESPONSIVE */}
      <div className="bg-zinc-900 px-4 md:px-8 py-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="w-full lg:w-auto text-center lg:text-left">
            <h2 className="text-[#d4af37] font-serif text-xl tracking-widest uppercase">Personal Registrado</h2>
            <p className="text-gray-400 text-[10px] uppercase tracking-tighter mt-1">Gestión operativa del hotel</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Buscador */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input
                type="text"
                placeholder="Buscar por nombre o CI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-full py-2.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-[#d4af37] transition-all"
              />
            </div>

            {/* Filtro de Cargo */}
            <div className="relative w-full sm:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <select
                value={filterCargo}
                onChange={(e) => setFilterCargo(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-full py-2.5 pl-9 pr-8 text-xs text-white appearance-none focus:outline-none focus:border-[#d4af37] cursor-pointer"
              >
                <option value="todos">Todos los Cargos</option>
                <option value="administrador">Administradores</option>
                <option value="recepcion">Recepción</option>
                <option value="limpieza">Limpieza</option>
              </select>
            </div>

            {/* Botón Añadir Desktop */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="hidden lg:flex bg-[#d4af37] hover:bg-[#b8962d] text-black w-10 h-10 rounded-full items-center justify-center shadow-lg transition-transform active:scale-90"
            >
              <UserPlus size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* BOTÓN FLOTANTE MÓVIL */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-[#d4af37] text-black w-14 h-14 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform border-4 border-white"
      >
        <UserPlus size={24} strokeWidth={2.5} />
      </button>

      {/* TABLA / CARD VIEW */}
      <div className="w-full overflow-hidden">
        {/* Vista Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Personal</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Carnet</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cargo</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Estado</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400 italic">Cargando personal...</td></tr>
              ) : usuariosFiltrados.map((u) => {
                const isOnline = currentUser && u.id === currentUser.id;
                return (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-400 font-serif uppercase">
                          {u.nombre[0]}{u.apellido[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{u.nombre} {u.apellido}</p>
                          <p className="text-[10px] text-gray-400">{u.genero}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{u.carnet}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${getBadgeColor(u.cargo)}`}>
                        {u.cargo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                        <span className={`text-[9px] font-bold uppercase ${isOnline ? 'text-green-700' : 'text-gray-400'}`}>
                          {isOnline ? 'Tú' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {!isOnline ? (
                        <button
                          onClick={() => handleDelete(u.id, `${u.nombre} ${u.apellido}`)}
                          className="mx-auto flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100 transition-all duration-200"
                        >
                          <Trash size={14} />
                        </button>
                      ) : (
                        <CheckCircle2 size={16} className="mx-auto text-green-500 opacity-50" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Vista Móvil */}
        <div className="md:hidden grid grid-cols-1 gap-4 p-4 bg-gray-50/50">
          {usuariosFiltrados.map((u) => {
            const isOnline = currentUser && u.id === currentUser.id;
            return (
              <div key={u.id} className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 text-[#d4af37] flex items-center justify-center font-serif font-bold text-xs uppercase">
                    {u.nombre[0]}{u.apellido[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{u.nombre} {u.apellido}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${getBadgeColor(u.cargo)}`}>{u.cargo}</span>
                      <span className="text-[10px] text-gray-400">CI: {u.carnet}</span>
                    </div>
                  </div>
                </div>
                {!isOnline && (
                  <button
                    onClick={() => handleDelete(u.id, `${u.nombre} ${u.apellido}`)}
                    className="absolute top-5 right-5 bg-red-50 text-red-500 p-2 rounded-full border border-red-100"
                  >
                    <Trash size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL RESPONSIVE CON BOTÓN DE CIERRE MEJORADO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative w-full h-full sm:h-auto sm:max-w-4xl bg-white sm:rounded-sm overflow-hidden animate-in slide-in-from-bottom duration-300">

            {/* BOTÓN DE CIERRE: Alto Contraste */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-[110] bg-white text-black hover:bg-red-500 hover:text-white w-10 h-10 rounded-full flex items-center justify-center shadow-2xl border border-gray-200 transition-all active:scale-90 group"
            >
              <X size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <div className="h-full max-h-screen overflow-y-auto">
              <RegisterUser />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewUser;