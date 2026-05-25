// App State Management
const appState = {
    currentUser: null,
    userType: null, // 'nutritionist' or 'athlete'
    currentPage: 'dashboard',
    theme: localStorage.getItem('theme') || 'light',
    athletes: [], // Loaded from API
    athleteEvaluations: [], // Store evaluations for current logged-in athlete
    editingAthleteId: null,

    async fetchAthletes() {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const res = await fetch("http://localhost:3333/users", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const users = await res.json();
                this.athletes = users.filter(u => u.role === 'ATHLETE' || u.role === 'ATLETA').map(u => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    // Fill mock data for layout purposes since backend might not have this yet
                    dob: '2000-01-01', height: 170, weight: 70, sex: 'M', sweating: 'Normal', salt: 'Normal'
                }));
                render();
            }
        } catch (error) {
            console.error("Erro ao buscar atletas:", error);
        }
    },

    navigate(page) {
        this.currentPage = page;
        render();
    },

    showAthleteForm(athleteId = null) {
        this.editingAthleteId = athleteId;
        const modal = document.getElementById('athlete-modal');
        const form = document.getElementById('athlete-form');
        const modalTitle = document.getElementById('modal-title');

        if (athleteId) {
            const athlete = this.athletes.find(a => a.id === athleteId);
            modalTitle.textContent = 'Editar Atleta';
            form.firstName.value = athlete.name;
            document.getElementById('athlete-name').value = athlete.name;
            document.getElementById('athlete-dob').value = athlete.dob;
            document.getElementById('athlete-height').value = athlete.height;
            document.getElementById('athlete-weight').value = athlete.weight;
            document.getElementById('athlete-sex').value = athlete.sex;
            document.getElementById('athlete-sweating').value = athlete.sweating;
            document.getElementById('athlete-salt').value = athlete.salt;
        } else {
            modalTitle.textContent = 'Novo Atleta';
            form.reset();
        }

        modal.style.display = 'flex';
    },

    closeAthleteForm() {
        document.getElementById('athlete-modal').style.display = 'none';
        this.editingAthleteId = null;
    },

    async addAthlete(data) {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const payload = {
                name: data.name,
                email: data.email || 'novoatleta_' + Date.now() + '@email.com',
                password: 'password123',
                role: 'ATHLETE',
            };
            const response = await fetch("http://localhost:3333/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });
            if (response.ok) {
                this.closeAthleteForm();
                await this.fetchAthletes();
            } else {
                const err = await response.json();
                alert(err.error || "Erro ao adicionar atleta.");
            }
        } catch (error) {
            console.error("Erro ao adicionar:", error);
            alert("Erro ao conectar com a API.");
        }
    },

    async updateAthlete(id, data) {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const existingAthlete = this.athletes.find(a => a.id === id);
            const payload = {
                name: data.name,
                email: existingAthlete?.email || 'atleta_' + id + '@email.com',
                role: 'ATHLETE',
            };
            const response = await fetch(`http://localhost:3333/users/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });
            if (response.ok) {
                this.closeAthleteForm();
                await this.fetchAthletes();
            } else {
                const err = await response.json();
                alert(err.error || "Erro ao atualizar atleta.");
            }
        } catch (error) {
            console.error("Erro ao atualizar:", error);
            alert("Erro ao conectar com a API.");
        }
    },

    async deleteAthlete(id) {
        if (confirm('Tem certeza que deseja deletar este atleta?')) {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;
                const response = await fetch(`http://localhost:3333/users/${id}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.ok) {
                    await this.fetchAthletes();
                } else {
                    const err = await response.json();
                    alert(err.error || "Erro ao deletar atleta.");
                }
            } catch (error) {
                console.error("Erro ao deletar:", error);
                alert("Erro ao conectar com a API.");
            }
        }
    },

    searchAthletes(query) {
        if (!query) return this.athletes;
        return this.athletes.filter(a =>
            a.name.toLowerCase().includes(query.toLowerCase())
        );
    },

    logout() {
        this.currentUser = null;
        this.userType = null;
        this.currentPage = 'dashboard';
        this.athleteEvaluations = [];
        render();
    },

    deleteEvaluation(index) {
        if (confirm('Tem certeza que deseja deletar esta avaliação?')) {
            this.athleteEvaluations.splice(index, 1);
            render();
        }
    },

    async login(email, password, userType) {
        try {
            const response = await fetch("http://localhost:3333/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Erro ao realizar login");
                return;
            }
            
            const userRole = data.user.role === 'NUTRITIONIST' ? 'nutritionist' : 'athlete';
            
            if (userType !== userRole) {
                const correctProfile = userRole === 'athlete' ? 'Atleta' : 'Nutricionista';
                alert(`Acesso negado. O perfil escolhido foi ${userType === 'athlete' ? 'Atleta' : 'Nutricionista'}, mas a conta é de ${correctProfile}.`);
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            this.currentUser = data.user;
            this.userType = userType;
            this.currentPage = "dashboard";

            render();
            this.fetchAthletes();
        } catch (error) {
            console.error("Erro ao conectar com a API:", error);
            alert("Não foi possível conectar ao servidor.");
        }
    }
};

