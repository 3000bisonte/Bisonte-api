"use client";

import { useState, useEffect } from 'react';

export default function DiagnosticPage() {
  const [diagnostics, setDiagnostics] = useState({});
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog('🔍 Iniciando diagnóstico...');
    
    // Verificar localStorage
    let authToken = '';
    let token = '';
    let user = '';
    let lastUser = '';
    let userData = null;

    try {
      if (typeof window !== 'undefined') {
        authToken = localStorage.getItem('authToken') || '';
        token = localStorage.getItem('token') || '';
        user = localStorage.getItem('user') || '';
        lastUser = localStorage.getItem('lastUser') || '';
        
        if (user) {
          userData = JSON.parse(user);
        }
      }
    } catch (e) {
      addLog('❌ Error parseando userData: ' + e.message);
    }

    const diag = {
      localStorage: {
        authToken: authToken ? '✅ Existe' : '❌ No existe',
        token: token ? '✅ Existe' : '❌ No existe',
        user: user ? '✅ Existe' : '❌ No existe',
        lastUser: lastUser ? '✅ Existe' : '❌ No existe',
        userDataParsed: userData ? '✅ Válido' : '❌ Inválido'
      },
      values: {
        authToken: authToken || 'N/A',
        token: token || 'N/A',
        user: user || 'N/A',
        userData: userData || 'N/A',
        lastUser: lastUser || 'N/A'
      }
    };

    setDiagnostics(diag);
    addLog('✅ Diagnóstico completado');
  }, []);

  const clearAllStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      addLog('🧹 LocalStorage limpiado completamente');
      window.location.reload();
    }
  };

  const testLogin = () => {
    addLog('🧪 Probando login de demostración...');
    const demoUser = {
      id: 999,
      nombre: 'Usuario Demo',
      email: 'demo@bisonte.com',
      tipo_usuario: 'cliente'
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(demoUser));
      localStorage.setItem('authToken', 'demo-token-123');
      localStorage.setItem('token', 'demo-session-456');
      addLog('✅ Datos de demo guardados');
      
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">🔧 Diagnóstico de Autenticación</h1>
          <p className="text-gray-600">Verificando el estado del sistema de autenticación</p>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">🎮 Controles de Test</h2>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={testLogin}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              🧪 Probar Login Demo
            </button>
            <button
              onClick={clearAllStorage}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              🧹 Limpiar Todo
            </button>
            <button
              onClick={() => typeof window !== 'undefined' && window.location.reload()}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            >
              🔄 Recargar Diagnóstico
            </button>
          </div>
        </div>

        {/* Estado de LocalStorage */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">💾 Estado de LocalStorage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(diagnostics.localStorage || {}).map(([key, value]) => (
              <div key={key} className="p-3 bg-gray-50 rounded">
                <p className="font-medium text-gray-700">{key}</p>
                <p className="text-sm">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Valores Actuales */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">📋 Valores Actuales</h2>
          <div className="space-y-4">
            {Object.entries(diagnostics.values || {}).map(([key, value]) => (
              <div key={key} className="border-b pb-2">
                <p className="font-medium text-gray-700">{key}:</p>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                  {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* Logs de Diagnóstico */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">📝 Logs de Diagnóstico</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-40 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
