const STUDENT_STORAGE_KEY = "math-student-profile";
const LAST_RESULT_STORAGE_KEY = "milliy-last-result";
const RESULTS_BY_SUBJECT_STORAGE_KEY = "milliy-results-by-subject";
const FEEDBACK_STORAGE_KEY = "milliy-feedback-list";
const VISITOR_ID_STORAGE_KEY = "milliy-visitor-id";
const REGISTRATION_SUCCESS_KEY = "milliy-registration-success";
const ACTIVE_SECTION_STORAGE_KEY = "milliy-dashboard-active-section";
const SESSION_HEARTBEAT_MS = 1000 * 60;
const NOTIFICATIONS_REFRESH_MS = 1000 * 30;
const API_BASE_URL = getApiBaseUrl();

const SUBJECTS = {
    "mother-tongue": {
        id: "mother-tongue",
        label: "Ona tili",
        file: "data/mother-tongue.json",
        durationSeconds: 10800,
        questionSummary: "44 ta: 1-35 yopiq, 36-44 ochiq"
    },
    math: {
        id: "math",
        label: "Matematika",
        file: "data/math.json",
        durationSeconds: 10800,
        questionSummary: "45 ta: 1-35 yopiq, 36-45 ochiq"
    },
    chemistry: {
        id: "chemistry",
        label: "Kimyo",
        file: "data/chemistry.json",
        durationSeconds: 10800,
        questionSummary: "43 ta: 1-35 yopiq, 36-43 ochiq"
    },
    biology: {
        id: "biology",
        label: "Biologiya",
        file: "data/biology.json",
        durationSeconds: 10800,
        questionSummary: "43 ta: 1-35 yopiq, 36-40 ochiq, 41-43 yozma ish"
    },
    history: {
        id: "history",
        label: "Tarix",
        file: "data/history.json",
        durationSeconds: 10800,
        questionSummary: "45 ta: 1-35 yopiq, 36-45 ochiq"
    },
    physics: {
        id: "physics",
        label: "Fizika",
        file: "data/physics.json",
        durationSeconds: 10800,
        questionSummary: "45 ta: 1-35 yopiq, 36-45 ochiq"
    }
};

const DISCUSSION_CHANNELS = [
    {
        id: "general-tests",
        label: "Testlar tahlili",
        description: "Barcha fan testlari bo'yicha umumiy suhbat va tahlil"
    },
    {
        id: "universities",
        label: "OTM universitetlar",
        description: "Universitetlar, kirish ballari va yo'nalishlar bo'yicha ma'lumotlar"
    }
];

const LEGACY_UNIVERSITY_INFO = [
    {
        title: "🥇 Eng TOP universitetlar",
        subtitle: "Eng yuqori ball talab qiladigan OTMlar",
        items: [
            { name: "O‘zbekiston Milliy Universiteti (NUU)", grant: "170 - 190+", contract: "130 - 180" },
            { name: "Jahon iqtisodiyoti va diplomatiya universiteti (UWED)", grant: "185 - 189", contract: "170 - 185" },
            { name: "Toshkent davlat yuridik universiteti", grant: "180 - 189", contract: "150 - 180" },
            { name: "Toshkent davlat iqtisodiyot universiteti", grant: "170 - 185", contract: "130 - 160" },
            { name: "INHA University in Tashkent", grant: "150 - 180", contract: "120 - 160" }
        ]
    },
    {
        title: "💻 Texnika va IT yo‘nalishlari",
        subtitle: "Texnik va IT yo'nalishlari uchun kuchli variantlar",
        items: [
            { name: "TATU (Axborot texnologiyalari universiteti)", grant: "165 - 185", contract: "120 - 150" },
            { name: "Turin Polytechnic University in Tashkent", grant: "160 - 180", contract: "120 - 150" },
            { name: "Toshkent davlat transport universiteti", grant: "120 - 140", contract: "100 - 115" },
            { name: "Toshkent davlat texnika universiteti", grant: "150 - 170", contract: "100 - 130" },
            { name: "Andijon davlat texnika instituti", grant: "155 - 165", contract: "80 - 105" }
        ]
    },
    {
        title: "📊 Iqtisod / Bank / Biznes",
        subtitle: "Moliya va biznes yo'nalishlari",
        items: [
            { name: "Bank-moliya akademiyasi", grant: "170 - 185", contract: "130 - 160" },
            { name: "TDIU Samarqand filiali", grant: "170 - 176", contract: "120 - 130" },
            { name: "Farg‘ona davlat texnika universiteti", grant: "170 - 175", contract: "110 - 120" }
        ]
    },
    {
        title: "🌍 Xalqaro / Til / Diplomatiya",
        subtitle: "Til, turizm va diplomatiya yo'nalishlari",
        items: [
            { name: "O‘zbekiston davlat jahon tillari universiteti", grant: "170 - 185", contract: "130 - 170" },
            { name: "Ipak yo‘li xalqaro turizm universiteti", grant: "180 - 187", contract: "145 - 150" }
        ]
    },
    {
        title: "🏫 Pedagogika va umumiy universitetlar",
        subtitle: "Keng tarqalgan davlat universitetlari",
        items: [
            { name: "Nizomiy nomidagi TDPU", grant: "150 - 170", contract: "110 - 140" },
            { name: "Andijon davlat universiteti", grant: "155 - 165", contract: "75 - 100" },
            { name: "Farg‘ona davlat universiteti", grant: "150 - 165", contract: "90 - 120" },
            { name: "Namangan davlat universiteti", grant: "145 - 160", contract: "85 - 115" },
            { name: "Samarqand davlat universiteti", grant: "155 - 175", contract: "110 - 140" }
        ]
    },
    {
        title: "⚙️ Boshqa muhim OTMlar",
        subtitle: "Qo'shimcha muhim universitetlar",
        items: [
            { name: "Qarshi davlat universiteti" },
            { name: "Termiz davlat universiteti" },
            { name: "Buxoro davlat universiteti", grant: "170 - 180", contract: "100 - 130" },
            { name: "Jizzax politexnika instituti" },
            { name: "Navoiy konchilik instituti" },
            { name: "Qarshi muhandislik-iqtisodiyot instituti" },
            { name: "Guliston davlat universiteti" },
            { name: "Qoraqalpoq davlat universiteti" },
            { name: "Toshkent kimyo-texnologiya instituti" },
            { name: "Toshkent arxitektura-qurilish instituti" }
        ]
    }
];

const UNIVERSITY_INFO = [
    { id: 1, name: "Toshkent Davlat Yuridik Universiteti", grant: "170-186", contract: "150-180", aliases: ["Toshkent davlat yuridik universiteti"] },
    { id: 2, name: "Toshkent Tibbiyot Akademiyasi", grant: "165-186", contract: "140-180" },
    {
        id: 3,
        name: "TATU (Axborot texnologiyalari)",
        grant: "150-180",
        contract: "130-170",
        aliases: [
            "Muhammad al-Xorazmiy nomidagi Toshkent Axborot Texnologiyalari Universiteti",
            "TATU (Axborot texnologiyalari universiteti)"
        ]
    },
    { id: 4, name: "Jahon Iqtisodiyoti va Diplomatiya Univ.", grant: "160-185", contract: "140-175", aliases: ["Jahon Iqtisodiyoti va Diplomatiya Universiteti"] },
    { id: 5, name: "Toshkent Moliya Instituti", grant: "150-175", contract: "130-165" },
    { id: 6, name: "Toshkent Davlat Iqtisodiyot Univ.", grant: "140-170", contract: "120-160", aliases: ["Toshkent Davlat Iqtisodiyot Universiteti"] },
    { id: 7, name: "O‘zbekiston Milliy Universiteti", grant: "130-165", contract: "110-150", aliases: ["O'zbekiston Milliy Universiteti"] },
    { id: 8, name: "Samarqand Davlat Universiteti", grant: "120-155", contract: "100-140" },
    { id: 9, name: "Buxoro Davlat Universiteti", grant: "110-145", contract: "90-130" },
    { id: 10, name: "Andijon Davlat Universiteti", grant: "110-140", contract: "90-125" },
    { id: 11, name: "Namangan Davlat Universiteti", grant: "100-135", contract: "85-120" },
    { id: 12, name: "Farg‘ona Davlat Universiteti", grant: "100-135", contract: "85-120", aliases: ["Farg'ona Davlat Universiteti"] },
    { id: 13, name: "Qarshi Davlat Universiteti", grant: "95-130", contract: "80-115" },
    { id: 14, name: "Nukus Davlat Universiteti", grant: "90-125", contract: "75-110" },
    { id: 15, name: "Urganch Davlat Universiteti", grant: "95-130", contract: "80-115" },
    { id: 16, name: "Termiz Davlat Universiteti", grant: "90-120", contract: "75-110" },
    { id: 17, name: "Toshkent Davlat Pedagogika Universiteti", grant: "100-140", contract: "85-125" },
    { id: 18, name: "Nizomiy nomidagi TDPU", grant: "105-145", contract: "90-130", aliases: ["Nizomiy nomidagi Toshkent Davlat Pedagogika Universiteti"] },
    { id: 19, name: "Toshkent Arxitektura Qurilish Univ.", grant: "120-150", contract: "100-135", aliases: ["Toshkent Arxitektura-Qurilish Universiteti"] },
    { id: 20, name: "Toshkent Temiryo‘l Muhandislari Instituti", grant: "110-145", contract: "90-130" },
    { id: 21, name: "Transport Universiteti", grant: "110-150", contract: "90-135", aliases: ["Toshkent Davlat Transport Universiteti"] },
    { id: 22, name: "Qishloq xo‘jaligi universiteti", grant: "90-130", contract: "75-115", aliases: ["Toshkent Davlat Agrar Universiteti"] },
    { id: 23, name: "Irrigatsiya va Melioratsiya Instituti", grant: "100-140", contract: "85-125" },
    { id: 24, name: "Kimyo-Texnologiya Instituti", grant: "95-135", contract: "80-120" },
    { id: 25, name: "Farmatsevtika Instituti", grant: "140-175", contract: "120-160" },
    { id: 26, name: "Sport Universiteti", grant: "90-130", contract: "75-115", aliases: ["O'zbekiston Davlat Jismoniy Tarbiya va Sport Universiteti"] },
    { id: 27, name: "San’at va Madaniyat Instituti", grant: "100-140", contract: "85-125", aliases: ["O'zbekiston Davlat San'at va Madaniyat Instituti"] },
    { id: 28, name: "Xalqaro Islom Akademiyasi", grant: "110-150", contract: "90-135" },
    {
        id: 29,
        name: "Westminster International University",
        grant: "150-180",
        contract: "140-170",
        aliases: ["Westminster International University in Tashkent", "Westminster International University"]
    },
    { id: 30, name: "INHA University in Tashkent", grant: "140-175", contract: "130-165", aliases: ["Inha Universiteti (Toshkentda)"] }
];