// Render function
function render() {
    const app = document.getElementById('app');

    if (!appState.currentUser) {
        // Render login page
        const template = document.getElementById('login-template');
        const clone = template.content.cloneNode(true);
        app.innerHTML = '';
        app.appendChild(clone);
        setupLoginHandlers();
    } else {
        // Render main layout
        const template = document.getElementById('main-layout-template');
        const clone = template.content.cloneNode(true);
        app.innerHTML = '';
        app.appendChild(clone);
        setupMainLayout();
    }
}

// Setup login handlers
function setupLoginHandlers() {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const userType = document.getElementById('user-type').value;
        appState.login(email, password, userType);
    });
}

// Setup main layout handlers
function setupMainLayout() {
    // Update page title
    updatePageTitle();

    // Setup navigation with user type filtering
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        // Show/hide based on user type
        if (item.classList.contains('nutritionist-only')) {
            item.style.display = appState.userType === 'nutritionist' ? 'flex' : 'none';
        } else if (item.classList.contains('athlete-only')) {
            item.style.display = appState.userType === 'athlete' ? 'flex' : 'none';
        }

        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            setActivePage(page);
            appState.navigate(page);
        });
    });

    // Setup logout
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
        appState.logout();
    });

    // Render content for current page
    renderPageContent();

    // Setup page-specific handlers
    setupPageHandlers();
}

// Update page title
function updatePageTitle() {
    const pageNames = {
        dashboard: 'Dashboard',
        athletes: 'Atletas',
        manual: 'Manual Operacional',
        terms: 'Termos de Uso',
        settings: 'Configurações'
    };

    const pageTitle = document.getElementById('page-title');
    pageTitle.textContent = pageNames[appState.currentPage];
}

// Set active navigation item
function setActivePage(page) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.dataset.page === page) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Render page content
function renderPageContent() {
    const contentArea = document.getElementById('content-area');
    const templateId = `${appState.currentPage}-template`;
    const template = document.getElementById(templateId);

    if (template) {
        const clone = template.content.cloneNode(true);
        contentArea.innerHTML = '';
        contentArea.appendChild(clone);
    }
}

// Setup page-specific handlers
function setupPageHandlers() {
    const page = appState.currentPage;

    if (page === 'athletes') {
        setupAthletesHandlers();
    } else if (page === 'evaluation') {
        setupEvaluationHandlers();
    } else if (page === 'settings') {
        setupSettingsHandlers();
    }
}

// Athletes page handlers
function setupAthletesHandlers() {
    // Render athletes list
    renderAthletesList();

    // Setup search
    const searchInput = document.getElementById('athlete-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            renderAthletesList(query);
        });
    }

    // Setup athlete form submission
    const athleteForm = document.getElementById('athlete-form');
    if (athleteForm) {
        athleteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = {
                name: document.getElementById('athlete-name').value,
                dob: document.getElementById('athlete-dob').value,
                height: parseFloat(document.getElementById('athlete-height').value),
                weight: parseFloat(document.getElementById('athlete-weight').value),
                sex: document.getElementById('athlete-sex').value,
                sweating: document.getElementById('athlete-sweating').value,
                salt: document.getElementById('athlete-salt').value,
                diseases: document.getElementById('athlete-diseases').value,
                calipers: document.getElementById('athlete-calipers').value,
                hydration: document.getElementById('athlete-hydration').value,
                symptoms: document.getElementById('athlete-symptoms').value,
                diuretics: document.getElementById('athlete-diuretics').value,
            };

            if (appState.editingAthleteId) {
                appState.updateAthlete(appState.editingAthleteId, formData);
            } else {
                appState.addAthlete(formData);
            }
        });
    }

    // Close modal on background click
    const modal = document.getElementById('athlete-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                appState.closeAthleteForm();
            }
        });
    }
}

