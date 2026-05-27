import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Asistente Construlaguaira',
    short_name: 'Construlaguaira',
    description: 'Chat de atención al cliente con consulta de inventario en tiempo real.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#007aff',
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
