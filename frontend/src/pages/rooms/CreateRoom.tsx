import { useState } from 'react';
import RoomRegistration from './RoomRegistration';
import { Plus } from 'lucide-react';

export default function CreateRoom() {
    const [showRegistration, setShowRegistration] = useState(false);

    return (
        <div className="p-6 animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Registro de Habitaciones</h2>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto text-center">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus size={32} className="text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Nueva Habitación</h3>
                    <p className="text-gray-500">Haz clic en el botón para abrir el formulario de registro.</p>
                </div>

                <button
                    onClick={() => setShowRegistration(true)}
                    className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                    Registrar Habitación
                </button>
            </div>

            {showRegistration && (
                <RoomRegistration
                    onClose={() => setShowRegistration(false)}
                    onSuccess={() => setShowRegistration(false)}
                />
            )}
        </div>
    );
}