const discussionState = {
    activeChannelId: "general-tests",
    pendingAttachments: []
};

const elements = {
    sectionButtons: Array.from(document.querySelectorAll("[data-section]")),
    sectionPanels: Array.from(document.querySelectorAll("[data-section-panel]")),
    dashboardUser: document.querySelector(".dashboard-user"),
    notificationsWrap: document.querySelector(".dashboard-notifications"),
    notificationsToggle: document.getElementById("notifications-toggle"),
    notificationsPanel: document.getElementById("notifications-panel"),
    notificationsCount: document.getElementById("notifications-count"),
    notificationsList: document.getElementById("notifications-list"),
    notificationsMarkAll: document.getElementById("notifications-mark-all"),
    dashboardUserName: document.getElementById("dashboard-user-name"),
    dashboardAvatar: document.getElementById("dashboard-avatar"),
    profileAvatar: document.getElementById("profile-avatar"),
    profileHeaderAvatar: document.getElementById("profile-header-avatar"),
    profilePhotoInput: document.getElementById("profile-photo-input"),
    profilePhotoTrigger: document.getElementById("profile-photo-trigger"),
    profilePhotoStatus: document.getElementById("profile-photo-status"),
    profileName: document.getElementById("profile-name"),
    profileHeaderName: document.getElementById("profile-header-name"),
    profileEmail: document.getElementById("profile-email"),
    profileHeaderEmail: document.getElementById("profile-header-email"),
    profilePhone: document.getElementById("profile-phone"),
    profileHeaderPhone: document.getElementById("profile-header-phone"),
    profileDreamScore: document.getElementById("profile-dream-score"),
    profileDreamUniversity: document.getElementById("profile-dream-university"),
    profileGoalForm: document.getElementById("profile-goals-form"),
    profileGoalScoreInput: document.getElementById("profile-goal-score"),
    profileGoalUniversityInput: document.getElementById("profile-goal-university"),
    profileGoalUniversityCustomInput: document.getElementById("profile-goal-university-custom"),
    profileGoalsStatus: document.getElementById("profile-goals-status"),
    feedbackForm: document.getElementById("feedback-form"),
    feedbackInput: document.getElementById("feedback-input"),
    feedbackStatus: document.getElementById("feedback-status"),
    feedbackList: document.getElementById("feedback-list"),
    analysisChannelList: document.getElementById("analysis-channel-list"),
    analysisContent: document.getElementById("analysis-content"),
    analysisForm: document.getElementById("analysis-form"),
    analysisStatus: document.getElementById("analysis-status"),
    analysisInput: document.getElementById("analysis-input"),
    analysisUniversityBoard: document.getElementById("analysis-university-board"),
    analysisEmojiTray: document.getElementById("analysis-emoji-tray"),
    analysisEmojiToggle: document.getElementById("analysis-emoji-toggle"),
    analysisImageInput: document.getElementById("analysis-image-input"),
    analysisAudioInput: document.getElementById("analysis-audio-input"),
    analysisMediaPreview: document.getElementById("analysis-media-preview"),
    analysisClearMediaButton: document.getElementById("analysis-clear-media"),
    analysisFeed: document.getElementById("analysis-feed"),
    completedTestsCount: document.getElementById("completed-tests-count"),
    completedTestsList: document.getElementById("completed-tests-list"),
    bestGrade: document.getElementById("best-grade"),
    profileBestGrade: document.getElementById("profile-best-grade"),
    examCards: document.getElementById("exam-cards"),
    historyList: document.getElementById("history-list")
};

bootDashboard();

bindTelegramLinks();

elements.sectionButtons.forEach((button) => {
    button.addEventListener("click", () => {
        if (button.tagName === "A") {
            return;
        }

        activateSection(button.dataset.section);
    });
});

if (elements.profileGoalForm) {
    elements.profileGoalForm.addEventListener("submit", saveProfileGoals);
}

if (elements.feedbackForm) {
    elements.feedbackForm.addEventListener("submit", saveFeedback);
}

if (elements.feedbackList) {
    elements.feedbackList.addEventListener("click", handleFeedbackListClick);
    elements.feedbackList.addEventListener("submit", handleReplySubmit);
}

if (elements.analysisForm) {
    elements.analysisForm.addEventListener("submit", handleDiscussionSubmit);
}

if (elements.analysisImageInput) {
    elements.analysisImageInput.addEventListener("change", handleDiscussionImageChange);
}

if (elements.analysisAudioInput) {
    elements.analysisAudioInput.addEventListener("change", handleDiscussionAudioChange);
}

if (elements.analysisClearMediaButton) {
    elements.analysisClearMediaButton.addEventListener("click", clearDiscussionPendingMedia);
}

if (elements.analysisFeed) {
    elements.analysisFeed.addEventListener("click", handleDiscussionFeedClick);
    elements.analysisFeed.addEventListener("submit", handleDiscussionReplySubmit);
}

if (elements.analysisEmojiToggle) {
    elements.analysisEmojiToggle.addEventListener("click", toggleDiscussionEmojiTray);
}

if (elements.analysisEmojiTray) {
    elements.analysisEmojiTray.addEventListener("click", handleDiscussionEmojiPick);
}

if (elements.profilePhotoInput) {
    elements.profilePhotoInput.addEventListener("change", handleProfilePhotoChange);
}

if (elements.notificationsToggle) {
    elements.notificationsToggle.addEventListener("click", toggleNotificationsPanel);
}

if (elements.notificationsMarkAll) {
    elements.notificationsMarkAll.addEventListener("click", () => {
        markNotificationsAsRead();
    });
}

window.addEventListener("storage", (event) => {
    if (event.key === FEEDBACK_STORAGE_KEY) {
        renderFeedbackPanel();
    }
});

document.addEventListener("click", (event) => {
    if (!elements.notificationsPanel || !elements.notificationsToggle) {
        return;
    }

    const clickedInsidePanel = event.target.closest(".dashboard-notifications");

    if (!clickedInsidePanel) {
        closeNotificationsPanel();
    }
});

async function bootDashboard() {
    let student = getSavedStudent();

    if (!student) {
        student = await restoreStudentSessionFromServer();

        if (!student) {
            window.location.href = "index.html";
            return;
        }
    }

    renderStudent(student);
    renderFeedbackPanel();
    renderDiscussionPanel();
    renderExamCards();
    syncStoredResultsToServer();
    hydrateResultSummary();
    renderNotifications();
    renderHistory();
    activateSection(getSavedActiveSection());
    showRegistrationSuccessToast();
    syncStudentSession();
    window.setInterval(syncStudentSession, SESSION_HEARTBEAT_MS);
    window.setInterval(renderNotifications, NOTIFICATIONS_REFRESH_MS);
}

function renderStudent(student) {
    const initials = getInitials(student.fullName);

    setText(elements.dashboardUserName, student.fullName);
    updateAvatar(elements.dashboardAvatar, initials, student.photoDataUrl);
    updateAvatar(elements.profileAvatar, initials, student.photoDataUrl);
    updateAvatar(elements.profileHeaderAvatar, initials, student.photoDataUrl);
    setText(elements.profileName, student.fullName);
    setText(elements.profileHeaderName, student.fullName);
    setText(elements.profileEmail, student.email);
    setText(elements.profileHeaderEmail, student.email);
    setText(elements.profilePhone, student.phone);
    setText(elements.profileHeaderPhone, student.phone);
    setText(elements.profileDreamScore, student.dreamScore ? `${student.dreamScore} ball` : "-");
    setText(elements.profileDreamUniversity, student.dreamUniversity || "-");

    if (elements.profileGoalScoreInput) {
        elements.profileGoalScoreInput.value = student.dreamScore || "";
    }

    if (elements.profileGoalUniversityInput) {
        const hasMatchingOption = Array.from(elements.profileGoalUniversityInput.options).some(
            (option) => option.value === (student.dreamUniversity || "")
        );
        elements.profileGoalUniversityInput.value = hasMatchingOption ? (student.dreamUniversity || "") : "";
    }

    if (elements.profileGoalUniversityCustomInput) {
        const selectedUniversity = student.dreamUniversity || "";
        const hasMatchingOption = elements.profileGoalUniversityInput
            ? Array.from(elements.profileGoalUniversityInput.options).some((option) => option.value === selectedUniversity)
            : false;
        elements.profileGoalUniversityCustomInput.value = hasMatchingOption ? "" : selectedUniversity;
    }

    setText(elements.profileGoalsStatus, "");
    setText(elements.profilePhotoStatus, "");
    setText(elements.profilePhotoTrigger, student.photoDataUrl ? "Rasmni almashtirish" : "Profil rasmi yuklash");
}

