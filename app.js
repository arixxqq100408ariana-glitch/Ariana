// ============================================================
// ПОРТАЛ УЧУСЬ.РФ - Полная логика приложения (многостраничный режим)
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

// ---- Генерация ID ----
function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

// ---- Перенаправление на страницу ----
function redirectTo(page) {
    window.location.href = page;
}

// ---- Показать уведомление ----
let notificationTimeoutId = null;

function showNotification(title, message, delay = 2500) {
    const modal = document.getElementById('notificationModal');
    if (!modal) {
        alert(title + '\n' + message);
        return;
    }
    document.getElementById('notifTitle').textContent = title;
    document.getElementById('notifMessage').textContent = message;
    modal.classList.add('show');
    
    if (notificationTimeoutId) {
        clearTimeout(notificationTimeoutId);
        notificationTimeoutId = null;
    }
    notificationTimeoutId = setTimeout(() => {
        hideNotification();
    }, delay);
}

function hideNotification() {
    const modal = document.getElementById('notificationModal');
    if (modal) modal.classList.remove('show');
    if (notificationTimeoutId) {
        clearTimeout(notificationTimeoutId);
        notificationTimeoutId = null;
    }
}

// ---- Проверка авторизации для защищённых страниц ----
function checkAuth() {
    const user = getCurrentUser();
    const currentPage = window.location.pathname.split('/').pop();
    
    const protectedPages = ['dashboard.html', 'application.html'];
    const adminPage = 'admin.html';
    
    // Если страница админа - пускаем всех (без проверки)
    if (currentPage === adminPage) {
        renderAdminPanel();
        return true;
    }
    
    if (protectedPages.includes(currentPage)) {
        if (!user) {
            showNotification('Ошибка', 'Сначала войдите в систему.', 2000);
            setTimeout(() => redirectTo('index.html'), 2200);
            return false;
        }
        if (currentPage === 'dashboard.html') {
            renderDashboard();
        }
        return true;
    }
    
    if ((currentPage === 'index.html' || currentPage === 'register.html' || currentPage === '') && user) {
        if (user.login === 'Admin26') {
            redirectTo('admin.html');
        } else {
            redirectTo('dashboard.html');
        }
        return false;
    }
    
    return true;
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

// ============================================================
// РЕГИСТРАЦИЯ (страница register.html)
// ============================================================
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
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

        showNotification('Регистрация успешна!', `Добро пожаловать, ${fullname}!`, 2000);
        registerForm.reset();
        document.querySelectorAll('.form-group input').forEach(el => el.classList.remove('error'));
        setTimeout(() => redirectTo('index.html'), 1500);
    });
}

// ============================================================
// АВТОРИЗАЦИЯ (страница index.html)
// ============================================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const login = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;

        document.getElementById('loginUsernameError').textContent = '';
        document.getElementById('loginPasswordError').textContent = '';
        document.getElementById('loginUsername').classList.remove('error');
        document.getElementById('loginPassword').classList.remove('error');

        if (login === 'Admin26' && password === 'Demo20') {
            setCurrentUser({ id: 0, login: 'Admin26', fullname: 'Администратор', isAdmin: true });
            loginForm.reset();
            redirectTo('admin.html');
            return;
        }

        const users = getUsers();
        const user = users.find(u => u.login === login && u.password === password);

        if (user) {
            setCurrentUser({ ...user, isAdmin: false });
            loginForm.reset();
            redirectTo('dashboard.html');
        } else {
            document.getElementById('loginUsernameError').textContent = 'Неверный логин или пароль';
            document.getElementById('loginUsername').classList.add('error');
            document.getElementById('loginPassword').classList.add('error');
        }
    });
}

// ============================================================
// ВЫХОД - МГНОВЕННЫЙ
// ============================================================
const logoutBtn = document.getElementById('navLogout');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        clearCurrentUser();
        redirectTo('index.html');
    });
}