// Render athletes list
function renderAthletesList(query = '') {
    const athletesList = document.getElementById('athletes-list');
    const athletes = query ? appState.searchAthletes(query) : appState.athletes;

    athletesList.innerHTML = '';
    athletes.forEach(athlete => {
        const initials = athlete.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const athleteCard = document.createElement('div');
        athleteCard.className = 'athlete-card';
        athleteCard.innerHTML = `
            <div class="athlete-avatar">${initials}</div>
            <div class="athlete-card-name">${athlete.name}</div>
            <div class="athlete-card-actions">
                <button class="btn btn-outline btn-sm" onclick="appState.showAthleteForm(${athlete.id})">Editar</button>
                <button class="btn btn-outline btn-sm" onclick="appState.deleteAthlete(${athlete.id})" style="color: var(--danger-color); border-color: var(--danger-color);">Deletar</button>
            </div>
        `;
        athletesList.appendChild(athleteCard);
    });
}

// Evaluation page handlers (for athletes)
function setupEvaluationHandlers() {
    const evaluationForm = document.getElementById('evaluation-form');
    const evaluationsList = document.getElementById('athlete-evaluations-list');

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('eval-date').value = today;

    // Display previous evaluations if any
    if (appState.athleteEvaluations.length > 0) {
        evaluationsList.innerHTML = '';
        appState.athleteEvaluations.forEach((eval, index) => {
            const evalItem = document.createElement('div');
            evalItem.className = 'evaluation-item';
            evalItem.innerHTML = `
                <div class="athlete-name">Avaliação ${appState.athleteEvaluations.length - index}</div>
                <div class="evaluation-date">${eval.date}</div>
                <div class="eval-weight">Peso: ${eval.weight} kg</div>
                <button class="btn btn-outline btn-sm" onclick="appState.deleteEvaluation(${index})">Remover</button>
            `;
            evaluationsList.appendChild(evalItem);
        });
    } else {
        evaluationsList.innerHTML = '<p style="text-align: center; color: var(--gray-500);">Nenhuma avaliação anterior</p>';
    }

    // Handle form submission
    if (evaluationForm) {
        evaluationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const evaluation = {
                date: document.getElementById('eval-date').value,
                weight: parseFloat(document.getElementById('eval-weight').value),
                sweating: document.getElementById('eval-sweating').value,
                salt: document.getElementById('eval-salt').value,
                hydration: document.getElementById('eval-hydration').value,
                symptoms: document.getElementById('eval-symptoms').value,
                diuretics: document.getElementById('eval-diuretics').value,
            };

            appState.athleteEvaluations.push(evaluation);
            alert('Avaliação enviada com sucesso!');
            evaluationForm.reset();
            document.getElementById('eval-date').value = today;
            setupEvaluationHandlers(); // Refresh the list
        });
    }
}

// Settings page handlers
function setupSettingsHandlers() {
    const themeSelect = document.getElementById('theme-select');
    const notificationsCheckbox = document.getElementById('notifications');

    // Load saved preferences from localStorage
    if (themeSelect) {
        themeSelect.value = appState.theme;
        themeSelect.addEventListener('change', (e) => {
            appState.theme = e.target.value;
            localStorage.setItem('theme', e.target.value);
            applyTheme(e.target.value);
        });
    }

    if (notificationsCheckbox) {
        notificationsCheckbox.checked = localStorage.getItem('notifications') !== 'false';
        notificationsCheckbox.addEventListener('change', (e) => {
            localStorage.setItem('notifications', e.target.checked);
        });
    }

    // Setup save button
    const saveBtn = document.querySelector('.settings-section:last-child .btn-primary');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            alert('Preferências salvas com sucesso!');
        });
    }

    // Setup change password button
    const changePasswordBtn = document.querySelector('.settings-section:first-child .btn-secondary');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            const newPassword = prompt('Digite sua nova senha:');
            if (newPassword) {
                alert('Senha alterado com sucesso!');
            }
        });
    }
}

// Apply theme
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Apply saved theme
    applyTheme(appState.theme);
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
        try {
            appState.currentUser = JSON.parse(user);
            appState.userType = appState.currentUser.role === 'NUTRITIONIST' ? 'nutritionist' : 'athlete';
            appState.fetchAthletes();
        } catch (e) {
            console.error("Erro ao ler userInfo do cache", e);
        }
    }
    
    render();
});

// Keep global reference to appState for inline onclick handlers
window.appState = appState;