function showRegistrationSuccessToast() {
    let payload = null;

    try {
        const rawValue = window.localStorage.getItem(REGISTRATION_SUCCESS_KEY);
        payload = rawValue ? JSON.parse(rawValue) : null;
        window.localStorage.removeItem(REGISTRATION_SUCCESS_KEY);
    } catch {
        payload = null;
    }

    if (!payload?.message) {
        return;
    }

    showDashboardToast(payload.message);

    window.setTimeout(() => {
        if (getActiveSectionId() === "exams") {
            showDashboardToast("Testlarni ishlash uchun pastga suring.");
        }
    }, 3200);
}

function showDashboardToast(message, durationMs = 3000) {
    if (!message) {
        return;
    }

    const toast = document.createElement("div");
    toast.className = "dashboard-welcome-toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    window.setTimeout(() => {
        toast.classList.add("is-visible");
    }, 30);

    window.setTimeout(() => {
        toast.classList.remove("is-visible");
        window.setTimeout(() => toast.remove(), 300);
    }, durationMs);
}

async function renderFeedbackPanel() {
    if (!elements.feedbackList) {
        return;
    }

    const feedbackEntries = await getFeedbackEntries();

    if (!feedbackEntries.length) {
        elements.feedbackList.innerHTML = `
            <article class="feedback-item feedback-item--empty">
                <p>Hali feedback qoldirilmagan. Birinchi bo'lib fikr yozishingiz mumkin.</p>
            </article>
        `;
        return;
    }

    const currentUsername = getCurrentUsername();

    elements.feedbackList.innerHTML = feedbackEntries
        .sort(sortFeedbackEntries)
        .map((item) => renderFeedbackItem(item, currentUsername))
        .join("");
}

function renderFeedbackItem(item, currentUsername) {
    const sentiment = analyzeFeedbackTone(item.message);
    const likeCount = Number(item.likes || 0);
    const isLikedByCurrentUser = Array.isArray(item.likedBy) && item.likedBy.includes(currentUsername);
    const replies = Array.isArray(item.replies) ? item.replies : [];
    const currentStudent = getSavedStudent();
    const canEditFeedback = Boolean(
        currentStudent?.email &&
        item.authorEmail &&
        currentStudent.email === item.authorEmail
    );
    const pinnedBadge = item.isPinned
        ? `<span class="feedback-item__badge feedback-item__badge--pinned">Pinned</span>`
        : "";
    const editedBadge = item.updatedAt
        ? ` &bull; Tahrirlangan`
        : "";
    const editActionMarkup = canEditFeedback
        ? `
                <button class="feedback-action" type="button" data-feedback-action="toggle-edit" data-feedback-id="${escapeHtml(item.id)}">
                    Tahrirlash
                </button>
        `
        : "";

    return `
        <article class="feedback-item${item.isPinned ? " feedback-item--pinned" : ""}" data-feedback-id="${escapeHtml(item.id)}">
            <div class="feedback-item__head">
                <div>
                    <div class="feedback-author">
                        ${renderFeedbackAvatar(item.authorPhotoDataUrl, item.authorName)}
                        <div>
                            <h3>${escapeHtml(item.authorName)}</h3>
                            <p class="feedback-item__meta">${formatDate(item.createdAt)}${editedBadge}</p>
                        </div>
                    </div>
                </div>
                <div class="feedback-item__actions">
                    ${pinnedBadge}
                    <span class="feedback-item__badge feedback-item__badge--${sentiment.type}">${sentiment.label}</span>
                </div>
            </div>
            <p class="feedback-item__text">${escapeHtml(item.message)}</p>
            <div class="feedback-item__toolbar">
                <button class="feedback-action feedback-action--heart${isLikedByCurrentUser ? " is-active" : ""}" type="button" data-feedback-action="toggle-like" data-feedback-id="${escapeHtml(item.id)}">
                    <span aria-hidden="true">&#9829;</span>
                    <span>${likeCount}</span>
                </button>
                <button class="feedback-action" type="button" data-feedback-action="toggle-reply" data-feedback-id="${escapeHtml(item.id)}">
                    Reply
                </button>
                ${editActionMarkup}
                <span class="feedback-item__reply-count">${replies.length} ta javob</span>
            </div>
            <form class="feedback-reply-form is-hidden" data-feedback-edit-form="${escapeHtml(item.id)}">
                <label class="field field--full">
                    <span>Feedbackni tahrirlash</span>
                    <textarea name="feedback-edit" rows="4" placeholder="Feedback matnini yangilang...">${escapeHtml(item.message)}</textarea>
                </label>
                <div class="field field--actions feedback-reply-form__actions">
                    <button class="button button--secondary" type="submit">Saqlash</button>
                    <button class="button button--secondary" type="button" data-feedback-action="toggle-edit" data-feedback-id="${escapeHtml(item.id)}">Bekor qilish</button>
                    <p class="feedback-reply-form__status" data-feedback-edit-status="${escapeHtml(item.id)}"></p>
                </div>
            </form>
            <form class="feedback-reply-form is-hidden" data-reply-form="${escapeHtml(item.id)}">
                <label class="field field--full">
                    <span>Javob yozing</span>
                    <textarea name="reply" rows="3" placeholder="Feedback egasiga javob yozing..."></textarea>
                </label>
                <div class="field field--actions feedback-reply-form__actions">
                    <button class="button button--secondary" type="submit">Javob yuborish</button>
                    <p class="feedback-reply-form__status" data-reply-status="${escapeHtml(item.id)}"></p>
                </div>
            </form>
            <div class="feedback-replies">
                ${replies.length ? replies.map(renderFeedbackReply).join("") : '<p class="feedback-replies__empty">Hali reply yozilmagan.</p>'}
            </div>
        </article>
    `;
}

function renderFeedbackReply(reply) {
    return `
        <article class="feedback-reply">
            <div class="feedback-reply__head">
                <div class="feedback-author feedback-author--reply">
                    ${renderFeedbackAvatar(reply.authorPhotoDataUrl, reply.authorName)}
                    <div>
                        <strong>${escapeHtml(reply.authorName)}</strong>
                        <span>${formatDate(reply.createdAt)}</span>
                    </div>
                </div>
            </div>
            <p>${escapeHtml(reply.message)}</p>
        </article>
    `;
}

async function renderNotifications() {
    if (!elements.notificationsList || !elements.notificationsCount) {
        return;
    }

    const student = getSavedStudent();

    if (!student?.email) {
        return;
    }

    try {
        const response = await fetch(buildApiUrl(`/api/notifications?studentEmail=${encodeURIComponent(student.email)}`));
        const payload = await parseJsonResponse(response);

        if (!response.ok) {
            throw new Error(payload.message || "Bildirishnomalar yuklanmadi.");
        }

        const notifications = Array.isArray(payload.notifications) ? payload.notifications : [];
        const unreadCount = notifications.filter((item) => !item.isRead).length;

        elements.notificationsCount.textContent = String(unreadCount);
        elements.notificationsCount.classList.toggle("is-hidden", unreadCount === 0);
        elements.notificationsMarkAll.disabled = notifications.length === 0 || unreadCount === 0;

        if (!notifications.length) {
            elements.notificationsList.innerHTML = `<p class="dashboard-notifications__empty">Hali bildirishnoma yo'q.</p>`;
            return;
        }

        elements.notificationsList.innerHTML = notifications
            .map((item) => `
                <button class="dashboard-notifications__item${item.isRead ? "" : " is-unread"}" type="button" data-notification-id="${escapeHtml(item.id)}" data-feedback-id="${escapeHtml(item.feedbackId || "")}">
                    <strong>${escapeHtml(item.title || "Yangi bildirishnoma")}</strong>
                    <p>${escapeHtml(item.message || "")}</p>
                    <span>${formatDate(item.createdAt)}</span>
                </button>
            `)
            .join("");

        elements.notificationsList.querySelectorAll("[data-notification-id]").forEach((button) => {
            button.addEventListener("click", async () => {
                const notificationId = button.getAttribute("data-notification-id");
                await markNotificationsAsRead(notificationId ? [notificationId] : []);
                activateSection("feedback");
                closeNotificationsPanel();
                const feedbackId = button.getAttribute("data-feedback-id");

                if (feedbackId) {
                    const feedbackCard = elements.feedbackList?.querySelector(`[data-feedback-id="${cssEscape(feedbackId)}"]`);
                    feedbackCard?.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        });
    } catch {
        elements.notificationsList.innerHTML = `<p class="dashboard-notifications__empty">Bildirishnomalarni yuklab bo'lmadi.</p>`;
    }
}

async function markNotificationsAsRead(notificationIds = []) {
    const student = getSavedStudent();

    if (!student?.email) {
        return;
    }

    try {
        await fetch(buildApiUrl("/api/notifications/mark-read"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                studentEmail: student.email,
                notificationIds
            })
        });
    } catch {
        return;
    }

    await renderNotifications();
}

function toggleNotificationsPanel() {
    if (!elements.notificationsPanel || !elements.notificationsToggle) {
        return;
    }

    const willOpen = elements.notificationsPanel.classList.contains("is-hidden");
    elements.notificationsPanel.classList.toggle("is-hidden", !willOpen);
    elements.notificationsToggle.setAttribute("aria-expanded", String(willOpen));
}

function closeNotificationsPanel() {
    if (!elements.notificationsPanel || !elements.notificationsToggle) {
        return;
    }

    elements.notificationsPanel.classList.add("is-hidden");
    elements.notificationsToggle.setAttribute("aria-expanded", "false");
}

function renderExamCards() {
    const resultsBySubject = getResultsBySubject();
    const subjectCardsMarkup = Object.values(SUBJECTS)
        .map((subject) => {
            const result = normalizeResultPresentation(resultsBySubject[subject.id]);
            const actionHref = result
                ? `results.html?subject=${subject.id}`
                : `exam.html?subject=${subject.id}`;
            const actionLabel = result ? "Ko'rib chiqish" : "Testni boshlash";
            const statusMarkup = result
                ? `
                    <div class="exam-card__status">
                        <span class="exam-card__badge">Tugallangan</span>
                        <p><strong>Sertifikat:</strong> ${result.grade}${getCertificatePercent(result) !== null ? ` (${getCertificatePercent(result)}%)` : ""}</p>
                        <p><strong>Ball:</strong> ${formatPointsSummary(result)}</p>
                        <p><strong>Maksimal ball:</strong> ${formatPointsValue(result.totalPoints ?? 0)}</p>
                        <p><strong>Foiz:</strong> ${formatPercentValue(result.percent)}%</p>
                        <p><strong>Natija:</strong> ${result.correct}/${result.total}</p>
                    </div>
                `
                : `
                    <div class="exam-card__status">
                        <span class="exam-card__badge exam-card__badge--pending">Yangi</span>
                        <p><strong>Holat:</strong> Hali ishlanmagan</p>
                    </div>
                `;
            const pendingNotice = !result
                ? `<p class="exam-card__notice">Diqqat test natijalari rasch model asosida baholanadi va test tugagach sertifikat natija beriladi.</p>`
                : "";

            return `
            <article class="exam-card${result ? " exam-card--done" : ""}">
                <p class="card-label">${subject.label}</p>
                <h2>${subject.label} imtihoni</h2>
                <div class="info-list">
                    <p><strong>Vaqt:</strong> ${formatTime(subject.durationSeconds)}</p>
                    <p><strong>Savollar:</strong> ${subject.questionSummary}</p>
                </div>
                ${statusMarkup}
                <a class="button" href="${actionHref}">${actionLabel}</a>
                ${pendingNotice}
            </article>
        `;
        })
        .join("");

    elements.examCards.innerHTML = subjectCardsMarkup;
}

function activateSection(sectionId) {
    const nextSectionId = elements.sectionPanels.some((panel) => panel.dataset.sectionPanel === sectionId)
        ? sectionId
        : "exams";
    const shouldShowNotifications = ["profile", "dashboard", "feedback", "analysis"].includes(nextSectionId);
    const shouldShowDashboardUser = nextSectionId !== "exams";

    elements.sectionButtons.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.section === nextSectionId);
    });

    elements.sectionPanels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.sectionPanel === nextSectionId);
    });

    if (elements.notificationsWrap) {
        elements.notificationsWrap.classList.toggle("is-hidden", !shouldShowNotifications);
    }

    if (elements.dashboardUser) {
        elements.dashboardUser.classList.toggle("is-hidden", !shouldShowDashboardUser);
    }

    if (!shouldShowNotifications) {
        closeNotificationsPanel();
    }

    if (nextSectionId === "exams") {
        showDashboardToast("Testlarni ishlash uchun pastga suring.");
    }

    if (nextSectionId === "profile") {
        showDashboardToast("Orzuyingizdagi universitetni tanlang va u haqida Testlar tahlili bo'limidan ma'lumotlar oling.");
    }

    saveActiveSection(nextSectionId);
}

