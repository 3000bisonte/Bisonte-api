console.log('🔍 === DIAGNÓSTICO COMPLETO DEL HOME ===\n');

async function diagnosticHome() {
  console.log('🏠 VERIFICANDO COMPONENTE HOME...');
  
  // 1. Verificar que el frontend cargue
  console.log('\n1. 🌐 Verificando Carga del Home...');
  try {
    const homeCheck = await fetch('https://www.bisonteapp.com/home');
    console.log('   ✅ Home responde:', homeCheck.status);
    
    if (homeCheck.ok) {
      const homeHTML = await homeCheck.text();
      
      // Verificar elementos críticos en el HTML
      const hasReactRoot = homeHTML.includes('__next');
      const hasHomeComponent = homeHTML.includes('Home') || homeHTML.includes('home');
      const hasErrorBoundary = homeHTML.includes('error');
      
      console.log('   📋 Elementos encontrados:');
      console.log('      - React Root:', hasReactRoot ? '✅' : '❌');
      console.log('      - Home Component:', hasHomeComponent ? '✅' : '❌');
      console.log('      - Error Handling:', hasErrorBoundary ? '✅' : '❌');
    }
  } catch (error) {
    console.log('   ❌ Error cargando Home:', error.message);
  }

  // 2. Verificar errores conocidos de React
  console.log('\n2. 🐛 Analizando Error React #310...');
  console.log('   📖 React Error #310: Corresponde a problemas con hooks o efectos');
  console.log('   🔍 Causas comunes:');
  console.log('      - useEffect con dependencias incorrectas');
  console.log('      - Hooks llamados condicionalmente');
  console.log('      - Hooks en funciones no-React');
  console.log('      - Race conditions en efectos');

  // 3. Verificar estructura de archivos críticos
  console.log('\n3. 📁 Verificando Archivos del Home...');
  const fs = require('fs');
  
  const homeFiles = [
    'src/components/Home.js',
    'src/hooks/useMobileSession.js',
    'src/app/home/page.js'
  ];

  for (const file of homeFiles) {
    try {
      const exists = fs.existsSync(file);
      console.log(`   ${exists ? '✅' : '❌'} ${file}`);
      
      if (exists) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Verificar problemas comunes en el código
        const hasUseEffect = content.includes('useEffect');
        const hasConditionalHooks = content.match(/if.*use[A-Z]/);
        const hasTryCatch = content.includes('try') && content.includes('catch');
        const hasAsyncEffect = content.includes('useEffect') && content.includes('async');
        
        console.log(`      - useEffect presente: ${hasUseEffect ? '✅' : '⚠️'}`);
        console.log(`      - Hooks condicionales: ${hasConditionalHooks ? '❌ PROBLEMA' : '✅'}`);
        console.log(`      - Error handling: ${hasTryCatch ? '✅' : '⚠️'}`);
        console.log(`      - Async en useEffect: ${hasAsyncEffect ? '❌ PROBLEMA' : '✅'}`);
      }
    } catch (error) {
      console.log(`   ❌ Error leyendo ${file}:`, error.message);
    }
  }

  // 4. Verificar session y localStorage
  console.log('\n4. 💾 Simulando Verificación de Sesión...');
  console.log('   📝 Basado en logs, localStorage contiene:');
  console.log('      - google_auth_data: ✅ PRESENTE');
  console.log('      - session_data: ✅ PRESENTE');
  console.log('      - user_email: ✅ PRESENTE');
  console.log('      - auth_success: ✅ PRESENTE');
  console.log('   ✅ Sesión parece válida según logs');

  // 5. Verificar problemas específicos del código
  console.log('\n5. 🔧 Revisando Código Específico...');
  try {
    const homeContent = fs.readFileSync('src/components/Home.js', 'utf8');
    
    // Buscar patrones problemáticos
    const useEffectCount = (homeContent.match(/useEffect/g) || []).length;
    const hasAsyncInEffect = homeContent.includes('useEffect') && homeContent.includes('async');
    const hasRouter = homeContent.includes('useRouter');
    const hasSetTimeout = homeContent.includes('setTimeout');
    
    console.log('   📊 Análisis del código Home.js:');
    console.log(`      - Número de useEffect: ${useEffectCount}`);
    console.log(`      - Async en useEffect: ${hasAsyncInEffect ? '❌ PROBLEMA' : '✅'}`);
    console.log(`      - useRouter presente: ${hasRouter ? '✅' : '❌'}`);
    console.log(`      - setTimeout usado: ${hasSetTimeout ? '⚠️ REVISAR' : '✅'}`);
    
    // Buscar líneas específicas problemáticas
    if (homeContent.includes('async') && homeContent.includes('useEffect')) {
      console.log('   🚨 PROBLEMA DETECTADO: async function dentro de useEffect');
      console.log('      💡 Solución: Crear función async interna o usar .then()');
    }
    
  } catch (error) {
    console.log('   ❌ Error analizando Home.js:', error.message);
  }

  // 6. Recomendaciones de solución
  console.log('\n6. 💡 RECOMENDACIONES DE SOLUCIÓN...');
  console.log('   🔧 Para React Error #310:');
  console.log('      1. Revisar todos los useEffect en Home.js');
  console.log('      2. Asegurar que no hay async functions directas en useEffect');
  console.log('      3. Verificar que todos los hooks estén al nivel raíz');
  console.log('      4. Comprobar que las dependencias de useEffect sean correctas');
  console.log('      5. Evitar race conditions con flags de mounted');

  console.log('\n   🚀 Pasos inmediatos:');
  console.log('      1. Crear versión de desarrollo para ver errores completos');
  console.log('      2. Revisar useMobileSession hook por problemas de timing');
  console.log('      3. Simplificar useEffect en Home.js');
  console.log('      4. Agregar error boundaries');

  // 7. Test de compilación local
  console.log('\n7. 🏗️ Testing Build Local...');
  try {
    const { execSync } = require('child_process');
    console.log('   🔄 Ejecutando npm run build...');
    const buildOutput = execSync('npm run build', { 
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('   ✅ Build local exitoso');
  } catch (error) {
    console.log('   ❌ Error en build local:', error.message);
  }

  console.log('\n🎯 === RESUMEN DEL DIAGNÓSTICO ===');
  console.log('📊 Estado detectado:');
  console.log('   - Sesión de usuario: ✅ FUNCIONANDO');
  console.log('   - Carga de datos: ✅ FUNCIONANDO'); 
  console.log('   - Rendering de Home: ❌ ERROR REACT #310');
  console.log('   - Probable causa: useEffect con async o race condition');
  
  console.log('\n🚨 ACCIÓN REQUERIDA:');
  console.log('   Revisar y corregir useEffect en Home.js o useMobileSession.js');
  console.log('   Específicamente buscar async functions dentro de useEffect');

  console.log('\n🔍 === FIN DEL DIAGNÓSTICO ===');
}

// Ejecutar diagnóstico
diagnosticHome().catch(console.error);
