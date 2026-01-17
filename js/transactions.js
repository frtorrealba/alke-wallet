/**
 * ALKE WALLET - TRANSACTIONS.JS
 * Maneja el historial completo de transacciones con filtros y paginación
 */

$(document).ready(function() {
    
    // Variables globales
    let allTransactions = [];
    let filteredTransactions = [];
    const ITEMS_PER_PAGE = 10;
    let currentPage = 1;

    // ====================================
    // VERIFICAR AUTENTICACIÓN
    // ====================================
    checkAuthentication();

    // ====================================
    // CARGAR DATOS INICIALES
    // ====================================
    loadTransactions();
    loadSummary();

    // ====================================
    // MANEJO DE LOGOUT
    // ====================================
    $('#logoutBtn').on('click', handleLogout);

    // ====================================
    // MANEJO DE FILTROS
    // ====================================
    $('#applyFiltersBtn').on('click', function() {
        applyFilters();
    });

    // Permitir filtrar con Enter
    $('#filterType, #filterDateFrom, #filterDateTo').on('change', function() {
        applyFilters();
    });

    // ====================================
    // FUNCIONES PRINCIPALES
    // ====================================

    /**
     * Verifica autenticación
     */
    function checkAuthentication() {
        if (!localStorage.getItem('currentUser')) {
            window.location.href = 'login.html';
        }
    }

    /**
     * Carga todas las transacciones
     */
    function loadTransactions() {
        allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        
        // Si no hay transacciones, crear algunas de ejemplo
        if (allTransactions.length === 0) {
            createSampleTransactions();
            allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        }
        
        // Ordenar por fecha (más reciente primero)
        allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        filteredTransactions = [...allTransactions];
        renderTransactions();
    }

    /**
     * Crea transacciones de ejemplo
     */
    function createSampleTransactions() {
        const sampleTransactions = [
            {
                id: 'TXN001',
                type: 'deposit',
                amount: 1000.00,
                paymentMethod: 'tarjeta',
                description: 'Depósito inicial',
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'completed'
            },
            {
                id: 'TXN002',
                type: 'transfer',
                amount: 150.00,
                recipient: 'María García',
                recipientEmail: 'maria.garcia@example.com',
                description: 'Pago de servicios',
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'completed'
            },
            {
                id: 'TXN003',
                type: 'deposit',
                amount: 500.00,
                paymentMethod: 'transferencia',
                description: 'Depósito mensual',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'completed'
            }
        ];
        
        localStorage.setItem('transactions', JSON.stringify(sampleTransactions));
    }

    /**
     * Carga el resumen financiero
     */
    function loadSummary() {
        const balance = parseFloat(localStorage.getItem('userBalance') || '0');
        const transactions = allTransactions;
        
        // Calcular totales
        const totalDeposits = transactions
            .filter(t => t.type === 'deposit')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalSent = transactions
            .filter(t => t.type === 'transfer')
            .reduce((sum, t) => sum + t.amount, 0);
        
        // Actualizar UI
        $('#summaryBalance').text(formatCurrency(balance));
        $('#totalDeposits').text(formatCurrency(totalDeposits));
        $('#totalSent').text(formatCurrency(totalSent));
    }

    /**
     * Aplica filtros a las transacciones
     */
    function applyFilters() {
        const filterType = $('#filterType').val();
        const dateFrom = $('#filterDateFrom').val();
        const dateTo = $('#filterDateTo').val();
        
        // Resetear a todas las transacciones
        filteredTransactions = [...allTransactions];
        
        // Filtrar por tipo
        if (filterType !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.type === filterType);
        }
        
        // Filtrar por fecha desde
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            filteredTransactions = filteredTransactions.filter(t => 
                new Date(t.date) >= fromDate
            );
        }
        
        // Filtrar por fecha hasta
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999); // Incluir todo el día
            filteredTransactions = filteredTransactions.filter(t => 
                new Date(t.date) <= toDate
            );
        }
        
        // Resetear a página 1
        currentPage = 1;
        
        // Renderizar resultados
        renderTransactions();
        
        // Efecto visual
        $('#transactionsTableBody').fadeOut(200, function() {
            $(this).fadeIn(200);
        });
    }

    /**
     * Renderiza las transacciones en la tabla
     */
    function renderTransactions() {
        const tableBody = $('#transactionsTableBody');
        const mobileView = $('#transactionsMobileView');
        
        // Actualizar contador
        $('#transactionCount').text(`${filteredTransactions.length} transaccione${filteredTransactions.length !== 1 ? 's' : ''}`);
        
        if (filteredTransactions.length === 0) {
            const emptyMessage = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                        No se encontraron transacciones con los filtros aplicados
                    </td>
                </tr>
            `;
            tableBody.html(emptyMessage);
            mobileView.html(`
                <div class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                    <p>No se encontraron transacciones</p>
                </div>
            `);
            $('#paginationContainer').empty();
            return;
        }
        
        // Calcular paginación
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
        
        // Renderizar tabla (desktop)
        let tableHtml = '';
        paginatedTransactions.forEach(transaction => {
            const typeIcon = transaction.type === 'deposit' 
                ? '<i class="bi bi-arrow-down-circle text-success"></i>' 
                : '<i class="bi bi-send text-primary"></i>';
            
            const typeText = transaction.type === 'deposit' ? 'Depósito' : 'Transferencia';
            const amountClass = transaction.type === 'deposit' ? 'text-success' : 'text-danger';
            const amountPrefix = transaction.type === 'deposit' ? '+' : '-';
            
            const recipient = transaction.recipient || '-';
            
            tableHtml += `
                <tr class="transaction-row" data-transaction='${JSON.stringify(transaction)}' style="cursor: pointer;">
                    <td>${formatDate(transaction.date)}</td>
                    <td>${typeIcon} ${typeText}</td>
                    <td>${transaction.description}</td>
                    <td>${recipient}</td>
                    <td class="text-end fw-bold ${amountClass}">
                        ${amountPrefix}${formatCurrency(transaction.amount)}
                    </td>
                    <td class="text-center">
                        <span class="badge bg-success">Completado</span>
                    </td>
                </tr>
            `;
        });
        
        tableBody.html(tableHtml);
        
        // Renderizar vista móvil
        let mobileHtml = '';
        paginatedTransactions.forEach(transaction => {
            const typeIcon = transaction.type === 'deposit' 
                ? 'arrow-down-circle text-success' 
                : 'send text-primary';
            
            const amountClass = transaction.type === 'deposit' ? 'text-success' : 'text-danger';
            const amountPrefix = transaction.type === 'deposit' ? '+' : '-';
            
            mobileHtml += `
                <div class="card mb-2 transaction-card" data-transaction='${JSON.stringify(transaction)}'>
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-${typeIcon} fs-4 me-2"></i>
                                <div>
                                    <h6 class="mb-0">${transaction.description}</h6>
                                    <small class="text-muted">${formatDate(transaction.date)}</small>
                                </div>
                            </div>
                            <span class="fw-bold ${amountClass}">
                                ${amountPrefix}${formatCurrency(transaction.amount)}
                            </span>
                        </div>
                        ${transaction.recipient ? `<small class="text-muted">A: ${transaction.recipient}</small>` : ''}
                    </div>
                </div>
            `;
        });
        
        mobileView.html(mobileHtml);
        
        // Agregar evento click
        $('.transaction-row, .transaction-card').on('click', function() {
            const transaction = JSON.parse($(this).attr('data-transaction'));
            showTransactionDetail(transaction);
        });
        
        // Renderizar paginación
        renderPagination();
    }

    /**
     * Renderiza los controles de paginación
     */
    function renderPagination() {
        const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
        const paginationContainer = $('#paginationContainer');
        
        if (totalPages <= 1) {
            paginationContainer.empty();
            return;
        }
        
        let html = '';
        
        // Botón anterior
        html += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">Anterior</a>
            </li>
        `;
        
        // Números de página
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                html += `
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }
        
        // Botón siguiente
        html += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">Siguiente</a>
            </li>
        `;
        
        paginationContainer.html(html);
        
        // Eventos de paginación
        $('.page-link').on('click', function(e) {
            e.preventDefault();
            const page = parseInt($(this).attr('data-page'));
            if (page > 0 && page <= totalPages) {
                currentPage = page;
                renderTransactions();
                $('html, body').animate({ scrollTop: 0 }, 300);
            }
        });
    }

    /**
     * Muestra el detalle de una transacción en un modal
     * @param {object} transaction - Transacción a mostrar
     */
    function showTransactionDetail(transaction) {
        const typeText = transaction.type === 'deposit' ? 'Depósito' : 'Transferencia';
        const typeIcon = transaction.type === 'deposit' ? 'arrow-down-circle' : 'send';
        const typeClass = transaction.type === 'deposit' ? 'success' : 'primary';
        
        let detailHtml = `
            <div class="text-center mb-3">
                <i class="bi bi-${typeIcon} text-${typeClass}" style="font-size: 3rem;"></i>
            </div>
            <table class="table">
                <tbody>
                    <tr>
                        <th>ID de Transacción:</th>
                        <td>${transaction.id}</td>
                    </tr>
                    <tr>
                        <th>Tipo:</th>
                        <td>${typeText}</td>
                    </tr>
                    <tr>
                        <th>Monto:</th>
                        <td class="fw-bold">${formatCurrency(transaction.amount)}</td>
                    </tr>
                    <tr>
                        <th>Fecha:</th>
                        <td>${formatDate(transaction.date, true)}</td>
                    </tr>
                    <tr>
                        <th>Descripción:</th>
                        <td>${transaction.description}</td>
                    </tr>
        `;
        
        if (transaction.recipient) {
            detailHtml += `
                    <tr>
                        <th>Destinatario:</th>
                        <td>${transaction.recipient}</td>
                    </tr>
                    <tr>
                        <th>Email:</th>
                        <td>${transaction.recipientEmail || '-'}</td>
                    </tr>
            `;
        }
        
        if (transaction.paymentMethod) {
            const methodNames = {
                'tarjeta': 'Tarjeta de Crédito/Débito',
                'transferencia': 'Transferencia Bancaria',
                'efectivo': 'Efectivo'
            };
            detailHtml += `
                    <tr>
                        <th>Método de Pago:</th>
                        <td>${methodNames[transaction.paymentMethod] || transaction.paymentMethod}</td>
                    </tr>
            `;
        }
        
        detailHtml += `
                    <tr>
                        <th>Estado:</th>
                        <td><span class="badge bg-success">Completado</span></td>
                    </tr>
                </tbody>
            </table>
        `;
        
        $('#transactionDetailContent').html(detailHtml);
        
        const modal = new bootstrap.Modal($('#transactionDetailModal')[0]);
        modal.show();
    }

    /**
     * Maneja el logout
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

    /**
     * Formatea una fecha
     * @param {string} dateString - Fecha en formato ISO
     * @param {boolean} detailed - Si debe mostrar formato detallado
     * @returns {string} - Fecha formateada
     */
    function formatDate(dateString, detailed = false) {
        const date = new Date(dateString);
        
        if (detailed) {
            return date.toLocaleString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
        
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // ====================================
    // ANIMACIONES
    // ====================================
    $('.card').hide().fadeIn(600);

});