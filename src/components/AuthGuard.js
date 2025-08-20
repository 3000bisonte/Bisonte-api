import styles from './AuthGuard.module.css';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMobileSession } from '@/hooks/useMobileSession';

export default function AuthGuard({ children }) {
  const { status, data } = useMobileSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log('🛡️ AuthGuard: estado de autenticación:', status);
    
    if (status === 'unauthenticated') {
      console.log('🚫 No autenticado, redirigiendo al login...');
      router.push('/');
      return;
    }
    
    if (status === 'authenticated') {
      console.log('✅ Usuario autenticado:', data?.user);
      setIsChecking(false);
    }
  }, [status, router, data]);

  // Mostrar loading mientras verifica
  if (status === 'loading' || isChecking) {
    return (
      <div className={styles.minHScreen + " " + styles.flex + " " + styles.itemsCenter + " " + styles.justifyCenter + " " + styles.bgGradientToBr + " " + styles.fromOrange400 + " " + styles.toRed500}>
        <div className={styles.textCenter}>
          <div className={styles.animateSpin + " " + styles.roundedFull + " " + styles.h12 + " " + styles.w12 + " " + styles.border4 + " " + styles.borderWhite + " " + styles.borderTTransparent + " " + styles.mxAuto + " " + styles.marginBottom4}></div>
          <p className={styles.textWhite}>Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Mostrar contenido solo si está autenticado
  if (status === 'authenticated') {
    return children;
  }

  // No mostrar nada mientras redirige
  return null;
}
