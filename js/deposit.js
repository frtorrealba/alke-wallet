/**
 * ALKE WALLET - DEPOSIT.JS
 * Maneja la lógica de depósitos y actualización del saldo
 */

$(document).ready(function() {
    
    // ====================================
    // VERIFICAR AUTENTICACIÓN
    // ====================================
    checkAuthentication();

    // ====================================
    // CARGAR SALDO ACTUAL
    // ====================================
    loadCurrentBalance();

    // ====================================
    // MANEJO DE LOGOUT
    // ====================================
    $('#logoutBtn').on('click', handleLogout);

    // ====================================
    // BOTONES DE MONTOS RÁPIDOS
    // ====================================
    $('.quick-amount').on('click', function() {
        const amount = $(this).data('amount');
        $('#depositAmount').val(amount);
        
        // Agregar efecto visual
        $(this).addClass('btn-primary').removeClass('btn-outline-primary');
        $('.quick-amount').not(this).removeClass('btn-primary').addClass('btn-outline-primary');
        
        // Remover clase de error si existe
        $('#depositAmount').removeClass('is-invalid');
    });

    // ====================================
    // MANEJO DEL FORMULARIO DE DEPÓSITO
    // ====================================
    $('#depositForm').on('submit', function(e) {
        e.preventDefault();
        
        // Obtener valores del formulario
        const amount = parseFloat($('#depositAmount').val());
        const paymentMethod = $('#paymentMethod').val();
        const description = $('#depositDescription').val().trim() || 'Depósito';
        
        // Validar formulario
        if (!validateDepositForm(amount, paymentMethod)) {
            return;
        }

        // Realizar el depósito
        processDeposit(amount, paymentMethod, description);
    });

    // ====================================
    // VALIDACIÓN EN TIEMPO REAL
    // ====================================
    $('#depositAmount').on('input', function() {
        const amount = parseFloat($(this).val());
        
        if (amount > 0) {
            $(this).removeClass('is-invalid').addClass('is-valid');
        } else {
            $(this).removeClass('is-valid');
        }
    });

    $('#paymentMethod').on('change', function() {
        if ($(this).val()) {
            $(this).removeClass('is-invalid').addClass('is-valid');
        }
    });

    // ====================================
    // FUNCIONES PRINCIPALES
    // ====================================

    /**
     * Verifica que el usuario esté autenticado
     */
    function checkAuthentication() {
        const currentUser = localStorage.getItem('currentUser');
        
        if (!currentUser) {
            window.location.href = 'login.html';
        }
    }

    /**
     * Carga el saldo actual del usuario
     */
    function loadCurrentBalance() {
        const balance = parseFloat(localStorage.getItem('userBalance') || '0');
        $('#currentBalance').text(formatCurrency(balance));
    }

    /**
     * Valida el formulario de depósito
     * @param {number} amount - Monto a depositar
     * @param {string} paymentMethod - Método de pago seleccionado
     * @returns {boolean} - true si es válido, false si no
     */
    function validateDepositForm(amount, paymentMethod) {
        let isValid = true;

        // Validar monto
        if (!amount || amount <= 0 || isNaN(amount)) {
            $('#depositAmount').addClass('is-invalid');
            showMessage('Por favor ingresa un monto válido mayor a $0', 'danger');
            isValid = false;
        } else {
            $('#depositAmount').removeClass('is-invalid').addClass('is-valid');
        }

        // Validar método de pago
        if (!paymentMethod) {
            $('#paymentMethod').addClass('is-invalid');
            showMessage('Por favor selecciona un método de pago', 'danger');
            isValid = false;
        } else {
            $('#paymentMethod').removeClass('is-invalid').addClass('is-valid');
        }

        // Validar límite máximo (ejemplo: $100,000)
        if (amount > 100000) {
            $('#depositAmount').addClass('is-invalid');
            showMessage('El monto máximo por depósito es de $100,000', 'danger');
            isValid = false;
        }

        return isValid;
    }

    /**
     * Procesa el depósito y actualiza el saldo
     * @param {number} amount - Monto a depositar
     * @param {string} paymentMethod - Método de pago
     * @param {string} description - Descripción del depósito
     */
    function processDeposit(amount, paymentMethod, description) {
        // Mostrar indicador de carga
        const submitBtn = $('#depositForm button[type="submit"]');
        const originalText = submitBtn.html();
        submitBtn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span>Procesando...');

        // Simular procesamiento (en producción, esto sería una llamada a API)
        setTimeout(() => {
            // Obtener saldo actual
            const currentBalance = parseFloat(localStorage.getItem('userBalance') || '0');
            
            // Calcular nuevo saldo
            const newBalance = currentBalance + amount;
            
            // Actualizar saldo en localStorage
            localStorage.setItem('userBalance', newBalance.toFixed(2));

            // Crear objeto de transacción
            const transaction = {
                id: generateTransactionId(),
                type: 'deposit',
                amount: amount,
                paymentMethod: paymentMethod,
                description: description,
                date: new Date().toISOString(),
                status: 'completed'
            };

            // Guardar transacción
            saveTransaction(transaction);

            // Actualizar UI
            loadCurrentBalance();
            
            // Mostrar mensaje de éxito
            showMessage(
                `¡Depósito exitoso! Se han agregado ${formatCurrency(amount)} a tu cuenta.`,
                'success'
            );

            // Resetear formulario
            $('#depositForm')[0].reset();
            $('#depositAmount, #paymentMethod').removeClass('is-valid is-invalid');
            $('.quick-amount').removeClass('btn-primary').addClass('btn-outline-primary');

            // Restaurar botón
            submitBtn.prop('disabled', false).html(originalText);

            // Animar el saldo actualizado
            animateBalanceUpdate();

            // Opcional: Redirigir al menú después de 3 segundos
            setTimeout(() => {
                if (confirm('¿Deseas volver al menú principal?')) {
                    window.location.href = 'menu.html';
                }
            }, 3000);

        }, 1500); // Simular delay de red
    }

    /**
     * Guarda una transacción en el historial
     * @param {object} transaction - Objeto de transacción
     */
    function saveTransaction(transaction) {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    /**
     * Genera un ID único para la transacción
     * @returns {string} - ID de transacción
     */
    function generateTransactionId() {
        return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    /**
     * Muestra un mensaje al usuario
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de alerta (success, danger, warning, info)
     */
    function showMessage(message, type) {
        const messageDiv = $('#depositMessage');
        const icon = type === 'success' ? 'check-circle' : 'exclamation-triangle';
        
        messageDiv
            .removeClass('d-none alert-success alert-danger alert-warning alert-info')
            .addClass(`alert-${type}`)
            .html(`<i class="bi bi-${icon}"></i> ${message}`)
            .hide()
            .slideDown(300);

        // Auto-ocultar después de 5 segundos si es mensaje de error
        if (type === 'danger' || type === 'warning') {
            setTimeout(() => {
                messageDiv.slideUp(300);
            }, 5000);
        }
    }

    /**
     * Anima la actualización del saldo
     */
    function animateBalanceUpdate() {
        $('#currentBalance')
            .addClass('animate__animated animate__heartBeat')
            .on('animationend', function() {
                $(this).removeClass('animate__animated animate__heartBeat');
            });
    }

    /**
     * Maneja el cierre de sesión
     */
    function handleLogout(e) {
        e.preventDefault();
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('rememberMe');
            window.location.href = 'login.html';
        }
    }

    // ====================================
    // FUNCIONES UTILITARIAS
    // ====================================

    /**
     * Formatea un número como moneda
     * @param {number} amount - Cantidad a formatear
     * @returns {string} - Cantidad formateada
     */
    function formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    }

    // ====================================
    // EFECTOS VISUALES CON JQUERY
    // ====================================
    
    // Efecto de focus en inputs
    $('.form-control, .form-select').on('focus', function() {
        $(this).parent().addClass('shadow-sm');
    }).on('blur', function() {
        $(this).parent().removeClass('shadow-sm');
    });

    // Efecto hover en botones de montos rápidos
    $('.quick-amount').hover(
        function() {
            $(this).css('transform', 'scale(1.05)');
        },
        function() {
            $(this).css('transform', 'scale(1)');
        }
    );

    // ====================================
    // ANIMACIÓN DE ENTRADA
    // ====================================
    $('.card').hide().fadeIn(600);

});

// ====================================
// ESTILOS ADICIONALES PARA ANIMACIONES
// ====================================
const style = document.createElement('style');
style.textContent = `
    @keyframes heartBeat {
        0%, 100% { transform: scale(1); }
        25% { transform: scale(1.1); }
        50% { transform: scale(1); }
        75% { transform: scale(1.05); }
    }
    .animate__heartBeat {
        animation: heartBeat 0.8s;
    }
`;
document.head.appendChild(style);