// ============================================================
// ПОРТАЛ УЧУСЬ.РФ - Полная логика приложения
// ============================================================

// ---- Хранилище данных ----
const STORAGE_KEYS = {
    USERS: 'uchus_users',
    APPLICATIONS: 'uchus_applications',
    CURRENT_USER: 'uchus_current_user',
    REVIEWS: 'uchus_reviews'
};

// ---- Вспомогательные функции ----
function getData(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
}

function setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getUsers() { return getData(STORAGE_KEYS.USERS); }
function setUsers(u) { setData(STORAGE_KEYS.USERS, u); }
function getApps() { return getData(STORAGE_KEYS.APPLICATIONS); }
function setApps(a) { setData(STORAGE_KEYS.APPLICATIONS, a); }
function getReviews() { return getData(STORAGE_KEYS.REVIEWS); }
function setReviews(r) { setData(STORAGE_KEYS.REVIEWS, r); }

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
    } catch {
        return null;
    }
}

function setCurrentUser(u) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(u));
}

function clearCurrentUser() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// ---- Инициализация демо-данных ----
function initDemoData() {
    if (getUsers().length === 0) {
        setUsers([
            { id: 1, login: 'user1', password: 'password123', fullname: 'Иванов Иван', phone: '+7 999 123-45-67', email: 'ivan@mail.ru' },
            { id: 2, login: 'user2', password: 'password123', fullname: 'Петрова Анна', phone: '+7 999 234-56-78', email: 'anna@mail.ru' }
        ]);
    }
    if (getApps().length === 0) {
        setApps([
            { id: 1, userId: 1, course: 'Повышение квалификации', date: '15.06.2026', payment: 'Предоплата по QR-коду', status: 'Новая', createdAt: '2026-06-10' },
            { id: 2, userId: 1, course: 'Охрана труда', date: '01.07.2026', payment: 'Оплата картой МИР', status: 'Идет обучение', createdAt: '2026-06-12' },
            { id: 3, userId: 2, course: 'Профессиональная переподготовка', date: '10.08.2026', payment: 'Постоплата в офисе', status: 'Обучение завершено', createdAt: '2026-06-01' }
        ]);
    }
    if (getReviews().length === 0) {
        setReviews([
            { appId: 3, userId: 2, text: 'Отличный курс! Всё было понятно и структурировано.', rating: 5 }
        ]);
    }
}

// ---- Генерация ID ----
function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

// ---- Навигация ----
function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`page-${page}`);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-btn[data-page]').forEach(b => b.classList.remove('active'));
    const navBtn = document.querySelector(`.nav-btn[data-page="${page}"]`);
    if (navBtn) navBtn.classList.add('active');

    const user = getCurrentUser();
    const isLoggedIn = !!user;
    const isAdmin = isLoggedIn && user.login === 'Admin26';

    document.getElementById('navLogin').style.display = isLoggedIn ? 'none' : 'inline-flex';
    document.getElementById('navRegister').style.display = isLoggedIn ? 'none' : 'inline-flex';
    document.getElementById('navDashboard').style.display = isLoggedIn && !isAdmin ? 'inline-flex' : 'none';
    document.getElementById('navAdmin').style.display = isAdmin ? 'inline-flex' : 'none';
    document.getElementById('navLogout').style.display = isLoggedIn ? 'inline-flex' : 'none';

    if (isAdmin && page !== 'admin') {
        document.getElementById('navAdmin').style.display = 'inline-flex';
    }
}

// ---- Показать уведомление ----
function showNotification(title, message) {
    const modal = document.getElementById('notificationModal');
    document.getElementById('notifTitle').textContent = title;
    document.getElementById('notifMessage').textContent = message;
    modal.classList.add('show');
}

function hideNotification() {
    document.getElementById('notificationModal').classList.remove('show');
}

// ---- Валидация ----
function validateLogin(login) {
    const regex = /^[a-zA-Z0-9]{6,}$/;
    return regex.test(login);
}

function validatePassword(password) {
    return password.length >= 8;
}

