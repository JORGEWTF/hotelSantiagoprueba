import { useEffect, useState, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart,
  FileText,
  Wallet,
  Loader2,
  Hash
} from 'lucide-react';
import DetailReports from './detailReports';
import HojaDeRecojo from './hojaderecojo';

const Reports = () => {
  // Estados de datos
  const [gastos, setGastos] = useState<any[]>([]);
  const [reservas, setReservas] = useState<any[]>([]);
  const [habitaciones, setHabitaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de UI
  const [tipoDetalle, setTipoDetalle] = useState<'ingresos' | 'gastos' | null>(null);
  const [showHojaRecojo, setShowHojaRecojo] = useState(false);

  // Filtros inicializados en el mes y año actual
  const [filtroMes, setFiltroMes] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear().toString());

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resGastos, resReservas, resHabitaciones] = await Promise.all([
        fetch('http://localhost:3000/api/gastos').then(res => res.json()),
        fetch('http://localhost:3000/api/reservas').then(res => res.json()),
        fetch('http://localhost:3000/api/habitaciones').then(res => res.json())
      ]);

      setGastos(resGastos.gastos || []);
      setReservas(Array.isArray(resReservas) ? resReservas : resReservas.reservas || []); 
      setHabitaciones(resHabitaciones.habitaciones || []);
    } catch (err) {
      console.error('❌ Error al cargar reportes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // PROCESAMIENTO DE DATOS FILTRADOS POR MES/AÑO
  const filteredData = useMemo(() => {
    const ingresos = reservas.filter(r => {
      const f = new Date(r.fecha_entrada);
      const m = (f.getUTCMonth() + 1).toString().padStart(2, '0');
      const y = f.getUTCFullYear().toString();
      return m === filtroMes && y === filtroAnio;
    });

    const egresos = gastos.filter(g => {
      const f = new Date(g.fecha);
      const m = (f.getUTCMonth() + 1).toString().padStart(2, '0');
      const y = f.getUTCFullYear().toString();
      return m === filtroMes && y === filtroAnio;
    });

    return { ingresos, egresos };
  }, [gastos, reservas, filtroMes, filtroAnio]);

  // ESTADÍSTICAS FINALES
  const stats = useMemo(() => {
    const totalIngresos = filteredData.ingresos.reduce((sum, r) => 
      sum + (Number(r.adelanto) || 0) + (Number(r.ingreso) || 0), 0);
    
    const totalEgresos = filteredData.egresos.reduce((sum, g) => 
      sum + (Number(g.precio) || 0), 0);
    
    const balance = totalIngresos - totalEgresos;

    return {
      totalIngresos,
      totalEgresos,
      balance,
      countReservas: filteredData.ingresos.length,
      countGastos: filteredData.egresos.length
    };
  }, [filteredData]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="animate-spin text-[#d4af37]" size={48} />
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Cargando Análisis Financiero...</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-4 font-sans bg-gray-50 min-h-screen relative z-10">
      
      {/* HEADER Y FILTROS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
            <BarChart3 className="text-[#d4af37]" /> Reporte de Caja
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            Análisis de Gestión Operativa • Hotel Trizor
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
          <Calendar className="text-gray-400 ml-2" size={18} />
          <select 
            value={filtroMes} 
            onChange={(e) => setFiltroMes(e.target.value)}
            className="bg-transparent text-sm font-bold outline-none cursor-pointer p-1"
          >
            {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
              <option key={m} value={m}>{new Date(2026, parseInt(m)-1).toLocaleString('es', {month: 'long'})}</option>
            ))}
          </select>
          <select 
            value={filtroAnio} 
            onChange={(e) => setFiltroAnio(e.target.value)}
            className="bg-transparent text-sm font-bold outline-none cursor-pointer p-1 border-l pl-2"
          >
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
      </div>

      {/* WIDGETS DE TOTALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => setTipoDetalle('ingresos')}
          className="bg-white p-6 rounded-2xl border-b-4 border-green-500 shadow-sm relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all"
        >
          <ArrowUpRight className="absolute right-4 top-4 text-green-500/10 group-hover:scale-125 transition-transform" size={60} />
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Ingresos Totales</p>
          <h2 className="text-3xl font-black text-gray-800 mt-2">Bs. {stats.totalIngresos.toLocaleString('es-BO', {minimumFractionDigits: 2})}</h2>
          <span className="text-[10px] text-green-600 font-bold uppercase tracking-tighter">Click para ver reservas</span>
        </div>

        <div 
          onClick={() => setTipoDetalle('gastos')}
          className="bg-white p-6 rounded-2xl border-b-4 border-red-500 shadow-sm relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all"
        >
          <ArrowDownRight className="absolute right-4 top-4 text-red-500/10 group-hover:scale-125 transition-transform" size={60} />
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Gastos Realizados</p>
          <h2 className="text-3xl font-black text-gray-800 mt-2">Bs. {stats.totalEgresos.toLocaleString('es-BO', {minimumFractionDigits: 2})}</h2>
          <span className="text-[10px] text-red-600 font-bold uppercase tracking-tighter">Click para ver egresos</span>
        </div>

        <div className={`p-6 rounded-2xl border-b-4 shadow-sm relative overflow-hidden ${stats.balance >= 0 ? 'border-blue-500 bg-blue-50/20' : 'border-orange-500 bg-orange-50/20'}`}>
          <Wallet className="absolute right-4 top-4 text-gray-400/10" size={60} />
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Balance Neto</p>
          <h2 className={`text-3xl font-black mt-2 ${stats.balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            Bs. {stats.balance.toLocaleString('es-BO', {minimumFractionDigits: 2})}
          </h2>
          <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-tighter font-mono">Real-time Balance</p>
        </div>
      </div>

      {/* DASHBOARD ANALÍTICO E IMPRESIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        
        {/* Gráfico de Barras de Rendimiento */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-sm font-black text-gray-700 uppercase mb-8 flex items-center gap-2 font-mono">
            <PieChart className="text-[#d4af37]" size={18} /> Rendimiento Proporcional
          </h3>
          <div className="flex-1 space-y-8">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase">
                <span className="text-gray-500">Ingresos</span>
                <span className="text-green-600">100%</span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 w-full" /></div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase">
                <span className="text-gray-500">Gastos</span>
                <span className="text-red-600">{(stats.totalIngresos > 0 ? (stats.totalEgresos / stats.totalIngresos) * 100 : 0).toFixed(1)}%</span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all duration-1000" 
                  style={{ width: `${stats.totalIngresos > 0 ? Math.min((stats.totalEgresos / stats.totalIngresos) * 100, 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Margen de Ganancia</p>
            <p className={`text-3xl font-black ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.totalIngresos > 0 ? ((stats.balance / stats.totalIngresos) * 100).toFixed(1) : '0.0'}%
            </p>
          </div>
        </div>

        {/* Panel de Auditoría y Botones de Hoja de Recojo */}
        <div className="bg-gray-800 p-8 rounded-2xl shadow-xl text-white flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black uppercase mb-6 flex items-center gap-2 text-[#d4af37]">
              <FileText size={18} /> Auditoría Mensual
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Total Operaciones</span>
                <span className="text-xl font-black">{stats.countReservas + stats.countGastos}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Ticket Promedio</span>
                <span className="text-xl font-black text-[#d4af37]">Bs. {stats.countReservas > 0 ? (stats.totalIngresos / stats.countReservas).toFixed(2) : '0.00'}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3 mt-8">
            <button 
              onClick={() => setShowHojaRecojo(true)} 
              className="w-full py-4 bg-[#d4af37] hover:bg-[#c4a137] text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-yellow-500/10 active:scale-95 flex items-center justify-center gap-2"
            >
              <Hash size={16} /> Desplegar Hoja de Recojo
            </button>
            <button 
              onClick={() => window.print()} 
              className="w-full py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
            >
              <FileText size={16} /> Exportar Auditoría PDF
            </button>
          </div>
        </div>
      </div>

      {/* MODALES DINÁMICOS */}
      {tipoDetalle && (
        <DetailReports 
          tipo={tipoDetalle} 
          data={tipoDetalle === 'ingresos' ? filteredData.ingresos : filteredData.egresos} 
          onClose={() => setTipoDetalle(null)} 
        />
      )}

      {showHojaRecojo && (
        <HojaDeRecojo 
          habitaciones={habitaciones}
          reservas={filteredData.ingresos}
          gastos={filteredData.egresos}
          mes={filtroMes}
          anio={filtroAnio}
          onClose={() => setShowHojaRecojo(false)}
        />
      )}
    </div>
  );
};

export default Reports;