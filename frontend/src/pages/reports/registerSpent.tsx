import { useEffect, useState, useMemo } from 'react';
import FormularioGasto from '../../components/gastos/FormularioGasto';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  FilterX, 
  Wallet, 
  Hash, 
  TrendingUp, 
  User as UserIcon,
  ChevronRight
} from 'lucide-react';

const RegisterSpent = () => {
  const [gastos, setGastos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Estados de los Filtros
  const [filtroDia, setFiltroDia] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear().toString());
  const [filtroTurno, setFiltroTurno] = useState('todos');

  const añosDisponibles = useMemo(() => {
    const añoActual = new Date().getFullYear();
    const años = [];
    for (let i = 2024; i <= añoActual; i++) {
      años.push(i.toString());
    }
    return años;
  }, []);

  const cargarGastos = () => {
    fetch('http://localhost:3000/api/gastos')
      .then(res => res.json())
      .then(data => {
        setGastos(data.gastos || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarGastos();
  }, []);

  const gastosFiltrados = useMemo(() => {
    return gastos.filter(gasto => {
      const fecha = new Date(gasto.fecha);
      const formatter = new Intl.DateTimeFormat('es-BO', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', hour12: false, timeZone: 'America/La_Paz'
      });
      
      const parts = formatter.formatToParts(fecha);
      const d = parts.find(p => p.type === 'day')?.value;
      const m = parts.find(p => p.type === 'month')?.value;
      const y = parts.find(p => p.type === 'year')?.value;
      const h = parseInt(parts.find(p => p.type === 'hour')?.value || '0');

      let turnoActual = 'otro';
      if (h >= 6 && h < 14) turnoActual = 'mañana';
      else if (h >= 14 && h < 22) turnoActual = 'tarde';

      const coincideDia = filtroDia ? d === filtroDia.split('-')[2] : true;
      const coincideMes = filtroMes ? m === filtroMes : true;
      const coincideAnio = filtroAnio ? y === filtroAnio : true;
      const coincideTurno = filtroTurno === 'todos' ? true : turnoActual === filtroTurno;

      return coincideDia && coincideMes && coincideAnio && coincideTurno;
    });
  }, [gastos, filtroDia, filtroMes, filtroAnio, filtroTurno]);

  const formatearFechaBolivia = (fechaStr: string) => {
    return new Date(fechaStr).toLocaleString('es-BO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
      timeZone: 'America/La_Paz'
    });
  };

  const getTurnoInfo = (fechaStr: string) => {
    const h = parseInt(new Intl.DateTimeFormat('es-BO', { 
        hour: '2-digit', hour12: false, timeZone: 'America/La_Paz' 
    }).format(new Date(fechaStr)));
    
    if (h >= 6 && h < 14) return { label: 'MAÑANA', color: 'bg-orange-100 text-orange-700 border-orange-200' };
    if (h >= 14 && h < 22) return { label: 'TARDE', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    return { label: 'NOCHE', color: 'bg-slate-100 text-slate-700 border-slate-200' };
  };

  const total = gastosFiltrados.reduce((sum, g) => sum + g.precio, 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#d4af37]"></div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-120px)] relative z-10 p-2 font-sans">
      
      {/* Header y Filtros */}
      <div className="bg-white p-5 rounded-xl shadow-sm border space-y-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
              <Wallet className="text-[#d4af37]" size={24} /> Registro de Gastos
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
              <Clock size={10} /> Control de Caja • Bolivia (GMT-4)
            </p>
          </div>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#d4af37] text-black rounded-lg font-bold hover:bg-[#c4a137] transition-all shadow-md active:scale-95 uppercase text-xs"
          >
            <Plus size={18} /> Registrar Gasto
          </button>
        </div>

        {/* Panel de Filtros con Iconos */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-3 border-t border-gray-100">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase ml-1 flex items-center gap-1">
              <Calendar size={12} /> Día Exacto
            </label>
            <input type="date" value={filtroDia} onChange={(e) => setFiltroDia(e.target.value)} className="w-full p-2 bg-gray-50 border rounded-lg text-sm focus:ring-2 ring-[#d4af37] outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase ml-1 flex items-center gap-1">
              <FilterX size={12} /> Mes
            </label>
            <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} className="w-full p-2 bg-gray-50 border rounded-lg text-sm outline-none cursor-pointer">
              <option value="">Todos los meses</option>
              {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                <option key={m} value={m}>{new Date(2026, parseInt(m)-1).toLocaleString('es', {month: 'long'})}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase ml-1 flex items-center gap-1">
              <Hash size={12} /> Año
            </label>
            <select value={filtroAnio} onChange={(e) => setFiltroAnio(e.target.value)} className="w-full p-2 bg-gray-50 border rounded-lg text-sm outline-none cursor-pointer">
              {añosDisponibles.map(año => <option key={año} value={año}>{año}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase ml-1 flex items-center gap-1">
              <Clock size={12} /> Turno
            </label>
            <select value={filtroTurno} onChange={(e) => setFiltroTurno(e.target.value)} className="w-full p-2 bg-gray-50 border rounded-lg text-sm outline-none cursor-pointer">
              <option value="todos">Todos los turnos</option>
              <option value="mañana">Mañana (06:00 - 14:00)</option>
              <option value="tarde">Tarde (14:00 - 22:00)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
                onClick={() => { setFiltroDia(''); setFiltroMes(''); setFiltroTurno('todos'); setFiltroAnio(new Date().getFullYear().toString()); }} 
                className="w-full py-2 text-[10px] text-red-500 font-black uppercase tracking-widest hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 flex items-center justify-center gap-2"
            >
                <FilterX size={14} /> Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Widgets con Iconos */}
      <div className="grid grid-cols-3 gap-4 shrink-0">
        <div className="p-4 bg-white border-b-4 border-blue-500 shadow-sm rounded-xl relative overflow-hidden group">
          <Wallet className="absolute right-[-10px] top-[-10px] text-blue-500/10 group-hover:scale-110 transition-transform" size={80} />
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Filtrado</p>
          <p className="text-2xl font-black text-gray-800">Bs. {total.toLocaleString('es-BO', {minimumFractionDigits: 2})}</p>
        </div>
        <div className="p-4 bg-white border-b-4 border-[#d4af37] shadow-sm rounded-xl relative overflow-hidden group">
          <Hash className="absolute right-[-10px] top-[-10px] text-[#d4af37]/10 group-hover:scale-110 transition-transform" size={80} />
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">N° Movimientos</p>
          <p className="text-2xl font-black text-gray-800">{gastosFiltrados.length}</p>
        </div>
        <div className="p-4 bg-white border-b-4 border-purple-500 shadow-sm rounded-xl relative overflow-hidden group">
          <TrendingUp className="absolute right-[-10px] top-[-10px] text-purple-500/10 group-hover:scale-110 transition-transform" size={80} />
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Promedio</p>
          <p className="text-2xl font-black text-gray-800">Bs. {gastosFiltrados.length > 0 ? (total / gastosFiltrados.length).toFixed(2) : '0.00'}</p>
        </div>
      </div>

      {/* Tabla con Iconos */}
      <div className="bg-white rounded-xl shadow-md border overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-y-auto flex-1">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-20 bg-gray-800 text-white shadow-md">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Fecha / Turno</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Detalle del Gasto</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Responsable</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {gastosFiltrados.length > 0 ? (
                gastosFiltrados.map((g, idx) => {
                  const turno = getTurnoInfo(g.fecha);
                  return (
                    <tr key={g.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-[#d4af37]/5 transition-colors group`}>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-gray-700 flex items-center gap-1">
                          <Calendar size={12} className="text-gray-400" /> {formatearFechaBolivia(g.fecha)}
                        </div>
                        <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 text-[9px] font-black rounded border shadow-sm ${turno.color}`}>
                          <Clock size={10} /> {turno.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ChevronRight size={14} className="text-[#d4af37] opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0" />
                          <span className="text-sm font-bold text-gray-800 uppercase tracking-tight">{g.producto}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <div className="bg-gray-100 p-1 rounded text-gray-500"><UserIcon size={12} /></div>
                          {g.usuario.nombre} {g.usuario.apellido}
                        </div>
                        <div className="text-[10px] text-[#8b7520] font-black uppercase ml-7">{g.usuario.cargo}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-lg font-black text-gray-900 tabular-nums">Bs. {g.precio.toFixed(2)}</span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                        <Search size={48} className="text-gray-400" />
                        <p className="text-gray-500 font-black italic uppercase text-xs tracking-[0.2em]">Sin resultados encontrados</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-8 py-4 flex justify-between items-center text-white shrink-0 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-[#d4af37] p-2 rounded-lg text-black">
              <Wallet size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Caja Total Filtrada</span>
              <span className="text-xs text-[#d4af37] font-bold">Resumen de Selección</span>
            </div>
          </div>
          <div className="text-2xl font-black text-white tabular-nums">
            <span className="text-sm text-[#d4af37] mr-1">Bs.</span>
            {total.toLocaleString('es-BO', {minimumFractionDigits: 2})}
          </div>
        </div>
      </div>

      {mostrarFormulario && (
        <FormularioGasto onClose={() => setMostrarFormulario(false)} onGastoCreado={cargarGastos} />
      )}
    </div>
  );
};

export default RegisterSpent;