function getActiveSectionId() {
    const activePanel = elements.sectionPanels.find((panel) => panel.classList.contains("is-active"));
    return activePanel?.dataset.sectionPanel || "exams";
}

function hydrateResultSummary() {
    try {
        const resultsBySubject = Object.values(getResultsBySubject()).map((result) => normalizeResultPresentation(result));

        if (!resultsBySubject.length) {
            setText(elements.completedTestsCount, "0");
            setText(elements.completedTestsList, "Hali test tugallanmagan.");
            setText(elements.bestGrade, "-");
            setText(elements.profileBestGrade, "-");
            return;
        }

        const bestResult = resultsBySubject
            .slice()
            .sort((left, right) => compareResultsForSummary(left, right))[0];

        setText(elements.completedTestsCount, String(resultsBySubject.length));
        setText(elements.completedTestsList, resultsBySubject.map((result) => result.subjectLabel).join(", "));
        setText(elements.bestGrade, bestResult?.grade || "-");
        setText(elements.profileBestGrade, bestResult?.grade || "-");
    } catch {
        setText(elements.completedTestsCount, "0");
        setText(elements.completedTestsList, "Hali test tugallanmagan.");
        setText(elements.bestGrade, "-");
        setText(elements.profileBestGrade, "-");
    }
}

function renderHistory() {
    return;
}

function getResultsBySubject() {
    try {
        const rawResults = window.localStorage.getItem(RESULTS_BY_SUBJECT_STORAGE_KEY);
        const resultsBySubject = rawResults ? JSON.parse(rawResults) : {};
        const rawLastResult = window.localStorage.getItem(LAST_RESULT_STORAGE_KEY);

        if (rawLastResult) {
            const lastResult = JSON.parse(rawLastResult);

            if (lastResult?.subjectId && !resultsBySubject[lastResult.subjectId]) {
                lastResult.completedAt = lastResult.completedAt || new Date().toISOString();
                resultsBySubject[lastResult.subjectId] = lastResult;
                window.localStorage.setItem(RESULTS_BY_SUBJECT_STORAGE_KEY, JSON.stringify(resultsBySubject));
            }
        }

        return resultsBySubject;
    } catch {
        return {};
    }
}

function normalizeResultPresentation(result) {
    if (!result) {
        return result;
    }

    if (result.subjectId !== "history" && result.subjectId !== "physics") {
        return result;
    }

    const correct = Number(result.correct);

    if (!Number.isFinite(correct)) {
        return result;
    }

    let grade = "Fail";
    let certificatePercent = null;

    if (result.subjectId === "history") {
        if (Number(result.earnedPoints) >= 93) {
            grade = "A+";
            certificatePercent = 100;
        } else if (Number(result.earnedPoints) >= 91) {
            grade = "A";
            certificatePercent = 100;
        } else if (Number(result.earnedPoints) >= 84) {
            grade = "B+";
            certificatePercent = 85;
        } else if (Number(result.earnedPoints) >= 75) {
            grade = "B";
            certificatePercent = 75;
        } else if (Number(result.earnedPoints) >= 67) {
            grade = "C+";
            certificatePercent = 65;
        } else if (Number(result.earnedPoints) >= 52) {
            grade = "C";
            certificatePercent = 55;
        }
    } else if (correct >= 42) {
        grade = "A+";
        certificatePercent = 100;
    } else if (correct >= 40) {
        grade = "A";
        certificatePercent = 100;
    } else if (correct >= 36) {
        grade = "B+";
        certificatePercent = 85;
    } else if (correct >= 31) {
        grade = "B";
        certificatePercent = 75;
    } else if (correct >= 26) {
        grade = "C+";
        certificatePercent = 65;
    } else if (correct >= 21) {
        grade = "C";
        certificatePercent = 55;
    }

    return {
        ...result,
        grade,
        certificatePercent,
        percent: result.subjectId === "physics" ? (certificatePercent ?? result.percent) : result.percent
    };
}

function compareResultsForSummary(left, right) {
    const percentDiff = Number(right?.percent || 0) - Number(left?.percent || 0);

    if (percentDiff !== 0) {
        return percentDiff;
    }

    const gradeDiff = getGradeRank(right?.grade) - getGradeRank(left?.grade);

    if (gradeDiff !== 0) {
        return gradeDiff;
    }

    return Number(right?.earnedPoints || 0) - Number(left?.earnedPoints || 0);
}

function getGradeRank(grade) {
    const gradeOrder = {
        "A+": 6,
        "A": 5,
        "B+": 4,
        "B": 3,
        "C+": 2,
        "C": 1,
        Fail: 0
    };

    return gradeOrder[grade] ?? -1;
}

function getSavedStudent() {
    try {
        const rawStudent = window.localStorage.getItem(STUDENT_STORAGE_KEY);
        return rawStudent ? JSON.parse(rawStudent) : null;
    } catch {
        return null;
    }
}

async function restoreStudentSessionFromServer() {
    try {
        const response = await fetch(buildApiUrl("/api/student/session/current"), {
            credentials: "same-origin"
        });
        const payload = await parseJsonResponse(response);

        if (!response.ok || !payload?.student) {
            return null;
        }

        window.localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(payload.student));
        return payload.student;
    } catch {
        return null;
    }
}

async function saveProfileGoals(event) {
    event.preventDefault();

    const student = getSavedStudent();
    const dreamScoreValue = Number(elements.profileGoalScoreInput?.value);
    const customUniversity = elements.profileGoalUniversityCustomInput?.value.trim() || "";
    const selectedUniversity = elements.profileGoalUniversityInput?.value.trim() || "";

    if (!student) {
        return;
    }

    if (!Number.isFinite(dreamScoreValue) || dreamScoreValue < 100 || dreamScoreValue > 189) {
        setText(elements.profileGoalsStatus, "Dream score 100 dan 189 gacha bo'lishi kerak.");
        return;
    }

    const updatedStudent = {
        ...student,
        dreamScore: String(dreamScoreValue),
        dreamUniversity: customUniversity || selectedUniversity
    };

    try {
        setText(elements.profileGoalsStatus, "Saqlanmoqda...");
        const response = await fetch(buildApiUrl("/api/student/goals"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                studentId: student.id,
                dreamScore: updatedStudent.dreamScore,
                dreamUniversity: updatedStudent.dreamUniversity
            })
        });
        const payload = await parseJsonResponse(response);

        if (!response.ok || !payload?.student) {
            throw new Error(payload?.message || "Dream maqsadlarni saqlab bo'lmadi.");
        }

        window.localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(payload.student));
        renderStudent(payload.student);
        setText(elements.profileGoalsStatus, "Saqlandi.");
    } catch (error) {
        window.localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(updatedStudent));
        renderStudent(updatedStudent);
        setText(elements.profileGoalsStatus, error.message || "Lokal saqlandi, serverga yozilmadi.");
    }
}

