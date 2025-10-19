import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

// Duplicating type to avoid complex relative imports
type Appointment = {
  id: string;
  clientName: string;
  phone: string;
  tattooType: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
};

type Client = {
    name: string;
    phone: string;
};

const Clients: React.FC = () => {
    const [appointments] = useLocalStorage<Appointment[]>('appointments', []);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    
    const clients = useMemo(() => {
        const clientMap = new Map<string, Client>();
        appointments.forEach(app => {
            if (app.clientName && app.phone && !clientMap.has(app.phone)) {
                clientMap.set(app.phone, { name: app.clientName, phone: app.phone });
            }
        });
        return Array.from(clientMap.values()).sort((a,b) => a.name.localeCompare(b.name));
    }, [appointments]);

    const filteredClients = useMemo(() => {
        return clients.filter(client => 
            client.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [clients, searchTerm]);

    const clientAppointments = useMemo(() => {
        if (!selectedClient) return [];
        return appointments
            .filter(app => app.phone === selectedClient.phone)
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [appointments, selectedClient]);

    const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setTimeout(() => {
          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    };


    if (selectedClient) {
        return (
            <div className="py-8">
                 <button onClick={() => setSelectedClient(null)} className="flex items-center gap-2 text-primary mb-6 font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Volver a la lista
                </button>
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold font-cinzel text-main">{selectedClient.name}</h1>
                    <p className="text-secondary">{selectedClient.phone}</p>
                </div>
                <h2 className="text-xl font-bold text-main mb-4">Historial de Citas</h2>
                <div className="space-y-3">
                    {clientAppointments.length > 0 ? clientAppointments.map(app => (
                        <div key={app.id} className="bg-card border border-border-card rounded-lg p-4">
                             <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-main">{app.tattooType}</p>
                                    <p className="text-sm text-secondary">{new Date(app.date + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <p className="font-semibold text-primary">{app.time}</p>
                            </div>
                        </div>
                    )) : <p className="text-secondary text-center py-4">No hay citas registradas para este cliente.</p>}
                </div>
            </div>
        )
    }

    return (
        <div className="py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold font-cinzel text-main mb-2">Clientes</h1>
                <p className="text-secondary">Tu lista de clientes registrados.</p>
            </div>
            
            <div className="mb-6 max-w-lg mx-auto">
                <input 
                    type="text"
                    placeholder="Buscar cliente por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={handleInputFocus}
                    className="w-full p-3 bg-card border border-border-card rounded-lg text-main placeholder-secondary"
                />
            </div>

            {clients.length === 0 ? (
                 <div className="text-center py-16">
                    <p className="text-secondary">Aún no tienes clientes registrados.</p>
                    <p className="text-sm text-secondary">Los clientes se añaden automáticamente cuando creas una cita en la Agenda.</p>
                </div>
            ) : (
                <div className="space-y-3 max-w-lg mx-auto">
                    {filteredClients.map(client => (
                        <button key={client.phone} onClick={() => setSelectedClient(client)} className="w-full text-left bg-card border border-border-card rounded-lg p-4 hover:border-primary transition-colors">
                            <h3 className="font-bold text-main">{client.name}</h3>
                            <p className="text-sm text-secondary">{client.phone}</p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Clients;