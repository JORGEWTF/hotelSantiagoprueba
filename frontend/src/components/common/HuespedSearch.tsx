import React, { useState } from 'react';
import { Search, ShieldAlert, ShieldCheck, UserPlus, X, AlertCircle } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import BlacklistForm from '../../pages/blacklist/BlacklistForm';

interface HuespedSearchProps {
    onRefresh?: () => void;
}

const HuespedSearch: React.FC<HuespedSearchProps> = ({ onRefresh }) => {
    const [carnet, setCarnet] = useState('');
    const [loading, setLoading] = useState(false);
    const [huesped, setHuesped] = useState<any>(null);
    const [blacklistInfo, setBlacklistInfo] = useState<any>(null);
    const [showBlacklistForm, setShowBlacklistForm] = useState(false);
    const { user } = useAuth();

    const isAdmin = user?.cargo?.toLowerCase() === 'administrador';

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!carnet) return;

        setLoading(true);
        setHuesped(null);
        setBlacklistInfo(null);

        try {
            // 1. Verificar en lista negra por carnet
            const response = await axiosInstance.get(`/lista-negra/check/${carnet}`);

            if (response.data.encontrado) {
                setHuesped(response.data.huesped);
                setBlacklistInfo(response.data);
            } else {
                setHuesped(null);
                setBlacklistInfo({ en_lista_negra: false });
            }
        } catch (error) {
            console.error('Error searching guest:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromBlacklist = async (id: number) => {
        if (!window.confirm('¿Está seguro de eliminar este registro de la lista negra?')) return;

        try {
            await axiosInstance.delete(`/lista-negra/${id}`);
            handleSearch({ preventDefault: () => { } } as any);
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error('Error removing from blacklist:', err);
            alert('Error al tratar de eliminar de la lista negra.');
        }
    };

    const handleBlacklistSuccess = () => {
        setShowBlacklistForm(false);
        handleSearch({ preventDefault: () => { } } as any); // Refrescar búsqueda
        if (onRefresh) onRefresh();
    };

    return (
        <div className="w-full space-y-6">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative group">
                <input
                    type="number"
                    className="w-full bg-white border-2 border-gray-100 p-5 pl-14 rounded-2xl outline-none focus:border-black transition-all shadow-sm text-lg font-medium text-black"
                    placeholder="Ingrese C.I. del huésped para verificar..."
                    value={carnet}
                    onChange={(e) => setCarnet(e.target.value)}
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={24} />
                <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-zinc-800 transition-all disabled:opacity-50"
                >
                    {loading ? 'Buscando...' : 'Verificar'}
                </button>
            </form>

            {/* Blacklist Alert Banner */}
            {blacklistInfo?.en_lista_negra && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-start space-x-4">
                        <div className="bg-red-600 p-3 rounded-xl text-white shadow-lg shadow-red-200">
                            <ShieldAlert size={32} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-black text-red-700 uppercase tracking-tight mb-1">
                                Huésped en Lista Negra
                            </h3>
                            <p className="text-red-600/80 font-medium mb-4">
                                Esta persona tiene reportes activos. Se recomienda restringir el acceso.
                            </p>

                            <div className="bg-white/50 rounded-xl p-4 space-y-3 border border-red-100">
                                {blacklistInfo.motivos.map((m: any, idx: number) => (
                                    <div key={idx} className="flex flex-col relative group/item">
                                        <span className="text-xs font-bold text-red-400 uppercase tracking-widest">
                                            Motivo ({new Date(m.fecha).toLocaleDateString()}):
                                        </span>
                                        <p className="text-red-900 font-bold">{m.motivo}</p>

                                        {isAdmin && (
                                            <button
                                                onClick={() => handleRemoveFromBlacklist(m.id)}
                                                className="absolute right-0 top-0 text-red-300 hover:text-red-600 transition-colors"
                                                title="Eliminar de lista negra"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Banner (Not in Blacklist) */}
            {blacklistInfo && !blacklistInfo.en_lista_negra && huesped && (
                <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-6 flex items-center space-x-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-emerald-500 p-3 rounded-xl text-white">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-emerald-800">Huésped sin reportes</h3>
                        <p className="text-emerald-600">No se encontraron antecedentes para {huesped.nombres} {huesped.apellidos}.</p>
                    </div>
                </div>
            )}

            {/* Guest Not Found Alert */}
            {blacklistInfo && !blacklistInfo.encontrado && !loading && (
                <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-6 flex items-center space-x-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-amber-500 p-3 rounded-xl text-white">
                        <AlertCircle size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-amber-800">Huésped no registrado</h3>
                        <p className="text-amber-600">No existe información para el C.I. {carnet}. Regístrelo antes de reportar.</p>
                    </div>
                </div>
            )}

            {/* Action Section (Report to Blacklist) */}
            {huesped && !loading && (
                <div className="flex justify-end pt-4">
                    <button
                        onClick={() => setShowBlacklistForm(true)}
                        className="flex items-center space-x-2 text-gray-400 hover:text-red-600 transition-colors font-bold uppercase tracking-widest text-[10px]"
                    >
                        <UserPlus size={16} />
                        <span>Reportar Incidente</span>
                    </button>
                </div>
            )}

            {/* Blacklist Form Modal */}
            {showBlacklistForm && (
                <BlacklistForm
                    huespedId={huesped?.id || 0} // En un caso real, obtendríamos el ID del huésped encontrado
                    huespedNombre={huesped ? `${huesped.nombres} ${huesped.apellidos}` : `Huésped CI: ${carnet}`}
                    onClose={() => setShowBlacklistForm(false)}
                    onSuccess={handleBlacklistSuccess}
                />
            )}
        </div>
    );
};

export default HuespedSearch;