async function saveFeedback(event) {
    event.preventDefault();

    const student = getSavedStudent();
    const message = elements.feedbackInput?.value.trim() || "";

    if (!student) {
        return;
    }

    if (message.length < 6) {
        setText(elements.feedbackStatus, "Feedback kamida 6 ta belgidan iborat bo'lishi kerak.");
        return;
    }

    try {
        const response = await fetch(buildApiUrl("/api/feedbacks"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                authorName: student.fullName,
                authorEmail: student.email,
                username: getUsername(student),
                message,
                authorPhotoDataUrl: student.photoDataUrl || ""
            })
        });
        const payload = await parseJsonResponse(response);

        if (!response.ok) {
            throw new Error(payload.message || `Feedback saqlanmadi. Server holati: ${response.status}`);
        }

        if (elements.feedbackInput) {
            elements.feedbackInput.value = "";
        }

        activateSection("feedback");
        setText(elements.feedbackStatus, "Feedback saqlandi.");
        await renderFeedbackPanel();
    } catch (error) {
        const feedbackErrorMessage = error?.message === "Failed to fetch"
            ? "Feedback saqlanmadi. Saytni http://localhost:3000 orqali oching va server yoqilganini tekshiring."
            : (error.message || "Feedback saqlanmadi. Sahifani yangilang va qayta urinib ko'ring.");
        setText(elements.feedbackStatus, feedbackErrorMessage);
    }
}

function handleFeedbackListClick(event) {
    const actionButton = event.target.closest("[data-feedback-action]");

    if (!actionButton) {
        return;
    }

    const feedbackId = actionButton.dataset.feedbackId;

    if (!feedbackId) {
        return;
    }

    if (actionButton.dataset.feedbackAction === "toggle-like") {
        toggleFeedbackLike(feedbackId);
        return;
    }

    if (actionButton.dataset.feedbackAction === "toggle-reply") {
        toggleReplyForm(feedbackId);
        return;
    }

    if (actionButton.dataset.feedbackAction === "toggle-edit") {
        toggleEditForm(feedbackId);
    }
}

async function handleReplySubmit(event) {
    const editForm = event.target.closest("[data-feedback-edit-form]");

    if (editForm) {
        event.preventDefault();
        await handleFeedbackEditSubmit(editForm);
        return;
    }

    const form = event.target.closest("[data-reply-form]");

    if (!form) {
        return;
    }

    event.preventDefault();

    const feedbackId = form.getAttribute("data-reply-form");
    const textarea = form.querySelector("textarea[name='reply']");
    const status = form.querySelector("[data-reply-status]");
    const student = getSavedStudent();
    const message = textarea?.value.trim() || "";

    if (!feedbackId || !student) {
        return;
    }

    if (message.length < 2) {
        setText(status, "Reply kamida 2 ta belgidan iborat bo'lsin.");
        return;
    }

    try {
        const response = await fetch(buildApiUrl(`/api/feedbacks/${encodeURIComponent(feedbackId)}/replies`), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                authorName: student.fullName,
                authorEmail: student.email,
                username: getUsername(student),
                message,
                authorPhotoDataUrl: student.photoDataUrl || ""
            })
        });
        const payload = await parseJsonResponse(response);

        if (!response.ok) {
            throw new Error(payload.message || "Reply yuborilmadi.");
        }

        if (textarea) {
            textarea.value = "";
        }

        activateSection("feedback");
        setText(status, "Reply yuborildi.");
        await renderFeedbackPanel();
    } catch (error) {
        setText(status, error.message || "Reply yuborilmadi.");
    }
}

function toggleReplyForm(feedbackId) {
    const form = elements.feedbackList?.querySelector(`[data-reply-form="${cssEscape(feedbackId)}"]`);

    if (!form) {
        return;
    }

    form.classList.toggle("is-hidden");
}

function toggleEditForm(feedbackId) {
    const form = elements.feedbackList?.querySelector(`[data-feedback-edit-form="${cssEscape(feedbackId)}"]`);

    if (!form) {
        return;
    }

    form.classList.toggle("is-hidden");
}

async function handleFeedbackEditSubmit(form) {
    const feedbackId = form.getAttribute("data-feedback-edit-form");
    const textarea = form.querySelector("textarea[name='feedback-edit']");
    const status = form.querySelector("[data-feedback-edit-status]");
    const student = getSavedStudent();
    const message = textarea?.value.trim() || "";

    if (!feedbackId || !student) {
        return;
    }

    if (message.length < 6) {
        setText(status, "Feedback kamida 6 ta belgidan iborat bo'lishi kerak.");
        return;
    }

    try {
        const response = await fetch(buildApiUrl(`/api/feedbacks/${encodeURIComponent(feedbackId)}`), {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                authorEmail: student.email,
                message
            })
        });
        const payload = await parseJsonResponse(response);

        if (!response.ok) {
            throw new Error(payload.message || "Feedback tahrirlanmadi.");
        }

        activateSection("feedback");
        setText(status, "Feedback yangilandi.");
        await renderFeedbackPanel();
    } catch (error) {
        setText(status, error.message || "Feedback tahrirlanmadi.");
    }
}

async function toggleFeedbackLike(feedbackId) {
    const username = getCurrentUsername();

    try {
        await fetch(buildApiUrl(`/api/feedbacks/${encodeURIComponent(feedbackId)}/likes/toggle`), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username })
        });
        await renderFeedbackPanel();
    } catch {
        renderFeedbackPanel();
    }
}

async function getFeedbackEntries() {
    try {
        const response = await fetch(buildApiUrl("/api/feedbacks"));

        if (response.ok) {
            const payload = await parseJsonResponse(response);
            return Array.isArray(payload.feedbacks) ? payload.feedbacks.map(normalizeFeedbackEntry) : [];
        }
    } catch {
        // fallback below
    }

    try {
        const rawFeedback = window.localStorage.getItem(FEEDBACK_STORAGE_KEY);
        const parsedEntries = rawFeedback ? JSON.parse(rawFeedback) : [];

        if (!Array.isArray(parsedEntries)) {
            return [];
        }

        const normalizedEntries = parsedEntries.map(normalizeFeedbackEntry);

        if (JSON.stringify(normalizedEntries) !== JSON.stringify(parsedEntries)) {
            saveFeedbackEntries(normalizedEntries);
        }

        return normalizedEntries;
    } catch {
        return [];
    }
}

function saveFeedbackEntries(feedbackEntries) {
    window.localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedbackEntries));
}

function updateFeedbackEntry(feedbackId, updater) {
    const feedbackEntries = getFeedbackEntries();
    const nextEntries = feedbackEntries.map((entry) => {
        if (entry.id !== feedbackId) {
            return entry;
        }

        return normalizeFeedbackEntry(updater(entry));
    });

    saveFeedbackEntries(nextEntries);
}