function validatePhone(phone) {
    return phone.replace(/[\s\-\(\)\+]/g, '').length >= 10;
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateDate(date) {
    const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    if (!regex.test(date)) return false;
    const [_, day, month, year] = date.match(regex);
    const d = new Date(+year, +month - 1, +day);
    return d.getFullYear() === +year && d.getMonth() === +month - 1 && d.getDate() === +day;
}

// ---- Регистрация ----
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const login = document.getElementById('regLogin').value.trim();
    const password = document.getElementById('regPassword').value;
    const fullname = document.getElementById('regFullname').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const email = document.getElementById('regEmail').value.trim();

    let valid = true;

    if (!validateLogin(login)) {
        document.getElementById('regLoginError').textContent = 'Логин должен содержать минимум 6 символов (латиница и цифры)';
        document.getElementById('regLogin').classList.add('error');
        valid = false;
    } else {
        document.getElementById('regLoginError').textContent = '';
        document.getElementById('regLogin').classList.remove('error');
    }

    if (!validatePassword(password)) {
        document.getElementById('regPasswordError').textContent = 'Пароль должен быть минимум 8 символов';
        document.getElementById('regPassword').classList.add('error');
        valid = false;
    } else {
        document.getElementById('regPasswordError').textContent = '';
        document.getElementById('regPassword').classList.remove('error');
    }

    if (fullname.length < 3) {
        document.getElementById('regFullnameError').textContent = 'Введите полное ФИО';
        document.getElementById('regFullname').classList.add('error');
        valid = false;
    } else {
        document.getElementById('regFullnameError').textContent = '';
        document.getElementById('regFullname').classList.remove('error');
    }

    if (!validatePhone(phone)) {
        document.getElementById('regPhoneError').textContent = 'Введите корректный номер телефона';
        document.getElementById('regPhone').classList.add('error');
        valid = false;
    } else {
        document.getElementById('regPhoneError').textContent = '';
        document.getElementById('regPhone').classList.remove('error');
    }

    if (!validateEmail(email)) {
        document.getElementById('regEmailError').textContent = 'Введите корректный email';
        document.getElementById('regEmail').classList.add('error');
        valid = false;
    } else {
        document.getElementById('regEmailError').textContent = '';
        document.getElementById('regEmail').classList.remove('error');
    }

    const users = getUsers();
    if (users.some(u => u.login === login)) {
        document.getElementById('regLoginError').textContent = 'Этот логин уже занят';
        document.getElementById('regLogin').classList.add('error');
        valid = false;
    }

    if (!valid) return;

    const newUser = {
        id: generateId(),
        login,
        password,
        fullname,
        phone,
        email
    };
    users.push(newUser);
    setUsers(users);

    showNotification('Регистрация успешна!', `Добро пожаловать, ${fullname}! Теперь вы можете войти.`);
    this.reset();
    document.querySelectorAll('.form-group input').forEach(el => el.classList.remove('error'));
    navigateTo('login');
});

// ---- Авторизация ----
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const login = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    document.getElementById('loginUsernameError').textContent = '';
    document.getElementById('loginPasswordError').textContent = '';
    document.getElementById('loginUsername').classList.remove('error');
    document.getElementById('loginPassword').classList.remove('error');

    if (login === 'Admin26' && password === 'Demo20') {
        setCurrentUser({ id: 0, login: 'Admin26', fullname: 'Администратор', isAdmin: true });
        navigateTo('admin');
        renderAdminPanel();
        showNotification('Вход выполнен', 'Добро пожаловать в панель администратора!');
        this.reset();
        return;
    }

    const users = getUsers();
    const user = users.find(u => u.login === login && u.password === password);

    if (user) {
        setCurrentUser({ ...user, isAdmin: false });
        navigateTo('dashboard');
        renderDashboard();
        showNotification('Вход выполнен', `Добро пожаловать, ${user.fullname}!`);
        this.reset();
    } else {
        document.getElementById('loginUsernameError').textContent = 'Неверный логин или пароль';
        document.getElementById('loginUsername').classList.add('error');
        document.getElementById('loginPassword').classList.add('error');
    }
});

// ---- Выход ----
document.getElementById('navLogout').addEventListener('click', function() {
    clearCurrentUser();
    navigateTo('login');
    showNotification('Выход выполнен', 'Вы вышли из системы.');
});

// ---- Навигационные ссылки ----
document.querySelectorAll('.link-btn[data-page], .nav-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', function() {
        const page = this.dataset.page;
        const user = getCurrentUser();
        if (page === 'dashboard' && !user) {
            showNotification('Ошибка', 'Сначала войдите в систему.');
            return;
        }
        if (page === 'admin') {
            if (user && user.login === 'Admin26') {
                navigateTo('admin');
                renderAdminPanel();
            } else {
                showNotification('Доступ запрещён', 'Только для администратора.');
            }
            return;
        }
        navigateTo(page);
        if (page === 'dashboard') renderDashboard();
        if (page === 'login' || page === 'register') {
            document.getElementById('navLogin').style.display = 'inline-flex';
            document.getElementById('navRegister').style.display = 'inline-flex';
        }
    });
});

