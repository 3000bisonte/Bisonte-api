"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authAPI, apiClient } from "@/libs/api-client";
import { useMobileSession } from "@/hooks/useMobileSession";
import GoogleSignInButtonNative from "@/components/GoogleSignInButtonNative";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { Capacitor } from '@capacitor/core';
import { getGoogleClientId } from "@/utils/googleConfig";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showGoogleEmailPrompt, setShowGoogleEmailPrompt] = useState(false);
  const [runtimeGoogleClientId, setRuntimeGoogleClientId] = useState(null);
  const [googleEmail, setGoogleEmail] = useState("");
  const router = useRouter();
  const { signIn } = useMobileSession();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const lastUser = localStorage.getItem("lastUser");
      if (lastUser) setEmail(lastUser);
    }
  }, []);

  // Fetch runtime public config once on mount as a fallback for client id
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return; // build-time already available
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/public/config', { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && json?.googleClientId) {
          setRuntimeGoogleClientId(json.googleClientId);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      // Llamar al backend real de autenticación
      const res = await authAPI.login(email.toLowerCase().trim(), password);
      if (res && (res.success || res.ok) && (res.token || res.data?.token)) {
        const token = res.token || res.data?.token;
        const user = res.user || res.data?.user || { email };

        // Persistir token para apiClient
        apiClient.setAuthToken(token);

        // Persistir datos de usuario (compatibilidad)
        if (typeof window !== "undefined") {
          localStorage.setItem("lastUser", email);
          localStorage.setItem("user", JSON.stringify(user));
        }

        // Setear sesión móvil (para Home/useMobileSession)
        signIn({ email: user.email, name: user.name });

  router.push("/home/");
      } else {
        throw new Error(res?.error || res?.message || "Credenciales inválidas");
      }
    } catch (error) {
      console.error("Error en login:", error);
      setErrorMessage(typeof error === 'string' ? error : (error?.message || "Error al iniciar sesión."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      // Si no hay email en el campo, pedirlo primero
      if (!email) {
        setShowGoogleEmailPrompt(true);
        setIsLoading(false);
        return;
      }
      // Usar Google Identity Services con idToken
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || runtimeGoogleClientId;
      if (!clientId) {
        throw new Error("Falta NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      }
      setShowGoogleEmailPrompt(false); // Asegurar cierre si estaba abierto
      // El botón de Google ejecutará onCredential -> handleGoogleCredential
      return;
      if (res && (res.success || res.ok) && (res.token || res.data?.token)) {
        const token = res.token || res.data?.token;
        const user = res.user || res.data?.user || { email, name: nameFallback };
        apiClient.setAuthToken(token);
        if (typeof window !== "undefined") {
          localStorage.setItem("lastUser", email);
          localStorage.setItem("user", JSON.stringify(user));
        }
        signIn({ email: user.email, name: user.name }, { token });
  router.push("/home/");
      } else {
        // Fallback: si el endpoint no existe, crear sesión local solo para pruebas
        signIn({ email: email || 'google-user@example.com', name: nameFallback });
  router.push("/home/");
      }
    } catch (error) {
  // Si el backend responde 400 u otro error, crear sesión local para continuar
  console.error("Error inicializando Google:", error);
  setErrorMessage("No se pudo iniciar Google. Revisa la configuración.");
  setIsLoading(false);
    }
  };

  const handleConfirmGoogleEmail = async (e) => {
    e.preventDefault();
    const normalized = (googleEmail || "").toLowerCase().trim();
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setErrorMessage("Ingresa un correo válido para continuar con Google.");
      return;
    }
    setEmail(normalized);
    setShowGoogleEmailPrompt(false);
    await handleGoogleSignIn();
  };

  // Admin UI options can be handled after session is available

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-8 relative">
      {/* Quick Nav for unauthenticated users */}
      <div className="absolute top-2 left-0 right-0 flex items-center justify-center gap-3 text-xs text-gray-300">
  <Link href="/home/" className="hover:text-teal-300">Home</Link>
        <span className="opacity-40">•</span>
        <Link href="/cotizador" className="hover:text-teal-300">Cotizar</Link>
        <span className="opacity-40">•</span>
        <Link href="/pagos" className="hover:text-teal-300">Pagos</Link>
        <span className="opacity-40">•</span>
        <Link href="/perfilCard" className="hover:text-teal-300">Perfil</Link>
        <span className="opacity-40">•</span>
        <Link href="/contacto" className="hover:text-teal-300">Contacto</Link>
      </div>
      {/* Background Pattern - Simplified */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>
      
      <div className="relative w-full max-w-md z-10">
        {/* Main Card */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/10 px-6 py-10 sm:px-10 sm:py-12">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full blur opacity-40"></div>
              <img
                src="/LogoNew.jpg"
                alt="Bisonte Logo"
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white/20 shadow-lg"
              />
            </div>
            <h1 className="text-white text-2xl sm:text-3xl font-bold mt-4 tracking-wider">
              BISONTE
            </h1>
            <div className="w-16 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-500 mx-auto mt-2"></div>
          </div>

          {/* Welcome Title */}
          <div className="text-center mb-8">
            <h2 className="text-white text-xl sm:text-2xl font-semibold mb-2">
              Bienvenido de nuevo
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-gray-300 text-sm font-medium">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm text-sm sm:text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-gray-300 text-sm font-medium">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm text-sm sm:text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-white/5 rounded-r-xl transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029M5.636 5.636l14.142 14.142M9.879 9.879L12 12m2.121-2.121l-2.122 2.122" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <p className="text-red-300 text-sm">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                href="/recuperar"
                className="text-teal-400 text-sm hover:text-teal-300 transition-colors duration-200 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                "Iniciar Sesión"
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-800 text-gray-400">o continúa con</span>
              </div>
            </div>

            {/* Warn if Google Client ID is missing */}
            {!(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || runtimeGoogleClientId) && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-yellow-200 text-sm">
                El botón de Google está deshabilitado: falta configurar NEXT_PUBLIC_GOOGLE_CLIENT_ID.
                Agrega tu Client ID en Vercel → Project Settings → Environment Variables y vuelve a desplegar.
              </div>
            )}

            {/* Google Button (Redirect) */}
            <div className="flex justify-center">
              <GoogleSignInButton
                clientId={getGoogleClientId()}
                useRedirect={true}
                onCredential={async (credential) => {
                  try {
                    if (!credential) {
                      setErrorMessage("Acceso bloqueado por Google. Asegúrate de que el dominio actual esté autorizado en Google Cloud Console > Credentials > OAuth 2.0 Client IDs > Authorized JavaScript origins. Usa exactamente: https://www.bisonteapp.com");
                      return;
                    }
                    setIsLoading(true);
                    
                    // Extraer datos del credential (puede ser formato nuevo o viejo)
                    let emailFromToken = undefined;
                    let nameFromToken = undefined;
                    let idToken = credential.credential || credential;
                    
                    // Si viene del componente nativo, puede tener datos del usuario directamente
                    if (credential.user) {
                      emailFromToken = credential.user.email;
                      nameFromToken = credential.user.name;
                    } else {
                      // Decodificar el ID token (JWT) para extraer claims básicos
                      try {
                        const parts = idToken.split('.')
                        if (parts.length === 3) {
                          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                          emailFromToken = payload.email;
                          nameFromToken = payload.name || payload.given_name || payload.family_name ? `${payload.given_name || ''} ${payload.family_name || ''}`.trim() : undefined;
                        }
                      } catch {}
                    }

                    const res = await authAPI.googleLogin(idToken, {
                      email: emailFromToken,
                      name: nameFromToken,
                    });
                    if (res && (res.success || res.ok) && (res.token || res.data?.token)) {
                      const token = res.token || res.data?.token;
                      const user = res.user || res.data?.user || {};
                      apiClient.setAuthToken(token);
                      if (typeof window !== "undefined" && user?.email) {
                        localStorage.setItem("lastUser", user.email);
                        localStorage.setItem("user", JSON.stringify(user));
                      }
                      signIn({ email: user.email, name: user.name }, { token });
                      router.push("/home/");
                    } else {
                      setErrorMessage("Google rechazado. Intenta otro método.");
                    }
                  } catch (err) {
                    const msg = (err?.message || "").toLowerCase();
                    if (msg.includes("origin_mismatch") || msg.includes("invalid_request") || msg.includes("blocked")) {
                      setErrorMessage("Google bloqueó el acceso: revisa el Client ID y los orígenes autorizados. Deben incluir https://www.bisonteapp.com y http://localhost:3000 si pruebas en local.");
                    } else {
                      setErrorMessage("No se pudo validar Google.");
                    }
                  } finally {
                    setIsLoading(false);
                  }
                }}
              />
            </div>

            {/* Prompt de email para Google */}
            {showGoogleEmailPrompt && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-[#1f2937] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                  <h3 className="text-white text-lg font-semibold mb-2">Continuar con Google</h3>
                  <p className="text-gray-300 text-sm mb-4">Ingresa tu correo para continuar con Google.</p>
                  <form onSubmit={handleConfirmGoogleEmail} className="space-y-4">
                    <input
                      type="email"
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                      required
                      autoFocus
                    />
                    <div className="flex items-center justify-end gap-3">
                      <button type="button" onClick={() => { setShowGoogleEmailPrompt(false); setIsLoading(false); }} className="text-gray-300 hover:text-white text-sm">Cancelar</button>
                      <button type="submit" className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-semibold py-2 px-4 rounded-lg">Continuar</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <span className="text-gray-400 text-sm">¿No tienes cuenta? </span>
            <Link
              href="/register"
              className="text-teal-400 text-sm font-semibold hover:text-teal-300 transition-colors duration-200 hover:underline"
            >
              Regístrate aquí
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">
            © 2024 Bisonte Logística. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;