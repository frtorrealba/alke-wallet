#  Alke Wallet - Billetera Digital

Proyecto de billetera digital desarrollado con HTML, CSS, JavaScript, Bootstrap y jQuery. Permite a los usuarios gestionar sus finanzas de manera segura y conveniente.

##  Descripción del Proyecto

Alke Wallet es una aplicación web de billetera digital que permite a los usuarios:
- Iniciar sesión de forma segura
- Visualizar su saldo disponible
- Realizar depósitos
- Enviar dinero a contactos
- Ver historial completo de transacciones
- Gestionar contactos para transferencias

##  Tecnologías Utilizadas

- **HTML5**: Estructura semántica de las páginas
- **CSS3**: Estilos personalizados y diseño responsive
- **JavaScript (ES6+)**: Lógica de la aplicación
- **Bootstrap 5.3**: Framework CSS para diseño responsive
- **jQuery 3.7**: Manipulación del DOM y efectos visuales
- **jQuery UI**: Autocompletado de contactos
- **Bootstrap Icons**: Iconografía

##  Estructura del Proyecto

```
alke-wallet/
│
├── index.html              # Página principal de bienvenida
│
├── pages/                  # Páginas de la aplicación
│   ├── login.html         # Inicio de sesión
│   ├── register.html      # Registro de nuevos usuarios
│   ├── menu.html          # Menú principal/Dashboard
│   ├── deposit.html       # Depósitos
│   ├── sendmoney.html     # Enviar dinero
│   └── transactions.html  # Historial de transacciones
│
├── css/                    # Estilos
│   └── styles.css         # Estilos personalizados
│
├── js/                     # Scripts JavaScript
│   ├── login.js           # Lógica de autenticación
│   ├── register.js        # Lógica de registro
│   ├── menu.js            # Lógica del dashboard
│   ├── deposit.js         # Lógica de depósitos
│   ├── sendmoney.js       # Lógica de transferencias
│   └── transactions.js    # Lógica de historial
│
└── README.md              # Este archivo
```

## 🔧 Instalación y Uso

### Requisitos Previos
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexión a internet (para cargar Bootstrap, jQuery y otros CDN)

### Pasos de Instalación

1. **Clonar o descargar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/alke-wallet.git
   cd alke-wallet
   ```

2. **Crear la estructura de carpetas:**
   ```bash
   mkdir -p pages css js
   ```

3. **Colocar los archivos en sus respectivas carpetas:**
   - Archivos HTML de páginas → carpeta `pages/`
   - Archivo CSS → carpeta `css/`
   - Archivos JavaScript → carpeta `js/`

4. **Abrir el proyecto:**
   - Abre `index.html` en tu navegador
   - O usa un servidor local como Live Server de VS Code

### Credenciales de Prueba

**Usuario 1:**
- Usuario: `admin`
- Contraseña: `1234`

**Usuario 2:**
- Usuario: `usuario`
- Contraseña: `pass123`

**Usuario 3:**
- Usuario: `test`
- Contraseña: `test`

## 📱 Funcionalidades Principales

### 1. Autenticación y Registro
- Sistema de registro de nuevos usuarios
- Validación de formularios en tiempo real
- Indicador de fortaleza de contraseña
- Verificación de usuarios duplicados
- Sistema de login con validación
- Almacenamiento de sesión
- Opción "Recordar sesión"
- Logout seguro

### 2. Dashboard
- Visualización de saldo actual
- Últimas transacciones
- Accesos rápidos a todas las funcionalidades
- Animaciones fluidas

### 3. Depósitos
- Formulario de depósito con validación
- Botones de montos rápidos
- Selección de método de pago
- Actualización automática del saldo

### 4. Envío de Dinero
- Búsqueda de contactos con autocompletado (jQuery UI)
- Agregar nuevos contactos
- Validación de saldo suficiente
- Confirmación de transferencia

### 5. Historial de Transacciones
- Vista completa de todas las transacciones
- Filtros por tipo y fecha
- Paginación
- Vista responsive (tabla en desktop, tarjetas en móvil)
- Modal con detalles de transacción

##  Almacenamiento de Datos

El proyecto utiliza **localStorage** para persistir información:

- `registeredUsers`: Array de todos los usuarios registrados
- `currentUser`: Datos del usuario autenticado
- `rememberMe`: Flag para recordar sesión
- `userBalance`: Saldo actual del usuario
- `transactions`: Array de todas las transacciones
- `contacts`: Array de contactos guardados

## Características de Diseño

- **Diseño Responsive**: Se adapta a móviles, tablets y escritorio
- **Animaciones suaves**: Transiciones con jQuery y CSS
- **Paleta de colores profesional**: Esquema de colores para fintech
- **Iconografía moderna**: Bootstrap Icons
- **UX intuitiva**: Navegación clara y accesible

## Buenas Prácticas Implementadas

### JavaScript
-  Código comentado y documentado
-  Funciones con nombres descriptivos
-  Validación de datos en tiempo real
-  Manejo de errores
-  Código modular y reutilizable
-  Use strict implícito
-  Convenciones de nombres consistentes

### HTML
-  Estructura semántica
-  Atributos ARIA para accesibilidad
-  Validación de formularios
-  Meta tags correctos

### CSS
-  Variables CSS para colores
-  Nombres de clases descriptivos
-  Organización por secciones
-  Media queries para responsive
-  Animaciones suaves







##  Licencia

Este proyecto es de uso educativo para el bootcamp de JavaScript de Talento digital

##  Autor

Desarrollado como proyecto del Módulo 2: Fundamentos del desarrollo Front-end por Francisco Torrealba Otero

---

**¡Gracias por revisar Alke Wallet! **

Si tienes preguntas o sugerencias, no dudes en contactarme.