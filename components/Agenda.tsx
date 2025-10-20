import React, { useState, useMemo, useEffect } from 'react';
import { getAppointments, saveAppointment, deleteAppointment } from '../services/geminiService';

type Appointment = {
  id: string;
  clientName: string;
  phone: string;
  tattooType: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
};

const Agenda: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [showSaveConfirmation, setShowSaveConfirmation] = useState<Appointment | null>(null);

    useEffect(() => {
        const loadAppointments = async () => {
            const data = await getAppointments();
            setAppointments(data);
        };
        loadAppointments();
    }, []);

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

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
            await deleteAppointment(id);
            setAppointments(apps => apps.filter(app => app.id !== id));
        }
    };
    
    const handleAppointmentSaved = (app: Appointment) => {
        // Optimistically update UI
        if (editingAppointment) {
            setAppointments(apps => apps.map(a => a.id === app.id ? app : a));
        } else {
            setAppointments(apps => [...apps, app]);
        }
        setShowSaveConfirmation(app);
        setTimeout(() => setShowSaveConfirmation(null), 10000); // Hide after 10 seconds
    };

    const generateIcsFile = (appointment: Appointment) => {
        const startDate = new Date(`${appointment.date}T${appointment.time}`);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Assume 1 hour duration

        const toUTC = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'BEGIN:VEVENT',
            `UID:${appointment.id}@soul.patterns`,
            `DTSTAMP:${toUTC(new Date())}`,
            `DTSTART:${toUTC(startDate)}`,
            `DTEND:${toUTC(endDate)}`,
            `SUMMARY:Cita de Tatuaje: ${appointment.clientName}`,
            `DESCRIPTION:Detalles: ${appointment.tattooType}. Contacto: ${appointment.phone}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cita-tatuaje-${appointment.clientName}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const showConfirmationNotification = async (appointment: Appointment) => {
        if ('Notification' in window && Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                new Notification('¡Cita Agendada!', {
                    body: `Tu cita con ${appointment.clientName} ha sido confirmada. Se añadió un recordatorio a tu calendario.`,
                    icon: '/icon-192x192.png',
                    badge: '/icon-192x192.png'
                });
            }
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
                            selectedDayAppointments.sort((a, b) => a.time.localeCompare(b.time)).map(app => (
                                <div key={app.id} className="bg-card border border-border-card rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-main">{app.clientName}</p>
                                            <p className="text-sm text-secondary">{app.tattooType}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0 pl-4">
                                            <p className="font-bold text-primary text-lg">{app.time}</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-border-card pt-3 flex justify-between items-center">
                                        <p className="text-xs text-secondary">{app.phone}</p>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => generateIcsFile(app)}
                                                className="p-2 text-secondary hover:text-primary rounded-full hover:bg-border-card transition-colors"
                                                title="Añadir al calendario"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => openModal(app)}
                                                className="p-2 text-secondary hover:text-primary rounded-full hover:bg-border-card transition-colors"
                                                title="Editar cita"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(app.id)}
                                                className="p-2 text-secondary hover:text-red-500 rounded-full hover:bg-border-card transition-colors"
                                                title="Eliminar cita"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
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
            {isModalOpen && <AppointmentModal appointment={editingAppointment} selectedDate={selectedDate} onClose={() => setIsModalOpen(false)} onSave={handleAppointmentSaved} />}
            {showSaveConfirmation && (
                <div className="fixed bottom-24 left-4 right-4 z-50 animate-fade-in-up bg-card border border-border-card rounded-lg shadow-2xl p-4 max-w-md mx-auto">
                    <p className="text-main font-semibold text-center">¡Cita con {showSaveConfirmation.clientName} guardada!</p>
                    <p className="text-sm text-secondary mb-3 text-center">Añádela a tu calendario para recibir un recordatorio.</p>
                    <div className="flex gap-3">
                        <button onClick={() => {
                            generateIcsFile(showSaveConfirmation);
                            showConfirmationNotification(showSaveConfirmation);
                            setShowSaveConfirmation(null);
                        }} className="w-full bg-primary text-primary-contrast font-bold py-2 px-4 rounded-lg hover:opacity-90 transition">
                            Añadir al Calendario
                        </button>
                        <button onClick={() => setShowSaveConfirmation(null)} className="w-full bg-border-card text-main font-bold py-2 px-4 rounded-lg hover:opacity-80 transition">
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const AppointmentModal = ({ appointment, selectedDate, onClose, onSave } : { appointment: Appointment | null, selectedDate: string, onClose: () => void, onSave: (app: Appointment) => void}) => {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalAppointment = appointment 
            ? { ...appointment, ...formData } 
            : { ...formData, id: Date.now().toString() };

        await saveAppointment(finalAppointment);
        onSave(finalAppointment);
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