function normalizeFeedbackEntry(entry) {
    const replies = Array.isArray(entry?.replies)
        ? entry.replies
            .filter(Boolean)
            .map((reply) => ({
                id: reply.id || `reply_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                authorName: String(reply.authorName || "Foydalanuvchi"),
                authorEmail: String(reply.authorEmail || ""),
                username: String(reply.username || "@foydalanuvchi"),
                message: String(reply.message || "").trim(),
                authorPhotoDataUrl: String(reply.authorPhotoDataUrl || ""),
                createdAt: reply.createdAt || new Date().toISOString()
            }))
            .filter((reply) => reply.message)
        : [];

    const likedBy = Array.isArray(entry?.likedBy)
        ? Array.from(new Set(entry.likedBy.map((value) => String(value || "").trim()).filter(Boolean)))
        : [];

    return {
        id: entry?.id || `feedback_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        authorName: String(entry?.authorName || "Foydalanuvchi"),
        authorEmail: String(entry?.authorEmail || ""),
        username: String(entry?.username || "@foydalanuvchi"),
        message: String(entry?.message || "").trim(),
        authorPhotoDataUrl: String(entry?.authorPhotoDataUrl || ""),
        createdAt: entry?.createdAt || new Date().toISOString(),
        updatedAt: entry?.updatedAt || "",
        likes: Number.isFinite(Number(entry?.likes)) ? Math.max(Number(entry.likes), likedBy.length) : likedBy.length,
        likedBy,
        replies,
        isPinned: Boolean(entry?.isPinned)
    };
}

function sortFeedbackEntries(left, right) {
    if (Boolean(right.isPinned) !== Boolean(left.isPinned)) {
        return Number(Boolean(right.isPinned)) - Number(Boolean(left.isPinned));
    }

    const leftSentiment = analyzeFeedbackTone(left.message);
    const rightSentiment = analyzeFeedbackTone(right.message);

    if (rightSentiment.rank !== leftSentiment.rank) {
        return rightSentiment.rank - leftSentiment.rank;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
}

function analyzeFeedbackTone(message) {
    const normalized = normalizeText(message);
    const positiveKeywords = ["zor", "zo'r", "ajoyib", "yaxshi", "qulay", "mukammal", "super", "rahmat", "foydali", "oson", "chiroyli", "manzur", "sifatli"];
    const negativeKeywords = ["yomon", "muammo", "xato", "sekin", "qiyin", "bug", "ishlamadi", "noto'gri", "noto'g'ri", "chalkash", "tushunarsiz", "ogir", "og'ir"];
    const positiveScore = positiveKeywords.filter((keyword) => normalized.includes(keyword)).length;
    const negativeScore = negativeKeywords.filter((keyword) => normalized.includes(keyword)).length;
    const score = positiveScore - negativeScore;

    if (score > 0) {
        return { type: "positive", label: "Ijobiy", rank: 2 };
    }

    if (score < 0) {
        return { type: "negative", label: "Salbiy", rank: 0 };
    }

    return { type: "neutral", label: "Neytral", rank: 1 };
}

async function renderDiscussionPanel() {
    renderDiscussionChannels();
    renderDiscussionComposer();
    await renderDiscussionFeed();
}

function renderDiscussionChannels() {
    if (!elements.analysisChannelList) {
        return;
    }

    elements.analysisChannelList.innerHTML = DISCUSSION_CHANNELS
        .map((channel) => `
            <button class="analysis-channel${channel.id === discussionState.activeChannelId ? " is-active" : ""}" type="button" data-analysis-channel="${escapeHtml(channel.id)}">
                <strong>${escapeHtml(channel.label)}</strong>
                <span>${escapeHtml(channel.description)}</span>
            </button>
        `)
        .join("");

    elements.analysisChannelList.querySelectorAll("[data-analysis-channel]").forEach((button) => {
        button.addEventListener("click", () => {
            discussionState.activeChannelId = button.getAttribute("data-analysis-channel") || "general-tests";
            renderDiscussionChannels();
            renderDiscussionComposer();
            renderDiscussionFeed();
        });
    });
}

function renderDiscussionComposer() {
    const activeChannel = getActiveDiscussionChannel();

    if (!activeChannel) {
        return;
    }

    elements.analysisContent?.classList.toggle("is-universities-mode", activeChannel.id === "universities");
    elements.analysisForm?.classList.toggle("analysis-form--compact", activeChannel.id === "universities");
    elements.analysisEmojiTray?.classList.add("is-hidden");
    renderUniversityBoard(activeChannel.id === "universities");
    renderDiscussionPendingMedia();
}

function renderUniversityBoard(isVisible) {
    if (!elements.analysisUniversityBoard) {
        return;
    }

    elements.analysisUniversityBoard.classList.toggle("is-hidden", !isVisible);

    if (!isVisible) {
        elements.analysisUniversityBoard.innerHTML = "";
        return;
    }

    const student = getSavedStudent();
    const selectedUniversity = findUniversityInfo(student?.dreamUniversity);

    elements.analysisUniversityBoard.innerHTML = `
        <div class="analysis-university-board__head">
            <div>
                <p class="card-label">OTM universitetlar</p>
                <h4>Universitetlar va taxminiy kirish ballari jadvali</h4>
            </div>
            <span class="analysis-university-board__note">Ballar taxminiy bo'lib, yil va yo'nalishga qarab o'zgarishi mumkin</span>
        </div>
        ${selectedUniversity ? `
            <section class="analysis-university-selected">
                <div class="analysis-university-selected__head">
                    <strong>Tanlangan universitet</strong>
                    <span>${escapeHtml(student?.dreamUniversity || "")}</span>
                </div>
                <div class="analysis-university-selected__stats">
                    <div class="analysis-university-selected__pill">
                        <small>Grant</small>
                        <strong>${escapeHtml(selectedUniversity.grant)}</strong>
                    </div>
                    <div class="analysis-university-selected__pill">
                        <small>Kontrakt</small>
                        <strong>${escapeHtml(selectedUniversity.contract)}</strong>
                    </div>
                </div>
            </section>
        ` : `
            <section class="analysis-university-selected analysis-university-selected--muted">
                <div class="analysis-university-selected__head">
                    <strong>Tanlangan universitet</strong>
                    <span>Profilim bo'limida OTM tanlang, ma'lumoti shu yerda chiqadi.</span>
                </div>
            </section>
        `}
        <div class="analysis-university-table-wrap">
            <table class="analysis-university-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Universitet nomi</th>
                        <th>Grant (taxmin)</th>
                        <th>Kontrakt (taxmin)</th>
                    </tr>
                </thead>
                <tbody>
                    ${UNIVERSITY_INFO.map((item) => `
                        <tr${selectedUniversity?.id === item.id ? ' class="is-highlighted"' : ""}>
                            <td>${item.id}</td>
                            <td>${escapeHtml(item.name)}</td>
                            <td>${escapeHtml(item.grant)}</td>
                            <td>${escapeHtml(item.contract)}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

function findUniversityInfo(universityName) {
    const target = normalizeUniversityName(universityName);

    if (!target) {
        return null;
    }

    return UNIVERSITY_INFO.find((item) => {
        const candidates = [item.name, ...(item.aliases || [])];
        return candidates.some((candidate) => normalizeUniversityName(candidate) === target);
    }) || null;
}

async function renderDiscussionFeed() {
    if (!elements.analysisFeed) {
        return;
    }

    const posts = await getDiscussionPosts();
    const activePosts = posts
        .filter((post) => post.categoryId === discussionState.activeChannelId)
        .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0));

    if (!activePosts.length) {
        elements.analysisFeed.innerHTML = `
            <article class="analysis-empty">
                <p>Bu bo'limda hali post yo'q. Birinchi bo'lib tahlil boshlashingiz mumkin.</p>
            </article>
        `;
        return;
    }

    const currentUsername = getCurrentUsername();
    elements.analysisFeed.innerHTML = activePosts
        .map((post) => renderDiscussionPost(post, currentUsername))
        .join("");
}

function renderDiscussionPost(post, currentUsername) {
    const reactions = post.reactions || {};
    const reactionTypes = [
        { id: "helpful", emoji: "👍", label: "Foydali" },
        { id: "fire", emoji: "🔥", label: "Zo'r" },
        { id: "question", emoji: "❓", label: "Savol" }
    ];
    const metadataMarkup = post.categoryId === "universities" && (post.metadata?.universityName || post.metadata?.studySubjects?.length)
        ? `
            <div class="analysis-post__university">
                <p><strong>Universitet:</strong> ${escapeHtml(post.metadata.universityName || "-")}</p>
                <p><strong>Fanlar:</strong> ${escapeHtml((post.metadata.studySubjects || []).join(", ") || "-")}</p>
            </div>
        `
        : "";
    const attachmentsMarkup = renderDiscussionAttachments(post.attachments);
    const replies = Array.isArray(post.replies) ? post.replies : [];

    return `
        <article class="analysis-post" data-discussion-post-id="${escapeHtml(post.id)}">
            <div class="analysis-post__head">
                <div class="feedback-author">
                    ${renderFeedbackAvatar(post.authorPhotoDataUrl, post.authorName)}
                    <div>
                        <strong>${escapeHtml(post.authorName)}</strong>
                        <p class="analysis-post__meta">${formatDate(post.createdAt)}</p>
                        <p class="analysis-post__channel">${escapeHtml(post.categoryLabel || getActiveDiscussionChannel()?.label || "")}</p>
                    </div>
                </div>
                <span class="feedback-item__reply-count">${replies.length} ta reply</span>
            </div>
            <p class="analysis-post__message">${escapeHtml(post.message || "")}</p>
            ${metadataMarkup}
            ${attachmentsMarkup}
            <div class="analysis-post__toolbar">
                ${reactionTypes.map((reaction) => {
                    const users = Array.isArray(reactions[reaction.id]) ? reactions[reaction.id] : [];
                    const isActive = users.includes(currentUsername);
                    return `
                        <button class="analysis-reaction${isActive ? " is-active" : ""}" type="button" data-discussion-quick-reaction="${escapeHtml(reaction.id)}" data-post-id="${escapeHtml(post.id)}" title="${escapeHtml(reaction.label)}">
                            <span>${reaction.emoji}</span>
                            <span>${users.length}</span>
                        </button>
                    `;
                }).join("")}
                <button class="analysis-reaction analysis-reply-toggle" type="button" data-discussion-action="toggle-reply" data-post-id="${escapeHtml(post.id)}">
                    Javob yozish
                </button>
            </div>
            <form class="analysis-reply-form is-hidden" data-discussion-reply-form="${escapeHtml(post.id)}">
                <label class="field field--full">
                    <span>Reply</span>
                    <textarea name="discussion-reply" rows="2" placeholder="Postga javob yozing..."></textarea>
                </label>
                <div class="field field--actions feedback-reply-form__actions">
                    <button class="button button--secondary" type="submit">Reply yuborish</button>
                    <p class="feedback-reply-form__status" data-discussion-reply-status="${escapeHtml(post.id)}"></p>
                </div>
            </form>
            <div class="analysis-replies">
                ${replies.length ? replies.map(renderDiscussionReply).join("") : '<p class="feedback-replies__empty">Hali reply yozilmagan.</p>'}
            </div>
        </article>
    `;
}

function renderDiscussionReply(reply) {
    return `
        <article class="analysis-reply">
            <div class="analysis-reply__head">
                <div class="feedback-author feedback-author--reply">
                    ${renderFeedbackAvatar(reply.authorPhotoDataUrl, reply.authorName)}
                    <div>
                        <strong>${escapeHtml(reply.authorName)}</strong>
                        <p class="analysis-reply__meta">${formatDate(reply.createdAt)}</p>
                    </div>
                </div>
            </div>
            <p class="analysis-reply__message">${escapeHtml(reply.message || "")}</p>
            ${renderDiscussionAttachments(reply.attachments)}
        </article>
    `;
}

function renderDiscussionAttachments(attachments) {
    const safeAttachments = Array.isArray(attachments) ? attachments.filter((item) => item?.dataUrl) : [];

    if (!safeAttachments.length) {
        return "";
    }

    return `
        <div class="analysis-attachments">
            ${safeAttachments.map((attachment) => `
                <div class="analysis-attachment analysis-media-card">
                    ${attachment.type === "audio"
                        ? renderDiscussionAudioAttachment(attachment)
                        : `<img src="${attachment.dataUrl}" alt="${escapeHtml(attachment.name || "Discussion rasmi")}">`
                    }
                </div>
            `).join("")}
        </div>
    `;
}

async function handleDiscussionSubmit(event) {
    event.preventDefault();

    const student = getSavedStudent();
    const activeChannel = getActiveDiscussionChannel();
    const message = elements.analysisInput?.value.trim() || "";

    if (!student || !activeChannel) {
        return;
    }

    const metadata = {
        universityName: "",
        studySubjects: []
    };

    if (!message && !discussionState.pendingAttachments.length) {
        setText(elements.analysisStatus, "Kamida matn yoki media qo'shing.");
        return;
    }

    try {
        const response = await fetch(buildApiUrl("/api/discussions/posts"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                categoryId: activeChannel.id,
                categoryLabel: activeChannel.label,
                authorName: student.fullName,
                authorEmail: student.email,
                username: getUsername(student),
                authorPhotoDataUrl: student.photoDataUrl || "",
                message,
                attachments: discussionState.pendingAttachments,
                metadata
            })
        });
        const payload = await parseJsonResponse(response);

        if (!response.ok) {
            throw new Error(payload.message || "Post saqlanmadi.");
        }

        if (elements.analysisInput) {
            elements.analysisInput.value = "";
        }

        clearDiscussionPendingMedia();
        setText(elements.analysisStatus, "Post joylandi.");
        activateSection("analysis");
        await renderDiscussionFeed();
    } catch (error) {
        setText(elements.analysisStatus, error.message || "Post saqlanmadi.");
    }
}

