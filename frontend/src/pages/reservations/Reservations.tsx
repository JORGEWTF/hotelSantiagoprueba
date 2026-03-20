import React from 'react';
import { CalendarDays, Info } from 'lucide-react';
import HuespedSearch from '../../components/common/HuespedSearch';

const Reservations: React.FC = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center space-x-3 text-black">
                        <div className="bg-black p-2 rounded-lg text-[#d4af37]">
                            <CalendarDays size={24} />
                        </div>
                        <h1 className="text-3xl font-black uppercase tracking-tight">Módulo de Reservas</h1>
                    </div>
                    <p className="text-gray-500 font-medium">Gestión de ingresos y verificación de antecedentes de huéspedes.</p>
                </div>

                <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 text-sm">
                    <Info size={18} />
                    <span>Verificación de Lista Negra automática activada</span>
                </div>
            </div>

            {/* Verification Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="w-1.5 h-8 bg-[#d4af37] rounded-full"></div>
                            <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider">Verificar Huésped</h2>
                        </div>

                        <HuespedSearch />
                    </section>

                    {/* Placeholder for remaining reservation form */}
                    <section className="bg-white/50 border-2 border-dashed border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                            <CalendarDays size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm">Formulario de Reserva</h3>
                        <p className="text-gray-300 text-xs mt-2 max-w-xs">El resto del formulario se habilitará tras la verificación exitosa del carnet.</p>
                    </section>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 bg-[#d4af37]/10 w-32 h-32 rounded-full blur-3xl group-hover:bg-[#d4af37]/20 transition-all duration-700"></div>
                        <h3 className="text-[#d4af37] font-black italic text-2xl mb-4 tracking-tighter">SANTIAGO LUXURY</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Para mantener la seguridad y calidad de nuestro servicio, es obligatorio verificar a cada huésped antes de procesar su ingreso.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-center space-x-3 text-xs font-bold text-gray-300">
                                <div className="w-2 h-2 bg-[#d4af37] rounded-full"></div>
                                <span>Verificación de identidad</span>
                            </li>
                            <li className="flex items-center space-x-3 text-xs font-bold text-gray-300">
                                <div className="w-2 h-2 bg-[#d4af37] rounded-full"></div>
                                <span>Chequeo de antecedentes</span>
                            </li>
                            <li className="flex items-center space-x-3 text-xs font-bold text-gray-300">
                                <div className="w-2 h-2 bg-[#d4af37] rounded-full"></div>
                                <span>Registro de incidentes</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reservations;
