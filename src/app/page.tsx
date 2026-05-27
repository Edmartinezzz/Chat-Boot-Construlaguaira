import ChatClientes from '@/components/ChatClientes';

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 md:p-8 overflow-hidden font-sans">
      
      {/* Luces de fondo decorativas (Glow effects estilo Gemini) */}
      <div className="absolute top-[-10%] left-[5%] w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[140px] pointer-events-none"></div>

      <div className="relative z-10 w-full flex flex-col items-center gap-6">
        {/* Encabezado Principal */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse"></span>
            Asistente Inteligente Activo
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mt-3">
            Atención al Cliente <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Construlaguaira</span>
          </h1>
          <p className="text-sm md:text-base text-slate-500 max-w-lg mx-auto font-medium">
            Consulta existencias y precios en tiempo real de forma instantánea.
          </p>
        </div>

        {/* Componente del Chat */}
        <main className="w-full flex justify-center">
          <ChatClientes />
        </main>

        {/* Pie de página */}
        <footer className="text-center text-xs text-slate-400 max-w-md mt-4 space-y-1">
          <p>© 2026 Construlaguaira. Todos los derechos reservados.</p>
          <p className="text-slate-500 font-medium">
            Desarrollado con Groq Llama 3.3 & Supabase en tiempo real.
          </p>
        </footer>
      </div>
    </div>
  );
}
