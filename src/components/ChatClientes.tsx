'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import type { UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  MessageSquare, 
  Database, 
  HelpCircle,
  Sparkles,
  MoreHorizontal
} from 'lucide-react';

export default function ChatClientes() {
  const [input, setInput] = useState('');
  
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    onError: (err: Error) => {
      console.error('Error de comunicación con el bot:', err);
    }
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final del chat cuando hay nuevos mensajes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Verificar si hay alguna consulta a Supabase activa en este momento
  const isConsultingSupabase = messages.some(
    (message: UIMessage) =>
      message.role === 'assistant' &&
      message.parts?.some(
        (part: any) =>
          part.type === 'tool-consultarInventarioSupabase' &&
          (part.state === 'input-streaming' || part.state === 'input-available')
      )
  );

  // Preguntas sugeridas estilo iOS Action Chips
  const sugerencias = [
    { texto: '¿Tienen cemento disponible?', valor: '¿Tienen cemento disponible?' },
    { texto: 'Precio de cabillas', valor: '¿Cuál es el precio de las cabillas?' },
    { texto: '¿Cómo puedo comprar?', valor: 'Quiero hacer una compra' },
  ];

  const handleSugerenciaClick = (texto: string) => {
    sendMessage({ text: texto });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <div className="flex flex-col w-full max-w-2xl h-[650px] bg-white border border-slate-200/60 rounded-3xl shadow-xl overflow-hidden transition-all duration-300 font-sans text-black">
      
      {/* iOS App Navigation Header (Without Status Bar / Phone Wrapper) */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 z-40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-[#007aff] to-[#5856d6] text-white shadow-sm">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm md:text-base leading-none tracking-wide flex items-center gap-1.5">
              Asistente Construlaguaira
            </h2>
            <p className="text-[11px] text-slate-400 mt-1.5 font-semibold flex items-center gap-1">
              Atención inteligente en vivo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-[11px] text-slate-600 font-bold border border-slate-100">
            <Database className="w-3.5 h-3.5 text-[#007aff]" />
            <span>Inventario Conectado</span>
          </div>
          <button className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* iOS Message Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f8f9fa] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent animate-in fade-in duration-300">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[#007aff] shadow-sm animate-pulse">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-slate-800">Asistente de Materiales</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-medium">
                Consulta existencias, precios de venta y disponibilidad al instante.
              </p>
            </div>
            
            {/* iOS Action Chips */}
            <div className="flex flex-wrap gap-2 justify-center max-w-md pt-2">
              {sugerencias.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSugerenciaClick(sug.valor)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200/60 rounded-2xl text-xs text-slate-700 hover:text-[#007aff] font-bold shadow-sm transition-all duration-200 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#007aff]" />
                  {sug.texto}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message: UIMessage) => {
            const isAi = message.role === 'assistant';
            
            const hasVisibleContent = message.parts?.some(
              (part: any) => 
                (part.type === 'text' && part.text) || 
                (part.type === 'reasoning' && part.text)
            );
            if (isAi && !hasVisibleContent) {
              return null;
            }

            return (
              <div
                key={message.id}
                className={`flex gap-3 max-w-[85%] ${
                  isAi ? 'self-start' : 'self-end ml-auto flex-row-reverse'
                } animate-in fade-in slide-in-from-bottom-2 duration-200`}
              >
                {/* Globo de mensaje estilo iOS */}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-[13.5px] leading-snug shadow-sm ${
                    isAi
                      ? 'bg-white text-slate-800 border border-slate-100 rounded-tl-md'
                      : 'bg-[#007aff] text-white rounded-tr-md font-medium'
                  }`}
                >
                  {message.parts?.map((part: any, idx: number) => {
                    if (part.type === 'text') {
                      return (
                        <p key={idx} className="whitespace-pre-wrap">
                          {part.text}
                        </p>
                      );
                    }
                    if (part.type === 'reasoning') {
                      return (
                        <span key={idx} className="block text-[10px] opacity-60 italic border-l-2 border-slate-300 pl-1.5 py-0.5 my-1">
                          Pensando: {part.text}
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            );
          })
        )}

        {/* Indicador de consulta de base de datos estilo iOS widget */}
        {isConsultingSupabase && (
          <div className="flex gap-2 max-w-[80%] self-start animate-in fade-in duration-300">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl rounded-tl-md bg-white border border-slate-100 text-[#007aff] text-[11px] font-bold shadow-sm">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Buscando en catálogo...</span>
            </div>
          </div>
        )}

        {/* Pensando... */}
        {isLoading && !isConsultingSupabase && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex gap-2 max-w-[80%] self-start animate-in fade-in duration-300">
            <div className="flex items-center gap-1 px-4 py-2.5 rounded-2xl rounded-tl-md bg-slate-200/50 text-slate-500 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-150"></span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-red-100 text-red-800 text-[11px] text-center font-bold">
            Hubo un error de conexión al servidor de IA.
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* iOS Bottom Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0 z-40"
      >
        <div className="flex-1 flex items-center bg-[#f2f2f7] border border-slate-200/30 rounded-full px-4 py-1.5">
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 bg-transparent text-sm text-black placeholder-slate-400 focus:outline-none py-1.5 font-medium"
            disabled={isLoading}
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="w-9 h-9 bg-[#007aff] hover:bg-[#026bde] disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4 rotate-45 -mt-0.5 -mr-0.5" />
          )}
        </button>
      </form>
    </div>
  );
}
