import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

type Appointment = {
  id: string;
  clientName: string;
  phone: string;
  tattooType: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
};

const Agenda: React.FC = () => {
    const [appointments, setAppointments] = useLocalStorage<Appointment[]>('appointments', []);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

    const appointmentsByDate = useMemo(() => {
        return appointments.reduce((acc, app) => {
            (acc[app.date] = acc[app.date] || []).push(app);
            return acc;
        }, {} as Record<string, Appointment[]>);
    }, [appointments]);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const handleDayClick = (day: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(newDate.toISOString().split('T')[0]);
    };

    const openModal = (app?: Appointment) => {
        setEditingAppointment(app || null);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
            setAppointments(apps => apps.filter(app => app.id !== id));
        }
    };
    
    const selectedDayAppointments = appointmentsByDate[selectedDate] || [];

    return (
        <div className="py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold font-cinzel text-main mb-2">Agenda de Citas</h1>
                <p className="text-secondary">Organiza tu tiempo y gestiona tus citas.</p>
            </div>
            <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-8">
                {/* Calendar */}
                <div className="lg:w-1/2 bg-card p-4 rounded-lg border border-border-card">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-border-card">&lt;</button>
                        <h2 className="font-bold text-main text-lg capitalize">{currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</h2>
                        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-border-card">&gt;</button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-secondary">
                        {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map(d => <div key={d}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1 mt-2">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`}></div>)}
                        {Array.from({ length: daysInMonth }).map((_, day) => {
                            const dayNumber = day + 1;
                            const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber).toISOString().split('T')[0];
                            const isSelected = dateStr === selectedDate;
                            const hasAppointments = !!appointmentsByDate[dateStr];
                            return (
                                <button key={dayNumber} onClick={() => handleDayClick(dayNumber)} className={`relative h-10 w-10 rounded-full transition-colors ${isSelected ? 'bg-primary text-primary-contrast' : 'hover:bg-border-card'}`}>
                                    {dayNumber}
                                    {hasAppointments && <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'}`}></span>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Appointments List */}
                <div className="lg:w-1/2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-main text-lg">
                            Citas para el {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                        </h3>
                        <button onClick={() => openModal()} className="bg-primary text-primary-contrast font-semibold py-2 px-4 rounded-md text-sm hover:opacity-90">
                            + Agendar
                        </button>
                    </div>
                    <div className="space-y-3">
                        {selectedDayAppointments.length > 0 ? (
                            selectedDayAppointments.sort((a,b) => a.time.localeCompare(b.time)).map(app => (
                                <div key={app.id} className="bg-card border border-border-card rounded-lg p-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-main">{app.clientName}</p>
                                            <p className="text-sm text-secondary">{app.tattooType}</p>
                                            <p className="text-xs text-secondary mt-1">{app.phone}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary text-lg">{app.time}</p>
                                            <div className="flex gap-2 mt-1">
                                                <button onClick={() => openModal(app)} className="text-xs text-blue-400 hover:underline">Editar</button>
                                                <button onClick={() => handleDelete(app.id)} className="text-xs text-red-400 hover:underline">Borrar</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-secondary text-center py-8">No hay citas para este día.</p>
                        )}
                    </div>
                </div>
            </div>
            {isModalOpen && <AppointmentModal appointment={editingAppointment} selectedDate={selectedDate} onClose={() => setIsModalOpen(false)} setAppointments={setAppointments} />}
        </div>
    );
};

const AppointmentModal = ({ appointment, selectedDate, onClose, setAppointments } : { appointment: Appointment | null, selectedDate: string, onClose: () => void, setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>}) => {
    const [formData, setFormData] = useState({
        clientName: appointment?.clientName || '',
        phone: appointment?.phone || '',
        tattooType: appointment?.tattooType || '',
        date: appointment?.date || selectedDate,
        time: appointment?.time || '10:00',
    });
    const [isInputFocused, setIsInputFocused] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (appointment) {
            setAppointments(apps => apps.map(app => app.id === appointment.id ? { ...app, ...formData } : app));
        } else {
            setAppointments(apps => [...apps, { ...formData, id: Date.now().toString() }]);
        }
        onClose();
    };
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setIsInputFocused(true);
        setTimeout(() => {
            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    };

    const handleBlur = () => setIsInputFocused(false);

    return (
        <div className={`fixed inset-0 bg-black/80 z-50 flex justify-center ${isInputFocused ? 'items-start pt-4 sm:pt-8' : 'items-center'}`} onClick={onClose}>
            <div className="bg-card p-6 rounded-lg shadow-xl w-full max-w-sm mx-4 border border-border-card" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-cinzel mb-4 text-main">{appointment ? 'Editar Cita' : 'Nueva Cita'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[65vh] overflow-y-auto pr-3">
                     <div>
                        <label className="text-sm font-medium text-secondary">Nombre del Cliente</label>
                        <input type="text" name="clientName" value={formData.clientName} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} className="w-full mt-1 p-2 bg-app border border-border-card rounded-md" required />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-secondary">Teléfono</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} className="w-full mt-1 p-2 bg-app border border-border-card rounded-md" required />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-secondary">Tipo/Descripción de Tatuaje</label>
                        <textarea name="tattooType" value={formData.tattooType} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} rows={2} className="w-full mt-1 p-2 bg-app border border-border-card rounded-md resize-none" required></textarea>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                             <label className="text-sm font-medium text-secondary">Fecha</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} className="w-full mt-1 p-2 bg-app border border-border-card rounded-md" required />
                        </div>
                         <div className="flex-1">
                             <label className="text-sm font-medium text-secondary">Hora</label>
                            <input type="time" name="time" value={formData.time} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} className="w-full mt-1 p-2 bg-app border border-border-card rounded-md" required />
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                       <button type="button" onClick={onClose} className="w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition">Cancelar</button>
                       <button type="submit" className="w-full bg-primary text-primary-contrast font-bold py-2 px-4 rounded-lg hover:opacity-90 transition">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Agenda;