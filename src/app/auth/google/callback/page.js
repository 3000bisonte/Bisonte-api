"use client";

import { useEffect, useState } from "react";

export default function GoogleCallbackPage() {
  const [status, setStatus] = useState('Procesando autenticación...');
  const [debugLog, setDebugLog] = useState([]);

  const addLog = (message) => {
    const timestamp = new Date().toISOString().substring(11, 19);
    const logMessage = `${timestamp}: ${message}`;
    console.log("🔥 CALLBACK:", logMessage);
    setDebugLog(prev => [...prev, logMessage]);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleCallback = async () => {
      try {
        addLog("=== INICIO DEL CALLBACK ===");
        addLog(`URL: ${window.location.href}`);

        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        addLog(`Código: ${code ? 'SÍ' : 'NO'}`);
        addLog(`Error: ${error || 'NO'}`);

        if (error) {
          setStatus('Error en autenticación');
          addLog(`❌ Error OAuth: ${error}`);
          setTimeout(() => window.location.href = '/login', 3000);
          return;
        }

        if (!code) {
          setStatus('Código faltante');
          addLog("❌ No hay código de autorización");
          setTimeout(() => window.location.href = '/login', 3000);
          return;
        }

        setStatus('Intercambiando tokens...');
        addLog("✅ Código válido, intercambiando tokens...");

        // Intercambio de tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
            code,
            grant_type: 'authorization_code',
            redirect_uri: 'https://www.bisonteapp.com/auth/google/callback',
          }),
        });

        addLog(`Respuesta tokens: ${tokenResponse.status}`);

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          addLog(`❌ Error tokens: ${errorText}`);
          throw new Error('Error en tokens');
        }

        const tokenData = await tokenResponse.json();
        addLog("✅ Tokens obtenidos");

        setStatus('Obteniendo usuario...');

        // Obtener datos del usuario
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        addLog(`Respuesta usuario: ${userResponse.status}`);

        if (!userResponse.ok) {
          throw new Error('Error obteniendo usuario');
        }

        const userData = await userResponse.json();
        addLog(`✅ Usuario: ${userData.email}`);

        setStatus('Guardando sesión...');

        // Guardar sesión
        const sessionData = {
          user: {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            picture: userData.picture
          },
          token: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expires: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
          created: new Date().toISOString()
        };

        // Guardar en múltiples formatos
        localStorage.setItem('google_auth_data', JSON.stringify({ user: userData, tokens: tokenData }));
        localStorage.setItem('bisonte_mobile_session', JSON.stringify(sessionData));
        localStorage.setItem('authToken', tokenData.access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('auth_success', 'true');

        addLog("💾 Sesión guardada");

        setStatus('¡Éxito! Redirigiendo...');
        addLog("🏠 Redirigiendo a home...");

        setTimeout(() => {
          window.location.href = '/home';
        }, 1500);

      } catch (error) {
        setStatus('Error en proceso');
        addLog(`❌ Error: ${error.message}`);
        setTimeout(() => window.location.href = '/login', 3000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          🔐 Procesando Autenticación
        </h1>
        
        <div className="flex flex-col items-center mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-gray-800 text-center font-semibold text-lg">
            {status}
          </p>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">📋 Log del Proceso:</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-xs max-h-40 overflow-y-auto">
            {debugLog.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
            {debugLog.length === 0 && (
              <div className="text-gray-500">Iniciando proceso...</div>
            )}
          </div>
        </div>

        {status.includes('Éxito') && (
          <div className="mt-6 text-center">
            <button
              onClick={() => window.location.href = '/home'}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg"
            >
              🏠 IR AL HOME
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
