# 🔍 GUÍA DE VERIFICACIÓN - SIMULADOR WEB LOCAL

## 📱 **CHECKLIST DE VERIFICACIÓN VISUAL**

### ✅ **Página Principal (index.html)**
- [ ] **Gradiente de fondo** se ve correctamente (azul a púrpura)
- [ ] **Texto "Cargando Bisonte..."** visible en blanco
- [ ] **Fuente Inter** cargando correctamente
- [ ] **Responsive design** se adapta al tamaño de ventana

### ✅ **Navegación**
Probar navegar a:
- [ ] `/cotizador/` - Formulario de cotización
- [ ] `/home/` - Página principal de la app
- [ ] `/contacto/` - Página de contacto
- [ ] `/register/` - Registro de usuarios

### ✅ **Estilos Críticos a Verificar:**

#### 🎨 **Colores y Tema:**
- [ ] **Verde Bisonte** (#41e0b3) en botones y acentos
- [ ] **Fondo oscuro** (#18191A) en navegación
- [ ] **Gradientes** funcionando correctamente
- [ ] **Hover effects** en botones

#### 📝 **Tipografía:**
- [ ] **Fuente Inter** se ve nítida y clara
- [ ] **Tamaños de texto** responsivos (sm:text-lg, text-xl, etc.)
- [ ] **Peso de fuente** correcto (font-bold, font-semibold)

#### 📐 **Layout:**
- [ ] **Grid y Flexbox** funcionando
- [ ] **Spacing** correcto (padding, margin)
- [ ] **Border radius** en tarjetas y botones
- [ ] **Shadows** visibles en componentes

#### 🔘 **Componentes Interactivos:**
- [ ] **Botones** con estilos hover
- [ ] **Inputs** con focus states
- [ ] **Select dropdowns** estilizados
- [ ] **Radio buttons** personalizados

### ✅ **Páginas Específicas a Revisar:**

#### 📊 **Cotizador (/cotizador/)**
- [ ] **Formulario estilizado** correctamente
- [ ] **Progress bar** verde funcionando
- [ ] **Campos de entrada** con bordes y focus
- [ ] **Botones Anterior/Continuar** estilizados
- [ ] **Bottom navigation** fija y visible

#### 🏠 **Home (/home/)**
- [ ] **Dashboard** layout correcto
- [ ] **Cards** con shadows y hover
- [ ] **Iconos** visibles y bien posicionados

#### 📞 **Contacto (/contacto/)**
- [ ] **Formulario de contacto** estilizado
- [ ] **Textarea** correctamente dimensionada

### ✅ **Responsive Design:**
- [ ] **Mobile (320px-768px)** - Texto y botones apropiados
- [ ] **Tablet (768px-1024px)** - Layout adaptado  
- [ ] **Desktop (1024px+)** - Máximo aprovechamiento del espacio

### ✅ **Performance Visual:**
- [ ] **Carga rápida** de estilos
- [ ] **Sin flash** de contenido sin estilos (FOUC)
- [ ] **Animaciones suaves** (hover, transitions)
- [ ] **Imágenes** cargando correctamente

---

## 🚨 **Problemas Comunes a Buscar:**

### ❌ **Estilos NO Funcionando:**
- Texto sin formato (fuente por defecto del sistema)
- Colores planos sin gradientes
- Botones sin estilos (solo texto)
- Layout roto o texto apilado incorrectamente

### ❌ **Recursos NO Cargando:**
- Iconos rotos o faltantes
- Fuentes por defecto (Arial, Times)
- Errores 404 en consola del navegador

### ❌ **Layout Issues:**
- Elementos sobrepuestos
- Texto cortado o desbordado
- Navegación rota

---

## 🔧 **Herramientas de Debugging:**

### **Consola del Navegador (F12):**
```
Console → Buscar errores 404 o de carga
Network → Verificar que CSS y fuentes cargan
Elements → Inspeccionar estilos aplicados
```

### **URLs de Prueba:**
```
http://127.0.0.1:8080/ - Página principal
http://127.0.0.1:8080/cotizador/ - Cotizador
http://127.0.0.1:8080/home/ - Home
http://127.0.0.1:8080/contacto/ - Contacto
```

---

## ✅ **Si TODO Se Ve Bien:**
1. ✅ **Estilos Tailwind funcionando**
2. ✅ **Fuentes Inter cargando**
3. ✅ **Colores Bisonte correctos**
4. ✅ **Layout responsive**
5. ✅ **Navegación funcional**

**→ PROCEDER A GENERAR APK** 🚀

## ❌ **Si Hay Problemas:**
1. 🔧 **Reportar qué específicamente se ve mal**
2. 🔧 **Indicar en qué página/sección**
3. 🔧 **Describir el problema visual**

**→ CORREGIR ANTES DEL APK** 🛠️