// ============================================================
// ОФОРМЛЕНИЕ ЗАЯВКИ (страница application.html)
// ============================================================
const applicationForm = document.getElementById('applicationForm');
if (applicationForm) {
    applicationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const user = getCurrentUser();
        if (!user) {
            showNotification('Ошибка', 'Вы не авторизованы.', 2000);
            setTimeout(() => redirectTo('index.html'), 2200);
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

        showNotification('Заявка отправлена!', `Заявка на курс "${course}" отправлена на согласование.`, 2000);
        applicationForm.reset();
        setTimeout(() => redirectTo('dashboard.html'), 1500);
    });
}

// ============================================================
// ЛИЧНЫЙ КАБИНЕТ (страница dashboard.html)
// ============================================================
function renderDashboard() {
    const user = getCurrentUser();
    if (!user) {
        redirectTo('index.html');
        return;
    }
    
    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = user.fullname;

    const apps = getApps();
    const userApps = apps.filter(a => a.userId === user.id);
    const reviews = getReviews();

    const container = document.getElementById('applicationsList');
    if (!container) return;

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

// ============================================================
// МОДАЛЬНОЕ ОКНО ОТЗЫВА
// ============================================================
let currentReviewAppId = null;

function openReviewModal(appId, course) {
    currentReviewAppId = appId;
    const appIdEl = document.getElementById('reviewAppId');
    const courseEl = document.getElementById('reviewAppCourse');
    if (appIdEl) appIdEl.textContent = appId;
    if (courseEl) courseEl.textContent = course;
    
    const textEl = document.getElementById('reviewText');
    if (textEl) textEl.value = '';
    
    const errorEl = document.getElementById('reviewError');
    if (errorEl) errorEl.textContent = '';
    
    document.querySelectorAll('.rating-stars .star').forEach(el => {
        el.classList.remove('active');
    });
    
    const ratingEl = document.getElementById('ratingValue');
    if (ratingEl) ratingEl.textContent = '0';
    
    const modal = document.getElementById('reviewModal');
    if (modal) modal.classList.add('show');
}

const modalClose = document.querySelector('.modal-close');
if (modalClose) {
    modalClose.addEventListener('click', function() {
        const modal = document.getElementById('reviewModal');
        if (modal) modal.classList.remove('show');
    });
}

const reviewModal = document.getElementById('reviewModal');
if (reviewModal) {
    reviewModal.addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('show');
    });
}

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
        const ratingEl = document.getElementById('ratingValue');
        if (ratingEl) ratingEl.textContent = value;
    });
});

// ---- Отправка отзыва ----
const submitReviewBtn = document.getElementById('submitReviewBtn');
if (submitReviewBtn) {
    submitReviewBtn.addEventListener('click', function() {
        const text = document.getElementById('reviewText').value.trim();
        const rating = parseInt(document.getElementById('ratingValue').textContent) || 0;

        if (!text || text.length < 3) {
            const errorEl = document.getElementById('reviewError');
            if (errorEl) errorEl.textContent = 'Введите текст отзыва (минимум 3 символа)';
            return;
        }
        if (rating === 0) {
            const errorEl = document.getElementById('reviewError');
            if (errorEl) errorEl.textContent = 'Поставьте оценку';
            return;
        }

        const errorEl = document.getElementById('reviewError');
        if (errorEl) errorEl.textContent = '';

        const reviews = getReviews();
        reviews.push({
            appId: currentReviewAppId,
            userId: getCurrentUser().id,
            text,
            rating,
            createdAt: new Date().toISOString()
        });
        setReviews(reviews);

        const modal = document.getElementById('reviewModal');
        if (modal) modal.classList.remove('show');
        
        showNotification('Спасибо за отзыв!', 'Ваше мнение очень важно для нас.', 2000);
        renderDashboard();
    });
}

// ============================================================
// СЛАЙДЕР
// ============================================================
let currentSlide = 0;
let slideInterval;