function handleDiscussionFeedClick(event) {
    const quickReactionButton = event.target.closest("[data-discussion-quick-reaction]");

    if (quickReactionButton) {
        const postId = quickReactionButton.getAttribute("data-post-id");
        const reactionType = quickReactionButton.getAttribute("data-discussion-quick-reaction") || "";

        if (postId && reactionType) {
            toggleDiscussionReaction(postId, reactionType);
        }

        return;
    }

    const actionButton = event.target.closest("[data-discussion-action]");

    if (!actionButton) {
        return;
    }

    const postId = actionButton.getAttribute("data-post-id");

    if (!postId) {
        return;
    }

    if (actionButton.getAttribute("data-discussion-action") === "toggle-reply") {
        const replyForm = elements.analysisFeed?.querySelector(`[data-discussion-reply-form="${cssEscape(postId)}"]`);
        replyForm?.classList.toggle("is-hidden");
        return;
    }

    if (actionButton.getAttribute("data-discussion-action") === "toggle-reaction") {
        toggleDiscussionReaction(postId, actionButton.getAttribute("data-reaction-type") || "");
    }
}

function toggleDiscussionEmojiTray() {
    elements.analysisEmojiTray?.classList.toggle("is-hidden");
}

function handleDiscussionEmojiPick(event) {
    const emojiButton = event.target.closest("[data-analysis-emoji]");
    const emoji = emojiButton?.getAttribute("data-analysis-emoji");

    if (!emoji || !elements.analysisInput) {
        return;
    }

    const textarea = elements.analysisInput;
    const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : textarea.value.length;
    const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : textarea.value.length;
    const before = textarea.value.slice(0, selectionStart);
    const after = textarea.value.slice(selectionEnd);
    const spacer = before && !before.endsWith(" ") ? " " : "";
    const inserted = `${before}${spacer}${emoji} `;

    textarea.value = `${inserted}${after}`;
    textarea.focus();
    textarea.setSelectionRange(inserted.length, inserted.length);
    elements.analysisEmojiTray?.classList.add("is-hidden");
}

async function handleDiscussionReplySubmit(event) {
    const form = event.target.closest("[data-discussion-reply-form]");

    if (!form) {
        return;
    }

    event.preventDefault();

    const student = getSavedStudent();
    const postId = form.getAttribute("data-discussion-reply-form");
    const textarea = form.querySelector("textarea[name='discussion-reply']");
    const status = form.querySelector("[data-discussion-reply-status]");
    const message = textarea?.value.trim() || "";

    if (!student || !postId) {
        return;
    }

    if (!message) {
        setText(status, "Reply matnini yozing.");
        return;
    }

    try {
        const response = await fetch(buildApiUrl(`/api/discussions/posts/${encodeURIComponent(postId)}/replies`), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                authorName: student.fullName,
                authorEmail: student.email,
                username: getUsername(student),
                authorPhotoDataUrl: student.photoDataUrl || "",
                message,
                attachments: []
            })
        });
        const payload = await parseJsonResponse(response);

        if (!response.ok) {
            throw new Error(payload.message || "Reply saqlanmadi.");
        }

        if (textarea) {
            textarea.value = "";
        }

        setText(status, "Reply yuborildi.");
        activateSection("analysis");
        await renderDiscussionFeed();
    } catch (error) {
        setText(status, error.message || "Reply saqlanmadi.");
    }
}

async function toggleDiscussionReaction(postId, reactionType) {
    const student = getSavedStudent();

    if (!student || !reactionType) {
        return;
    }

    try {
        await fetch(buildApiUrl(`/api/discussions/posts/${encodeURIComponent(postId)}/reactions/toggle`), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                reactionType,
                username: getUsername(student)
            })
        });
        await renderDiscussionFeed();
    } catch {
        renderDiscussionFeed();
    }
}

async function getDiscussionPosts() {
    try {
        const response = await fetch(buildApiUrl("/api/discussions"));
        const payload = await parseJsonResponse(response);

        if (!response.ok) {
            throw new Error(payload.message || "Discussion postlari yuklanmadi.");
        }

        return Array.isArray(payload.posts) ? payload.posts.map(normalizeDiscussionPost) : [];
    } catch {
        return [];
    }
}