// ---- Оформление заявки ----
document.getElementById('newApplicationBtn').addEventListener('click', function() {
    navigateTo('application');
    document.getElementById('applicationForm').reset();
    document.querySelectorAll('#applicationForm .error-message').forEach(el => el.textContent = '');
});

document.getElementById('appCancelBtn').addEventListener('click', function() {
    navigateTo('dashboard');
    renderDashboard();
});

document.getElementById('applicationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) {
        showNotification('Ошибка', 'Вы не авторизованы.');
        return;
    }

    const course = document.getElementById('appCourse').value;
    const date = document.getElementById('appDate').value.trim();
    const payment = document.getElementById('appPayment').value;

    let valid = true;

    if (!course) {
        document.getElementById('appCourseError').textContent = 'Выберите курс';
        valid = false;
    } else {
        document.getElementById('appCourseError').textContent = '';
    }

    if (!validateDate(date)) {
        document.getElementById('appDateError').textContent = 'Введите дату в формате ДД.ММ.ГГГГ';
        valid = false;
    } else {
        document.getElementById('appDateError').textContent = '';
    }

    if (!payment) {
        document.getElementById('appPaymentError').textContent = 'Выберите способ оплаты';
        valid = false;
    } else {
        document.getElementById('appPaymentError').textContent = '';
    }

    if (!valid) return;

    const apps = getApps();
    const newApp = {
        id: generateId(),
        userId: user.id,
        course,
        date,
        payment,
        status: 'Новая',
        createdAt: new Date().toISOString().split('T')[0]
    };
    apps.push(newApp);
    setApps(apps);

    showNotification('Заявка отправлена!', `Заявка на курс "${course}" отправлена на согласование.`);
    this.reset();
    navigateTo('dashboard');
    renderDashboard();
});

// ---- Рендер личного кабинета ----
function renderDashboard() {
    const user = getCurrentUser();
    if (!user) return;
    document.getElementById('userName').textContent = user.fullname;

    const apps = getApps();
    const userApps = apps.filter(a => a.userId === user.id);
    const reviews = getReviews();

    const container = document.getElementById('applicationsList');

    if (userApps.length === 0) {
        container.innerHTML = '<p class="empty-message">У вас пока нет заявок. Создайте новую!</p>';
        return;
    }

    container.innerHTML = '';
    userApps.sort((a, b) => b.id - a.id).forEach(app => {
        const hasReview = reviews.some(r => r.appId === app.id);
        const div = document.createElement('div');
        div.className = 'application-item';
        div.style.borderLeftColor = app.status === 'Новая' ? '#007bff' :
                                    app.status === 'Идет обучение' ? '#ffc107' : '#28a745';

        let statusClass = 'status-new';
        if (app.status === 'Идет обучение') statusClass = 'status-active';
        if (app.status === 'Обучение завершено') statusClass = 'status-completed';

        div.innerHTML = `
            <div class="app-info">
                <strong>${app.course}</strong>
                <div class="app-meta">
                    <span>${app.date}</span>
                    <span>${app.payment}</span>
                    <span>${app.createdAt}</span>
                </div>
            </div>
            <span class="app-status ${statusClass}">${app.status}</span>
            <div class="app-actions">
                ${app.status === 'Обучение завершено' && !hasReview ? `
                    <button class="review-open-btn" data-appid="${app.id}" data-course="${app.course}">Отзыв</button>
                ` : ''}
                ${hasReview ? `<span style="color:#28a745;font-size:0.8rem;">Отзыв оставлен</span>` : ''}
            </div>
        `;
        container.appendChild(div);
    });

    document.querySelectorAll('.review-open-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const appId = parseInt(this.dataset.appid);
            const course = this.dataset.course;
            openReviewModal(appId, course);
        });
    });
}

// ---- Модальное окно отзыва ----
let currentReviewAppId = null;

function openReviewModal(appId, course) {
    currentReviewAppId = appId;
    document.getElementById('reviewAppId').textContent = appId;
    document.getElementById('reviewAppCourse').textContent = course;
    document.getElementById('reviewText').value = '';
    document.getElementById('reviewError').textContent = '';
    document.querySelectorAll('.rating-stars .star').forEach(el => {
        el.classList.remove('active');
    });
    document.getElementById('ratingValue').textContent = '0';
    document.getElementById('reviewModal').classList.add('show');
}

document.querySelector('.modal-close').addEventListener('click', function() {
    document.getElementById('reviewModal').classList.remove('show');
});

document.getElementById('reviewModal').addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('show');
});

