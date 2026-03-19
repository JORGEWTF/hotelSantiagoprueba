import { useState, useEffect } from 'react';
import RoomRegistration from './RoomRegistration';
import { BedDouble, Plus} from 'lucide-react';
import axiosInstance from '../../api/axios';

export default function RoomsDashboard() {
    const [showRegistration, setShowRegistration] = useState(false);
    const [habitaciones, setHabitaciones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHabitaciones = async () => {
        try {
            const response = await axiosInstance.get('/habitaciones');
            if (response.status === 200) {
                setHabitaciones(response.data.habitaciones || []);
            }
        } catch (error) {
            console.error("Error fetching rooms:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHabitaciones();
    }, []);

    const handleRoomAdded = () => {
        fetchHabitaciones();
        setShowRegistration(false);
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Panel de Habitaciones</h2>
                    <p className="text-gray-500 mt-1">Gestiona y visualiza el estado de todas las habitaciones.</p>
                </div>
                <button
                    onClick={() => setShowRegistration(true)}
                    className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                >
                    <Plus size={20} />
                    <span>Nueva Habitación</span>
                </button>
            </div>

            {/* Stats / Filters (Placeholder for now) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <BedDouble size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Habitaciones</p>
                        <h3 className="text-xl font-bold text-gray-800">{habitaciones.length}</h3>
                    </div>
                </div>
                {/* Add more stats here later if needed */}
            </div>

            {/* Rooms Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
                </div>
            ) : habitaciones.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                    <BedDouble size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600">No hay habitaciones registradas</h3>
                    <p className="text-gray-400 mt-1">Comienza registrando una nueva habitación.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {habitaciones.map((habitacion) => (
                        <div key={habitacion.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`px-3 py-1 rounded-full text-xs font-semibold
                                    ${habitacion.estado === 'Disponible' ? 'bg-green-100 text-green-700' :
                                        habitacion.estado === 'Ocupada' ? 'bg-red-100 text-red-700' :
                                            habitacion.estado === 'Mantenimiento' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'}`}
                                >
                                    {habitacion.estado}
                                </div>
                                <span className="text-gray-400 text-sm">Piso {habitacion.piso}</span>
                            </div>

                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-2xl font-bold text-gray-800">Hab. {habitacion.numero}</h3>
                                {habitacion.tipo_habitacion === 'Suite' ? <span className="text-yellow-600 text-xs font-bold border border-yellow-200 px-2 py-0.5 rounded">VIP</span> : null}
                            </div>

                            <p className="text-gray-500 text-sm mb-4">{habitacion.tipo_habitacion}</p>

                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className={`text-sm font-medium ${habitacion.ocupado ? 'text-red-500' : 'text-green-500'}`}>
                                    {habitacion.ocupado ? 'Ocupada' : 'Libre'}
                                </span>
                                <button className="text-sm text-gray-400 hover:text-gray-600 font-medium">
                                    Ver Detalles
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showRegistration && (
                <RoomRegistration
                    onClose={() => setShowRegistration(false)}
                    onSuccess={handleRoomAdded}
                />
            )}
        </div>
    );
}