function normalizeDiscussionPost(post) {
    return {
        id: String(post?.id || `discussion_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
        categoryId: String(post?.categoryId || ""),
        categoryLabel: String(post?.categoryLabel || ""),
        authorName: String(post?.authorName || "Foydalanuvchi"),
        authorEmail: String(post?.authorEmail || ""),
        username: String(post?.username || "@foydalanuvchi"),
        authorPhotoDataUrl: String(post?.authorPhotoDataUrl || ""),
        message: String(post?.message || "").trim(),
        attachments: Array.isArray(post?.attachments) ? post.attachments.map(normalizeDiscussionAttachment).filter((item) => item.dataUrl) : [],
        metadata: {
            universityName: String(post?.metadata?.universityName || ""),
            studySubjects: Array.isArray(post?.metadata?.studySubjects)
                ? post.metadata.studySubjects.map((value) => String(value || "").trim()).filter(Boolean)
                : []
        },
        createdAt: post?.createdAt || new Date().toISOString(),
        reactions: normalizeDiscussionReactions(post?.reactions),
        replies: Array.isArray(post?.replies) ? post.replies.map(normalizeDiscussionReply) : []
    };
}

function normalizeDiscussionReply(reply) {
    return {
        id: String(reply?.id || `discussion_reply_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
        authorName: String(reply?.authorName || "Foydalanuvchi"),
        authorEmail: String(reply?.authorEmail || ""),
        username: String(reply?.username || "@foydalanuvchi"),
        authorPhotoDataUrl: String(reply?.authorPhotoDataUrl || ""),
        message: String(reply?.message || "").trim(),
        attachments: Array.isArray(reply?.attachments) ? reply.attachments.map(normalizeDiscussionAttachment).filter((item) => item.dataUrl) : [],
        createdAt: reply?.createdAt || new Date().toISOString(),
        reactions: normalizeDiscussionReactions(reply?.reactions)
    };
}

function normalizeDiscussionAttachment(attachment) {
    return {
        id: String(attachment?.id || `attachment_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
        type: attachment?.type === "audio" ? "audio" : "image",
        name: String(attachment?.name || ""),
        dataUrl: String(attachment?.dataUrl || "")
    };
}

function normalizeDiscussionReactions(reactions) {
    const source = reactions && typeof reactions === "object" ? reactions : {};
    const normalized = {};

    Object.entries(source).forEach(([reactionType, users]) => {
        normalized[String(reactionType || "")] = Array.isArray(users)
            ? Array.from(new Set(users.map((value) => String(value || "").trim()).filter(Boolean)))
            : [];
    });

    return normalized;
}

async function handleDiscussionImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
        return;
    }

    try {
        const attachment = await prepareDiscussionAttachment(file, "image");
        upsertDiscussionPendingAttachment(attachment);
        renderDiscussionPendingMedia();
        setText(elements.analysisStatus, "Rasm biriktirildi.");
    } catch (error) {
        setText(elements.analysisStatus, error.message || "Rasm biriktirilmadi.");
    } finally {
        if (elements.analysisImageInput) {
            elements.analysisImageInput.value = "";
        }
    }
}

async function handleDiscussionAudioChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
        return;
    }

    try {
        const attachment = await prepareDiscussionAttachment(file, "audio");
        upsertDiscussionPendingAttachment(attachment);
        renderDiscussionPendingMedia();
        setText(elements.analysisStatus, "Audio biriktirildi.");
    } catch (error) {
        setText(elements.analysisStatus, error.message || "Audio biriktirilmadi.");
    } finally {
        if (elements.analysisAudioInput) {
            elements.analysisAudioInput.value = "";
        }
    }
}

function upsertDiscussionPendingAttachment(attachment) {
    discussionState.pendingAttachments = discussionState.pendingAttachments
        .filter((item) => item.type !== attachment.type)
        .concat(attachment);
}

function clearDiscussionPendingMedia() {
    discussionState.pendingAttachments = [];

    if (elements.analysisImageInput) {
        elements.analysisImageInput.value = "";
    }

    if (elements.analysisAudioInput) {
        elements.analysisAudioInput.value = "";
    }

    renderDiscussionPendingMedia();
}

function renderDiscussionPendingMedia() {
    if (!elements.analysisMediaPreview) {
        return;
    }

    if (!discussionState.pendingAttachments.length) {
        elements.analysisMediaPreview.innerHTML = "";
        return;
    }

    elements.analysisMediaPreview.innerHTML = discussionState.pendingAttachments
        .map((attachment) => `
            <div class="analysis-media-card">
                ${attachment.type === "audio"
                    ? renderDiscussionAudioAttachment(attachment)
                    : `<img src="${attachment.dataUrl}" alt="${escapeHtml(attachment.name || "Yuklangan rasm")}">`
                }
            </div>
        `)
        .join("");
}

function renderDiscussionAudioAttachment(attachment) {
    return `
        <div class="analysis-voice-note">
            <div class="analysis-voice-note__head">
                <span class="analysis-voice-note__icon">&#127908;</span>
                <div>
                    <strong>Ovozli xabar</strong>
                    <p>${escapeHtml(attachment.name || "Audio fayl")}</p>
                </div>
            </div>
            <div class="analysis-voice-note__wave" aria-hidden="true">
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
            <audio class="analysis-voice-note__audio" controls src="${attachment.dataUrl}"></audio>
        </div>
    `;
}

async function prepareDiscussionAttachment(file, mediaType) {
    if (mediaType === "image") {
        if (!file.type.startsWith("image/")) {
            throw new Error("Faqat rasm fayl yuklang.");
        }

        return {
            id: `attachment_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            type: "image",
            name: file.name,
            dataUrl: await prepareProfilePhoto(file, 1400)
        };
    }

    if (!file.type.startsWith("audio/")) {
        throw new Error("Faqat audio fayl yuklang.");
    }

    if (file.size > 10 * 1024 * 1024) {
        throw new Error("Audio hajmi 10 MB dan oshmasligi kerak.");
    }

    return {
        id: `attachment_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        type: "audio",
        name: file.name,
        dataUrl: await readFileAsDataUrl(file)
    };
}

function getActiveDiscussionChannel() {
    return DISCUSSION_CHANNELS.find((channel) => channel.id === discussionState.activeChannelId) || DISCUSSION_CHANNELS[0];
}

function getCurrentUsername() {
    const student = getSavedStudent();
    return getUsername(student);
}

function getSavedActiveSection() {
    try {
        return window.sessionStorage.getItem(ACTIVE_SECTION_STORAGE_KEY) || "exams";
    } catch {
        return "exams";
    }
}

function saveActiveSection(sectionId) {
    try {
        window.sessionStorage.setItem(ACTIVE_SECTION_STORAGE_KEY, sectionId);
    } catch {
        // no-op
    }
}

function getUsername(student) {
    const emailPrefix = student?.email?.split("@")[0]?.trim();
    return emailPrefix ? `@${emailPrefix}` : "@foydalanuvchi";
}

async function handleProfilePhotoChange(event) {
    const student = getSavedStudent();
    const file = event.target.files?.[0];

    if (!student || !file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        setText(elements.profilePhotoStatus, "Faqat rasm fayl yuklang.");
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        setText(elements.profilePhotoStatus, "Rasm hajmi 5 MB dan oshmasligi kerak.");
        return;
    }

    try {
        const photoDataUrl = await prepareProfilePhoto(file, 1200);
        const updatedStudent = {
            ...student,
            photoDataUrl
        };

        window.localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(updatedStudent));
        await syncProfilePhoto(updatedStudent);
        renderStudent(updatedStudent);
        await renderFeedbackPanel();
        setText(elements.profilePhotoStatus, "Profil rasmi saqlandi.");
    } catch {
        setText(elements.profilePhotoStatus, "Rasmni yuklab bo'lmadi.");
    } finally {
        if (elements.profilePhotoInput) {
            elements.profilePhotoInput.value = "";
        }
    }
}

async function syncProfilePhoto(student) {
    if (!student?.id) {
        return;
    }

    try {
        const response = await fetch(buildApiUrl("/api/student/profile-photo"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                studentId: student.id,
                photoDataUrl: student.photoDataUrl || ""
            })
        });

        if (!response.ok) {
            throw new Error("Serverga saqlab bo'lmadi.");
        }
    } catch (error) {
        console.error("Profil rasmi serverga saqlanmadi.", error);
    }
}

async function syncStudentSession() {
    const student = getSavedStudent();

    if (!student?.id) {
        return;
    }

    try {
        const response = await fetch(buildApiUrl("/api/student/session"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                studentId: student.id,
                visitorId: getVisitorId(),
                currentPage: "dashboard"
            })
        });

        const payload = await parseJsonResponse(response);

        if (response.ok && payload?.student) {
            window.localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(payload.student));
            renderStudent(payload.student);
        }
    } catch (error) {
        console.error("Student session yuborilmadi.", error);
    }
}

async function syncStoredResultsToServer() {
    const student = getSavedStudent();
    const resultsBySubject = getResultsBySubject();

    if (!student?.id) {
        return;
    }

    const results = Object.values(resultsBySubject || {});

    for (const result of results) {
        try {
            await fetch(buildApiUrl("/api/results"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...result,
                    studentId: result.studentId || student.id,
                    studentEmail: result.studentEmail || student.email,
                    studentFullName: result.studentFullName || student.fullName
                })
            });
        } catch (error) {
            console.error("Saqlangan natijani serverga sync qilib bo'lmadi.", error);
        }
    }
}

function getVisitorId() {
    try {
        return window.localStorage.getItem(VISITOR_ID_STORAGE_KEY) || "";
    } catch {
        return "";
    }
}

function renderFeedbackAvatar(photoDataUrl, authorName) {
    const initials = escapeHtml(getInitials(authorName || "F"));

    if (photoDataUrl) {
        return `<span class="feedback-avatar feedback-avatar--photo"><img class="feedback-avatar__img" src="${photoDataUrl}" alt="${escapeHtml(authorName || "Profil rasmi")}"></span>`;
    }

    return `<span class="feedback-avatar">${initials}</span>`;
}

async function parseJsonResponse(response) {
    const rawText = await response.text();

    if (!rawText.trim()) {
        return {};
    }

    try {
        return JSON.parse(rawText);
    } catch {
        if (rawText.startsWith("<!DOCTYPE") || rawText.startsWith("<html")) {
            throw new Error("Server o'rniga HTML qaytdi. Sahifani yangilang va qayta urinib ko'ring.");
        }

        throw new Error("Serverdan noto'g'ri javob keldi.");
    }
}

function prepareProfilePhoto(file, maxDimension) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const image = new Image();

            image.onload = () => {
                if (image.width <= maxDimension && image.height <= maxDimension) {
                    resolve(String(reader.result || ""));
                    return;
                }

                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");

                if (!context) {
                    reject(new Error("Canvas context topilmadi."));
                    return;
                }

                const scale = Math.min(maxDimension / image.width, maxDimension / image.height);
                const targetWidth = Math.round(image.width * scale);
                const targetHeight = Math.round(image.height * scale);

                canvas.width = targetWidth;
                canvas.height = targetHeight;
                context.imageSmoothingEnabled = true;
                context.imageSmoothingQuality = "high";
                context.drawImage(image, 0, 0, targetWidth, targetHeight);

                const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
                const outputData = outputType === "image/png"
                    ? canvas.toDataURL(outputType)
                    : canvas.toDataURL(outputType, 0.96);

                resolve(outputData);
            };

            image.onerror = () => reject(new Error("Rasmni o'qib bo'lmadi."));
            image.src = String(reader.result || "");
        };

        reader.onerror = () => reject(new Error("Faylni o'qib bo'lmadi."));
        reader.readAsDataURL(file);
    });
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Faylni o'qib bo'lmadi."));
        reader.readAsDataURL(file);
    });
}

function updateAvatar(element, fallbackText, photoDataUrl) {
    if (!element) {
        return;
    }

    if (photoDataUrl) {
        element.innerHTML = `<img class="avatar-photo" src="${photoDataUrl}" alt="Profil rasmi">`;
        element.classList.add("is-photo");
        element.style.backgroundImage = "";
        return;
    }

    element.textContent = fallbackText;
    element.classList.remove("is-photo");
    element.style.backgroundImage = "";
}

function setText(element, value) {
    if (element) {
        element.textContent = value;
    }
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function normalizeText(value) {
    return String(value || "")
        .trim()
        .toLocaleLowerCase("uz-UZ");
}

function normalizeUniversityName(value) {
    return normalizeText(value)
        .replaceAll("o‘", "o'")
        .replaceAll("g‘", "g'")
        .replaceAll("ʻ", "'")
        .replaceAll("’", "'")
        .replaceAll("`", "'")
        .replace(/\s+/g, " ")
        .trim();
}

function getInitials(fullName) {
    return fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join("");
}

function formatTime(totalSeconds) {
    const safeSeconds = Math.max(totalSeconds, 0);
    const hours = String(Math.floor(safeSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(safeSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
}

function formatDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleString("uz-UZ");
}

function getCertificatePercent(result) {
    if (Number.isFinite(Number(result?.certificatePercent))) {
        return Math.round(Number(result.certificatePercent));
    }

    return result?.grade === "A" || result?.grade === "A+" ? 100 : null;
}

function formatPointsSummary(result) {
    if (Number.isFinite(Number(result?.earnedPoints)) && Number.isFinite(Number(result?.totalPoints))) {
        return `${formatPointsValue(result.earnedPoints)}/${formatPointsValue(result.totalPoints)}`;
    }

    return String(result?.points || "0/0");
}

function formatPointsValue(value) {
    const roundedValue = Math.round((Number(value) + Number.EPSILON) * 10) / 10;
    return Number.isInteger(roundedValue) ? String(roundedValue) : roundedValue.toFixed(1);
}

function formatPercentValue(value) {
    return String(Math.round(Number(value) || 0));
}

function bindTelegramLinks() {
    const telegramLinks = Array.from(document.querySelectorAll("[data-telegram-link]"));

    telegramLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            if (!isMobileDevice()) {
                return;
            }

            event.preventDefault();

            const username = link.getAttribute("data-telegram-link");

            if (!username) {
                return;
            }

            const webUrl = `https://t.me/${username}`;
            const appUrl = `tg://resolve?domain=${username}`;

            window.location.href = appUrl;
            window.setTimeout(() => {
                window.location.href = webUrl;
            }, 700);
        });
    });
}

function isMobileDevice() {
    return /android|iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function cssEscape(value) {
    return String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function buildApiUrl(pathname) {
    return `${API_BASE_URL}${pathname}`;
}

function getApiBaseUrl() {
    const { protocol, hostname } = window.location;

    if (window.location.origin && protocol !== "file:") {
        return "";
    }

    if (protocol === "file:" || !hostname) {
        return "http://localhost:3000";
    }

    return "";
}
