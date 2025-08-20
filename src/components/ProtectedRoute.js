'use client';
import styles from './ProtectedRoute.module.css';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('🚫 No autenticado, redirigiendo...');
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Mostrar loading mientras verifica
  if (isLoading) {
    return (
      <div className={styles.minHScreen + " " + styles.flex + " " + styles.itemsCenter + " " + styles.justifyCenter + " " + styles.bgGradientToBr + " " + styles.fromOrange400 + " " + styles.toRed500}>
        <div className={styles.textCenter}>
          <div className={styles.animateSpin + " " + styles.roundedFull + " " + styles.h12 + " " + styles.w12 + " " + styles.border4 + " " + styles.borderWhite + " " + styles.borderTTransparent + " " + styles.mxAuto + " " + styles.marginBottom4}></div>
          <p className={styles.textWhite + " " + styles.fontMedium}>Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Solo mostrar contenido si está autenticado
  if (isAuthenticated) {
    return children;
  }

  // No mostrar nada mientras redirige
  return null;
}
