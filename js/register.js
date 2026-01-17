/**
 * ALKE WALLET - REGISTER.JS
 * Maneja el registro de nuevos usuarios
 */

$(document).ready(function() {
    
    // ====================================
    // TOGGLE PASSWORD VISIBILITY
    // ====================================
    $('#togglePassword').on('click', function() {
        const passwordField = $('#registerPassword');
        const icon = $(this).find('i');
        
        if (passwordField.attr('type') === 'password') {
            passwordField.attr('type', 'text');
            icon.removeClass('bi-eye').addClass('bi-eye-slash');
        } else {
            passwordField.attr('type', 'password');
            icon.removeClass('bi-eye-slash').addClass('bi-eye');
        }
    });

    // ====================================
    // PASSWORD STRENGTH INDICATOR
    // ====================================
    $('#registerPassword').on('input', function() {
        const password = $(this).val();
        const strength = calculatePasswordStrength(password);
        
        updatePasswordStrengthUI(strength);
    });

    // ====================================
    // VALIDACIÓN EN TIEMPO REAL
    // ====================================
    
    // Validar nombre completo
    $('#fullName').on('input', function() {
        const name = $(this).val().trim();
        if (name.length >= 3) {
            $(this).removeClass('is-invalid').addClass('is-valid');
        } else {
            $(this).removeClass('is-valid');
        }
    });

    // Validar email
    $('#registerEmail').on('input', function() {
        const email = $(this).val();
        if (isValidEmail(email)) {
            $(this).removeClass('is-invalid').addClass('is-valid');
        } else {
            $(this).removeClass('is-valid');
        }
    });

    // Validar username
    $('#registerUsername').on('input', function() {
        const username = $(this).val();
        const pattern = /^[a-zA-Z0-9_]+$/;
        
        if (username.length >= 4 && pattern.test(username)) {
            // Verificar si el usuario ya existe
            if (checkUsernameExists(username)) {
                $(this).removeClass('is-valid').addClass('is-invalid');
                $(this).siblings('.invalid-feedback').text('Este nombre de usuario ya está en uso.');
            } else {
                $(this).removeClass('is-invalid').addClass('is-valid');
            }
        } else {
            $(this).removeClass('is-valid');
        }
    });

    // Validar confirmación de contraseña
    $('#confirmPassword').on('input', function() {
        const password = $('#registerPassword').val();
        const confirm = $(this).val();
        
        if (confirm === password && confirm.length >= 6) {
            $(this).removeClass('is-invalid').addClass('is-valid');
        } else if (confirm.length > 0) {
            $(this).removeClass('is-valid').addClass('is-invalid');
        } else {
            $(this).removeClass('is-valid is-invalid');
        }
    });

    // ====================================
    // MANEJO DEL FORMULARIO
    // ====================================
    $('#registerForm').on('submit', function(e) {
        e.preventDefault();
        
        // Obtener valores
        const fullName = $('#fullName').val().trim();
        const email = $('#registerEmail').val().trim();
        const username = $('#registerUsername').val().trim();
        const password = $('#registerPassword').val();
        const confirmPassword = $('#confirmPassword').val();
        const acceptTerms = $('#acceptTerms').is(':checked');
        
        // Validar formulario
        if (!validateRegistrationForm(fullName, email, username, password, confirmPassword, acceptTerms)) {
            return;
        }

        // Registrar usuario
        registerUser(fullName, email, username, password);
    });

    // ====================================
    // FUNCIONES PRINCIPALES
    // ====================================

    /**
     * Valida todo el formulario de registro
     */
    function validateRegistrationForm(fullName, email, username, password, confirmPassword, acceptTerms) {
        let isValid = true;

        // Validar nombre
        if (fullName.length < 3) {
            $('#fullName').addClass('is-invalid');
            isValid = false;
        }

        // Validar email
        if (!isValidEmail(email)) {
            $('#registerEmail').addClass('is-invalid');
            isValid = false;
        }

        // Validar username
        if (username.length < 4 || !/^[a-zA-Z0-9_]+$/.test(username)) {
            $('#registerUsername').addClass('is-invalid');
            isValid = false;
        }

        // Verificar si el usuario ya existe
        if (checkUsernameExists(username)) {
            $('#registerUsername').addClass('is-invalid');
            $('#registerUsername').siblings('.invalid-feedback').text('Este nombre de usuario ya está en uso.');
            showMessage('El nombre de usuario ya está registrado. Por favor elige otro.', 'danger');
            isValid = false;
        }

        // Verificar si el email ya existe
        if (checkEmailExists(email)) {
            $('#registerEmail').addClass('is-invalid');
            $('#registerEmail').siblings('.invalid-feedback').text('Este email ya está registrado.');
            showMessage('El email ya está registrado. ¿Quieres <a href="login.html">iniciar sesión</a>?', 'warning');
            isValid = false;
        }

        // Validar contraseña
        if (password.length < 6) {
            $('#registerPassword').addClass('is-invalid');
            isValid = false;
        }

        // Validar confirmación
        if (password !== confirmPassword) {
            $('#confirmPassword').addClass('is-invalid');
            showMessage('Las contraseñas no coinciden.', 'danger');
            isValid = false;
        }

        // Validar términos
        if (!acceptTerms) {
            $('#acceptTerms').addClass('is-invalid');
            showMessage('Debes aceptar los términos y condiciones.', 'danger');
            isValid = false;
        }

        return isValid;
    }

    /**
     * Registra un nuevo usuario
     */
    function registerUser(fullName, email, username, password) {
        // Mostrar indicador de carga
        const submitBtn = $('#registerForm button[type="submit"]');
        const originalText = submitBtn.html();
        submitBtn.prop('disabled', true).html(
            '<span class="spinner-border spinner-border-sm me-2"></span>Creando cuenta...'
        );

        // Simular proceso de registro (en producción sería una llamada a API)
        setTimeout(() => {
            // Crear objeto de usuario
            const newUser = {
                username: username,
                password: password, // En producción, esto estaría hasheado
                name: fullName,
                email: email,
                createdAt: new Date().toISOString(),
                balance: 0 // Saldo inicial en 0
            };

            // Obtener usuarios existentes
            const users = getRegisteredUsers();
            
            // Agregar nuevo usuario
            users.push(newUser);
            
            // Guardar en localStorage
            localStorage.setItem('registeredUsers', JSON.stringify(users));

            // Mostrar mensaje de éxito
            showMessage(
                '¡Registro exitoso! Serás redirigido al inicio de sesión...',
                'success'
            );

            // Efecto visual de éxito
            $('#registerForm').addClass('animate__animated animate__fadeOut');

            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        }, 1500);
    }

    /**
     * Verifica si un username ya existe
     */
    function checkUsernameExists(username) {
        const users = getRegisteredUsers();
        return users.some(user => user.username.toLowerCase() === username.toLowerCase());
    }

    /**
     * Verifica si un email ya existe
     */
    function checkEmailExists(email) {
        const users = getRegisteredUsers();
        return users.some(user => user.email.toLowerCase() === email.toLowerCase());
    }

    /**
     * Obtiene la lista de usuarios registrados
     */
    function getRegisteredUsers() {
        const usersStr = localStorage.getItem('registeredUsers');
        
        if (usersStr) {
            return JSON.parse(usersStr);
        }
        
        // Si no existen, crear array con usuarios de prueba
        const defaultUsers = [
            { username: 'admin', password: '1234', name: 'Administrador', email: 'admin@alkewallet.com', balance: 1000 },
            { username: 'usuario', password: 'pass123', name: 'Usuario Demo', email: 'usuario@demo.com', balance: 500 },
            { username: 'test', password: 'test', name: 'Usuario Test', email: 'test@test.com', balance: 750 }
        ];
        
        localStorage.setItem('registeredUsers', JSON.stringify(defaultUsers));
        return defaultUsers;
    }

    /**
     * Calcula la fortaleza de la contraseña
     */
    function calculatePasswordStrength(password) {
        let strength = 0;
        
        if (password.length >= 6) strength += 20;
        if (password.length >= 8) strength += 20;
        if (password.length >= 12) strength += 10;
        if (/[a-z]/.test(password)) strength += 10;
        if (/[A-Z]/.test(password)) strength += 15;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
        
        return Math.min(strength, 100);
    }

    /**
     * Actualiza el UI del indicador de fortaleza
     */
    function updatePasswordStrengthUI(strength) {
        const strengthBar = $('#passwordStrength');
        const hint = $('#passwordHint');
        
        strengthBar.css('width', strength + '%');
        
        if (strength < 40) {
            strengthBar.removeClass('bg-warning bg-success').addClass('bg-danger');
            hint.text('Contraseña débil').removeClass('text-success text-warning').addClass('text-danger');
        } else if (strength < 70) {
            strengthBar.removeClass('bg-danger bg-success').addClass('bg-warning');
            hint.text('Contraseña media').removeClass('text-danger text-success').addClass('text-warning');
        } else {
            strengthBar.removeClass('bg-danger bg-warning').addClass('bg-success');
            hint.text('Contraseña fuerte').removeClass('text-danger text-warning').addClass('text-success');
        }
    }

    /**
     * Valida formato de email
     */
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Muestra un mensaje
     */
    function showMessage(message, type) {
        const messageDiv = $('#registerMessage');
        const icons = {
            success: 'check-circle',
            danger: 'exclamation-triangle',
            warning: 'exclamation-circle'
        };
        
        messageDiv
            .removeClass('d-none alert-success alert-danger alert-warning')
            .addClass(`alert-${type}`)
            .html(`<i class="bi bi-${icons[type]}"></i> ${message}`)
            .hide()
            .slideDown(300);
    }

    // ====================================
    // ANIMACIÓN DE ENTRADA
    // ====================================
    $('.register-form-container').hide().fadeIn(800);

    // ====================================
    // INICIALIZAR USUARIOS DE PRUEBA
    // ====================================
    getRegisteredUsers(); // Esto crea los usuarios de prueba si no existen

});