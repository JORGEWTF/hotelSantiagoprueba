import axiosInstance from '../../api/axios';

export interface Huesped {
  nombres: string;
  apellidos: string;
  carnet: string;
  complemento: string;
  celular: string;
  genero: string;
  profesion: string;
  fecha_nacimiento: string;
  nacionalidad: string;
  ciudad_nacimiento: string;
  estado_civil: string;
  en_lista_negra?: boolean;
}

interface HuespedesSectionProps {
  huespedes: Huesped[];
  // Cambiamos el tipo para permitir actualizaciones funcionales (prev => ...)
  setHuespedes: (update: Huesped[] | ((prev: Huesped[]) => Huesped[])) => void;
}

const HuespedesSection: React.FC<HuespedesSectionProps> = ({ huespedes, setHuespedes }) => {

  const buscarHuesped = async (index: number, carnet: string) => {
    // Restricción: No disparar la petición si tiene menos de 7 caracteres
    if (carnet.length < 7) return;

    try {
      // 1. Obtener datos básicos del huésped
      const response = await axiosInstance.get(`/huespedes/${carnet}`);

      // 2. Verificar lista negra (Paralelo)
      const blacklistRes = await axiosInstance.get(`/lista-negra/check/${carnet}`);

      const enListaNegra = blacklistRes.data?.en_lista_negra || false;

      if (response.data || enListaNegra) {
        const h = response.data || {};

        // Usamos la actualización funcional para evitar el error de "bloqueo" de caracteres
        setHuespedes((prevHuespedes) => {
          const nuevos = [...prevHuespedes];

          // Verificación de seguridad: solo actualizar si el carnet sigue siendo el mismo que buscamos
          if (nuevos[index] && nuevos[index].carnet === carnet) {
            nuevos[index] = {
              ...nuevos[index],
              nombres: h.nombres || nuevos[index].nombres,
              apellidos: h.apellidos || nuevos[index].apellidos,
              complemento: h.complemento || 'LP',
              celular: h.celular || nuevos[index].celular,
              genero: h.genero || 'Masculino',
              profesion: h.profesion || '',
              fecha_nacimiento: h.fecha_nacimiento ? h.fecha_nacimiento.split('T')[0] : '',
              nacionalidad: h.nacionalidad || 'Boliviano',
              ciudad_nacimiento: h.ciudad_nacimiento || '',
              estado_civil: h.estado_civil || 'Soltero',
              en_lista_negra: enListaNegra
            };
          }
          return nuevos;
        });
      }
    } catch (error) {
      console.log("Error al verificar huésped o lista negra.");
    }
  };

  const handleChangeHuesped = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Actualizamos el estado inmediatamente para que la escritura sea fluida
    const nuevosHuespedes = [...huespedes];
    nuevosHuespedes[index] = { ...nuevosHuespedes[index], [name]: value };
    setHuespedes(nuevosHuespedes);

    // Solo disparamos la búsqueda si es el campo carnet y tiene 7 o más caracteres
    if (name === 'carnet' && value.length >= 7) {
      buscarHuesped(index, value);
    }
  };

  const agregarHuesped = () => {
    setHuespedes([...huespedes, {
      nombres: '', apellidos: '', carnet: '', complemento: 'LP', celular: '',
      genero: 'Masculino', profesion: '', fecha_nacimiento: '',
      nacionalidad: 'Boliviano', ciudad_nacimiento: '', estado_civil: 'Soltero'
    }]);
  };

  const eliminarHuesped = (index: number) => {
    if (index === 0) return;
    setHuespedes(huespedes.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <style>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <div className="flex justify-between items-center px-2">
        <h3 className="text-xl font-black text-gray-700 uppercase tracking-tighter">Huéspedes</h3>
        <button type="button" onClick={agregarHuesped} className="bg-gray-900 text-white text-[10px] px-6 py-3 rounded-full font-black uppercase hover:bg-blue-600 transition-colors">
          + Acompañante
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {huespedes.map((h, index) => (
          <div key={index} className={`relative p-10 border-2 rounded-[2.5rem] bg-white shadow-sm transition-all ${h.en_lista_negra ? 'border-red-500 shadow-red-100' : 'border-gray-50 hover:border-blue-100'}`}>
            <span className={`absolute -top-3 left-10 px-4 py-1 rounded-full text-[10px] font-black uppercase ${h.en_lista_negra ? 'bg-red-600 text-white animate-pulse' : index === 0 ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
              {h.en_lista_negra ? '⚠️ En Lista Negra' : index === 0 ? 'Titular' : `Acompañante ${index}`}
            </span>

            {h.en_lista_negra && (
              <div className="absolute top-4 right-14 flex items-center gap-2 text-red-600 animate-bounce">
                <span className="text-[10px] font-black uppercase tracking-tighter">¡Atención! Antecedentes Detectados</span>
              </div>
            )}

            {index > 0 && (
              <button type="button" onClick={() => eliminarHuesped(index)} className="absolute top-4 right-6 text-gray-300 hover:text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
              <div className="md:col-span-2 flex gap-2">
                <div className="flex-1">
                  <label className="text-[9px] font-black text-blue-500 ml-2 uppercase">Carnet de Identidad</label>
                  <input
                    name="carnet"
                    type="number"
                    value={h.carnet}
                    onChange={(e) => handleChangeHuesped(index, e)}
                    className="p-4 bg-blue-50/50 rounded-2xl border-none text-sm font-bold w-full focus:ring-2 focus:ring-blue-400"
                    placeholder="Min. 7 dígitos para buscar"
                    required
                  />
                </div>
                <div className="w-28">
                  <label className="text-[9px] font-black text-gray-400 ml-2 uppercase">Ext.</label>
                  <select name="complemento" value={h.complemento} onChange={(e) => handleChangeHuesped(index, e)} className="p-4 bg-gray-50 rounded-2xl border-none text-sm font-bold w-full text-center">
                    {['LP', 'OR', 'PT', 'CB', 'SC', 'BN', 'PA', 'TJ', 'CH'].map(dep => <option key={dep} value={dep}>{dep}</option>)}
                  </select>
                </div>
              </div>

              <div className="md:col-span-1 flex flex-col justify-end">
                <label className="text-[9px] font-black text-gray-400 ml-2 uppercase">Celular</label>
                <input name="celular" type="number" value={h.celular} onChange={(e) => handleChangeHuesped(index, e)} className="p-4 bg-gray-50 rounded-2xl border-none text-sm font-bold w-full" required />
              </div>

              <div className="md:col-span-1 flex flex-col justify-end">
                <label className="text-[9px] font-black text-gray-400 ml-2 uppercase">Nacionalidad</label>
                <input name="nacionalidad" value={h.nacionalidad} onChange={(e) => handleChangeHuesped(index, e)} className="p-4 bg-gray-50 rounded-2xl border-none text-sm font-bold w-full" required />
              </div>

              <div className="md:col-span-1">
                <label className="text-[9px] font-black text-gray-400 ml-2 uppercase">Nombres</label>
                <input name="nombres" value={h.nombres} onChange={(e) => handleChangeHuesped(index, e)} className="p-4 bg-gray-50 rounded-2xl border-none text-sm font-bold w-full" required />
              </div>

              <div className="md:col-span-1">
                <label className="text-[9px] font-black text-gray-400 ml-2 uppercase">Apellidos</label>
                <input name="apellidos" value={h.apellidos} onChange={(e) => handleChangeHuesped(index, e)} className="p-4 bg-gray-50 rounded-2xl border-none text-sm font-bold w-full" required />
              </div>

              <div className="md:col-span-1">
                <label className="text-[9px] font-black text-gray-400 ml-2 uppercase">Ciudad Origen</label>
                <input name="ciudad_nacimiento" value={h.ciudad_nacimiento} onChange={(e) => handleChangeHuesped(index, e)} className="p-4 bg-gray-50 rounded-2xl border-none text-sm font-bold w-full" />
              </div>

              <div className="md:col-span-1">
                <label className="text-[9px] font-black text-gray-400 ml-2 uppercase">Profesión</label>
                <input name="profesion" value={h.profesion} onChange={(e) => handleChangeHuesped(index, e)} className="p-4 bg-gray-50 rounded-2xl border-none text-sm font-bold w-full" />
              </div>

              <div className="md:col-span-1">
                <label className="text-[9px] font-black text-gray-400 ml-2 uppercase">Fecha Nacimiento</label>
                <input name="fecha_nacimiento" type="date" value={h.fecha_nacimiento} onChange={(e) => handleChangeHuesped(index, e)} className="p-4 bg-gray-50 rounded-2xl border-none text-sm font-bold w-full" required />
              </div>

              <div className="md:col-span-1">
                <label className="text-[9px] font-black text-gray-400 ml-2 uppercase">Estado Civil</label>
                <select name="estado_civil" value={h.estado_civil} onChange={(e) => handleChangeHuesped(index, e)} className="p-4 bg-gray-50 rounded-2xl border-none text-sm font-bold w-full">
                  <option value="Soltero">Soltero</option>
                  <option value="Casado">Casado</option>
                  <option value="Divorciado">Divorciado</option>
                  <option value="Viudo">Viudo</option>
                </select>
              </div>

              <div className="md:col-span-1">
                <label className="text-[9px] font-black text-gray-400 ml-2 uppercase">Género</label>
                <select name="genero" value={h.genero} onChange={(e) => handleChangeHuesped(index, e)} className="p-4 bg-gray-50 rounded-2xl border-none text-sm font-bold w-full">
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HuespedesSection;