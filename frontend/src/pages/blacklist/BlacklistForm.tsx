import React, { useState } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import axiosInstance from '../../api/axios';

interface BlacklistFormProps {
    huespedId: number;
    huespedNombre: string;
    onClose: () => void;
    onSuccess: () => void;
}

const BlacklistForm: React.FC<BlacklistFormProps> = ({
    huespedId,
    huespedNombre,
    onClose,
    onSuccess
}: BlacklistFormProps) => {
    const [motivo, setMotivo] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!motivo.trim()) {
            setError('El motivo es obligatorio');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await axiosInstance.post('/lista-negra', {
                huesped_id: huespedId,
                motivo: motivo
            });
            onSuccess();
        } catch (err: any) {
            console.error('Error reporting to blacklist:', err);
            setError(err.response?.data?.error || 'Error al registrar en lista negra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-red-600 p-6 text-white flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <ShieldAlert size={28} />
                        <h2 className="text-xl font-bold">Reportar a Lista Negra</h2>
                    </div>
                    <button onClick={onClose} className="hover:bg-red-700 p-1 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8">
                    <p className="text-gray-600 mb-6">
                        Estás reportando a <span className="font-bold text-black">{huespedNombre}</span>.
                        Este registro alertará a otros empleados y restringirá su acceso al hotel.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm">
                                ⚠️ {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                Motivo del Reporte <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-red-500 transition-all h-32 resize-none text-black"
                                placeholder="Describa detalladamente el incidente (daños, falta de pago, comportamiento agresivo...)"
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 border border-gray-200 text-gray-400 font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-gray-50 transition-all font-sans"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex-1 py-4 bg-red-600 text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg
                                    transition-all duration-300 hover:bg-red-700 active:scale-[0.98]
                                    ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                `}
                            >
                                {loading ? 'Enviando...' : 'Confirmar Reporte'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BlacklistForm;