// ---- Звёзды рейтинга ----
document.querySelectorAll('.rating-stars .star').forEach(star => {
    star.addEventListener('click', function() {
        const value = parseInt(this.dataset.value);
        document.querySelectorAll('.rating-stars .star').forEach(s => {
            if (parseInt(s.dataset.value) <= value) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
        document.getElementById('ratingValue').textContent = value;
    });
});

// ---- Отправка отзыва ----
document.getElementById('submitReviewBtn').addEventListener('click', function() {
    const text = document.getElementById('reviewText').value.trim();
    const rating = parseInt(document.getElementById('ratingValue').textContent) || 0;

    if (!text || text.length < 3) {
        document.getElementById('reviewError').textContent = 'Введите текст отзыва (минимум 3 символа)';
        return;
    }
    if (rating === 0) {
        document.getElementById('reviewError').textContent = 'Поставьте оценку';
        return;
    }
    document.getElementById('reviewError').textContent = '';

    const reviews = getReviews();
    reviews.push({
        appId: currentReviewAppId,
        userId: getCurrentUser().id,
        text,
        rating,
        createdAt: new Date().toISOString()
    });
    setReviews(reviews);

    document.getElementById('reviewModal').classList.remove('show');
    showNotification('Спасибо за отзыв!', 'Ваше мнение очень важно для нас.');
    renderDashboard();
});

// ---- Слайдер ----
let currentSlide = 0;
let slideInterval;

function initSlider() {
    const wrapper = document.getElementById('sliderWrapper');
    const dots = document.getElementById('sliderDots');
    const totalSlides = document.querySelectorAll('.slide').length;

    dots.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('span');
        dot.dataset.index = i;
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dots.appendChild(dot);
    }

    document.getElementById('sliderPrev').addEventListener('click', () => {
        clearInterval(slideInterval);
        goToSlide(currentSlide - 1);
        startSlider();
    });

    document.getElementById('sliderNext').addEventListener('click', () => {
        clearInterval(slideInterval);
        goToSlide(currentSlide + 1);
        startSlider();
    });

    goToSlide(0);
    startSlider();
}

function goToSlide(index) {
    const wrapper = document.getElementById('sliderWrapper');
    const total = document.querySelectorAll('.slide').length;
    currentSlide = (index + total) % total;
    wrapper.style.transform = `translateX(-${currentSlide * 100}%)`;

    document.querySelectorAll('.slider-dots span').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
    });
}

function startSlider() {
    clearInterval(slideInterval);
    slideInterval = setInterval(() => {
        goToSlide(currentSlide + 1);
    }, 3000);
}

// ---- Админ панель ----
let adminCurrentPage = 1;
const ITEMS_PER_PAGE = 5;
let adminFilteredApps = [];

function renderAdminPanel() {
    const user = getCurrentUser();
    if (!user || user.login !== 'Admin26') {
        navigateTo('login');
        return;
    }

    let apps = getApps();
    const users = getUsers();
    const reviews = getReviews();

    const statusFilter = document.getElementById('adminStatusFilter').value;
    const searchFilter = document.getElementById('adminSearchFilter').value.toLowerCase();

    adminFilteredApps = apps.filter(app => {
        const user = users.find(u => u.id === app.userId);
        const userName = user ? user.fullname : 'Неизвестный';
        if (statusFilter !== 'all' && app.status !== statusFilter) return false;
        if (searchFilter) {
            return userName.toLowerCase().includes(searchFilter) ||
                   app.course.toLowerCase().includes(searchFilter);
        }
        return true;
    });

    adminFilteredApps.sort((a, b) => b.id - a.id);

    const total = apps.length;
    const newCount = apps.filter(a => a.status === 'Новая').length;
    const activeCount = apps.filter(a => a.status === 'Идет обучение').length;
    const completedCount = apps.filter(a => a.status === 'Обучение завершено').length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statNew').textContent = newCount;
    document.getElementById('statActive').textContent = activeCount;
    document.getElementById('statCompleted').textContent = completedCount;

    const totalPages = Math.ceil(adminFilteredApps.length / ITEMS_PER_PAGE) || 1;
    if (adminCurrentPage > totalPages) adminCurrentPage = totalPages;
    const start = (adminCurrentPage - 1) * ITEMS_PER_PAGE;
    const pageApps = adminFilteredApps.slice(start, start + ITEMS_PER_PAGE);

    document.getElementById('pageInfo').textContent = `Страница ${adminCurrentPage} из ${totalPages}`;
    document.getElementById('pagePrev').disabled = adminCurrentPage <= 1;
    document.getElementById('pageNext').disabled = adminCurrentPage >= totalPages;

    const tbody = document.getElementById('adminTableBody');
    if (pageApps.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-message">Нет заявок для отображения</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    pageApps.forEach(app => {
        const user = users.find(u => u.id === app.userId);
        const userName = user ? user.fullname : 'Неизвестный';
        const hasReview = reviews.some(r => r.appId === app.id);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${app.id}</td>
            <td><strong>${userName}</strong></td>
            <td>${app.course}</td>
            <td>${app.date}</td>
            <td>
                <select class="status-select" data-appid="${app.id}">
                    <option value="Новая" ${app.status === 'Новая' ? 'selected' : ''}>Новая</option>
                    <option value="Идет обучение" ${app.status === 'Идет обучение' ? 'selected' : ''}>Идет обучение</option>
                    <option value="Обучение завершено" ${app.status === 'Обучение завершено' ? 'selected' : ''}>Обучение завершено</option>
                </select>
            </td>
            <td>
                ${hasReview ? `Оценка: ${reviews.find(r => r.appId === app.id)?.rating}/5` : 'Нет отзыва'}
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', function() {
            const appId = parseInt(this.dataset.appid);
            const newStatus = this.value;
            const apps = getApps();
            const app = apps.find(a => a.id === appId);
            if (app) {
                app.status = newStatus;
                setApps(apps);
                showNotification('Статус обновлён', `Заявка №${appId} теперь "${newStatus}"`);
                renderAdminPanel();
            }
        });
    });
}

