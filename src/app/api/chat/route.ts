import { groq } from '@ai-sdk/groq';
import { google } from '@ai-sdk/google';
import { streamText, tool, convertToModelMessages, stepCountIs } from 'ai';
import { supabaseServer } from '@/lib/supabaseServer';
import { z } from 'zod';

export const maxDuration = 30;

// System prompt compartido entre modelos
const SYSTEM_PROMPT = `Eres el asistente virtual oficial de atención al cliente de la empresa.
Tu objetivo es ayudar a los clientes con información sobre productos, precios y disponibilidad.

REGLAS DE ORO QUE DEBES CUMPLIR ESTRICTAMENTE:
1. Tu única fuente de verdad para precios, disponibilidad y detalles de productos es la herramienta 'consultarInventarioSupabase'. NUNCA asumas, inventes, adivines o alucines un precio o stock. Si la base de datos no te devuelve información exacta de un producto, indícalo de manera amable y empática indicando que no está disponible o no se encuentra en el catálogo en este momento.
2. Mantén en todo momento un tono amable, servicial y profesional. Si un producto está agotado o tiene poco stock, comunícalo con empatía.
3. NO ESTÁS AUTORIZADO para cerrar ventas, recibir datos de pago, concretar envíos ni apartar mercancía en el sistema de forma directa.
4. En el momento exacto en que el cliente demuestre una intención clara de concretar la compra (por ejemplo, al decir: "quiero comprar", "quiero comprar tal producto", "¿cómo pago?", "pásame los datos de pago", "quiero apartar 5 unidades", "añade esto al pedido"), debes proporcionarle de inmediato los números de WhatsApp de las vendedoras humanas para finalizar el proceso de compra, los cuales son:
   - 04220102215
   - 04241372156
   Despídete amablemente y no intentes seguir la conversación después de esto.`;

// Herramientas compartidas entre modelos
const TOOLS = {
  consultarInventarioSupabase: tool({
    description: 'Consulta en tiempo real la existencia, precio y nombre de un producto en el inventario de Supabase.',
    inputSchema: z.object({
      producto: z.string().describe('El término de búsqueda o nombre del producto a consultar.'),
    }),
    execute: async ({ producto }) => {
      console.log(`[Tool Call] Buscando producto en Supabase: "${producto}"`);
      try {
        const { data, error } = await supabaseServer
          .from('products')
          .select('name, price_usd, stock')
          .ilike('name', `%${producto}%`);

        if (error) {
          console.error('Error al realizar query en Supabase:', error);
          return {
            success: false,
            error: error.message,
            message: 'No se pudo completar la consulta debido a un error en el servidor de base de datos.',
          };
        }

        if (!data || data.length === 0) {
          return {
            success: true,
            count: 0,
            products: [],
            message: `No se encontraron productos que coincidan con la búsqueda "${producto}".`,
          };
        }

        return {
          success: true,
          count: data.length,
          products: data.map(item => ({
            nombre: item.name,
            precio: item.price_usd,
            stock: item.stock,
          })),
        };
      } catch (err) {
        console.error('Error inesperado en consultarInventarioSupabase execute:', err);
        return {
          success: false,
          error: err instanceof Error ? err.message : String(err),
          message: 'Ocurrió un error inesperado al conectar con el inventario.',
        };
      }
    },
  }),
};

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const modelMessages = await convertToModelMessages(messages);

    // 1. Intentar con Gemini 2.5 Flash (proveedor principal)
    try {
      console.log('[AI Router] Usando modelo principal: Gemini 2.5 Flash');
      const result = streamText({
        model: google('gemini-2.5-flash'),
        system: SYSTEM_PROMPT,
        messages: modelMessages,
        stopWhen: stepCountIs(5),
        tools: TOOLS,
      });
      return result.toUIMessageStreamResponse();
    } catch (primaryError) {
      // 2. Si Gemini falla (rate limit, error de API, etc.), usar Groq como respaldo
      console.warn('[AI Router] Gemini falló, alternando a Groq Llama 3.1 como respaldo:', primaryError);
      const result = streamText({
        model: groq('llama-3.1-8b-instant'),
        system: SYSTEM_PROMPT,
        messages: modelMessages,
        stopWhen: stepCountIs(5),
        tools: TOOLS,
      });
      return result.toUIMessageStreamResponse();
    }
  } catch (error) {
    console.error('Error en POST /api/chat:', error);
    return new Response(
      JSON.stringify({ error: 'Ocurrió un error al procesar el mensaje en el servidor.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