function initSlider() {
    const wrapper = document.getElementById('sliderWrapper');
    if (!wrapper) return;
    
    const dots = document.getElementById('sliderDots');
    const totalSlides = document.querySelectorAll('.slide').length;

    if (dots) {
        dots.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('span');
            dot.dataset.index = i;
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dots.appendChild(dot);
        }
    }

    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            clearInterval(slideInterval);
            goToSlide(currentSlide - 1);
            startSlider();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            clearInterval(slideInterval);
            goToSlide(currentSlide + 1);
            startSlider();
        });
    }

    goToSlide(0);
    startSlider();
}

function goToSlide(index) {
    const wrapper = document.getElementById('sliderWrapper');
    if (!wrapper) return;
    
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

// ============================================================
// АДМИН-ПАНЕЛЬ (страница admin.html) - ДОСТУПНА ВСЕМ
// ============================================================
let adminCurrentPage = 1;
const ITEMS_PER_PAGE = 5;
let adminFilteredApps = [];

function renderAdminPanel() {
    // Убираем проверку на админа - пускаем всех
    let apps = getApps();
    const users = getUsers();
    const reviews = getReviews();

    const statusFilter = document.getElementById('adminStatusFilter');
    const searchFilter = document.getElementById('adminSearchFilter');
    
    const statusValue = statusFilter ? statusFilter.value : 'all';
    const searchValue = searchFilter ? searchFilter.value.toLowerCase() : '';

    adminFilteredApps = apps.filter(app => {
        const user = users.find(u => u.id === app.userId);
        const userName = user ? user.fullname : 'Неизвестный';
        if (statusValue !== 'all' && app.status !== statusValue) return false;
        if (searchValue) {
            return userName.toLowerCase().includes(searchValue) ||
                   app.course.toLowerCase().includes(searchValue);
        }
        return true;
    });

    adminFilteredApps.sort((a, b) => b.id - a.id);

    const total = apps.length;
    const newCount = apps.filter(a => a.status === 'Новая').length;
    const activeCount = apps.filter(a => a.status === 'Идет обучение').length;
    const completedCount = apps.filter(a => a.status === 'Обучение завершено').length;

    const statTotal = document.getElementById('statTotal');
    const statNew = document.getElementById('statNew');
    const statActive = document.getElementById('statActive');
    const statCompleted = document.getElementById('statCompleted');
    
    if (statTotal) statTotal.textContent = total;
    if (statNew) statNew.textContent = newCount;
    if (statActive) statActive.textContent = activeCount;
    if (statCompleted) statCompleted.textContent = completedCount;

    const totalPages = Math.ceil(adminFilteredApps.length / ITEMS_PER_PAGE) || 1;
    if (adminCurrentPage > totalPages) adminCurrentPage = totalPages;
    const start = (adminCurrentPage - 1) * ITEMS_PER_PAGE;
    const pageApps = adminFilteredApps.slice(start, start + ITEMS_PER_PAGE);

    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) pageInfo.textContent = `Страница ${adminCurrentPage} из ${totalPages}`;
    
    const pagePrev = document.getElementById('pagePrev');
    const pageNext = document.getElementById('pageNext');
    if (pagePrev) pagePrev.disabled = adminCurrentPage <= 1;
    if (pageNext) pageNext.disabled = adminCurrentPage >= totalPages;

    const tbody = document.getElementById('adminTableBody');
    if (!tbody) return;

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
                showNotification('Статус обновлён', `Заявка №${appId} теперь "${newStatus}"`, 2000);
                renderAdminPanel();
            }
        });
    });
}

// ---- Фильтры админа ----
const adminStatusFilter = document.getElementById('adminStatusFilter');
const adminSearchFilter = document.getElementById('adminSearchFilter');
const adminResetFilter = document.getElementById('adminResetFilter');

if (adminStatusFilter) adminStatusFilter.addEventListener('change', renderAdminPanel);
if (adminSearchFilter) adminSearchFilter.addEventListener('input', renderAdminPanel);
if (adminResetFilter) {
    adminResetFilter.addEventListener('click', function() {
        if (adminStatusFilter) adminStatusFilter.value = 'all';
        if (adminSearchFilter) adminSearchFilter.value = '';
        adminCurrentPage = 1;
        renderAdminPanel();
    });
}

