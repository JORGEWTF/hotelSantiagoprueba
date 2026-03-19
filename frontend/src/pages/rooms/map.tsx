import React from 'react';
import { Armchair, Bath, UtensilsCrossed, Square } from 'lucide-react';

interface Habitacion {
  id: number;
  numero: number;
  piso: number;
  tipo_habitacion: string;
  ocupado: boolean;
  estado: string;
}

interface MapProps {
  habitaciones: Habitacion[];
  pisoActual: number;
}

const Map: React.FC<MapProps> = ({ habitaciones, pisoActual }) => {
  
  const getRoom = (num: number) => habitaciones.find(h => h.numero === num);

  // Componente para espacios estructurales (Solo para el Piso 1)
  const WallBox = ({ className = "" }: { className?: string }) => (
    <div className={`absolute border-2 border-gray-300 bg-gray-200/50 flex items-center justify-center ${className}`}>
        <Square size={12} className="text-gray-400 opacity-20" />
    </div>
  );

  const RoomBox = ({ num, className = "" }: { num: number, className?: string }) => {
    const room = getRoom(num);
    if (!room) return <WallBox className={className} />;

    const isOccupied = room.ocupado;
    const isDirty = room.estado === 'Sucio';

    return (
      <div 
        className={`absolute border-2 transition-all duration-300 flex flex-col items-center justify-center group shadow-sm rounded-sm
          ${className}
          ${isOccupied 
            ? 'bg-red-50 border-red-300 hover:bg-red-100 shadow-red-100' 
            : isDirty 
              ? 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100 shadow-yellow-100 animate-pulse-slow' 
              : 'bg-green-50 border-green-300 hover:bg-green-100 shadow-green-100'}
        `}
      >
        <span className="absolute top-1 left-1.5 text-sm font-black text-gray-800">{num}</span>
        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter mt-2 text-center px-1">
          {room.tipo_habitacion}
        </span>
        
        {/* Etiqueta de Estado Dinámica */}
        <div className={`mt-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase 
          ${isOccupied ? 'bg-red-200 text-red-700' : 
            isDirty ? 'bg-yellow-200 text-yellow-700' : 
            'bg-green-200 text-green-700'}`}
        >
          {isOccupied ? 'Ocupado' : isDirty ? 'Sucio' : 'Libre'}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-white p-4 rounded-3xl border-2 border-gray-100 shadow-2xl overflow-hidden">
      <div className="relative w-full aspect-[3/4] bg-slate-50 rounded-xl border-4 border-gray-800 overflow-hidden">
        
        {/* Techo diagonal */}
        <div className="absolute top-0 left-0 w-full h-12 bg-gray-800 z-10" style={{ clipPath: 'polygon(0 40%, 100% 0, 100% 100%, 0 100%)' }} />

        {/* --- PISO 1 (Con espacios estructurales) --- */}
        {pisoActual === 1 && (
          <>
            <RoomBox num={2} className="top-[10%] left-[2%] w-[25%] h-[14%]" />
            <RoomBox num={4} className="top-[25%] left-[2%] w-[25%] h-[14%]" />
            <RoomBox num={5} className="top-[40%] left-[2%] w-[25%] h-[12%]" />
            <RoomBox num={6} className="top-[53%] left-[2%] w-[25%] h-[14%]" />
            <RoomBox num={9} className="top-[68%] left-[2%] w-[25%] h-[14%]" />
            <RoomBox num={11} className="top-[83%] left-[2%] w-[25%] h-[15%]" />
            
            <RoomBox num={1} className="top-[8%] left-[38%] w-[25%] h-[15%]" />
            <WallBox className="top-[24%] left-[38%] w-[25%] h-[16%]" /> {/* Estructural */}
            <WallBox className="top-[54%] left-[38%] w-[25%] h-[14%]" /> {/* Estructural */}
            <WallBox className="top-[69%] left-[38%] w-[25%] h-[14%]" /> {/* Estructural */}
            <RoomBox num={10} className="top-[84%] left-[38%] w-[25%] h-[14%]" />
            
            <RoomBox num={12} className="top-[6%] left-[73%] w-[25%] h-[16%]" />
            <WallBox className="top-[23%] left-[73%] w-[25%] h-[18%]" /> {/* Estructural */}
            <RoomBox num={14} className="top-[42%] left-[73%] w-[25%] h-[12%]" />
            <WallBox className="top-[55%] left-[73%] w-[25%] h-[14%]" /> {/* Estructural */}
            <RoomBox num={16} className="top-[70%] left-[73%] w-[25%] h-[14%]" />
            <RoomBox num={17} className="top-[85%] left-[73%] w-[25%] h-[13%]" />
          </>
        )}

        {/* --- PISO 2 --- */}
        {pisoActual === 2 && (
          <>
            <RoomBox num={19} className="top-[10%] left-[2%] w-[25%] h-[14%]" />
            <RoomBox num={20} className="top-[25%] left-[2%] w-[25%] h-[14%]" />
            <RoomBox num={21} className="top-[40%] left-[2%] w-[25%] h-[12%]" />
            <RoomBox num={22} className="top-[53%] left-[2%] w-[25%] h-[14%]" />
            <RoomBox num={25} className="top-[68%] left-[2%] w-[25%] h-[14%]" />
            <RoomBox num={27} className="top-[83%] left-[2%] w-[25%] h-[15%]" />
            
            <RoomBox num={18} className="top-[8%] left-[38%] w-[25%] h-[15%]" />
            <RoomBox num={30} className="top-[24%] left-[38%] w-[25%] h-[16%]" />
            <RoomBox num={23} className="top-[54%] left-[38%] w-[25%] h-[14%]" />
            <RoomBox num={24} className="top-[69%] left-[38%] w-[25%] h-[14%]" />
            <RoomBox num={26} className="top-[84%] left-[38%] w-[25%] h-[14%]" />
            
            <RoomBox num={28} className="top-[6%] left-[73%] w-[25%] h-[16%]" />
            <RoomBox num={29} className="top-[23%] left-[73%] w-[25%] h-[18%]" />
            <RoomBox num={31} className="top-[42%] left-[73%] w-[25%] h-[12%]" />
            <RoomBox num={32} className="top-[55%] left-[73%] w-[25%] h-[14%]" />
            <RoomBox num={33} className="top-[70%] left-[73%] w-[25%] h-[14%]" />
            <RoomBox num={34} className="top-[85%] left-[73%] w-[25%] h-[13%]" />
          </>
        )}

        {/* --- PISO 3 --- */}
        {pisoActual === 3 && (
          <>
            <RoomBox num={36} className="top-[10%] left-[2%] w-[25%] h-[14%]" />
            <RoomBox num={37} className="top-[25%] left-[2%] w-[25%] h-[14%]" />
            <RoomBox num={38} className="top-[40%] left-[2%] w-[25%] h-[12%]" />
            <RoomBox num={39} className="top-[53%] left-[2%] w-[25%] h-[14%]" />
            <RoomBox num={42} className="top-[68%] left-[2%] w-[25%] h-[14%]" />
            <RoomBox num={44} className="top-[83%] left-[2%] w-[25%] h-[15%]" />
            
            <RoomBox num={35} className="top-[8%] left-[38%] w-[25%] h-[15%]" />
            <RoomBox num={47} className="top-[24%] left-[38%] w-[25%] h-[16%]" />
            <RoomBox num={40} className="top-[54%] left-[38%] w-[25%] h-[14%]" />
            <RoomBox num={41} className="top-[69%] left-[38%] w-[25%] h-[14%]" />
            <RoomBox num={43} className="top-[84%] left-[38%] w-[25%] h-[14%]" />
            
            <RoomBox num={45} className="top-[6%] left-[73%] w-[25%] h-[16%]" />
            <RoomBox num={46} className="top-[23%] left-[73%] w-[25%] h-[18%]" />
            <RoomBox num={48} className="top-[42%] left-[73%] w-[25%] h-[12%]" />
            <RoomBox num={49} className="top-[55%] left-[73%] w-[25%] h-[14%]" />
            <RoomBox num={50} className="top-[70%] left-[73%] w-[25%] h-[14%]" />
            <RoomBox num={51} className="top-[85%] left-[73%] w-[25%] h-[13%]" />
          </>
        )}

        {/* --- PISO 4 --- */}
        {pisoActual === 4 && (
          <>
            <RoomBox num={52} className="top-[10%] left-[2%] w-[25%] h-[14%]" />
            <RoomBox num={53} className="top-[25%] left-[2%] w-[25%] h-[14%]" />
            <RoomBox num={54} className="top-[40%] left-[2%] w-[25%] h-[14%]" />
            <RoomBox num={55} className="top-[55%] left-[2%] w-[25%] h-[14%]" />
            <RoomBox num={56} className="top-[70%] left-[2%] w-[25%] h-[28%]" />

            <div className="absolute top-[8%] left-[38%] w-[25%] h-[32%] bg-blue-50 border-2 border-blue-200 rounded-md flex flex-col items-center justify-center text-blue-500 shadow-inner">
               <Armchair size={32} />
               <span className="text-[10px] font-black uppercase mt-2">Living</span>
            </div>

            <RoomBox num={59} className="top-[6%] left-[73%] w-[25%] h-[16%]" />
            <div className="absolute top-[31%] left-[73%] w-[25%] h-[20%] bg-orange-50 border-2 border-orange-200 rounded-md flex flex-col items-center justify-center text-orange-500 shadow-inner">
                <UtensilsCrossed size={24} />
                <span className="text-[10px] font-black uppercase mt-1">Cocina</span>
            </div>
            <div className="absolute top-[52%] left-[73%] w-[25%] h-[15%] bg-cyan-50 border-2 border-cyan-200 rounded-md flex flex-col items-center justify-center text-cyan-600 shadow-inner">
                <Bath size={20} />
                <span className="text-[8px] font-black uppercase text-center">Baño Gral.</span>
            </div>
            <RoomBox num={58} className="top-[68%] left-[73%] w-[25%] h-[14%]" />
            <RoomBox num={57} className="top-[83%] left-[73%] w-[25%] h-[15%]" />
          </>
        )}

        {/* H central común */}
        <div className="absolute top-[43%] left-[39%] w-[24%] h-[10%] flex items-center justify-center">
            <div className="w-16 h-12 border-4 border-gray-400 flex items-center justify-center font-black text-gray-400 text-xl bg-slate-100">H</div>
        </div>

        {/* Pasillos */}
        <div className="absolute top-[10%] left-[27%] w-[11%] h-[85%] bg-slate-200/20 border-x border-dashed border-gray-300"></div>
        <div className="absolute top-[10%] left-[63%] w-[10%] h-[85%] bg-slate-200/20 border-x border-dashed border-gray-300"></div>
      </div>
      
      {/* LEYENDA DINÁMICA */}
      <div className="mt-4 flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Libre</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span>Ocupado</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
            <span>Sucio</span>
         </div>
      </div>
    </div>
  );
};

export default Map;