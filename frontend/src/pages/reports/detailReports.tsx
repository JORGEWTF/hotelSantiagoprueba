import { X, User, Home, Calendar, Clock, CreditCard, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface DetailReportsProps {
  tipo: 'ingresos' | 'gastos';
  data: any[];
  onClose: () => void;
}

const DetailReports = ({ tipo, data, onClose }: DetailReportsProps) => {
  
  // Función para formatear la fecha correctamente (evitando desfases UTC)
  const formatearFecha = (fechaStr: string) => {
    if (!fechaStr) return "S/F";
    const f = new Date(fechaStr);
    // Usamos getUTC para que coincida con lo que guardamos en el backend
    return `${f.getUTCDate().toString().padStart(2, '0')}/${(f.getUTCMonth() + 1).toString().padStart(2, '0')}/${f.getUTCFullYear()}`;
  };

  // CORRECCIÓN DEL ERROR 1970:
  const formatearHora = (item: any) => {
    // Si es un gasto, usamos la fecha completa
    if (tipo === 'gastos') {
      return new Date(item.fecha).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    // Si es una reserva y existe hora_entrada (ej: "12:30:25.575")
    if (item.hora_entrada) {
      // Solo tomamos los primeros 5 caracteres (HH:MM)
      const partes = item.hora_entrada.split(':');
      if (partes.length >= 2) {
        const hora = parseInt(partes[0]);
        const ampm = hora >= 12 ? 'p.m.' : 'a.m.';
        const hora12 = hora % 12 || 12;
        return `${hora12}:${partes[1]} ${ampm}`;
      }
      return item.hora_entrada;
    }

    return "Check-in pendiente";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100">
        
        {/* Header */}
        <div className={`${tipo === 'ingresos' ? 'bg-green-600' : 'bg-red-600'} p-6 text-white flex justify-between items-center shrink-0`}>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              {tipo === 'ingresos' ? <ArrowUpCircle size={32} /> : <ArrowDownCircle size={32} />}
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">
                Detalle de {tipo === 'ingresos' ? 'Ingresos (Reservas)' : 'Gastos Realizados'}
              </h2>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest">
                {data.length} registros en el periodo
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X size={28} />
          </button>
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-800 text-white sticky top-0">
                <tr>
                  <th className="px-4 py-4 text-[10px] font-black uppercase">Fecha / Hora</th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase">
                    {tipo === 'ingresos' ? 'Cliente / Habitación' : 'Concepto / Producto'}
                  </th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase">Registrado por</th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase">Método de Pago</th>
                  <th className="px-4 py-4 text-right text-[10px] font-black uppercase">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                        <Calendar size={14} className="text-gray-400" /> {formatearFecha(item.fecha_entrada || item.fecha)}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold mt-1 uppercase">
                        <Clock size={12} /> {formatearHora(item)}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {tipo === 'ingresos' ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-black text-gray-800 uppercase">
                             <User size={14} className="text-[#d4af37]" /> 
                             {/* Ajuste según tu relación de base de datos */}
                             {item.huespedes_detalle?.[0]?.huesped?.nombres || 'S/N'} {item.huespedes_detalle?.[0]?.huesped?.apellidos || ''}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 w-fit px-2 py-0.5 rounded-md border border-blue-100">
                             <Home size={10} /> HAB. #{item.habitacion?.numero || item.habitacion_id}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm font-black text-gray-800 uppercase uppercase tracking-tight">
                          {item.producto}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-xs font-bold text-gray-700 uppercase">
                        {/* CORRECCIÓN: Si item.usuario.nombre falla, busca item.usuario_id o el campo que traiga tu include */}
                        {item.usuario?.nombre || 'Abel'} 
                      </div>
                      <div className="text-[9px] text-gray-400 font-bold uppercase">
                        {item.usuario?.cargo || 'Administrador'}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        {tipo === 'ingresos' ? (
                          <>
                            {Number(item.adelanto) > 0 && (
                              <span className="text-[9px] font-black px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-md w-fit">
                                ADELANTO: {item.metodo_adelanto || 'QR'}
                              </span>
                            )}
                            {Number(item.ingreso) > 0 && (
                              <span className="text-[9px] font-black px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md w-fit">
                                INGRESO: {item.metodo_ingreso || 'EFECTIVO'}
                              </span>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center gap-1 text-xs font-bold text-gray-600">
                            <CreditCard size={14} /> {item.metodo_pago || 'EFECTIVO'}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <span className={`text-lg font-black ${tipo === 'ingresos' ? 'text-green-700' : 'text-red-700'}`}>
                        Bs. {(tipo === 'ingresos' ? (Number(item.adelanto) + Number(item.ingreso)) : Number(item.precio)).toFixed(2)}
                      </span>
                      {tipo === 'ingresos' && item.observacion && (
                        <div className={`text-[9px] font-bold uppercase px-1 rounded ${item.observacion.includes('Falta') ? 'text-red-500' : 'text-gray-400'}`}>
                          {item.observacion}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white p-6 border-t flex justify-between items-center shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase">Total Periodo</span>
            <div className={`text-3xl font-black ${tipo === 'ingresos' ? 'text-green-600' : 'text-red-600'}`}>
              Bs. {data.reduce((sum, item) => sum + (tipo === 'ingresos' ? (Number(item.adelanto) + Number(item.ingreso)) : Number(item.precio)), 0).toFixed(2)}
            </div>
          </div>
          <button onClick={() => window.print()} className="bg-gray-800 text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase">
            Imprimir Lista
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailReports;