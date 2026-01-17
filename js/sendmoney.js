/**
 * ALKE WALLET - SENDMONEY.JS
 * Maneja la lógica de envío de dinero y gestión de contactos
 */

$(document).ready(function() {
    
    // Variable global para el contacto seleccionado
    let selectedContact = null;

    // ====================================
    // VERIFICAR AUTENTICACIÓN
    // ====================================
    checkAuthentication();

    // ====================================
    // CARGAR SALDO DISPONIBLE
    // ====================================
    loadAvailableBalance();

    // ====================================
    // CARGAR LISTA DE CONTACTOS
    // ====================================
    loadContactsList();

    // ====================================
    // INICIALIZAR AUTOCOMPLETADO
    // ====================================
    initializeAutocomplete();

    // ====================================
    // MANEJO DE LOGOUT
    // ====================================
    $('#logoutBtn').on('click', handleLogout);

    // ====================================
    // MANEJO DEL FORMULARIO DE ENVÍO
    // ====================================
    $('#sendMoneyForm').on('submit', function(e) {
        e.preventDefault();
        processSendMoney();
    });

    // ====================================
    // MANEJO DEL MODAL DE AGREGAR CONTACTO
    // ====================================
    $('#saveContactBtn').on('click', function() {
        saveNewContact();
    });

    // ====================================
    // VALIDACIÓN EN TIEMPO REAL
    // ====================================
    $('#sendAmount').on('input', function() {
        validateAmount();
    });

    $('#transferConcept').on('input', function() {
        if ($(this).val().trim()) {
            $(this).removeClass('is-invalid').addClass('is-valid');
        }
    });

    // ====================================
    // FUNCIONES PRINCIPALES
    // ====================================

    /**
     * Verifica autenticación del usuario
     */
    function checkAuthentication() {
        if (!localStorage.getItem('currentUser')) {
            window.location.href = 'login.html';
        }
    }

    /**
     * Carga el saldo disponible
     */
    function loadAvailableBalance() {
        const balance = parseFloat(localStorage.getItem('userBalance') || '0');
        $('#availableBalance').text(formatCurrency(balance));
    }

    /**
     * Carga la lista de contactos guardados
     */
    function loadContactsList() {
        const contacts = getContacts();
        const contactsList = $('#contactsList');
        
        if (contacts.length === 0) {
            contactsList.html(`
                <div class="list-group-item text-center text-muted">
                    <i class="bi bi-person-plus fs-3"></i>
                    <p class="mb-0 mt-2 small">No hay contactos guardados</p>
                </div>
            `);
            return;
        }

        let html = '';
        contacts.forEach(contact => {
            html += `
                <a href="#" class="list-group-item list-group-item-action contact-item" 
                   data-contact='${JSON.stringify(contact)}'>
                    <div class="d-flex align-items-center">
                        <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                             style="width: 40px; height: 40px; font-weight: bold;">
                            ${contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div class="ms-3 flex-grow-1">
                            <h6 class="mb-0">${contact.name}</h6>
                            <small class="text-muted">${contact.email}</small>
                        </div>
                        <i class="bi bi-chevron-right text-muted"></i>
                    </div>
                </a>
            `;
        });
        
        contactsList.html(html);

        // Evento click en contactos
        $('.contact-item').on('click', function(e) {
            e.preventDefault();
            const contact = JSON.parse($(this).attr('data-contact'));
            selectContact(contact);
        });
    }

    /**
     * Inicializa el autocompletado de jQuery UI
     */
    function initializeAutocomplete() {
        const contacts = getContacts();
        
        // Preparar datos para autocomplete
        const contactNames = contacts.map(c => ({
            label: `${c.name} (${c.email})`,
            value: c.name,
            contact: c
        }));

        // Configurar autocomplete
        $('#contactSearch').autocomplete({
            source: contactNames,
            minLength: 1,
            select: function(event, ui) {
                event.preventDefault();
                selectContact(ui.item.contact);
                $(this).val(ui.item.value);
            }
        });
    }

    /**
     * Selecciona un contacto para la transferencia
     * @param {object} contact - Objeto de contacto
     */
    function selectContact(contact) {
        selectedContact = contact;
        
        // Mostrar información del contacto
        $('#selectedContactInfo').removeClass('d-none').html(`
            <strong>Contacto seleccionado:</strong>
            <p class="mb-0" id="contactDetails">
                ${contact.name} - ${contact.email}
            </p>
        `);
        
        // Efecto visual en la lista de contactos
        $('.contact-item').removeClass('active');
        $(`.contact-item[data-contact*='"email":"${contact.email}"']`).addClass('active');
        
        // Focus en el campo de monto
        $('#sendAmount').focus();
    }

    /**
     * Valida el monto a enviar
     */
    function validateAmount() {
        const amount = parseFloat($('#sendAmount').val());
        const balance = parseFloat(localStorage.getItem('userBalance') || '0');
        
        if (!amount || amount <= 0) {
            $('#sendAmount').removeClass('is-valid').addClass('is-invalid');
            return false;
        }
        
        if (amount > balance) {
            $('#sendAmount').addClass('is-invalid');
            showMessage('Saldo insuficiente para realizar esta transferencia', 'danger');
            return false;
        }
        
        $('#sendAmount').removeClass('is-invalid').addClass('is-valid');
        return true;
    }

    /**
     * Procesa el envío de dinero
     */
    function processSendMoney() {
        const amount = parseFloat($('#sendAmount').val());
        const concept = $('#transferConcept').val().trim();
        
        // Validaciones
        if (!selectedContact) {
            showMessage('Por favor selecciona un contacto', 'danger');
            $('#contactSearch').focus();
            return;
        }
        
        if (!validateAmount()) {
            return;
        }
        
        if (!concept) {
            $('#transferConcept').addClass('is-invalid');
            showMessage('Por favor ingresa un concepto para la transferencia', 'danger');
            return;
        }

        // Confirmar transferencia
        if (!confirm(`¿Confirmas el envío de ${formatCurrency(amount)} a ${selectedContact.name}?`)) {
            return;
        }

        // Deshabilitar botón de envío
        const submitBtn = $('#sendMoneyForm button[type="submit"]');
        const originalText = submitBtn.html();
        submitBtn.prop('disabled', true).html(
            '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...'
        );

        // Simular procesamiento
        setTimeout(() => {
            // Actualizar saldo
            const currentBalance = parseFloat(localStorage.getItem('userBalance') || '0');
            const newBalance = currentBalance - amount;
            localStorage.setItem('userBalance', newBalance.toFixed(2));

            // Crear transacción
            const transaction = {
                id: generateTransactionId(),
                type: 'transfer',
                amount: amount,
                recipient: selectedContact.name,
                recipientEmail: selectedContact.email,
                description: concept,
                date: new Date().toISOString(),
                status: 'completed'
            };

            // Guardar transacción
            saveTransaction(transaction);

            // Actualizar UI
            loadAvailableBalance();
            showMessage(
                `¡Transferencia exitosa! Has enviado ${formatCurrency(amount)} a ${selectedContact.name}`,
                'success'
            );

            // Resetear formulario
            resetForm();
            submitBtn.prop('disabled', false).html(originalText);

            // Redirigir después de 3 segundos
            setTimeout(() => {
                if (confirm('¿Deseas ver el historial de transacciones?')) {
                    window.location.href = 'transactions.html';
                } else {
                    window.location.href = 'menu.html';
                }
            }, 3000);

        }, 1500);
    }

    /**
     * Guarda un nuevo contacto
     */
    function saveNewContact() {
        const name = $('#contactName').val().trim();
        const email = $('#contactEmail').val().trim();
        const phone = $('#contactPhone').val().trim();

        // Validar campos
        if (!name || !email) {
            alert('Por favor completa los campos requeridos');
            return;
        }

        // Validar email
        if (!isValidEmail(email)) {
            $('#contactEmail').addClass('is-invalid');
            alert('Por favor ingresa un email válido');
            return;
        }

        // Crear objeto de contacto
        const newContact = {
            id: generateContactId(),
            name: name,
            email: email,
            phone: phone || '',
            dateAdded: new Date().toISOString()
        };

        // Guardar contacto
        const contacts = getContacts();
        
        // Verificar si el email ya existe
        if (contacts.some(c => c.email === email)) {
            alert('Este contacto ya existe');
            return;
        }

        contacts.push(newContact);
        localStorage.setItem('contacts', JSON.stringify(contacts));

        // Actualizar UI
        loadContactsList();
        initializeAutocomplete();

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance($('#addContactModal')[0]);
        modal.hide();

        // Resetear formulario del modal
        $('#addContactForm')[0].reset();

        // Mostrar mensaje
        showMessage(`Contacto "${name}" agregado exitosamente`, 'success');
    }

    /**
     * Resetea el formulario de envío
     */
    function resetForm() {
        $('#sendMoneyForm')[0].reset();
        $('#sendAmount, #transferConcept').removeClass('is-valid is-invalid');
        $('#selectedContactInfo').addClass('d-none');
        $('.contact-item').removeClass('active');
        selectedContact = null;
    }

    // ====================================
    // FUNCIONES AUXILIARES
    // ====================================

    /**
     * Obtiene la lista de contactos
     * @returns {array} - Array de contactos
     */
    function getContacts() {
        const contacts = localStorage.getItem('contacts');
        if (contacts) {
            return JSON.parse(contacts);
        }
        
        // Contactos de ejemplo si no hay ninguno
        const defaultContacts = [
            {
                id: 'CONT001',
                name: 'María García',
                email: 'maria.garcia@example.com',
                phone: '555-0101',
                dateAdded: new Date().toISOString()
            },
            {
                id: 'CONT002',
                name: 'Juan Pérez',
                email: 'juan.perez@example.com',
                phone: '555-0102',
                dateAdded: new Date().toISOString()
            },
            {
                id: 'CONT003',
                name: 'Ana Martínez',
                email: 'ana.martinez@example.com',
                phone: '555-0103',
                dateAdded: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('contacts', JSON.stringify(defaultContacts));
        return defaultContacts;
    }

    /**
     * Guarda una transacción
     * @param {object} transaction - Objeto de transacción
     */
    function saveTransaction(transaction) {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    /**
     * Genera un ID único para transacción
     * @returns {string} - ID de transacción
     */
    function generateTransactionId() {
        return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    /**
     * Genera un ID único para contacto
     * @returns {string} - ID de contacto
     */
    function generateContactId() {
        return 'CONT' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    /**
     * Valida un email
     * @param {string} email - Email a validar
     * @returns {boolean} - true si es válido
     */
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Muestra un mensaje
     * @param {string} message - Mensaje
     * @param {string} type - Tipo de alerta
     */
    function showMessage(message, type) {
        const messageDiv = $('#transferMessage');
        const icon = type === 'success' ? 'check-circle' : 'exclamation-triangle';
        
        messageDiv
            .removeClass('d-none alert-success alert-danger alert-warning alert-info')
            .addClass(`alert-${type}`)
            .html(`<i class="bi bi-${icon}"></i> ${message}`)
            .hide()
            .slideDown(300);
    }

    /**
     * Formatea moneda
     * @param {number} amount - Cantidad
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
    // ANIMACIONES DE ENTRADA
    // ====================================
    $('.card').hide().fadeIn(600);

});