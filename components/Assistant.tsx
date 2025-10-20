import React, { useState, useEffect, useRef } from 'react';
import type { Chat } from '@google/genai';
import { createAssistantChat } from '../services/geminiService';
import { jsPDF } from 'jspdf';

type Message = {
    id: string;
    sender: 'user' | 'ai';
    text: string;
};

const Assistant: React.FC = () => {
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        try {
            const session = createAssistantChat();
            setChatSession(session);
            setMessages([{
                id: `ai-init-${Date.now()}`,
                sender: 'ai',
                text: "Hola. Soy tu Maestro Tatuador. Estoy aquí para ayudarte a perfeccionar tu arte. ¿Qué duda tienes hoy?"
            }]);
        } catch (error) {
            console.error("No se pudo inicializar el chat del asistente:", error);
            const errorMessage = error instanceof Error ? error.message : "Error desconocido.";
            setMessages([{
                id: `err-init-${Date.now()}`,
                sender: 'ai',
                text: `No se pudo iniciar el asistente de chat. Error: ${errorMessage}`
            }]);
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
    const handleGeneratePdf = (text: string, id: string) => {
        const doc = new jsPDF();
        doc.setFont('helvetica', 'normal');
        
        doc.setFontSize(18);
        doc.setTextColor(161, 98, 247); // Primary color: #A162F7
        doc.text("Consejo del Maestro Tatuador", 105, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.setTextColor(27, 26, 33); // Main text color (approximated for PDF)
        const lines = doc.splitTextToSize(text, 180); // Wrap text within 180mm width
        doc.text(lines, 15, 35);
        
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("Generado por Soul Patterns AI Designer", 105, 285, { align: 'center' });

        doc.save(`consejo-soul-patterns-${id.substring(0, 10)}.pdf`);
    };


    const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setTimeout(() => {
            e.target.form?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 300);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading || !chatSession) return;

        const userMessage: Message = { id: `user-${Date.now()}`, sender: 'user', text: userInput };
        setMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await chatSession.sendMessage({ message: userInput });
            const aiMessage: Message = { id: `ai-${Date.now()}`, sender: 'ai', text: response.text };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = { id: `err-${Date.now()}`, sender: 'ai', text: "Lo siento, tuve un problema al procesar tu pregunta. Por favor, inténtalo de nuevo." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)]">
            {/* Chat Messages */}
            <div className="flex-grow overflow-y-auto pr-2">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} mb-4`}>
                        <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-primary text-primary-contrast' : 'bg-card'}`}>
                           <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                        </div>
                        {msg.sender === 'ai' && (
                             <button
                                onClick={() => handleGeneratePdf(msg.text, msg.id)}
                                className="flex items-center gap-1.5 mt-2 px-2.5 py-1.5 text-xs bg-card border border-border-card text-secondary rounded-lg hover:border-primary hover:text-main transition-colors"
                             >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Guardar Consejo en PDF
                            </button>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start mb-4">
                        <div className="max-w-xs p-3 rounded-lg bg-card">
                           <div className="flex items-center space-x-2">
                               <div className="w-2 h-2 bg-secondary rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                               <div className="w-2 h-2 bg-secondary rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                               <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="pt-4">
                <form ref={formRef} onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onFocus={handleInputFocus}
                        placeholder="Escribe tu pregunta..."
                        className="w-full p-3 bg-card border border-border-card rounded-lg text-main placeholder-secondary focus:ring-2 focus:ring-primary focus:border-primary transition"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !userInput.trim()}
                        className="p-3 rounded-lg bg-primary text-primary-contrast transition-opacity hover:opacity-90 disabled:opacity-50"
                        aria-label="Enviar"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Assistant;