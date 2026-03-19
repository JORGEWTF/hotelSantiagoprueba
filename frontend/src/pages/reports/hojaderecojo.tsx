import { useMemo } from 'react'; 
import { X, Printer, Hotel } from 'lucide-react'; 

interface HojaDeRecojoProps {
  habitaciones: any[];
  reservas: any[];
  gastos: any[];
  onClose: () => void;
  mes: string;
  anio: string;
}

const HojaDeRecojo = ({ habitaciones, reservas, gastos, onClose, mes, anio }: HojaDeRecojoProps) => {
  
  // Procesar datos financieros para el panel derecho
  const finanzas = useMemo(() => {
    const totalReservas = reservas.reduce((sum, r) => sum + (Number(r.adelanto) || 0) + (Number(r.ingreso) || 0), 0);
    const totalGastos = gastos.reduce((sum, g) => sum + Number(g.precio), 0);
    const cajaInicial = 130; // Valor de ejemplo según tu imagen
    
    return {
      totalReservas,
      totalGastos,
      cajaInicial,
      totalEfectivo: (totalReservas + cajaInicial) - totalGastos
    };
  }, [reservas, gastos]);

  // Dividir habitaciones en dos columnas (1-30 y 31-59) como el papel
  const col1 = habitaciones.filter(h => h.numero <= 30).sort((a,b) => a.numero - b.numero);
  const col2 = habitaciones.filter(h => h.numero > 30).sort((a,b) => a.numero - b.numero);

  const FilaHabitacion = ({ hab }: { hab: any }) => {
    // Buscar si hay una reserva activa para esta habitación en el mes/año actual
    const reservaActiva = reservas.find(r => r.habitacion_id === hab.id || r.numero_habitacion === hab.numero);
    const monto = reservaActiva ? (Number(reservaActiva.adelanto) || 0) + (Number(reservaActiva.ingreso) || 0) : "";

    return (
      <tr className="border-b border-gray-300 text-[9px] uppercase font-bold">
        <td className="border-r border-gray-300 py-1 text-center bg-gray-50">{hab.numero}</td>
        <td className="border-r border-gray-300 py-1 text-center">{hab.estado === 'Ocupado' ? 'SI' : ''}</td>
        <td className="border-r border-gray-300 py-1 text-center text-gray-300">---</td>
        <td className="border-r border-gray-300 py-1 px-1 text-right">{monto}</td>
        <td className="py-1 px-1 text-[8px] italic text-gray-400">{hab.tipo_habitacion.substring(0,8)}</td>
      </tr>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl h-[95vh] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* HEADER CONTROL */}
        <div className="bg-gray-800 p-4 text-white flex justify-between items-center shrink-0 print:hidden">
          <div className="flex items-center gap-4">
            <h2 className="font-black uppercase tracking-tighter flex items-center gap-2">
              <Hotel size={20} className="text-[#d4af37]" /> Vista de Impresión: Hoja de Recojo
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="bg-white/10 hover:bg-[#d4af37] p-2 rounded-lg transition-colors">
              <Printer size={20} />
            </button>
            <button onClick={onClose} className="bg-white/10 hover:bg-red-500 p-2 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* CONTENIDO DE LA HOJA (Formato Papel) */}
        <div className="flex-1 overflow-y-auto p-8 bg-white print:p-0" id="print-area">
          <div className="border-2 border-gray-800 p-4 min-h-full">
            
            {/* ENCABEZADO TÉCNICO */}
            <div className="grid grid-cols-3 border-b-2 border-gray-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-gray-800 text-white p-2 font-black text-xl">HT</div>
                <div>
                  <h1 className="font-black text-sm uppercase">Hotel Trizor</h1>
                  <p className="text-[8px] font-bold text-gray-400 uppercase">Gestión de Calidad v3.0</p>
                </div>
              </div>
              <div className="text-center">
                <h2 className="font-black text-lg uppercase underline">Recojo de Caja</h2>
                <h3 className="font-bold text-xs uppercase italic text-gray-500">Revisión de Llaves</h3>
              </div>
              <div className="text-[8px] font-bold text-right space-y-1">
                <p>REGISTRO: REG-ADM-CAJA</p>
                <p>PERIODO: {mes} / {anio}</p>
                <p>FECHA EMISIÓN: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* CUERPO PRINCIPAL (TABLAS + PANEL FINANCIERO) */}
            <div className="grid grid-cols-12 gap-0 border border-gray-800">
              
              {/* COLUMNA 1 (Habs 1-30) */}
              <div className="col-span-4 border-r border-gray-800">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-800 text-[8px] font-black uppercase">
                      <th className="border-r border-gray-300 w-8 py-1">#</th>
                      <th className="border-r border-gray-300 w-12">Hosp.</th>
                      <th className="border-r border-gray-300">A/T/S/U</th>
                      <th className="border-r border-gray-300 w-16 text-right px-1">Monto</th>
                      <th>Obs.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {col1.map(h => <FilaHabitacion key={h.id} hab={h} />)}
                  </tbody>
                </table>
              </div>

              {/* COLUMNA 2 (Habs 31-59) */}
              <div className="col-span-4 border-r border-gray-800">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-800 text-[8px] font-black uppercase">
                      <th className="border-r border-gray-300 w-8 py-1">#</th>
                      <th className="border-r border-gray-300 w-12">Hosp.</th>
                      <th className="border-r border-gray-300">A/T/S/U</th>
                      <th className="border-r border-gray-300 w-16 text-right px-1">Monto</th>
                      <th>Obs.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {col2.map(h => <FilaHabitacion key={h.id} hab={h} />)}
                  </tbody>
                </table>
              </div>

              {/* PANEL DERECHO (Finanzas y Resumen) */}
              <div className="col-span-4 p-4 space-y-4 bg-gray-50/50">
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-gray-400 py-1">
                    <span className="text-[10px] font-black uppercase">Responsable:</span>
                    <span className="text-[10px] font-bold border-b border-dotted border-gray-800 flex-1 ml-2"></span>
                  </div>
                  <div className="flex justify-between border-b border-gray-400 py-1">
                    <span className="text-[10px] font-black uppercase">Fecha y Hora:</span>
                    <span className="text-[10px] font-bold ml-2 italic">{new Date().toLocaleString()}</span>
                  </div>
                </div>

                {/* CALCULOS FINANCIEROS */}
                <div className="border-2 border-gray-800 bg-white p-3 space-y-2 shadow-inner">
                  <div className="flex justify-between text-[11px] font-black border-b border-gray-200">
                    <span>TOTALES SUMA</span>
                    <span>{finanzas.totalReservas.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-black border-b border-gray-200">
                    <span>CAJA INICIAL</span>
                    <span>{finanzas.cajaInicial.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-black border-b-2 border-gray-800 bg-gray-100 px-1">
                    <span>TOTAL</span>
                    <span>{(finanzas.totalReservas + finanzas.cajaInicial).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-black border-b border-gray-200 text-red-600">
                    <span>GASTOS</span>
                    <span>-{finanzas.totalGastos.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black bg-gray-800 text-white p-1 rounded mt-2">
                    <span>TOTAL EFECTIVO</span>
                    <span>Bs. {finanzas.totalEfectivo.toFixed(2)}</span>
                  </div>
                </div>

                {/* LEYENDA TÉCNICA (SÍMBOLOS) */}
                <div className="text-[7px] font-bold text-gray-500 uppercase leading-tight space-y-1 mt-auto">
                    <p className="border-b border-gray-300 font-black text-gray-800">Símbolos de Control:</p>
                    <p>A: Aseo Requerido</p>
                    <p>T: Falta de Toallas</p>
                    <p>S: Cambio de Sábanas</p>
                    <p>U: Utensilios / Insumos</p>
                    <p>CTRL: Hab. en control o mantenimiento</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HojaDeRecojo;