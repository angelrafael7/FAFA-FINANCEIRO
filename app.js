// ===== FINANCE APP - VERSÃO COMPLETA =====

class FinanceApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'home';
        this.users = [];
        this.transactions = [];
        this.bills = [];
        this.categories = [
            { id: 'alimentacao', name: '🍔 Alimentação', color: '#f59e0b' },
            { id: 'transporte', name: '🚗 Transporte', color: '#3b82f6' },
            { id: 'moradia', name: '🏠 Moradia', color: '#8b5cf6' },
            { id: 'saude', name: '🏥 Saúde', color: '#10b981' },
            { id: 'educacao', name: '📚 Educação', color: '#06b6d4' },
            { id: 'lazer', name: '🎮 Lazer', color: '#ec4899' },
            { id: 'outros', name: '📦 Outros', color: '#64748b' }
        ];
        this.init();
    }

    // ===== INICIALIZAÇÃO =====
    init() {
        this.loadUsers();
        this.checkNotifications();
        
        const savedUserId = localStorage.getItem('finance_current_user');
        if (savedUserId) {
            const user = this.users.find(u => u.id === savedUserId);
            if (user) {
                this.currentUser = user;
                this.loadUserData();
                this.renderApp();
                return;
            }
        }
        
        this.renderAuth();
    }

    // ===== AUTENTICAÇÃO =====
    renderAuth() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="auth-screen fade-in">
                <div class="auth-box">
                    <div class="logo">
                        <i class="fas fa-wallet"></i>
                    </div>
                    <h1 class="auth-title">Finance Manager</h1>
                    <p class="auth-subtitle">Controle completo das suas finanças</p>
                    
                    <div class="auth-tabs">
                        <button class="auth-tab active" onclick="app.switchAuthTab('login')">
                            Login
                        </button>
                        <button class="auth-tab" onclick="app.switchAuthTab('register')">
                            Cadastro
                        </button>
                    </div>
                    
                    <!-- LOGIN FORM -->
                    <form id="login-form" class="auth-form">
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" id="login-email" class="form-input" 
                                   placeholder="seu@email.com" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Senha</label>
                            <input type="password" id="login-password" class="form-input" 
                                   placeholder="••••••••" required>
                        </div>
                        
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-sign-in-alt"></i>
                            Entrar
                        </button>
                    </form>
                    
                    <!-- REGISTER FORM -->
                    <form id="register-form" class="auth-form hidden">
                        <div class="form-group">
                            <label class="form-label">Nome Completo</label>
                            <input type="text" id="register-name" class="form-input" 
                                   placeholder="Seu nome" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" id="register-email" class="form-input" 
                                   placeholder="seu@email.com" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Senha</label>
                            <input type="password" id="register-password" class="form-input" 
                                   placeholder="Mínimo 6 caracteres" required minlength="6">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Confirmar Senha</label>
                            <input type="password" id="register-confirm" class="form-input" 
                                   placeholder="Digite a senha novamente" required>
                        </div>
                        
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-user-plus"></i>
                            Criar Conta
                        </button>
                    </form>
                    
                    ${this.users.length > 0 ? `
                        <div class="saved-users">
                            <div class="saved-users-title">Contas salvas:</div>
                            ${this.users.map(u => `
                                <div class="saved-user" onclick="app.quickLogin('${u.id}')">
                                    <div class="saved-user-info">
                                        <div class="saved-user-name">${u.name}</div>
                                        <div class="saved-user-email">${u.email}</div>
                                    </div>
                                    <i class="fas fa-arrow-right"></i>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
    }

    switchAuthTab(tab) {
        const tabs = document.querySelectorAll('.auth-tab');
        tabs.forEach(t => t.classList.remove('active'));
        event.target.classList.add('active');
        
        document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
        document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
    }

    handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.login(user);
        } else {
            this.showToast('Email ou senha incorretos', 'error');
        }
    }

    handleRegister() {
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;

        if (password !== confirm) {
            this.showToast('As senhas não coincidem', 'error');
            return;
        }

        if (this.users.find(u => u.email === email)) {
            this.showToast('Este email já está cadastrado', 'error');
            return;
        }

        const newUser = {
            id: 'user_' + Date.now(),
            name: name,
            email: email,
            password: password,
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        this.saveUsers();
        this.login(newUser);
    }

    quickLogin(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            this.login(user);
        }
    }

    login(user) {
        this.currentUser = user;
        localStorage.setItem('finance_current_user', user.id);
        this.loadUserData();
        this.renderApp();
        this.showToast(`Bem-vindo, ${user.name}! 👋`, 'success');
    }

    logout() {
        if (confirm('Deseja realmente sair?')) {
            this.closeModal();
            localStorage.removeItem('finance_current_user');
            this.currentUser = null;
            this.transactions = [];
            this.bills = [];
            this.renderAuth();
        }
    }

    // ===== RENDERIZAÇÃO APP =====
    renderApp() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="app-container fade-in">
                ${this.renderHeader()}
                <div class="app-content" id="app-content">
                    ${this.renderPage()}
                </div>
                ${this.renderBottomNav()}
            </div>
        `;

        this.attachEventListeners();
    }

    renderHeader() {
        const balance = this.calculateBalance();
        const income = this.calculateIncome();
        const expense = this.calculateExpense();
        const pending = this.calculatePending();

        return `
            <div class="app-header">
                <div class="header-top">
                    <div>
                        <div class="greeting">Olá,</div>
                        <div class="greeting user-name">${this.currentUser.name}</div>
                    </div>
                    <div class="header-icon" onclick="app.showSettings()">
                        <i class="fas fa-cog"></i>
                    </div>
                </div>
                
                <div class="balance-card">
                    <div class="balance-label">Saldo Disponível</div>
                    <div class="balance-amount">${this.formatMoney(balance - pending)}</div>
                    <div class="balance-row">
                        <div class="balance-item">
                            <i class="fas fa-arrow-down"></i>
                            <div>
                                <div class="balance-item-text">Receitas</div>
                                <div class="balance-item-value">${this.formatMoney(income)}</div>
                            </div>
                        </div>
                        <div class="balance-item">
                            <i class="fas fa-arrow-up"></i>
                            <div>
                                <div class="balance-item-text">Despesas</div>
                                <div class="balance-item-value">${this.formatMoney(expense)}</div>
                            </div>
                        </div>
                    </div>
                    ${pending > 0 ? `
                        <div class="pending-alert">
                            <i class="fas fa-exclamation-circle"></i>
                            ${this.formatMoney(pending)} em contas pendentes
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderPage() {
        switch(this.currentPage) {
            case 'home':
                return this.renderHome();
            case 'bills':
                return this.renderBills();
            case 'transactions':
                return this.renderTransactions();
            case 'stats':
                return this.renderStats();
            default:
                return this.renderHome();
        }
    }

    renderHome() {
        const recentTransactions = this.transactions.slice(0, 5);
        const dueBills = this.bills
            .filter(b => !b.paid && new Date(b.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 3);
        
        return `
            <div class="quick-actions">
                <div class="action-card" onclick="app.showAddTransaction('expense')">
                    <div class="action-icon expense">
                        <i class="fas fa-minus"></i>
                    </div>
                    <div class="action-title">Despesa</div>
                </div>
                <div class="action-card" onclick="app.showAddTransaction('income')">
                    <div class="action-icon income">
                        <i class="fas fa-plus"></i>
                    </div>
                    <div class="action-title">Receita</div>
                </div>
                <div class="action-card" onclick="app.showAddBill()">
                    <div class="action-icon warning">
                        <i class="fas fa-file-invoice-dollar"></i>
                    </div>
                    <div class="action-title">Conta a Pagar</div>
                </div>
            </div>
            
            ${dueBills.length > 0 ? `
                <div class="section-header">
                    <div class="section-title">Contas Próximas</div>
                    <a href="#" class="see-all" onclick="app.goToPage('bills'); return false;">Ver todas</a>
                </div>
                
                <div class="bills-list">
                    ${dueBills.map(b => this.renderBillItem(b)).join('')}
                </div>
            ` : ''}
            
            <div class="section-header mt-2">
                <div class="section-title">Transações Recentes</div>
                ${this.transactions.length > 5 ? '<a href="#" class="see-all" onclick="app.goToPage(\'transactions\'); return false;">Ver todas</a>' : ''}
            </div>
            
            ${recentTransactions.length > 0 ? `
                <div class="transactions-list">
                    ${recentTransactions.map(t => this.renderTransactionItem(t)).join('')}
                </div>
            ` : `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-receipt"></i>
                    </div>
                    <div class="empty-text">
                        Nenhuma transação ainda.<br>
                        Comece adicionando uma despesa ou receita.
                    </div>
                </div>
            `}
        `;
    }

    renderBills() {
        const pendingBills = this.bills.filter(b => !b.paid).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        const paidBills = this.bills.filter(b => b.paid).sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));

        return `
            <div class="section-header">
                <div class="section-title">Contas a Pagar</div>
                <button class="btn-icon" onclick="app.showAddBill()">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            
            ${pendingBills.length > 0 ? `
                <div class="bills-group">
                    <div class="bills-group-title">Pendentes (${pendingBills.length})</div>
                    <div class="bills-list">
                        ${pendingBills.map(b => this.renderBillItem(b)).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${paidBills.length > 0 ? `
                <div class="bills-group mt-2">
                    <div class="bills-group-title">Pagas (${paidBills.length})</div>
                    <div class="bills-list">
                        ${paidBills.map(b => this.renderBillItem(b)).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${this.bills.length === 0 ? `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-file-invoice-dollar"></i>
                    </div>
                    <div class="empty-text">
                        Nenhuma conta cadastrada.
                    </div>
                </div>
            ` : ''}
        `;
    }

    renderTransactions() {
        return `
            <div class="section-header">
                <div class="section-title">Todas as Transações</div>
            </div>
            
            ${this.transactions.length > 0 ? `
                <div class="transactions-list">
                    ${this.transactions.map(t => this.renderTransactionItem(t)).join('')}
                </div>
            ` : `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-receipt"></i>
                    </div>
                    <div class="empty-text">
                        Nenhuma transação registrada.
                    </div>
                </div>
            `}
        `;
    }

    renderStats() {
        const balance = this.calculateBalance();
        const income = this.calculateIncome();
        const expense = this.calculateExpense();
        const pending = this.calculatePending();
        const count = this.transactions.length;
        
        const categoryStats = this.calculateCategoryStats();

        return `
            <div class="section-header">
                <div class="section-title">Estatísticas</div>
            </div>
            
            <div class="transactions-list">
                <div class="transaction-item">
                    <div class="transaction-icon income">
                        <i class="fas fa-wallet"></i>
                    </div>
                    <div class="transaction-info">
                        <div class="transaction-title">Saldo Total</div>
                        <div class="transaction-date">${count} transações</div>
                    </div>
                    <div class="transaction-amount ${balance >= 0 ? 'income' : 'expense'}">
                        ${this.formatMoney(balance)}
                    </div>
                </div>
                
                <div class="transaction-item">
                    <div class="transaction-icon income">
                        <i class="fas fa-arrow-down"></i>
                    </div>
                    <div class="transaction-info">
                        <div class="transaction-title">Total de Receitas</div>
                        <div class="transaction-date">Entradas</div>
                    </div>
                    <div class="transaction-amount income">
                        ${this.formatMoney(income)}
                    </div>
                </div>
                
                <div class="transaction-item">
                    <div class="transaction-icon expense">
                        <i class="fas fa-arrow-up"></i>
                    </div>
                    <div class="transaction-info">
                        <div class="transaction-title">Total de Despesas</div>
                        <div class="transaction-date">Saídas</div>
                    </div>
                    <div class="transaction-amount expense">
                        ${this.formatMoney(expense)}
                    </div>
                </div>
                
                ${pending > 0 ? `
                    <div class="transaction-item">
                        <div class="transaction-icon warning">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="transaction-info">
                            <div class="transaction-title">Contas Pendentes</div>
                            <div class="transaction-date">A pagar</div>
                        </div>
                        <div class="transaction-amount expense">
                            ${this.formatMoney(pending)}
                        </div>
                    </div>
                ` : ''}
            </div>
            
            ${categoryStats.length > 0 ? `
                <div class="section-header mt-2">
                    <div class="section-title">Despesas por Categoria</div>
                </div>
                
                <div class="category-stats">
                    ${categoryStats.map(cat => `
                        <div class="category-stat-item">
                            <div class="category-stat-info">
                                <span style="color: ${cat.color}">${cat.icon}</span>
                                <span class="category-stat-name">${cat.name}</span>
                            </div>
                            <div class="category-stat-bar">
                                <div class="category-stat-fill" style="width: ${cat.percentage}%; background: ${cat.color}"></div>
                            </div>
                            <div class="category-stat-amount">${this.formatMoney(cat.amount)}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
    }

    renderTransactionItem(transaction) {
        const category = this.categories.find(c => c.id === transaction.category);
        return `
            <div class="transaction-item">
                <div class="transaction-icon ${transaction.type}">
                    <i class="fas fa-${transaction.type === 'expense' ? 'minus' : 'plus'}"></i>
                </div>
                <div class="transaction-info">
                    <div class="transaction-title">${transaction.description}</div>
                    <div class="transaction-date">
                        ${category ? category.name : ''} • ${this.formatDate(transaction.date)}
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'expense' ? '-' : '+'}${this.formatMoney(transaction.amount)}
                </div>
            </div>
        `;
    }

    renderBillItem(bill) {
        const dueDate = new Date(bill.dueDate);
        const today = new Date();
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        const isOverdue = !bill.paid && daysUntilDue < 0;
        const isDueSoon = !bill.paid && daysUntilDue >= 0 && daysUntilDue <= 3;

        return `
            <div class="bill-item ${bill.paid ? 'paid' : ''} ${isOverdue ? 'overdue' : ''} ${isDueSoon ? 'due-soon' : ''}">
                <div class="bill-checkbox" onclick="app.toggleBillPaid('${bill.id}')">
                    <i class="fas fa-${bill.paid ? 'check-circle' : 'circle'}"></i>
                </div>
                <div class="bill-info">
                    <div class="bill-title">${bill.description}</div>
                    <div class="bill-date">
                        ${bill.paid ? 
                            `Pago em ${this.formatDate(bill.paidAt)}` : 
                            `Vence em ${this.formatDate(bill.dueDate)} ${isOverdue ? '(ATRASADA!)' : isDueSoon ? '(EM BREVE!)' : ''}`
                        }
                    </div>
                </div>
                <div class="bill-right">
                    <div class="bill-amount ${bill.paid ? 'paid' : ''}">
                        ${this.formatMoney(bill.amount)}
                    </div>
                    ${!bill.paid ? `
                        <button class="btn-pay" onclick="app.toggleBillPaid('${bill.id}'); event.stopPropagation();">
                            <i class="fas fa-check"></i>
                            Pagar
                        </button>
                    ` : `
                        <button class="btn-unpay" onclick="app.toggleBillPaid('${bill.id}'); event.stopPropagation();">
                            <i class="fas fa-undo"></i>
                            Desfazer
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    renderBottomNav() {
        return `
            <div class="bottom-nav">
                <div class="nav-item ${this.currentPage === 'home' ? 'active' : ''}" 
                     onclick="app.goToPage('home')">
                    <i class="fas fa-home"></i>
                    <span class="nav-label">Início</span>
                </div>
                <div class="nav-item ${this.currentPage === 'bills' ? 'active' : ''}" 
                     onclick="app.goToPage('bills')">
                    <i class="fas fa-file-invoice-dollar"></i>
                    <span class="nav-label">Contas</span>
                </div>
                <div class="nav-item ${this.currentPage === 'transactions' ? 'active' : ''}" 
                     onclick="app.goToPage('transactions')">
                    <i class="fas fa-list"></i>
                    <span class="nav-label">Transações</span>
                </div>
                <div class="nav-item ${this.currentPage === 'stats' ? 'active' : ''}" 
                     onclick="app.goToPage('stats')">
                    <i class="fas fa-chart-pie"></i>
                    <span class="nav-label">Estatísticas</span>
                </div>
            </div>
        `;
    }

    // ===== MODAIS =====
    showModal(title, content, footer = '') {
        this.closeModal();

        const modalHTML = `
            <div class="modal-overlay" id="modal-overlay">
                <div class="modal">
                    <div class="modal-header">
                        <div class="modal-title">${title}</div>
                        <button class="modal-close" onclick="app.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        setTimeout(() => {
            document.getElementById('modal-overlay')?.classList.add('show');
        }, 10);

        document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'modal-overlay') {
                this.closeModal();
            }
        });
    }

    closeModal() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 300);
        }
    }

    showAddTransaction(type) {
        const typeLabel = type === 'expense' ? 'Despesa' : 'Receita';

        const content = `
            <form id="transaction-form" onsubmit="return false;">
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <input type="text" id="description" class="form-input" 
                           placeholder="Ex: Almoço, Salário, etc." required>
                </div>
                
                ${type === 'expense' ? `
                    <div class="form-group">
                        <label class="form-label">Categoria</label>
                        <select id="category" class="form-input" required>
                            ${this.categories.map(c => `
                                <option value="${c.id}">${c.name}</option>
                            `).join('')}
                        </select>
                    </div>
                ` : ''}
                
                <div class="form-group">
                    <label class="form-label">Valor (R$)</label>
                    <input type="number" id="amount" class="form-input" 
                           placeholder="0,00" step="0.01" min="0.01" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Data</label>
                    <input type="date" id="date" class="form-input" 
                           value="${new Date().toISOString().split('T')[0]}" required>
                </div>
            </form>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="app.closeModal()">
                Cancelar
            </button>
            <button class="btn btn-primary" onclick="app.saveTransaction('${type}')">
                <i class="fas fa-check"></i>
                Salvar
            </button>
        `;

        this.showModal(`Nova ${typeLabel}`, content, footer);
    }

    showAddBill() {
        const content = `
            <form id="bill-form" onsubmit="return false;">
                <div class="form-group">
                    <label class="form-label">Descrição da Conta</label>
                    <input type="text" id="bill-description" class="form-input" 
                           placeholder="Ex: Conta de luz, Aluguel, etc." required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Valor (R$)</label>
                    <input type="number" id="bill-amount" class="form-input" 
                           placeholder="0,00" step="0.01" min="0.01" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Data de Vencimento</label>
                    <input type="date" id="bill-duedate" class="form-input" 
                           min="${new Date().toISOString().split('T')[0]}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Categoria</label>
                    <select id="bill-category" class="form-input" required>
                        ${this.categories.map(c => `
                            <option value="${c.id}">${c.name}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Repetir mensalmente?</label>
                    <select id="bill-recurring" class="form-input">
                        <option value="false">Não</option>
                        <option value="true">Sim</option>
                    </select>
                </div>
            </form>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="app.closeModal()">
                Cancelar
            </button>
            <button class="btn btn-primary" onclick="app.saveBill()">
                <i class="fas fa-check"></i>
                Salvar
            </button>
        `;

        this.showModal('Nova Conta a Pagar', content, footer);
    }

    showSettings() {
        const content = `
            <div class="settings-list">
                <div class="settings-item" onclick="app.exportData()">
                    <div class="settings-icon income">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <div class="settings-text">
                        <div class="settings-title">Exportar Relatório PDF</div>
                        <div class="settings-subtitle">Visualizar e baixar planilha</div>
                    </div>
                </div>
                
                <div class="settings-item" onclick="app.clearAllData()">
                    <div class="settings-icon expense">
                        <i class="fas fa-trash"></i>
                    </div>
                    <div class="settings-text">
                        <div class="settings-title">Limpar Tudo</div>
                        <div class="settings-subtitle">Apagar transações e contas</div>
                    </div>
                </div>
                
                <div class="settings-item" onclick="app.logout()">
                    <div class="settings-icon warning">
                        <i class="fas fa-sign-out-alt"></i>
                    </div>
                    <div class="settings-text">
                        <div class="settings-title">Sair</div>
                        <div class="settings-subtitle">Fazer logout</div>
                    </div>
                </div>
            </div>
            
            <div class="user-info">
                <div class="user-info-row">
                    <span>Nome:</span>
                    <strong>${this.currentUser.name}</strong>
                </div>
                <div class="user-info-row">
                    <span>Email:</span>
                    <strong>${this.currentUser.email}</strong>
                </div>
                <div class="user-info-row">
                    <span>Membro desde:</span>
                    <strong>${new Date(this.currentUser.createdAt).toLocaleDateString('pt-BR')}</strong>
                </div>
            </div>
        `;

        this.showModal('Configurações', content);
    }

    // ===== AÇÕES =====
    saveTransaction(type) {
        const description = document.getElementById('description').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const date = document.getElementById('date').value;
        const category = type === 'expense' ? document.getElementById('category').value : null;

        if (!description || !amount || !date) {
            this.showToast('Preencha todos os campos', 'error');
            return;
        }

        const transaction = {
            id: 'tx_' + Date.now(),
            type: type,
            description: description,
            amount: amount,
            date: date,
            category: category,
            createdAt: new Date().toISOString()
        };

        this.transactions.unshift(transaction);
        this.saveUserData();
        this.closeModal();
        this.renderApp();
        
        const message = type === 'expense' ? 'Despesa adicionada!' : 'Receita adicionada!';
        this.showToast(message, 'success');
    }

    saveBill() {
        const description = document.getElementById('bill-description').value.trim();
        const amount = parseFloat(document.getElementById('bill-amount').value);
        const dueDate = document.getElementById('bill-duedate').value;
        const category = document.getElementById('bill-category').value;
        const recurring = document.getElementById('bill-recurring').value === 'true';

        if (!description || !amount || !dueDate) {
            this.showToast('Preencha todos os campos', 'error');
            return;
        }

        const bill = {
            id: 'bill_' + Date.now(),
            description: description,
            amount: amount,
            dueDate: dueDate,
            category: category,
            recurring: recurring,
            paid: false,
            paidAt: null,
            createdAt: new Date().toISOString()
        };

        this.bills.unshift(bill);
        this.saveUserData();
        this.closeModal();
        this.renderApp();
        this.showToast('Conta adicionada!', 'success');
        
        // Agendar notificação
        this.scheduleNotification(bill);
    }

    toggleBillPaid(billId) {
        const bill = this.bills.find(b => b.id === billId);
        if (!bill) return;

        if (!bill.paid) {
            bill.paid = true;
            bill.paidAt = new Date().toISOString().split('T')[0];
            
            // Adicionar como transação
            const transaction = {
                id: 'tx_' + Date.now(),
                type: 'expense',
                description: bill.description,
                amount: bill.amount,
                date: bill.paidAt,
                category: bill.category,
                createdAt: new Date().toISOString()
            };
            this.transactions.unshift(transaction);
            
            this.showToast('Conta marcada como paga!', 'success');
            
            // Se é recorrente, criar próxima
            if (bill.recurring) {
                const nextDueDate = new Date(bill.dueDate);
                nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                
                const nextBill = {
                    ...bill,
                    id: 'bill_' + Date.now(),
                    dueDate: nextDueDate.toISOString().split('T')[0],
                    paid: false,
                    paidAt: null,
                    createdAt: new Date().toISOString()
                };
                
                this.bills.unshift(nextBill);
                this.scheduleNotification(nextBill);
            }
        } else {
            bill.paid = false;
            bill.paidAt = null;
            
            // Remover transação correspondente
            const txIndex = this.transactions.findIndex(t => 
                t.description === bill.description && 
                t.date === bill.paidAt
            );
            if (txIndex !== -1) {
                this.transactions.splice(txIndex, 1);
            }
            
            this.showToast('Conta desmarcada', 'info');
        }

        this.saveUserData();
        this.renderApp();
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderApp();
        document.getElementById('app-content')?.scrollTo(0, 0);
    }

    exportData() {
        this.showToast('Gerando PDF...', 'info');
        
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            let yPos = 20;
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            
            // Cores
            const primaryColor = [99, 102, 241];
            const successColor = [16, 185, 129];
            const dangerColor = [239, 68, 68];
            const textColor = [30, 41, 59];
            
            // ===== PÁGINA 1: CAPA E RESUMO =====
            
            // Capa
            doc.setFillColor(...primaryColor);
            doc.rect(0, 0, pageWidth, 60, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(28);
            doc.setFont('helvetica', 'bold');
            doc.text('FINANCE MANAGER', pageWidth / 2, 25, { align: 'center' });
            
            doc.setFontSize(16);
            doc.setFont('helvetica', 'normal');
            doc.text('Relatório Financeiro Completo', pageWidth / 2, 40, { align: 'center' });
            
            // Informações do usuário
            yPos = 75;
            doc.setTextColor(...textColor);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('INFORMACOES DO USUARIO', 20, yPos);
            
            yPos += 10;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Nome: ${this.currentUser.name}`, 20, yPos);
            yPos += 6;
            doc.text(`Email: ${this.currentUser.email}`, 20, yPos);
            yPos += 6;
            doc.text(`Data do Relatorio: ${new Date().toLocaleDateString('pt-BR')}`, 20, yPos);
            yPos += 6;
            doc.text(`Membro desde: ${new Date(this.currentUser.createdAt).toLocaleDateString('pt-BR')}`, 20, yPos);
            
            // Resumo Financeiro
            yPos += 15;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('RESUMO FINANCEIRO', 20, yPos);
            
            yPos += 5;
            const resumoData = [
                ['Total de Receitas', this.formatMoney(this.calculateIncome())],
                ['Total de Despesas', this.formatMoney(this.calculateExpense())],
                ['Saldo Atual', this.formatMoney(this.calculateBalance())],
                ['Contas Pendentes', this.formatMoney(this.calculatePending())],
                ['Saldo Disponivel', this.formatMoney(this.calculateBalance() - this.calculatePending())]
            ];
            
            doc.autoTable({
                startY: yPos,
                head: [['Descricao', 'Valor (R$)']],
                body: resumoData,
                theme: 'grid',
                headStyles: { fillColor: primaryColor, fontSize: 10, fontStyle: 'bold' },
                bodyStyles: { fontSize: 10 },
                columnStyles: {
                    0: { cellWidth: 100 },
                    1: { cellWidth: 70, halign: 'right', fontStyle: 'bold' }
                }
            });
            
            // Contadores
            yPos = doc.lastAutoTable.finalY + 15;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('ESTATISTICAS', 20, yPos);
            
            yPos += 5;
            const statsData = [
                ['Total de Transacoes', this.transactions.length.toString()],
                ['Total de Receitas', this.transactions.filter(t => t.type === 'income').length.toString()],
                ['Total de Despesas', this.transactions.filter(t => t.type === 'expense').length.toString()],
                ['Contas Cadastradas', this.bills.length.toString()],
                ['Contas Pagas', this.bills.filter(b => b.paid).length.toString()],
                ['Contas Pendentes', this.bills.filter(b => !b.paid).length.toString()]
            ];
            
            doc.autoTable({
                startY: yPos,
                head: [['Descricao', 'Quantidade']],
                body: statsData,
                theme: 'grid',
                headStyles: { fillColor: primaryColor, fontSize: 10, fontStyle: 'bold' },
                bodyStyles: { fontSize: 10 },
                columnStyles: {
                    0: { cellWidth: 100 },
                    1: { cellWidth: 70, halign: 'center' }
                }
            });
            
            // ===== PÁGINA 2: DESPESAS POR CATEGORIA =====
            doc.addPage();
            yPos = 20;
            
            doc.setFillColor(...dangerColor);
            doc.rect(0, 0, pageWidth, 15, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('DESPESAS POR CATEGORIA', pageWidth / 2, 10, { align: 'center' });
            
            yPos = 25;
            const categoryStats = this.calculateCategoryStats();
            
            if (categoryStats.length > 0) {
                const categoryData = categoryStats.map(cat => [
                    cat.name,
                    this.formatMoney(cat.amount),
                    cat.percentage.toFixed(1) + '%'
                ]);
                
                categoryData.push(['TOTAL', this.formatMoney(this.calculateExpense()), '100%']);
                
                doc.autoTable({
                    startY: yPos,
                    head: [['Categoria', 'Valor (R$)', 'Percentual']],
                    body: categoryData,
                    theme: 'striped',
                    headStyles: { fillColor: dangerColor, fontSize: 10, fontStyle: 'bold' },
                    bodyStyles: { fontSize: 10 },
                    columnStyles: {
                        0: { cellWidth: 80 },
                        1: { cellWidth: 60, halign: 'right' },
                        2: { cellWidth: 40, halign: 'center' }
                    },
                    footStyles: { fillColor: [220, 220, 220], fontStyle: 'bold' }
                });
            } else {
                doc.setTextColor(...textColor);
                doc.setFontSize(10);
                doc.text('Nenhuma despesa registrada.', 20, yPos);
            }
            
            // ===== PÁGINA 3: DESPESAS DETALHADAS =====
            doc.addPage();
            yPos = 20;
            
            doc.setFillColor(...dangerColor);
            doc.rect(0, 0, pageWidth, 15, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('DESPESAS DETALHADAS', pageWidth / 2, 10, { align: 'center' });
            
            yPos = 25;
            const despesas = this.transactions.filter(t => t.type === 'expense');
            
            if (despesas.length > 0) {
                const despesasData = despesas.map(t => {
                    const cat = this.categories.find(c => c.id === t.category);
                    const catName = cat ? cat.name.split(' ').slice(1).join(' ') : 'Outros';
                    return [
                        new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR'),
                        t.description,
                        catName,
                        this.formatMoney(t.amount)
                    ];
                });
                
                doc.autoTable({
                    startY: yPos,
                    head: [['Data', 'Descricao', 'Categoria', 'Valor (R$)']],
                    body: despesasData,
                    theme: 'striped',
                    headStyles: { fillColor: dangerColor, fontSize: 9, fontStyle: 'bold' },
                    bodyStyles: { fontSize: 8 },
                    columnStyles: {
                        0: { cellWidth: 25 },
                        1: { cellWidth: 70 },
                        2: { cellWidth: 50 },
                        3: { cellWidth: 35, halign: 'right' }
                    }
                });
            } else {
                doc.setTextColor(...textColor);
                doc.setFontSize(10);
                doc.text('Nenhuma despesa registrada.', 20, yPos);
            }
            
            // ===== PÁGINA 4: RECEITAS =====
            doc.addPage();
            yPos = 20;
            
            doc.setFillColor(...successColor);
            doc.rect(0, 0, pageWidth, 15, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('RECEITAS DETALHADAS', pageWidth / 2, 10, { align: 'center' });
            
            yPos = 25;
            const receitas = this.transactions.filter(t => t.type === 'income');
            
            if (receitas.length > 0) {
                const receitasData = receitas.map(t => [
                    new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR'),
                    t.description,
                    this.formatMoney(t.amount)
                ]);
                
                doc.autoTable({
                    startY: yPos,
                    head: [['Data', 'Descricao', 'Valor (R$)']],
                    body: receitasData,
                    theme: 'striped',
                    headStyles: { fillColor: successColor, fontSize: 9, fontStyle: 'bold' },
                    bodyStyles: { fontSize: 8 },
                    columnStyles: {
                        0: { cellWidth: 30 },
                        1: { cellWidth: 110 },
                        2: { cellWidth: 40, halign: 'right' }
                    }
                });
            } else {
                doc.setTextColor(...textColor);
                doc.setFontSize(10);
                doc.text('Nenhuma receita registrada.', 20, yPos);
            }
            
            // ===== PÁGINA 5: CONTAS A PAGAR =====
            doc.addPage();
            yPos = 20;
            
            doc.setFillColor(245, 158, 11);
            doc.rect(0, 0, pageWidth, 15, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('CONTAS A PAGAR', pageWidth / 2, 10, { align: 'center' });
            
            yPos = 25;
            
            if (this.bills.length > 0) {
                const contasData = this.bills.map(b => [
                    b.description,
                    this.formatMoney(b.amount),
                    new Date(b.dueDate + 'T00:00:00').toLocaleDateString('pt-BR'),
                    b.paid ? 'PAGA' : 'PENDENTE',
                    b.paid ? new Date(b.paidAt + 'T00:00:00').toLocaleDateString('pt-BR') : '-'
                ]);
                
                doc.autoTable({
                    startY: yPos,
                    head: [['Descricao', 'Valor', 'Vencimento', 'Status', 'Pagamento']],
                    body: contasData,
                    theme: 'striped',
                    headStyles: { fillColor: [245, 158, 11], fontSize: 9, fontStyle: 'bold' },
                    bodyStyles: { fontSize: 8 },
                    columnStyles: {
                        0: { cellWidth: 60 },
                        1: { cellWidth: 30, halign: 'right' },
                        2: { cellWidth: 30, halign: 'center' },
                        3: { cellWidth: 30, halign: 'center' },
                        4: { cellWidth: 30, halign: 'center' }
                    }
                });
                
                // Resumo de contas
                yPos = doc.lastAutoTable.finalY + 10;
                doc.setTextColor(...textColor);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text('RESUMO:', 20, yPos);
                yPos += 6;
                doc.setFont('helvetica', 'normal');
                doc.text(`Total Pago: ${this.formatMoney(this.bills.filter(b => b.paid).reduce((sum, b) => sum + b.amount, 0))}`, 20, yPos);
                yPos += 6;
                doc.text(`Total Pendente: ${this.formatMoney(this.bills.filter(b => !b.paid).reduce((sum, b) => sum + b.amount, 0))}`, 20, yPos);
            } else {
                doc.setTextColor(...textColor);
                doc.setFontSize(10);
                doc.text('Nenhuma conta cadastrada.', 20, yPos);
            }
            
            // ===== PÁGINA 6: FLUXO MENSAL =====
            const fluxoMensal = this.calculateMonthlyFlow();
            
            if (fluxoMensal.length > 0) {
                doc.addPage();
                yPos = 20;
                
                doc.setFillColor(...primaryColor);
                doc.rect(0, 0, pageWidth, 15, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text('FLUXO DE CAIXA MENSAL', pageWidth / 2, 10, { align: 'center' });
                
                yPos = 25;
                
                const fluxoData = fluxoMensal.map(m => [
                    m.month,
                    this.formatMoney(m.income),
                    this.formatMoney(m.expense),
                    this.formatMoney(m.balance)
                ]);
                
                doc.autoTable({
                    startY: yPos,
                    head: [['Mes/Ano', 'Receitas', 'Despesas', 'Saldo']],
                    body: fluxoData,
                    theme: 'striped',
                    headStyles: { fillColor: primaryColor, fontSize: 10, fontStyle: 'bold' },
                    bodyStyles: { fontSize: 9 },
                    columnStyles: {
                        0: { cellWidth: 60 },
                        1: { cellWidth: 40, halign: 'right' },
                        2: { cellWidth: 40, halign: 'right' },
                        3: { cellWidth: 40, halign: 'right' }
                    }
                });
            }
            
            // ===== PÁGINA 7: RELATÓRIO ANUAL =====
            const relatorioAnual = this.calculateAnnualReport();
            
            if (relatorioAnual.years.length > 0) {
                doc.addPage();
                yPos = 20;
                
                doc.setFillColor(...primaryColor);
                doc.rect(0, 0, pageWidth, 15, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text('RELATORIO ANUAL COMPLETO', pageWidth / 2, 10, { align: 'center' });
                
                yPos = 25;
                
                // Para cada ano, criar uma tabela detalhada
                relatorioAnual.years.forEach((yearData, index) => {
                    if (index > 0) {
                        yPos += 15;
                        // Verificar se precisa de nova página
                        if (yPos > pageHeight - 100) {
                            doc.addPage();
                            yPos = 20;
                        }
                    }
                    
                    // Título do ano
                    doc.setTextColor(...textColor);
                    doc.setFontSize(14);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`ANO ${yearData.year}`, 20, yPos);
                    yPos += 5;
                    
                    // Tabela mensal com acumulado
                    const monthlyData = yearData.months.map(m => [
                        m.monthName,
                        this.formatMoney(m.income),
                        this.formatMoney(m.expense),
                        this.formatMoney(m.balance),
                        this.formatMoney(m.accumulatedIncome),
                        this.formatMoney(m.accumulatedExpense),
                        this.formatMoney(m.accumulatedBalance)
                    ]);
                    
                    // Linha de total
                    monthlyData.push([
                        'TOTAL DO ANO',
                        this.formatMoney(yearData.totalIncome),
                        this.formatMoney(yearData.totalExpense),
                        this.formatMoney(yearData.totalBalance),
                        '',
                        '',
                        ''
                    ]);
                    
                    doc.autoTable({
                        startY: yPos,
                        head: [['Mes', 'Receitas', 'Despesas', 'Saldo', 'Receit.Acum', 'Desp.Acum', 'Saldo Acum']],
                        body: monthlyData,
                        theme: 'striped',
                        headStyles: { 
                            fillColor: primaryColor, 
                            fontSize: 8, 
                            fontStyle: 'bold' 
                        },
                        bodyStyles: { fontSize: 7 },
                        columnStyles: {
                            0: { cellWidth: 25 },
                            1: { cellWidth: 25, halign: 'right' },
                            2: { cellWidth: 25, halign: 'right' },
                            3: { cellWidth: 25, halign: 'right' },
                            4: { cellWidth: 25, halign: 'right' },
                            5: { cellWidth: 25, halign: 'right' },
                            6: { cellWidth: 30, halign: 'right' }
                        },
                        didParseCell: function(data) {
                            // Destacar linha de total
                            if (data.row.index === monthlyData.length - 1) {
                                data.cell.styles.fillColor = [220, 220, 220];
                                data.cell.styles.fontStyle = 'bold';
                                data.cell.styles.fontSize = 8;
                            }
                        }
                    });
                    
                    yPos = doc.lastAutoTable.finalY;
                });
                
                // Resumo geral de todos os anos
                if (relatorioAnual.years.length > 0) {
                    yPos += 15;
                    
                    // Verificar se precisa de nova página
                    if (yPos > pageHeight - 80) {
                        doc.addPage();
                        yPos = 20;
                    }
                    
                    doc.setTextColor(...textColor);
                    doc.setFontSize(14);
                    doc.setFont('helvetica', 'bold');
                    doc.text('RESUMO GERAL DE TODOS OS ANOS', 20, yPos);
                    yPos += 5;
                    
                    const summaryData = relatorioAnual.years.map(y => [
                        y.year.toString(),
                        this.formatMoney(y.totalIncome),
                        this.formatMoney(y.totalExpense),
                        this.formatMoney(y.totalBalance)
                    ]);
                    
                    // Total geral
                    const grandTotalIncome = relatorioAnual.years.reduce((sum, y) => sum + y.totalIncome, 0);
                    const grandTotalExpense = relatorioAnual.years.reduce((sum, y) => sum + y.totalExpense, 0);
                    const grandTotalBalance = grandTotalIncome - grandTotalExpense;
                    
                    summaryData.push([
                        'TOTAL GERAL',
                        this.formatMoney(grandTotalIncome),
                        this.formatMoney(grandTotalExpense),
                        this.formatMoney(grandTotalBalance)
                    ]);
                    
                    doc.autoTable({
                        startY: yPos,
                        head: [['Ano', 'Total Receitas', 'Total Despesas', 'Saldo']],
                        body: summaryData,
                        theme: 'grid',
                        headStyles: { 
                            fillColor: primaryColor, 
                            fontSize: 10, 
                            fontStyle: 'bold' 
                        },
                        bodyStyles: { fontSize: 10 },
                        columnStyles: {
                            0: { cellWidth: 40, halign: 'center' },
                            1: { cellWidth: 50, halign: 'right' },
                            2: { cellWidth: 50, halign: 'right' },
                            3: { cellWidth: 40, halign: 'right' }
                        },
                        didParseCell: function(data) {
                            // Destacar linha de total geral
                            if (data.row.index === summaryData.length - 1) {
                                data.cell.styles.fillColor = [99, 102, 241];
                                data.cell.styles.textColor = [255, 255, 255];
                                data.cell.styles.fontStyle = 'bold';
                                data.cell.styles.fontSize = 11;
                            }
                        }
                    });
                }
            }
            
            // ===== RODAPÉ EM TODAS AS PÁGINAS =====
            const totalPages = doc.internal.getNumberOfPages();
            
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(
                    `Finance Manager - Gerado em ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: 'center' }
                );
                doc.text(`Pagina ${i} de ${totalPages}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
            }
            
            // Salvar PDF
            const filename = `FinanceManager_${this.currentUser.name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);
            
            // Abrir em nova aba para visualizar
            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');
            
            this.showToast('PDF gerado com sucesso! 📄', 'success');
            this.closeModal();
        } catch (error) {
            console.error('Erro ao exportar:', error);
            this.showToast('Erro ao gerar PDF. Tente novamente.', 'error');
        }
    }

    calculateMonthlyFlow() {
        const months = {};
        
        // Agrupar por mês
        this.transactions.forEach(t => {
            const date = new Date(t.date + 'T00:00:00');
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            
            if (!months[monthKey]) {
                months[monthKey] = {
                    month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
                    income: 0,
                    expense: 0,
                    balance: 0
                };
            }
            
            if (t.type === 'income') {
                months[monthKey].income += t.amount;
            } else {
                months[monthKey].expense += t.amount;
            }
        });
        
        // Calcular saldo de cada mês
        Object.values(months).forEach(m => {
            m.balance = m.income - m.expense;
        });
        
        // Ordenar por data
        return Object.entries(months)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([_, data]) => data);
    }

    calculateAnnualReport() {
        const years = {};
        
        // Agrupar transações por ano e mês
        this.transactions.forEach(t => {
            const date = new Date(t.date + 'T00:00:00');
            const year = date.getFullYear();
            const month = date.getMonth(); // 0-11
            
            if (!years[year]) {
                years[year] = {
                    year: year,
                    months: Array(12).fill(null).map((_, i) => ({
                        month: i + 1,
                        monthName: new Date(year, i, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
                        income: 0,
                        expense: 0,
                        balance: 0,
                        accumulatedIncome: 0,
                        accumulatedExpense: 0,
                        accumulatedBalance: 0
                    })),
                    totalIncome: 0,
                    totalExpense: 0,
                    totalBalance: 0
                };
            }
            
            if (t.type === 'income') {
                years[year].months[month].income += t.amount;
            } else {
                years[year].months[month].expense += t.amount;
            }
        });
        
        // Calcular saldos e acumulados para cada ano
        Object.values(years).forEach(yearData => {
            let accIncome = 0;
            let accExpense = 0;
            
            yearData.months.forEach(m => {
                m.balance = m.income - m.expense;
                
                accIncome += m.income;
                accExpense += m.expense;
                
                m.accumulatedIncome = accIncome;
                m.accumulatedExpense = accExpense;
                m.accumulatedBalance = accIncome - accExpense;
            });
            
            yearData.totalIncome = accIncome;
            yearData.totalExpense = accExpense;
            yearData.totalBalance = accIncome - accExpense;
        });
        
        // Ordenar anos (mais recente primeiro)
        const sortedYears = Object.values(years).sort((a, b) => b.year - a.year);
        
        return {
            years: sortedYears
        };
    }

    clearAllData() {
        if (confirm('Isso irá apagar TODAS as suas transações e contas. Deseja continuar?')) {
            this.transactions = [];
            this.bills = [];
            this.saveUserData();
            this.closeModal();
            this.renderApp();
            this.showToast('Dados apagados!', 'info');
        }
    }

    // ===== NOTIFICAÇÕES =====
    checkNotifications() {
        if ('Notification' in window) {
            Notification.requestPermission();
        }
        
        setInterval(() => {
            const today = new Date();
            today.setHours(9, 0, 0, 0);
            
            this.bills.forEach(bill => {
                if (!bill.paid) {
                    const dueDate = new Date(bill.dueDate);
                    dueDate.setHours(9, 0, 0, 0);
                    
                    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                    
                    if (daysUntilDue === 0) {
                        this.sendNotification(
                            'Conta vence hoje!',
                            `${bill.description} - ${this.formatMoney(bill.amount)}`
                        );
                    } else if (daysUntilDue === 1) {
                        this.sendNotification(
                            'Conta vence amanhã!',
                            `${bill.description} - ${this.formatMoney(bill.amount)}`
                        );
                    } else if (daysUntilDue === 3) {
                        this.sendNotification(
                            'Lembrete: Conta vence em 3 dias',
                            `${bill.description} - ${this.formatMoney(bill.amount)}`
                        );
                    }
                }
            });
        }, 60000 * 60); // Verificar a cada hora
    }

    scheduleNotification(bill) {
        // Notificação imediata para contas que vencem em breve
        const dueDate = new Date(bill.dueDate);
        const today = new Date();
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue <= 3 && daysUntilDue >= 0) {
            this.sendNotification(
                'Nova conta adicionada',
                `${bill.description} vence em ${daysUntilDue} dias - ${this.formatMoney(bill.amount)}`
            );
        }
    }

    sendNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '/icon-192.png',
                badge: '/icon-192.png'
            });
        }
    }

    // ===== STORAGE =====
    loadUsers() {
        const data = localStorage.getItem('finance_users');
        if (data) {
            try {
                this.users = JSON.parse(data);
            } catch (e) {
                this.users = [];
            }
        }
    }

    saveUsers() {
        localStorage.setItem('finance_users', JSON.stringify(this.users));
    }

    loadUserData() {
        const txData = localStorage.getItem(`finance_transactions_${this.currentUser.id}`);
        if (txData) {
            try {
                this.transactions = JSON.parse(txData);
            } catch (e) {
                this.transactions = [];
            }
        }

        const billsData = localStorage.getItem(`finance_bills_${this.currentUser.id}`);
        if (billsData) {
            try {
                this.bills = JSON.parse(billsData);
            } catch (e) {
                this.bills = [];
            }
        }
    }

    saveUserData() {
        localStorage.setItem(`finance_transactions_${this.currentUser.id}`, JSON.stringify(this.transactions));
        localStorage.setItem(`finance_bills_${this.currentUser.id}`, JSON.stringify(this.bills));
    }

    // ===== CÁLCULOS =====
    calculateBalance() {
        return this.calculateIncome() - this.calculateExpense();
    }

    calculateIncome() {
        return this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
    }

    calculateExpense() {
        return this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
    }

    calculatePending() {
        return this.bills
            .filter(b => !b.paid)
            .reduce((sum, b) => sum + b.amount, 0);
    }

    calculateCategoryStats() {
        const expenses = this.transactions.filter(t => t.type === 'expense');
        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
        
        if (totalExpenses === 0) return [];
        
        const stats = this.categories.map(cat => {
            const amount = expenses
                .filter(t => t.category === cat.id)
                .reduce((sum, t) => sum + t.amount, 0);
            
            return {
                ...cat,
                icon: cat.name.split(' ')[0],
                name: cat.name.split(' ').slice(1).join(' '),
                amount: amount,
                percentage: (amount / totalExpenses) * 100
            };
        }).filter(cat => cat.amount > 0);
        
        return stats.sort((a, b) => b.amount - a.amount);
    }

    // ===== HELPERS =====
    formatMoney(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        
        const diffTime = today - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoje';
        if (diffDays === 1) return 'Ontem';
        if (diffDays === -1) return 'Amanhã';
        if (diffDays < 0 && diffDays > -7) return `Em ${Math.abs(diffDays)} dias`;
        if (diffDays > 0 && diffDays < 7) return `${diffDays} dias atrás`;

        return date.toLocaleDateString('pt-BR');
    }

    showToast(message, type = 'info') {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${icons[type]}"></i>
            </div>
            <div class="toast-message">${message}</div>
        `;

        const container = document.getElementById('toast-container');
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    attachEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }
}

// ===== INICIALIZAÇÃO =====
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new FinanceApp();
});