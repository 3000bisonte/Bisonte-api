// Test Home sin autenticación
const fetch = require('node-fetch');

async function testHomeSimple() {
  console.log('🧪 Testing Home simplificado...\n');
  
  try {
    const response = await fetch('http://localhost:3000/home', {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers));
    
    const html = await response.text();
    
    console.log('\n🔍 Content Analysis:');
    console.log('Content length:', html.length);
    console.log('Contains React root:', html.includes('__next') ? '✅' : '❌');
    console.log('Contains error messages:', html.includes('Error') || html.includes('404') ? '❌' : '✅');
    console.log('Contains Bisonte branding:', html.includes('Bisonte') ? '✅' : '❌');
    console.log('Server rendering:', html.includes('SSR') || html.includes('getServerSideProps') ? '✅' : '❌');
    
    // Buscar errores específicos
    if (html.includes('404')) {
      console.log('\n❌ 404 Error detected in content');
    }
    
    if (html.includes('Error:')) {
      console.log('\n❌ Error messages found');
    }
    
    if (html.includes('useEffect')) {
      console.log('\n⚠️ Client-side code detected - may need hydration');
    }
    
    // Verificar si hay contenido útil
    if (html.length > 1000 && html.includes('Bisonte')) {
      console.log('\n✅ Home seems to be working!');
    } else {
      console.log('\n❌ Home may not be working properly');
    }
    
    // Mostrar primeras líneas del contenido
    console.log('\n📄 First 500 characters:');
    console.log(html.substring(0, 500) + '...');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testHomeSimple();