// ---- Пагинация админа ----
const pagePrev = document.getElementById('pagePrev');
const pageNext = document.getElementById('pageNext');

if (pagePrev) {
    pagePrev.addEventListener('click', function() {
        if (adminCurrentPage > 1) {
            adminCurrentPage--;
            renderAdminPanel();
        }
    });
}

if (pageNext) {
    pageNext.addEventListener('click', function() {
        const totalPages = Math.ceil(adminFilteredApps.length / ITEMS_PER_PAGE);
        if (adminCurrentPage < totalPages) {
            adminCurrentPage++;
            renderAdminPanel();
        }
    });
}

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
const notifCloseBtn = document.getElementById('notifCloseBtn');
if (notifCloseBtn) {
    notifCloseBtn.addEventListener('click', function() {
        hideNotification();
    });
}

const notificationModal = document.getElementById('notificationModal');
if (notificationModal) {
    notificationModal.addEventListener('click', function(e) {
        if (e.target === this) hideNotification();
    });
}

// ============================================================
// КРАСИВОЕ МОДАЛЬНОЕ ОКНО ПРИ КЛИКЕ НА ЛОГОТИП
// ============================================================
function showLogoModal() {
    const modal = document.getElementById('notificationModal');
    if (!modal) return;
    
    const icon = document.getElementById('notifIcon');
    if (icon) {
        icon.textContent = '🎓';
        icon.style.fontSize = '4rem';
        icon.style.display = 'block';
        icon.style.marginBottom = '12px';
    }
    
    document.getElementById('notifTitle').textContent = 'Учусь.РФ';
    document.getElementById('notifTitle').style.color = '#007bff';
    document.getElementById('notifTitle').style.fontSize = '28px';
    
    document.getElementById('notifMessage').textContent = 'Добро пожаловать на портал образования! Здесь вы найдёте курсы повышения квалификации, переподготовки и охраны труда.';
    document.getElementById('notifMessage').style.fontSize = '16px';
    document.getElementById('notifMessage').style.lineHeight = '1.6';
    
    modal.classList.add('show');
    
    if (notificationTimeoutId) {
        clearTimeout(notificationTimeoutId);
        notificationTimeoutId = null;
    }
    notificationTimeoutId = setTimeout(() => {
        hideNotification();
        const iconEl = document.getElementById('notifIcon');
        if (iconEl) {
            iconEl.style.fontSize = '';
            iconEl.style.display = '';
            iconEl.style.marginBottom = '';
        }
        document.getElementById('notifTitle').style.color = '';
        document.getElementById('notifTitle').style.fontSize = '';
        document.getElementById('notifMessage').style.fontSize = '';
        document.getElementById('notifMessage').style.lineHeight = '';
    }, 4000);
}

// ---- Клик по логотипу ----
const logoLink = document.getElementById('logoLink');
if (logoLink) {
    logoLink.addEventListener('click', function(e) {
        e.preventDefault();
        const user = getCurrentUser();
        showLogoModal();
        setTimeout(() => {
            if (user) {
                if (user.login === 'Admin26') {
                    redirectTo('admin.html');
                } else {
                    redirectTo('dashboard.html');
                }
            } else {
                redirectTo('index.html');
            }
        }, 2000);
    });
}

// ---- Клик по логотипу в футере ----
const footerLogo = document.querySelector('.footer-logo');
if (footerLogo) {
    footerLogo.addEventListener('click', function() {
        const user = getCurrentUser();
        showLogoModal();
        setTimeout(() => {
            if (user) {
                if (user.login === 'Admin26') {
                    redirectTo('admin.html');
                } else {
                    redirectTo('dashboard.html');
                }
            } else {
                redirectTo('index.html');
            }
        }, 2000);
    });
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================

// Инициализация демо-данных
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

// Запуск
initDemoData();
initSlider();
checkAuth();

console.log('Портал Учусь.РФ загружен!');