/**
 * ALKE WALLET - LOGIN.JS
 * Maneja la lógica de autenticación de usuarios
 */

// Esperar a que el DOM esté completamente cargado
$(document).ready(function() {
    
    // ====================================
    // OBTENER USUARIOS REGISTRADOS
    // ====================================
    function getRegisteredUsers() {
        const usersStr = localStorage.getItem('registeredUsers');
        
        if (usersStr) {
            return JSON.parse(usersStr);
        }
        
        // Si no existen, crear usuarios de prueba
        const defaultUsers = [
            { username: 'admin', password: '1234', name: 'Administrador', email: 'admin@alkewallet.com', balance: 1000 },
            { username: 'usuario', password: 'pass123', name: 'Usuario Demo', email: 'usuario@demo.com', balance: 500 },
            { username: 'test', password: 'test', name: 'Usuario Test', email: 'test@test.com', balance: 750 }
        ];
        
        localStorage.setItem('registeredUsers', JSON.stringify(defaultUsers));
        return defaultUsers;
    }

    // ====================================
    // MANEJO DEL FORMULARIO DE LOGIN
    // ====================================
    $('#loginForm').on('submit', function(e) {
        e.preventDefault(); // Prevenir el envío por defecto del formulario
        
        // Obtener valores del formulario
        const email = $('#email').val().trim();
        const password = $('#password').val().trim();
        const rememberMe = $('#rememberMe').is(':checked');
        
        // Validar campos vacíos
        if (!email || !password) {
            showError('Por favor completa todos los campos');
            return;
        }
        
        // Validar credenciales
        const user = authenticateUser(email, password);
        
        if (user) {
            // Login exitoso
            handleSuccessfulLogin(user, rememberMe);
        } else {
            // Login fallido
            showError('Usuario o contraseña incorrectos');
            
            // Agregar animación de error (shake)
            $('#loginForm').addClass('shake');
            setTimeout(() => {
                $('#loginForm').removeClass('shake');
            }, 500);
        }
    });

    // ====================================
    // VALIDACIÓN EN TIEMPO REAL
    // ====================================
    $('#email, #password').on('input', function() {
        // Remover clase de error cuando el usuario empiece a escribir
        $(this).removeClass('is-invalid');
        hideError();
    });

    // ====================================
    // FUNCIONES AUXILIARES
    // ====================================
    
    /**
     * Autentica al usuario comparando con la base de datos de usuarios
     * @param {string} username - Nombre de usuario o email
     * @param {string} password - Contraseña
     * @returns {object|null} - Objeto de usuario si es válido, null si no
     */
    function authenticateUser(username, password) {
        const validUsers = getRegisteredUsers();
        return validUsers.find(user => 
            (user.username === username || user.email === username) && user.password === password
        ) || null;
    }

    /**
     * Maneja el proceso después de un login exitoso
     * @param {object} user - Datos del usuario autenticado
     * @param {boolean} rememberMe - Si el usuario marcó "recordar sesión"
     */
    function handleSuccessfulLogin(user, rememberMe) {
        // Mostrar mensaje de éxito
        showSuccess('¡Bienvenido! Redirigiendo...');
        
        // Guardar información del usuario en localStorage
        const userData = {
            name: user.name,
            username: user.username,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Si marcó "recordar sesión", guardar flag adicional
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }
        
        // Inicializar saldo si no existe
        if (!localStorage.getItem('userBalance')) {
            // Usar el saldo del usuario registrado o 1000 por defecto
            const userBalance = user.balance || 1000;
            localStorage.setItem('userBalance', userBalance.toFixed(2));
        }
        
        // Redirigir al menú principal después de 1.5 segundos
        setTimeout(() => {
            window.location.href = 'menu.html';
        }, 1500);
    }

    /**
     * Muestra un mensaje de error
     * @param {string} message - Mensaje a mostrar
     */
    function showError(message) {
        const errorDiv = $('#errorMessage');
        errorDiv.text(message);
        errorDiv.removeClass('d-none');
        
        // Agregar clases de validación de Bootstrap
        $('#email, #password').addClass('is-invalid');
        
        // Ocultar el error después de 5 segundos
        setTimeout(hideError, 5000);
    }

    /**
     * Oculta el mensaje de error
     */
    function hideError() {
        $('#errorMessage').addClass('d-none');
    }

    /**
     * Muestra un mensaje de éxito
     * @param {string} message - Mensaje a mostrar
     */
    function showSuccess(message) {
        const errorDiv = $('#errorMessage');
        errorDiv.removeClass('alert-danger d-none');
        errorDiv.addClass('alert-success');
        errorDiv.html(`<i class="bi bi-check-circle"></i> ${message}`);
    }

    // ====================================
    // VERIFICAR SI YA HAY SESIÓN ACTIVA
    // ====================================
    checkExistingSession();

    /**
     * Verifica si existe una sesión activa y redirige al menú
     */
    function checkExistingSession() {
        const currentUser = localStorage.getItem('currentUser');
        const rememberMe = localStorage.getItem('rememberMe');
        
        if (currentUser && rememberMe === 'true') {
            // Si hay sesión guardada y el usuario marcó "recordar", redirigir
            window.location.href = 'menu.html';
        }
    }

    // ====================================
    // ANIMACIÓN DEL FORMULARIO
    // ====================================
    $('.login-form-container').hide().fadeIn(800);

    // ====================================
    // EASTER EGG: DOBLE CLICK EN EL LOGO
    // ====================================
    let clickCount = 0;
    $('.bi-wallet2').on('click', function() {
        clickCount++;
        if (clickCount === 5) {
            console.log('🎉 ¡Credenciales reveladas en consola!');
            console.table(getRegisteredUsers());
            clickCount = 0;
        }
    });

    // ====================================
    // INICIALIZAR USUARIOS
    // ====================================
    getRegisteredUsers(); // Esto crea los usuarios de prueba si no existen

});

// ====================================
// CSS PARA ANIMACIÓN SHAKE
// ====================================
// Se puede agregar esto al archivo CSS o inline
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    .shake {
        animation: shake 0.5s;
    }
`;
document.head.appendChild(style);