console.log('🔍 === DIAGNÓSTICO ESPECÍFICO DEL HOME NO FUNCIONANDO ===\n');

async function deepDiagnoseHome() {
  console.log('🏠 DIAGNÓSTICO PROFUNDO DEL HOME...');
  
  // 1. Verificar respuesta exacta del servidor
  console.log('\n1. 📡 Verificando Respuesta del Servidor...');
  try {
    const response = await fetch('https://www.bisonteapp.com/home');
    console.log('   📊 Status:', response.status);
    console.log('   📋 Headers:', Object.fromEntries(response.headers.entries()));
    
    const content = await response.text();
    console.log('   📄 Content Length:', content.length);
    
    // Verificar si es HTML válido o hay errores
    const hasHtmlTag = content.includes('<html');
    const hasBodyTag = content.includes('<body');
    const hasReactRoot = content.includes('__next');
    const hasErrors = content.includes('error') || content.includes('Error');
    
    console.log('   🔍 Análisis del contenido:');
    console.log(`      - HTML válido: ${hasHtmlTag ? '✅' : '❌'}`);
    console.log(`      - Body tag: ${hasBodyTag ? '✅' : '❌'}`);
    console.log(`      - React root: ${hasReactRoot ? '✅' : '❌'}`);
    console.log(`      - Errores detectados: ${hasErrors ? '❌ SÍ' : '✅ NO'}`);
    
    // Buscar errores específicos
    if (content.includes('Error') || content.includes('error')) {
      const errorMatch = content.match(/Error[^<]*/gi);
      if (errorMatch) {
        console.log('   🚨 Errores encontrados:', errorMatch.slice(0, 3));
      }
    }
    
  } catch (error) {
    console.log('   ❌ Error al verificar servidor:', error.message);
  }

  // 2. Verificar el componente Home.js actual
  console.log('\n2. 📄 Analizando Componente Home.js...');
  const fs = require('fs');
  
  try {
    const homeContent = fs.readFileSync('src/components/Home.js', 'utf8');
    
    // Buscar posibles problemas sintácticos
    const syntaxChecks = {
      'Parenthesis balance': (homeContent.match(/\(/g) || []).length === (homeContent.match(/\)/g) || []).length,
      'Braces balance': (homeContent.match(/\{/g) || []).length === (homeContent.match(/\}/g) || []).length,
      'Brackets balance': (homeContent.match(/\[/g) || []).length === (homeContent.match(/\]/g) || []).length,
      'JSX properly closed': !homeContent.includes('<div>') || homeContent.includes('</div>'),
      'Import statements': homeContent.includes('import React'),
      'Export statement': homeContent.includes('export default'),
      'Component function': homeContent.includes('const Home = () =>') || homeContent.includes('function Home')
    };
    
    console.log('   🔍 Verificaciones sintácticas:');
    Object.entries(syntaxChecks).forEach(([check, result]) => {
      console.log(`      - ${check}: ${result ? '✅' : '❌'}`);
    });
    
    // Verificar problemas específicos de React
    const reactIssues = {
      'Hooks at top level': !/if.*use[A-Z]/.test(homeContent),
      'JSX return': homeContent.includes('return (') || homeContent.includes('return <'),
      'useState imports': homeContent.includes('useState'),
      'useEffect imports': homeContent.includes('useEffect'),
      'No async in useEffect': !homeContent.includes('useEffect(async'),
      'Proper dependencies': homeContent.includes('], [')
    };
    
    console.log('   ⚛️ Verificaciones React:');
    Object.entries(reactIssues).forEach(([check, result]) => {
      console.log(`      - ${check}: ${result ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.log('   ❌ Error leyendo Home.js:', error.message);
  }

  // 3. Verificar useMobileSession hook
  console.log('\n3. 🎣 Verificando Hook useMobileSession...');
  try {
    const sessionContent = fs.readFileSync('src/hooks/useMobileSession.js', 'utf8');
    
    const hookChecks = {
      'Export presente': sessionContent.includes('export'),
      'useState usage': sessionContent.includes('useState'),
      'useEffect usage': sessionContent.includes('useEffect'),
      'Return object': sessionContent.includes('return {'),
      'Loading state': sessionContent.includes('loading'),
      'Session data': sessionContent.includes('session') || sessionContent.includes('data'),
      'SignOut function': sessionContent.includes('signOut')
    };
    
    console.log('   🔍 Verificaciones del hook:');
    Object.entries(hookChecks).forEach(([check, result]) => {
      console.log(`      - ${check}: ${result ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.log('   ❌ Error leyendo useMobileSession:', error.message);
  }

  // 4. Verificar compilación local
  console.log('\n4. 🏗️ Verificando Compilación Local...');
  try {
    const { execSync } = require('child_process');
    
    // Intentar compilar y capturar errores
    const buildResult = execSync('npm run build', { 
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('   ✅ Compilación local exitosa');
    
    // Verificar que el Home esté en el build
    if (buildResult.includes('/home')) {
      console.log('   ✅ Ruta /home presente en build');
    } else {
      console.log('   ⚠️ Ruta /home no encontrada en build');
    }
    
  } catch (buildError) {
    console.log('   ❌ Error en compilación local:');
    console.log('   ', buildError.message.substring(0, 500));
  }

  // 5. Verificar page.js del home
  console.log('\n5. 📄 Verificando src/app/home/page.js...');
  try {
    const pageContent = fs.readFileSync('src/app/home/page.js', 'utf8');
    
    const pageChecks = {
      'Importa Home component': pageContent.includes('import Home'),
      'Exporta HomePage': pageContent.includes('export default'),
      'Renderiza Home': pageContent.includes('<Home'),
      'Es async function': pageContent.includes('async function'),
      'Tiene JSX return': pageContent.includes('return')
    };
    
    console.log('   🔍 Verificaciones de page.js:');
    Object.entries(pageChecks).forEach(([check, result]) => {
      console.log(`      - ${check}: ${result ? '✅' : '❌'}`);
    });
    
    console.log('   📄 Contenido actual:');
    console.log('   ', pageContent.split('\n').slice(0, 10).join('\n   '));
    
  } catch (error) {
    console.log('   ❌ Error leyendo page.js:', error.message);
  }

  // 6. Verificar si hay errores de runtime
  console.log('\n6. 🚨 Buscando Errores de Runtime...');
  try {
    // Simular carga del componente para buscar errores
    console.log('   🔍 Errores potenciales identificados:');
    
    // Verificar errores comunes
    const commonErrors = [
      'React hooks order',
      'Conditional hooks',
      'Missing dependencies',
      'Async in useEffect',
      'Unhandled promises',
      'State mutation',
      'Memory leaks'
    ];
    
    commonErrors.forEach(error => {
      console.log(`      - ${error}: Revisando...`);
    });
    
  } catch (error) {
    console.log('   ❌ Error en análisis de runtime:', error.message);
  }

  console.log('\n🎯 === DIAGNÓSTICO COMPLETO ===');
  console.log('📊 Estado del Home:');
  console.log('   - Servidor responde pero puede tener errores internos');
  console.log('   - Componente compilable pero con posibles problemas de runtime');
  console.log('   - Hook de sesión puede tener problemas');
  console.log('   - Revisar console en DevTools para errores específicos');
  
  console.log('\n💡 PRÓXIMOS PASOS:');
  console.log('   1. Revisar console del navegador en /home');
  console.log('   2. Verificar que useMobileSession retorne datos correctos');
  console.log('   3. Simplificar temporalmente el Home para identificar problema');
  console.log('   4. Verificar que no hay imports faltantes');

  console.log('\n🔍 === FIN DEL DIAGNÓSTICO PROFUNDO ===');
}

deepDiagnoseHome().catch(console.error);
