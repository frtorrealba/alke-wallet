/**
 * ALKE WALLET - MENU.JS
 * Maneja la lógica del menú principal y dashboard
 */

$(document).ready(function() {
    
    // ====================================
    // VERIFICAR AUTENTICACIÓN
    // ====================================
    checkAuthentication();

    // ====================================
    // CARGAR INFORMACIÓN DEL USUARIO
    // ====================================
    loadUserInfo();

    // ====================================
    // CARGAR SALDO
    // ====================================
    loadBalance();

    // ====================================
    // CARGAR TRANSACCIONES RECIENTES
    // ====================================
    loadRecentTransactions();

    // ====================================
    // ACTUALIZAR ÚLTIMA ACTUALIZACIÓN
    // ====================================
    updateLastUpdateTime();

    // ====================================
    // MANEJO DEL LOGOUT
    // ====================================
    $('#logoutBtn').on('click', function(e) {
        e.preventDefault();
        handleLogout();
    });

    // ====================================
    // ANIMACIONES DE ENTRADA
    // ====================================
    animateCards();

    // ====================================
    // FUNCIONES PRINCIPALES
    // ====================================

    /**
     * Verifica si el usuario está autenticado
     * Redirige al login si no hay sesión activa
     */
    function checkAuthentication() {
        const currentUser = localStorage.getItem('currentUser');
        
        if (!currentUser) {
            // No hay sesión activa, redirigir al login
            window.location.href = 'login.html';
        }
    }

    /**
     * Carga y muestra la información del usuario
     */
    function loadUserInfo() {
        const userDataStr = localStorage.getItem('currentUser');
        
        if (userDataStr) {
            try {
                const userData = JSON.parse(userDataStr);
                $('#userGreeting').html(`<i class="bi bi-person-circle"></i> ${userData.name}`);
            } catch (error) {
                console.error('Error al parsear datos de usuario:', error);
                $('#userGreeting').html('<i class="bi bi-person-circle"></i> Usuario');
            }
        }
    }

    /**
     * Carga y muestra el saldo del usuario
     */
    function loadBalance() {
        const balance = parseFloat(localStorage.getItem('userBalance') || '0');
        
        // Animar el cambio de saldo
        animateBalance(balance);
    }

    /**
     * Anima el contador del saldo
     * @param {number} targetAmount - Cantidad objetivo
     */
    function animateBalance(targetAmount) {
        const balanceElement = $('#balanceDisplay');
        const startAmount = 0;
        const duration = 1500; // 1.5 segundos
        const startTime = Date.now();

        function updateBalance() {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (easeOutQuart)
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            
            const currentAmount = startAmount + (targetAmount - startAmount) * easeProgress;
            balanceElement.text(formatCurrency(currentAmount));

            if (progress < 1) {
                requestAnimationFrame(updateBalance);
            }
        }

        requestAnimationFrame(updateBalance);
    }

    /**
     * Carga las últimas 3 transacciones
     */
    function loadRecentTransactions() {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const recentContainer = $('#recentTransactions');
        
        if (transactions.length === 0) {
            recentContainer.html(`
                <div class="text-center text-muted py-3">
                    <i class="bi bi-inbox fs-3"></i>
                    <p class="mb-0 mt-2">No hay transacciones recientes</p>
                </div>
            `);
            return;
        }

        // Ordenar por fecha (más reciente primero) y tomar las últimas 3
        const recentTransactions = transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);

        // Generar HTML para las transacciones
        let html = '<div class="list-group list-group-flush">';
        
        recentTransactions.forEach(transaction => {
            const icon = transaction.type === 'deposit' 
                ? '<i class="bi bi-arrow-down-circle text-success"></i>' 
                : '<i class="bi bi-arrow-up-circle text-danger"></i>';
            
            const amountClass = transaction.type === 'deposit' ? 'text-success' : 'text-danger';
            const amountPrefix = transaction.type === 'deposit' ? '+' : '-';

            html += `
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        ${icon}
                        <div class="ms-3">
                            <h6 class="mb-0">${transaction.description || 'Sin descripción'}</h6>
                            <small class="text-muted">${formatDate(transaction.date)}</small>
                        </div>
                    </div>
                    <span class="fw-bold ${amountClass}">
                        ${amountPrefix}${formatCurrency(transaction.amount)}
                    </span>
                </div>
            `;
        });
        
        html += '</div>';
        recentContainer.html(html);
    }

    /**
     * Actualiza el tiempo de última actualización
     */
    function updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        $('#lastUpdate').text(timeString);
    }

    /**
     * Maneja el proceso de cierre de sesión
     */
    function handleLogout() {
        // Confirmar el logout
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            // Limpiar solo la sesión, mantener transacciones y saldo
            localStorage.removeItem('currentUser');
            localStorage.removeItem('rememberMe');
            
            // Redirigir al login
            window.location.href = 'login.html';
        }
    }

    /**
     * Anima la entrada de las tarjetas
     */
    function animateCards() {
        $('.action-card').each(function(index) {
            $(this).hide().delay(index * 100).fadeIn(500);
        });
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

    /**
     * Formatea una fecha de manera legible
     * @param {string} dateString - Fecha en formato ISO
     * @returns {string} - Fecha formateada
     */
    function formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Verificar si es hoy
        if (date.toDateString() === today.toDateString()) {
            return `Hoy, ${date.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })}`;
        }
        
        // Verificar si es ayer
        if (date.toDateString() === yesterday.toDateString()) {
            return `Ayer, ${date.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })}`;
        }
        
        // Fecha más antigua
        return date.toLocaleDateString('es-ES', { 
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // ====================================
    // ACTUALIZACIÓN PERIÓDICA
    // ====================================
    
    /**
     * Actualiza la información cada 30 segundos
     */
    setInterval(() => {
        loadBalance();
        loadRecentTransactions();
        updateLastUpdateTime();
    }, 30000);

    // ====================================
    // EFECTOS HOVER EN TARJETAS (jQuery)
    // ====================================
    $('.action-card').hover(
        function() {
            $(this).find('.action-icon i').addClass('animate__animated animate__pulse');
        },
        function() {
            $(this).find('.action-icon i').removeClass('animate__animated animate__pulse');
        }
    );

});