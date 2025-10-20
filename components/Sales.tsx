import React, { useState, useMemo, useEffect } from 'react';
import { getSales, saveSale } from '../services/geminiService';

type Sale = {
    id: string;
    amount: number;
    date: string; // YYYY-MM-DD
};

const BarChart = ({ data, barColor }: { data: { label: string, value: number }[], barColor: string }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero
    const chartHeight = 150;
    const barWidth = 30;
    const barMargin = 15;
    const formatCurrency = (value: number) => `$${value.toLocaleString('es-CO')}`;

    return (
        <div className="w-full overflow-x-auto pb-4">
            <svg width={data.length * (barWidth + barMargin)} height={chartHeight + 40}>
                {data.map((d, i) => {
                    const barHeight = (d.value / maxValue) * chartHeight;
                    const x = i * (barWidth + barMargin);
                    const y = chartHeight - barHeight;
                    return (
                        <g key={d.label}>
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                className={barColor}
                                rx="4"
                            />
                            <text x={x + barWidth / 2} y={chartHeight + 15} textAnchor="middle" className="text-xs fill-current text-secondary">{d.label}</text>
                            <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" className="text-xs font-bold fill-current text-main">{formatCurrency(d.value)}</text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};


const Sales: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chartTimeframe, setChartTimeframe] = useState<'week' | 'month'>('week');

    useEffect(() => {
        const loadSales = async () => {
            const data = await getSales();
            setSales(data);
        };
        loadSales();
    }, []);

    const formatCurrency = (value: number) => {
        return `$ ${value.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
    }

    const today = new Date().toISOString().split('T')[0];
    const salesToday = useMemo(() => {
        return sales
            .filter(s => s.date === today)
            .reduce((sum, s) => sum + s.amount, 0);
    }, [sales, today]);

    const salesThisWeek = useMemo(() => {
        const now = new Date();
        const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))); // Monday as first day
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
        
        const firstDate = firstDayOfWeek.toISOString().split('T')[0];
        const lastDate = lastDayOfWeek.toISOString().split('T')[0];

        return sales
            .filter(s => s.date >= firstDate && s.date <= lastDate)
            .reduce((sum, s) => sum + s.amount, 0);
    }, [sales]);

    const salesThisMonth = useMemo(() => {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const prefix = `${year}-${month}`;

        return sales
            .filter(s => s.date.startsWith(prefix))
            .reduce((sum, s) => sum + s.amount, 0);
    }, [sales]);

    const chartData = useMemo(() => {
        if (chartTimeframe === 'week') {
            const data: { [key: string]: number } = {};
            const labels: string[] = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const dayLabel = d.toLocaleDateString('es-ES', { weekday: 'short' }).slice(0, 2);
                labels.push(dayLabel);
                data[dateStr] = 0;
            }
            sales.forEach(s => {
                if (data.hasOwnProperty(s.date)) {
                    data[s.date] += s.amount;
                }
            });
            return labels.map((label, index) => {
                const dateKey = Object.keys(data)[index];
                return { label: label, value: data[dateKey] };
            });
        } else { // month
            const data: { [key: string]: number } = {};
             const now = new Date();
            const last4Weeks: {label: string, start: string, end: string}[] = [];

            for (let i = 3; i >= 0; i--) {
                const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7) - now.getDay() + 7);
                const weekStart = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate() - 6);
                 last4Weeks.push({
                    label: `Sem ${weekStart.getDate()}-${weekEnd.getDate()}`,
                    start: weekStart.toISOString().split('T')[0],
                    end: weekEnd.toISOString().split('T')[0]
                });
                data[last4Weeks[last4Weeks.length-1].label] = 0;
            }

            sales.forEach(s => {
                const saleDate = s.date;
                for(const week of last4Weeks) {
                    if(saleDate >= week.start && saleDate <= week.end) {
                        data[week.label] += s.amount;
                        break;
                    }
                }
            });
             return Object.keys(data).map(label => ({ label, value: data[label] }));
        }
    }, [sales, chartTimeframe]);

    const handleSaveSale = (newSale: Sale) => {
        // Optimistically update UI
        setSales(prev => [newSale, ...prev]);
    };

    return (
        <div className="py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold font-cinzel text-main mb-2">Registro de Ventas</h1>
                <p className="text-secondary">Tu resumen de ingresos.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-card border border-border-card p-4 rounded-lg text-center"><h3 className="text-secondary text-sm">Ventas de Hoy</h3><p className="text-2xl font-bold text-main">{formatCurrency(salesToday)}</p></div>
                <div className="bg-card border border-border-card p-4 rounded-lg text-center"><h3 className="text-secondary text-sm">Esta Semana</h3><p className="text-2xl font-bold text-main">{formatCurrency(salesThisWeek)}</p></div>
                <div className="bg-card border border-border-card p-4 rounded-lg text-center"><h3 className="text-secondary text-sm">Este Mes</h3><p className="text-2xl font-bold text-main">{formatCurrency(salesThisMonth)}</p></div>
            </div>

            <div className="bg-card border border-border-card p-4 rounded-lg mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-main">Gráfica de Ingresos</h3>
                    <div className="bg-app p-1 rounded-full text-sm flex">
                        <button onClick={() => setChartTimeframe('week')} className={`px-3 py-1 rounded-full ${chartTimeframe === 'week' ? 'bg-primary text-primary-contrast' : ''}`}>Semana</button>
                        <button onClick={() => setChartTimeframe('month')} className={`px-3 py-1 rounded-full ${chartTimeframe === 'month' ? 'bg-primary text-primary-contrast' : ''}`}>Mes</button>
                    </div>
                </div>
                <BarChart data={chartData} barColor="fill-primary" />
            </div>

            <div className="text-center">
                 <button onClick={() => setIsModalOpen(true)} className="bg-primary text-primary-contrast font-semibold py-3 px-6 rounded-lg hover:opacity-90">
                    + Registrar Nueva Venta
                </button>
            </div>

            {isModalOpen && <SaleModal onClose={() => setIsModalOpen(false)} onSave={handleSaveSale} />}
        </div>
    );
};

const SaleModal = ({ onClose, onSave }: { onClose: () => void, onSave: (sale: Sale) => void }) => {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const saleAmount = parseFloat(amount);
        if (!saleAmount || saleAmount <= 0) return;
        const newSale: Sale = {
            id: Date.now().toString(),
            amount: saleAmount,
            date,
        };
        await saveSale(newSale);
        onSave(newSale);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-card p-6 rounded-lg shadow-xl w-full max-w-sm mx-4 border border-border-card" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-cinzel mb-4 text-main">Nueva Venta</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-secondary">Monto ($)</label>
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full mt-1 p-2 bg-app border border-border-card rounded-md" required placeholder="Ej: 150000" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-secondary">Fecha</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full mt-1 p-2 bg-app border border-border-card rounded-md" required />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition">Cancelar</button>
                        <button type="submit" className="w-full bg-primary text-primary-contrast font-bold py-2 px-4 rounded-lg hover:opacity-90 transition">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Sales;