import { useState } from 'react';
import { X } from 'lucide-react';
import axiosInstance from '../../api/axios';

interface RoomRegistrationProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function RoomRegistration({ onClose, onSuccess }: RoomRegistrationProps) {
    const [numero, setNumero] = useState('');
    const [piso, setPiso] = useState('');
    const [tipoHabitacion, setTipoHabitacion] = useState('');
    const [ocupado, setOcupado] = useState(false);
    const [estado, setEstado] = useState('Disponible');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        // Validaciones basicas frontend
        if (!numero || parseInt(numero) <= 0) {
            setMessage('Error: El número de habitación es obligatorio y debe ser mayor a 0');
            return;
        }
        if (!piso || parseInt(piso) <= 0) {
            setMessage('Error: El piso es obligatorio y debe ser mayor a 0');
            return;
        }
        if (!tipoHabitacion) {
            setMessage('Error: Debes seleccionar un tipo de habitación');
            return;
        }

        setLoading(true);

        try {
            const response = await axiosInstance.post('/habitaciones', {
                numero: parseInt(numero),
                piso: parseInt(piso),
                tipo_habitacion: tipoHabitacion,
                ocupado,
                estado,
            });

            if (response.status === 201) {
                setMessage(response.data.mensaje || 'Habitación registrada correctamente');
                setNumero('');
                setPiso('');
                setTipoHabitacion('');
                setOcupado(false);
                setEstado('Disponible');
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 1500);
            }
        } catch (error: any) {
            console.error('Error al registrar:', error);
            const errorMessage = error.response?.data?.error || error.response?.data?.mensaje || 'Error de conexión con el servidor';
            setMessage(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Registro de nuevas habitaciones</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {message && (
                        <div className={`mb-4 p-3 rounded text-sm font-medium ${message.includes('Error') ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-1">Número <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    id="numero"
                                    value={numero}
                                    min="1"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || (parseInt(val) > 0 && !val.includes('-'))) {
                                            setNumero(val);
                                        }
                                    }}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all text-black bg-white"
                                    placeholder="101"
                                />
                            </div>
                            <div>
                                <label htmlFor="piso" className="block text-sm font-medium text-gray-700 mb-1">Piso <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    id="piso"
                                    value={piso}
                                    min="1"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || (parseInt(val) > 0 && !val.includes('-'))) {
                                            setPiso(val);
                                        }
                                    }}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all text-black bg-white"
                                    placeholder="1"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="tipoHabitacion" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Habitación <span className="text-red-500">*</span></label>
                            <select
                                id="tipoHabitacion"
                                value={tipoHabitacion}
                                onChange={(e) => setTipoHabitacion(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all text-black bg-white"
                            >
                                <option value="">Seleccione...</option>
                                <option value="Sencilla">Sencilla</option>
                                <option value="Doble">Doble</option>
                                <option value="Suite">Triple</option>
                                <option value="Suite">cuadruple</option>
                                <option value="Matrimonial">Matrimonial</option>
                                <option value="Familiar">Familiar</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">Estado Inicial</label>
                            <select
                                id="estado"
                                value={estado}
                                onChange={(e) => setEstado(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all text-black bg-white"
                            >
                                <option value="Disponible">Disponible</option>
                                <option value="Ocupada">Ocupada</option>
                                <option value="Mantenimiento">Mantenimiento</option>
                                <option value="Limpieza">Sucio</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Registrando...' : 'Guardar Habitación'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
