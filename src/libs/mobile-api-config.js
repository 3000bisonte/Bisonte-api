
// Configuración temporal para APIs en aplicación móvil
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.bisonte.com',
  MODE: process.env.NEXT_PUBLIC_APP_MODE || 'mobile',
  MOCK_DATA: true // Usar datos mock para la versión móvil
};

export const MOCK_RESPONSES = {
  login: { success: true, token: 'mock-token' },
  profile: { id: 1, name: 'Usuario Demo', email: 'demo@bisonte.com' },
  shipments: [
    { id: 1, origin: 'Bogotá', destination: 'Medellín', status: 'En tránsito' },
    { id: 2, origin: 'Cali', destination: 'Cartagena', status: 'Entregado' }
  ]
};