// ---- Фильтры админа ----
document.getElementById('adminStatusFilter').addEventListener('change', renderAdminPanel);
document.getElementById('adminSearchFilter').addEventListener('input', renderAdminPanel);
document.getElementById('adminResetFilter').addEventListener('click', function() {
    document.getElementById('adminStatusFilter').value = 'all';
    document.getElementById('adminSearchFilter').value = '';
    adminCurrentPage = 1;
    renderAdminPanel();
});

// ---- Пагинация админа ----
document.getElementById('pagePrev').addEventListener('click', function() {
    if (adminCurrentPage > 1) {
        adminCurrentPage--;
        renderAdminPanel();
    }
});

document.getElementById('pageNext').addEventListener('click', function() {
    const totalPages = Math.ceil(adminFilteredApps.length / ITEMS_PER_PAGE);
    if (adminCurrentPage < totalPages) {
        adminCurrentPage++;
        renderAdminPanel();
    }
});

// ---- Сортировка таблицы ----
document.querySelectorAll('.admin-table th[data-sort]').forEach(th => {
    th.addEventListener('click', function() {
        const key = this.dataset.sort;
        const desc = this.dataset.dir === 'desc';
        adminFilteredApps.sort((a, b) => {
            let valA, valB;
            if (key === 'id') { valA = a.id; valB = b.id; }
            else if (key === 'user') {
                const users = getUsers();
                valA = (users.find(u => u.id === a.userId)?.fullname || '');
                valB = (users.find(u => u.id === b.userId)?.fullname || '');
            }
            else if (key === 'course') { valA = a.course; valB = b.course; }
            else if (key === 'date') { valA = a.date; valB = b.date; }
            else if (key === 'status') { valA = a.status; valB = b.status; }
            if (typeof valA === 'string') return desc ? valB.localeCompare(valA) : valA.localeCompare(valB);
            return desc ? valB - valA : valA - valB;
        });
        this.dataset.dir = desc ? 'asc' : 'desc';
        adminCurrentPage = 1;
        renderAdminPanel();
    });
});

// ---- Закрытие уведомления ----
document.getElementById('notifCloseBtn').addEventListener('click', hideNotification);
document.getElementById('notificationModal').addEventListener('click', function(e) {
    if (e.target === this) hideNotification();
});

// ---- Клик по логотипу ----
document.getElementById('logoLink').addEventListener('click', function(e) {
    e.preventDefault();
    const user = getCurrentUser();
    if (user) {
        if (user.login === 'Admin26') {
            navigateTo('admin');
            renderAdminPanel();
        } else {
            navigateTo('dashboard');
            renderDashboard();
        }
    } else {
        navigateTo('login');
    }
    showNotification('Учусь.РФ', 'Добро пожаловать на портал образования!');
});

document.querySelector('.footer-logo')?.addEventListener('click', function() {
    document.getElementById('logoLink').click();
});

// ---- Проверка авторизации при загрузке ----
function checkAuth() {
    const user = getCurrentUser();
    if (user) {
        if (user.login === 'Admin26') {
            navigateTo('admin');
            renderAdminPanel();
        } else {
            navigateTo('dashboard');
            renderDashboard();
        }
    } else {
        navigateTo('login');
    }
}

// ---- Инициализация ----
initDemoData();
initSlider();
checkAuth();

console.log('Портал Учусь.РФ загружен!');