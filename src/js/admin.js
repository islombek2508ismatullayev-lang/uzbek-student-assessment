const ADMIN_TOKEN_STORAGE_KEY = "milliy-admin-token";
const SUBJECT_LABELS = {
    "mother-tongue": "Ona tili",
    math: "Matematika",
    chemistry: "Kimyo",
    biology: "Biologiya",
    history: "Tarix",
    physics: "Fizika"
};

const ANSWER_KEY_MAP = {
    A: 0,
    B: 1,
    C: 2,
    D: 3
};

const elements = {
    authShell: document.getElementById("admin-auth-shell"),
    adminApp: document.getElementById("admin-app"),
    loginForm: document.getElementById("admin-login-form"),
    loginUsername: document.getElementById("admin-username"),
    loginPassword: document.getElementById("admin-password"),
    loginButton: document.getElementById("admin-login-button"),
    loginMessage: document.getElementById("admin-login-message"),
    logoutButton: document.getElementById("admin-logout"),
    refreshStudentsButton: document.getElementById("refresh-students"),
    refreshVisitsButton: document.getElementById("refresh-visits"),
    refreshFeedbacksButton: document.getElementById("refresh-feedbacks"),
    refreshDiscussionsButton: document.getElementById("refresh-discussions"),
    refreshTestsButton: document.getElementById("refresh-tests"),
    broadcastForm: document.getElementById("broadcast-notification-form"),
    broadcastTitle: document.getElementById("broadcast-title"),
    broadcastMessage: document.getElementById("broadcast-message"),
    broadcastSubmitButton: document.getElementById("broadcast-submit"),
    broadcastStatus: document.getElementById("broadcast-status"),
    cancelEditButton: document.getElementById("cancel-edit"),
    importCsvButton: document.getElementById("import-csv"),
    loadBulkEditorButton: document.getElementById("load-bulk-editor"),
    saveBulkEditorButton: document.getElementById("save-bulk-editor"),
    message: document.getElementById("admin-message"),
    visitsMessage: document.getElementById("visits-message"),
    feedbacksMessage: document.getElementById("feedbacks-message"),
    discussionsMessage: document.getElementById("discussions-message"),
    testsMessage: document.getElementById("tests-message"),
    studentsCount: document.getElementById("students-count"),
    visitsCount: document.getElementById("visits-count"),
    uniqueVisitorsCount: document.getElementById("unique-visitors-count"),
    studentsStatus: document.getElementById("students-status"),
    questionsCount: document.getElementById("questions-count"),
    activeSubjectLabel: document.getElementById("active-subject-label"),
    studentsTableBody: document.getElementById("students-table-body"),
    studentDetailStatus: document.getElementById("student-detail-status"),
    detailStudentAvatar: document.getElementById("detail-student-avatar"),
    detailStudentName: document.getElementById("detail-student-name"),
    detailStudentEmail: document.getElementById("detail-student-email"),
    detailStudentPhone: document.getElementById("detail-student-phone"),
    detailStudentEmailInline: document.getElementById("detail-student-email-inline"),
    detailStudentPhoneInline: document.getElementById("detail-student-phone-inline"),
    detailStudentOnline: document.getElementById("detail-student-online"),
    detailStudentLastSeen: document.getElementById("detail-student-last-seen"),
    detailStudentFirstSeen: document.getElementById("detail-student-first-seen"),
    detailStudentPage: document.getElementById("detail-student-page"),
    detailStudentVisitsCount: document.getElementById("detail-student-visits-count"),
    detailStudentIp: document.getElementById("detail-student-ip"),
    detailStudentTestsCount: document.getElementById("detail-student-tests-count"),
    detailStudentBestResult: document.getElementById("detail-student-best-result"),
    detailStudentCreatedAt: document.getElementById("detail-student-created-at"),
    detailStudentDreamUniversity: document.getElementById("detail-student-dream-university"),
    detailStudentDreamScore: document.getElementById("detail-student-dream-score"),
    studentResultsBody: document.getElementById("student-results-body"),
    visitsTableBody: document.getElementById("visits-table-body"),
    adminFeedbackList: document.getElementById("admin-feedback-list"),
    adminDiscussionList: document.getElementById("admin-discussion-list"),
    testsTableBody: document.getElementById("tests-table-body"),
    testForm: document.getElementById("test-manager-form"),
    subjectSelect: document.getElementById("test-subject"),
    questionTypeSelect: document.getElementById("question-type"),
    questionInput: document.getElementById("question-text-input"),
    optionA: document.getElementById("option-a"),
    optionB: document.getElementById("option-b"),
    optionC: document.getElementById("option-c"),
    optionD: document.getElementById("option-d"),
    correctAnswer: document.getElementById("correct-answer"),
    singleAnswerField: document.getElementById("single-answer-field"),
    singleAnswerInput: document.getElementById("single-answer-input"),
    multiAnswerCountField: document.getElementById("multi-answer-count-field"),
    multiAnswerCount: document.getElementById("multi-answer-count"),
    multiAnswerConfigField: document.getElementById("multi-answer-config-field"),
    multiAnswerConfig: document.getElementById("multi-answer-config"),
    saveQuestionButton: document.getElementById("save-question"),
    csvImportInput: document.getElementById("csv-import-input"),
    bulkEditorInput: document.getElementById("bulk-editor-input")
};

const state = {
    token: window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || "",
    currentSubjectId: elements.subjectSelect?.value || "mother-tongue",
    currentQuestions: [],
    editingQuestionIndex: null,
    studentSummaries: [],
    selectedStudentId: ""
};

bootAdmin();

if (elements.loginForm) {
    elements.loginForm.addEventListener("submit", handleAdminLogin);
}

if (elements.logoutButton) {
    elements.logoutButton.addEventListener("click", handleLogout);
}

if (elements.refreshStudentsButton) {
    elements.refreshStudentsButton.addEventListener("click", loadStudents);
}

if (elements.refreshVisitsButton) {
    elements.refreshVisitsButton.addEventListener("click", loadVisits);
}

if (elements.refreshFeedbacksButton) {
    elements.refreshFeedbacksButton.addEventListener("click", loadFeedbacks);
}

if (elements.refreshDiscussionsButton) {
    elements.refreshDiscussionsButton.addEventListener("click", loadDiscussions);
}

if (elements.broadcastForm) {
    elements.broadcastForm.addEventListener("submit", handleBroadcastSubmit);
}

if (elements.refreshTestsButton) {
    elements.refreshTestsButton.addEventListener("click", () => loadQuestions(state.currentSubjectId));
}

if (elements.adminFeedbackList) {
    elements.adminFeedbackList.addEventListener("click", handleFeedbackActions);
}

if (elements.adminDiscussionList) {
    elements.adminDiscussionList.addEventListener("click", handleDiscussionActions);
}

if (elements.cancelEditButton) {
    elements.cancelEditButton.addEventListener("click", resetQuestionForm);
}

if (elements.importCsvButton) {
    elements.importCsvButton.addEventListener("click", importCsvQuestions);
}

if (elements.loadBulkEditorButton) {
    elements.loadBulkEditorButton.addEventListener("click", loadBulkEditor);
}

if (elements.saveBulkEditorButton) {
    elements.saveBulkEditorButton.addEventListener("click", saveBulkEditor);
}

if (elements.subjectSelect) {
    elements.subjectSelect.addEventListener("change", () => {
        state.currentSubjectId = elements.subjectSelect.value;
        resetQuestionForm();
        loadQuestions(state.currentSubjectId);
    });
}

if (elements.questionTypeSelect) {
    elements.questionTypeSelect.addEventListener("change", updateQuestionModeUI);
}

if (elements.testForm) {
    elements.testForm.addEventListener("submit", submitQuestionForm);
}

async function bootAdmin() {
    if (!state.token) {
        showLogin();
        return;
    }

    const isValid = await verifySession();

    if (!isValid) {
        handleLogout();
        return;
    }

    showAdminApp();
    loadInitialData();
}

async function handleAdminLogin(event) {
    event.preventDefault();

    try {
        elements.loginButton.disabled = true;
        elements.loginMessage.textContent = "Tekshirilmoqda...";

        const response = await fetch("/api/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: elements.loginUsername.value.trim(),
                password: elements.loginPassword.value.trim()
            })
        });
        const payload = await parseApiResponse(response);

        if (!response.ok) {
            throw new Error(payload.message || "Admin login bajarilmadi.");
        }

        state.token = payload.token;
        window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, payload.token);
        elements.loginForm.reset();
        elements.loginMessage.textContent = "";
        showAdminApp();
        loadInitialData();
    } catch (error) {
        elements.loginMessage.textContent = error.message || "Kirishda xatolik yuz berdi.";
    } finally {
        elements.loginButton.disabled = false;
    }
}

function handleLogout() {
    state.token = "";
    state.currentQuestions = [];
    state.editingQuestionIndex = null;
    window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    resetQuestionForm();
    showLogin();
}

function showLogin() {
    elements.authShell.classList.remove("is-hidden");
    elements.adminApp.classList.add("is-hidden");
}

function showAdminApp() {
    elements.authShell.classList.add("is-hidden");
    elements.adminApp.classList.remove("is-hidden");
}

async function verifySession() {
    try {
        const response = await authorizedFetch("/api/admin/session");
        return response.ok;
    } catch {
        return false;
    }
}

function loadInitialData() {
    loadStudents();
    loadVisits();
    loadFeedbacks();
    loadDiscussions();
    loadQuestions(state.currentSubjectId);
    updateQuestionModeUI();
}

async function loadVisits() {
    if (!elements.visitsCount || !elements.uniqueVisitorsCount) {
        return;
    }

    try {
        if (elements.visitsMessage) {
            elements.visitsMessage.textContent = "Tashriflar statistikasi yuklanmoqda...";
        }
        const response = await authorizedFetch("/api/admin/visits");
        const payload = await parseApiResponse(response);

        if (!response.ok) {
            throw new Error(payload.message || "Tashriflar statistikasini olib bo'lmadi.");
        }

        elements.visitsCount.textContent = String(payload.totalVisits ?? 0);
        elements.uniqueVisitorsCount.textContent = String(payload.uniqueVisitors ?? 0);
        renderVisits(Array.isArray(payload.visitEntries) ? payload.visitEntries : []);
    } catch (error) {
        if (isUnauthorized(error)) {
            handleLogout();
            return;
        }

        elements.visitsCount.textContent = "0";
        elements.uniqueVisitorsCount.textContent = "0";
        renderVisits([]);
        if (elements.visitsMessage) {
            elements.visitsMessage.textContent = error.message || "Tashriflar statistikasi yuklanmadi.";
        }
    }
}

async function loadFeedbacks() {
    const feedbackEntries = await getFeedbackEntries();

    elements.feedbacksMessage.textContent = feedbackEntries.length
        ? "Feedbacklar server orqali boshqarilmoqda."
        : "Hozircha feedback qoldirilmagan.";

    if (!feedbackEntries.length) {
        elements.adminFeedbackList.innerHTML = `
            <article class="feedback-item feedback-item--empty">
                <p>Hali feedback yo'q.</p>
            </article>
        `;
        return;
    }

    elements.adminFeedbackList.innerHTML = feedbackEntries
        .sort(sortFeedbackEntries)
        .map((entry) => {
            const replies = Array.isArray(entry.replies) ? entry.replies.length : 0;

            return `
                <article class="feedback-item${entry.isPinned ? " feedback-item--pinned" : ""}">
                    <div class="feedback-item__head">
                        <div class="feedback-author">
                            ${renderFeedbackAvatar(entry.authorPhotoDataUrl, entry.authorName)}
                            <div>
                                <h3>${escapeHtml(entry.authorName)}</h3>
                                <p class="feedback-item__meta">${escapeHtml(entry.username)} &bull; ${formatDate(entry.createdAt)}</p>
                            </div>
                        </div>
                        <div class="feedback-item__actions">
                            ${entry.isPinned ? '<span class="feedback-item__badge feedback-item__badge--pinned">Pinned</span>' : ""}
                            <button class="button button--secondary table-action" type="button" data-action="toggle-pin" data-feedback-id="${escapeHtml(entry.id)}">
                                ${entry.isPinned ? "Unpin qilish" : "Pin qilish"}
                            </button>
                            <button class="button table-action" type="button" data-action="delete-feedback" data-feedback-id="${escapeHtml(entry.id)}">
                                O'chirish
                            </button>
                        </div>
                    </div>
                    <p class="feedback-item__text">${escapeHtml(entry.message)}</p>
                    <div class="feedback-item__toolbar">
                        <span class="feedback-item__reply-count">&#9829; ${Number(entry.likes || 0)}</span>
                        <span class="feedback-item__reply-count">${replies} ta reply</span>
                    </div>
                </article>
            `;
        })
        .join("");
}

async function loadDiscussions() {
    if (!elements.adminDiscussionList || !elements.discussionsMessage) {
        return;
    }

    try {
        elements.discussionsMessage.textContent = "Chat postlari yuklanmoqda...";
        const response = await authorizedFetch("/api/discussions");
        const payload = await parseApiResponse(response);

        if (!response.ok) {
            throw new Error(payload.message || "Chat postlarini olib bo'lmadi.");
        }

        const posts = Array.isArray(payload.posts) ? postsToAdminView(payload.posts) : [];
        elements.discussionsMessage.textContent = posts.length
            ? "Chatdagi post va replylar shu yerda boshqariladi."
            : "Hozircha chat postlari yo'q.";

        if (!posts.length) {
            elements.adminDiscussionList.innerHTML = `
                <article class="feedback-item feedback-item--empty">
                    <p>Hali chat posti yo'q.</p>
                </article>
            `;
            return;
        }

        elements.adminDiscussionList.innerHTML = posts
            .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
            .map((post) => `
                <article class="feedback-item" data-discussion-post-id="${escapeHtml(post.id)}">
                    <div class="feedback-item__head">
                        <div class="feedback-author">
                            ${renderFeedbackAvatar(post.authorPhotoDataUrl, post.authorName)}
                            <div>
                                <h3>${escapeHtml(post.authorName)}</h3>
                                <p class="feedback-item__meta">${escapeHtml(post.categoryLabel)} &bull; ${formatDate(post.createdAt)}</p>
                            </div>
                        </div>
                        <div class="feedback-item__actions">
                            <button class="button table-action" type="button" data-action="delete-discussion-post" data-post-id="${escapeHtml(post.id)}">
                                Postni o'chirish
                            </button>
                        </div>
                    </div>
                    <p class="feedback-item__text">${escapeHtml(post.message || "(Matnsiz post)")}</p>
                    <div class="feedback-item__toolbar">
                        <span class="feedback-item__reply-count">${post.replyCount} ta reply</span>
                    </div>
                    <div class="feedback-replies">
                        ${post.replies.length ? post.replies.map((reply) => `
                            <article class="feedback-reply">
                                <div class="feedback-reply__head">
                                    <div class="feedback-author feedback-author--reply">
                                        ${renderFeedbackAvatar(reply.authorPhotoDataUrl, reply.authorName)}
                                        <div>
                                            <strong>${escapeHtml(reply.authorName)}</strong>
                                            <span>${formatDate(reply.createdAt)}</span>
                                        </div>
                                    </div>
                                    <button class="button table-action" type="button" data-action="delete-discussion-reply" data-post-id="${escapeHtml(post.id)}" data-reply-id="${escapeHtml(reply.id)}">
                                        Replyni o'chirish
                                    </button>
                                </div>
                                <p>${escapeHtml(reply.message || "(Matnsiz reply)")}</p>
                            </article>
                        `).join("") : '<p class="feedback-replies__empty">Hali reply yozilmagan.</p>'}
                    </div>
                </article>
            `)
            .join("");
    } catch (error) {
        if (isUnauthorized(error)) {
            handleLogout();
            return;
        }

        elements.adminDiscussionList.innerHTML = "";
        elements.discussionsMessage.textContent = error.message || "Chat postlarini yuklashda xatolik yuz berdi.";
    }
}

async function loadStudents() {
    try {
        setStudentStatus("Yuklanmoqda...", "Serverdan ma'lumotlar olinmoqda...");
        const response = await authorizedFetch("/api/admin/student-results");
        const payload = await parseApiResponse(response);

        if (!response.ok) {
            throw new Error(payload.message || "Studentlar ro'yxatini olib bo'lmadi.");
        }

        state.studentSummaries = payload.students || [];
        renderStudents(state.studentSummaries);

        if (!state.studentSummaries.length) {
            renderStudentDetail(null);
            return;
        }

        const selectedStudent = state.studentSummaries.find((student) => student.id === state.selectedStudentId) || state.studentSummaries[0];
        state.selectedStudentId = selectedStudent?.id || "";
        renderStudentDetail(selectedStudent);
    } catch (error) {
        if (isUnauthorized(error)) {
            handleLogout();
            return;
        }

        elements.studentsTableBody.innerHTML = "";
        elements.studentsCount.textContent = "0";
        renderStudentDetail(null);
        setStudentStatus("Xatolik", error.message || "Server bilan ulanishda xatolik yuz berdi.");
    }
}

async function loadQuestions(subjectId) {
    try {
        setTestStatus("Savollar yuklanmoqda...");
        updateActiveSubject(subjectId);

        const response = await authorizedFetch(`/api/tests/${subjectId}`);
        const payload = await parseApiResponse(response);

        if (!response.ok) {
            throw new Error(payload.message || "Savollarni olib bo'lmadi.");
        }

        state.currentQuestions = payload.questions || [];
        renderQuestions(state.currentQuestions);
        elements.bulkEditorInput.value = stringifyQuestionsAsCsv(state.currentQuestions);
    } catch (error) {
        if (isUnauthorized(error)) {
            handleLogout();
            return;
        }

        state.currentQuestions = [];
        elements.testsTableBody.innerHTML = "";
        elements.questionsCount.textContent = "0";
        setTestStatus(error.message || "Savollarni yuklashda xatolik yuz berdi.");
    }
}

async function handleBroadcastSubmit(event) {
    event.preventDefault();

    const title = elements.broadcastTitle?.value.trim() || "";
    const message = elements.broadcastMessage?.value.trim() || "";

    if (title.length < 3) {
        setBroadcastStatus("Sarlavha kamida 3 ta belgidan iborat bo'lsin.", true);
        return;
    }

    if (message.length < 6) {
        setBroadcastStatus("Xabar kamida 6 ta belgidan iborat bo'lsin.", true);
        return;
    }

    try {
        if (elements.broadcastSubmitButton) {
            elements.broadcastSubmitButton.disabled = true;
        }

        setBroadcastStatus("Bildirishnoma yuborilmoqda...");
        const response = await authorizedFetch("/api/admin/notifications/broadcast", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title, message })
        });
        const payload = await parseApiResponse(response);

        if (!response.ok) {
            throw new Error(payload.message || "Bildirishnoma yuborilmadi.");
        }

        elements.broadcastForm.reset();
        setBroadcastStatus(payload.message || "Bildirishnoma yuborildi.");
    } catch (error) {
        if (isUnauthorized(error)) {
            handleLogout();
            return;
        }

        setBroadcastStatus(error.message || "Bildirishnoma yuborilmadi.", true);
    } finally {
        if (elements.broadcastSubmitButton) {
            elements.broadcastSubmitButton.disabled = false;
        }
    }
}

async function submitQuestionForm(event) {
    event.preventDefault();

    const payload = buildQuestionPayload();
    const subjectId = state.currentSubjectId;
    const isEditing = Number.isInteger(state.editingQuestionIndex);
    const url = isEditing
        ? `/api/tests/${subjectId}/questions/${state.editingQuestionIndex}`
        : `/api/tests/${subjectId}/questions`;
    const method = isEditing ? "PUT" : "POST";

    try {
        elements.saveQuestionButton.disabled = true;
        setTestStatus(isEditing ? "Savol yangilanmoqda..." : "Savol saqlanmoqda...");

        const response = await authorizedFetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const result = await parseApiResponse(response);

        if (!response.ok) {
            throw new Error(result.message || "Savolni saqlab bo'lmadi.");
        }

        resetQuestionForm();
        setTestStatus(result.message || "Amal muvaffaqiyatli bajarildi.");
        await loadQuestions(subjectId);
    } catch (error) {
        if (isUnauthorized(error)) {
            handleLogout();
            return;
        }

        setTestStatus(error.message || "Savolni saqlashda xatolik yuz berdi.");
    } finally {
        elements.saveQuestionButton.disabled = false;
    }
}

async function importCsvQuestions() {
    const csv = elements.csvImportInput.value.trim();

    if (!csv) {
        setTestStatus("CSV matnini kiriting.");
        return;
    }

    try {
        elements.importCsvButton.disabled = true;
        setTestStatus("CSV import qilinmoqda...");

        const response = await authorizedFetch(`/api/tests/${state.currentSubjectId}/import`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ csv })
        });
        const result = await parseApiResponse(response);

        if (!response.ok) {
            throw new Error(result.message || "CSV importda xatolik yuz berdi.");
        }

        elements.csvImportInput.value = "";
        setTestStatus(result.message || "CSV import bajarildi.");
        await loadQuestions(state.currentSubjectId);
    } catch (error) {
        if (isUnauthorized(error)) {
            handleLogout();
            return;
        }

        setTestStatus(error.message || "CSV importda xatolik yuz berdi.");
    } finally {
        elements.importCsvButton.disabled = false;
    }
}

function loadBulkEditor() {
    elements.bulkEditorInput.value = stringifyQuestionsAsCsv(state.currentQuestions);
    setTestStatus("Joriy savollar tez tahrirlash oynasiga yuklandi.");
}

async function saveBulkEditor() {
    const csv = elements.bulkEditorInput.value.trim();

    if (!csv) {
        setTestStatus("Tez tahrirlash oynasi bo'sh.");
        return;
    }

    try {
        elements.saveBulkEditorButton.disabled = true;
        setTestStatus("Barcha savollar saqlanmoqda...");

        const questions = parseCsvToQuestions(csv);
        const response = await authorizedFetch(`/api/tests/${state.currentSubjectId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ questions })
        });
        const result = await parseApiResponse(response);

        if (!response.ok) {
            throw new Error(result.message || "Savollarni to'liq saqlab bo'lmadi.");
        }

        setTestStatus(result.message || "Savollar yangilandi.");
        await loadQuestions(state.currentSubjectId);
    } catch (error) {
        if (isUnauthorized(error)) {
            handleLogout();
            return;
        }

        setTestStatus(error.message || "Tez tahrirlashni saqlashda xatolik yuz berdi.");
    } finally {
        elements.saveBulkEditorButton.disabled = false;
    }
}

async function deleteQuestion(questionIndex) {
    const confirmed = window.confirm("Bu savolni o'chirmoqchimisiz?");

    if (!confirmed) {
        return;
    }

    try {
        setTestStatus("Savol o'chirilmoqda...");
        const response = await authorizedFetch(`/api/tests/${state.currentSubjectId}/questions/${questionIndex}`, {
            method: "DELETE"
        });
        const result = await parseApiResponse(response);

        if (!response.ok) {
            throw new Error(result.message || "Savolni o'chirib bo'lmadi.");
        }

        if (state.editingQuestionIndex === questionIndex) {
            resetQuestionForm();
        }

        setTestStatus(result.message || "Savol o'chirildi.");
        await loadQuestions(state.currentSubjectId);
    } catch (error) {
        if (isUnauthorized(error)) {
            handleLogout();
            return;
        }

        setTestStatus(error.message || "Savolni o'chirishda xatolik yuz berdi.");
    }
}

function startEditingQuestion(questionIndex) {
    const question = state.currentQuestions[questionIndex];

    if (!question) {
        return;
    }

    state.editingQuestionIndex = questionIndex;
    elements.questionTypeSelect.value = question.type || "mcq";
    updateQuestionModeUI();
    elements.questionInput.value = question.question;

    if (!question.type) {
        elements.optionA.value = question.options[0] || "";
        elements.optionB.value = question.options[1] || "";
        elements.optionC.value = question.options[2] || "";
        elements.optionD.value = question.options[3] || "";
        elements.correctAnswer.value = getAnswerKey(question);
    } else if (question.type === "closed") {
        elements.singleAnswerInput.value = Array.isArray(question.answer) ? question.answer[0] || "" : question.answer || "";
    } else {
        const answerGroups = Array.isArray(question.answer) ? question.answer : [];
        elements.multiAnswerCount.value = String(answerGroups.length || (question.type === "closed-pair" ? 2 : 3));
        elements.multiAnswerConfig.value = answerGroups
            .map((answers, index) => `${String.fromCharCode(97 + index)}) Javob|${(Array.isArray(answers) ? answers : [answers]).join(";")}`)
            .join("\n");
    }

    elements.saveQuestionButton.textContent = "Savolni yangilash";
    elements.cancelEditButton.classList.remove("is-hidden");
    setTestStatus("Tahrirlash rejimi yoqildi.");
    elements.questionInput.focus();
}

function resetQuestionForm() {
    const subjectId = state.currentSubjectId;
    state.editingQuestionIndex = null;
    elements.testForm.reset();
    elements.subjectSelect.value = subjectId;
    elements.questionTypeSelect.value = "mcq";
    elements.correctAnswer.value = "A";
    elements.singleAnswerInput.value = "";
    elements.multiAnswerCount.value = "3";
    elements.multiAnswerConfig.value = "";
    elements.saveQuestionButton.textContent = "Savolni saqlash";
    elements.cancelEditButton.classList.add("is-hidden");
    updateQuestionModeUI();
}

function buildQuestionPayload() {
    const questionType = elements.questionTypeSelect.value || "mcq";

    if (questionType === "closed") {
        return {
            type: "closed",
            question: elements.questionInput.value.trim(),
            placeholder: "Javobni yozing",
            answer: [elements.singleAnswerInput.value.trim()]
        };
    }

    if (questionType === "closed-pair" || questionType === "closed-multi") {
        const configLines = elements.multiAnswerConfig.value
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);
        const answerGroups = configLines.map((line, index) => {
            const [labelPart, valuesPart] = line.includes("|") ? line.split("|") : [`${String.fromCharCode(97 + index)}) Javob`, line];
            return {
                label: labelPart.trim() || `${String.fromCharCode(97 + index)}) Javob`,
                answers: String(valuesPart || "")
                    .split(";")
                    .map((value) => value.trim())
                    .filter(Boolean)
            };
        });

        return {
            type: questionType,
            question: elements.questionInput.value.trim(),
            fields: answerGroups.map((group) => ({
                label: group.label,
                placeholder: `${group.label.toLowerCase()} ni kiriting`
            })),
            answer: answerGroups.map((group) => group.answers)
        };
    }

    const options = [
        elements.optionA.value.trim(),
        elements.optionB.value.trim(),
        elements.optionC.value.trim(),
        elements.optionD.value.trim()
    ];
    const answerIndex = ANSWER_KEY_MAP[elements.correctAnswer.value];

    return {
        question: elements.questionInput.value.trim(),
        options,
        answer: options[answerIndex] || ""
    };
}

function renderStudents(students) {
    elements.studentsCount.textContent = String(students.length);
    const onlineCount = students.filter((student) => student.isOnline).length;
    elements.studentsStatus.textContent = students.length ? `${onlineCount} ta online` : "Bo'sh";
    elements.message.textContent = students.length
        ? "Backend orqali saqlangan studentlar va ularning natijalari."
        : "Hali birorta student ro'yxatdan o'tmagan.";

    if (!students.length) {
        elements.studentsTableBody.innerHTML = `
            <tr>
                <td colspan="7">Hozircha ma'lumot yo'q.</td>
            </tr>
        `;
        return;
    }

    elements.studentsTableBody.innerHTML = students
        .map((student, index) => `
            <tr class="${student.id === state.selectedStudentId ? "students-table__row is-active" : "students-table__row"}" data-student-id="${escapeHtml(student.id)}">
                <td>${index + 1}</td>
                <td>${renderStudentAvatar(student)}</td>
                <td><strong>${escapeHtml(student.fullName)}</strong></td>
                <td><span class="admin-presence ${student.isOnline ? "admin-presence--online" : "admin-presence--offline"}">${student.isOnline ? "Online" : "Offline"}</span></td>
                <td>${formatDate(student.lastSeenAt)}</td>
                <td>${student.visitCount || 0} marta</td>
                <td>${student.bestResult ? `${escapeHtml(student.bestResult.subjectLabel)} | ${escapeHtml(student.bestResult.grade)} | ${student.bestResult.percent}%` : "-"}</td>
            </tr>
        `)
        .join("");

    elements.studentsTableBody.querySelectorAll("[data-student-id]").forEach((row) => {
        row.addEventListener("click", () => {
            const student = state.studentSummaries.find((entry) => entry.id === row.dataset.studentId);

            if (!student) {
                return;
            }

            state.selectedStudentId = student.id;
            renderStudents(state.studentSummaries);
            renderStudentDetail(student);
        });
    });
}

function renderStudentDetail(student) {
    if (!student) {
        elements.studentDetailStatus.textContent = "Jadvaldan student tanlang.";
        elements.detailStudentAvatar.textContent = "MS";
        elements.detailStudentAvatar.innerHTML = "MS";
        elements.detailStudentName.textContent = "Student tanlanmagan";
        elements.detailStudentEmail.textContent = "-";
        elements.detailStudentPhone.textContent = "-";
        elements.detailStudentEmailInline.textContent = "-";
        elements.detailStudentPhoneInline.textContent = "-";
        elements.detailStudentOnline.textContent = "-";
        elements.detailStudentLastSeen.textContent = "-";
        elements.detailStudentFirstSeen.textContent = "-";
        elements.detailStudentPage.textContent = "-";
        elements.detailStudentVisitsCount.textContent = "0";
        elements.detailStudentIp.textContent = "-";
        elements.detailStudentTestsCount.textContent = "0";
        elements.detailStudentBestResult.textContent = "-";
        elements.detailStudentCreatedAt.textContent = "-";
        elements.detailStudentDreamUniversity.textContent = "-";
        elements.detailStudentDreamScore.textContent = "-";
        elements.studentResultsBody.innerHTML = `
            <tr>
                <td colspan="6">Student tanlangandan keyin natijalar shu yerda chiqadi.</td>
            </tr>
        `;
        return;
    }

    elements.studentDetailStatus.textContent = "Tanlangan student bo'yicha batafsil ma'lumot.";
    renderStudentDetailAvatar(student);
    elements.detailStudentName.textContent = student.fullName;
    elements.detailStudentEmail.textContent = student.email;
    elements.detailStudentPhone.textContent = student.phone;
    elements.detailStudentEmailInline.textContent = student.email;
    elements.detailStudentPhoneInline.textContent = student.phone;
    elements.detailStudentOnline.textContent = student.isOnline ? "Online" : "Offline";
    elements.detailStudentLastSeen.textContent = formatDate(student.lastSeenAt);
    elements.detailStudentFirstSeen.textContent = formatDate(student.firstSeenAt);
    elements.detailStudentPage.textContent = student.currentPage || "-";
    elements.detailStudentVisitsCount.textContent = String(student.visitCount || 0);
    elements.detailStudentIp.textContent = student.ipAddress || "-";
    elements.detailStudentTestsCount.textContent = String(student.completedTestsCount || 0);
    elements.detailStudentBestResult.textContent = student.bestResult
        ? `${student.bestResult.subjectLabel}: ${student.bestResult.grade} (${student.bestResult.percent}%)`
        : "Hali ishlamagan";
    elements.detailStudentCreatedAt.textContent = formatDate(student.createdAt);
    elements.detailStudentDreamUniversity.textContent = student.dreamUniversity || "-";
    elements.detailStudentDreamScore.textContent = student.dreamScore ? `${student.dreamScore} ball` : "-";

    if (!student.results?.length) {
        elements.studentResultsBody.innerHTML = `
            <tr>
                <td colspan="6">Bu student hali birorta test ishlamagan.</td>
            </tr>
        `;
        return;
    }

    elements.studentResultsBody.innerHTML = student.results
        .map((result) => `
            <tr>
                <td>${escapeHtml(result.subjectLabel)}</td>
                <td>${escapeHtml(result.grade)}</td>
                <td>${escapeHtml(result.points || `${result.earnedPoints}/${result.totalPoints}`)}</td>
                <td>${result.percent}%</td>
                <td>${result.correct}/${result.total}</td>
                <td>${formatDate(result.completedAt)}</td>
            </tr>
        `)
        .join("");
}

function renderVisits(visits) {
    elements.visitsMessage.textContent = visits.length
        ? "Websitega kirgan foydalanuvchilar ro'yxati."
        : "Hozircha tashriflar qayd etilmagan.";

    if (!visits.length) {
        elements.visitsTableBody.innerHTML = `
            <tr>
                <td colspan="6">Hozircha ma'lumot yo'q.</td>
            </tr>
        `;
        return;
    }

    elements.visitsTableBody.innerHTML = visits
        .map((visit, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(visit.visitorId)}</td>
                <td>${escapeHtml(visit.ipAddress || "-")}</td>
                <td>${formatDate(visit.firstSeenAt)}</td>
                <td>${formatDate(visit.lastSeenAt)}</td>
                <td>${visit.visitCount}</td>
            </tr>
        `)
        .join("");
}

function renderQuestions(questions) {
    elements.questionsCount.textContent = String(questions.length);
    elements.testsMessage.textContent = questions.length
        ? "Fan bo'yicha saqlangan savollar ro'yxati."
        : "Bu fan uchun hali savollar qo'shilmagan.";

    if (!questions.length) {
        elements.testsTableBody.innerHTML = `
            <tr>
                <td colspan="5">Hozircha savollar yo'q.</td>
            </tr>
        `;
        return;
    }

    elements.testsTableBody.innerHTML = questions
        .map((question, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(question.question)}</td>
                <td>${formatQuestionTypeSummary(question)}</td>
                <td>${formatQuestionAnswerSummary(question)}</td>
                <td>
                    <div class="table-actions">
                        <button class="button button--secondary table-action" type="button" data-action="edit" data-question-index="${index}">Tahrirlash</button>
                        <button class="button table-action" type="button" data-action="delete" data-question-index="${index}">O'chirish</button>
                    </div>
                </td>
            </tr>
        `)
        .join("");

    elements.testsTableBody.querySelectorAll("[data-action='edit']").forEach((button) => {
        button.addEventListener("click", () => startEditingQuestion(Number(button.dataset.questionIndex)));
    });

    elements.testsTableBody.querySelectorAll("[data-action='delete']").forEach((button) => {
        button.addEventListener("click", () => deleteQuestion(Number(button.dataset.questionIndex)));
    });
}

function updateQuestionModeUI() {
    const questionType = elements.questionTypeSelect?.value || "mcq";
    document.querySelectorAll(".question-mode").forEach((element) => {
        element.classList.add("is-hidden");
    });

    if (questionType === "mcq") {
        document.querySelectorAll(".question-mode--mcq").forEach((element) => element.classList.remove("is-hidden"));
        return;
    }

    if (questionType === "closed") {
        elements.singleAnswerField.classList.remove("is-hidden");
        return;
    }

    elements.multiAnswerCountField.classList.remove("is-hidden");
    elements.multiAnswerConfigField.classList.remove("is-hidden");
}

function formatQuestionTypeSummary(question) {
    if (!question.type) {
        return (question.options || []).map((option, optionIndex) => `${String.fromCharCode(65 + optionIndex)}. ${escapeHtml(option)}`).join("<br>");
    }

    if (question.type === "closed") {
        return "Ochiq test";
    }

    if (question.type === "closed-pair") {
        return "2 qismli yozma";
    }

    if (question.type === "closed-multi") {
        return `${Array.isArray(question.fields) ? question.fields.length : 0} qismli yozma`;
    }

    return escapeHtml(question.type);
}

function formatQuestionAnswerSummary(question) {
    if (!question.type) {
        return escapeHtml(question.answer);
    }

    if (question.type === "closed") {
        return escapeHtml(Array.isArray(question.answer) ? question.answer.join(" | ") : question.answer);
    }

    return Array.isArray(question.answer)
        ? question.answer.map((answers, index) => `${String.fromCharCode(97 + index)}) ${(Array.isArray(answers) ? answers : [answers]).map(escapeHtml).join(" | ")}`).join("<br>")
        : "-";
}

async function handleFeedbackActions(event) {
    const button = event.target.closest("[data-action='toggle-pin'], [data-action='delete-feedback']");

    if (!button) {
        return;
    }

    const feedbackId = button.dataset.feedbackId;

    if (!feedbackId) {
        return;
    }

    try {
        if (button.dataset.action === "delete-feedback") {
            const confirmed = window.confirm("Bu feedbackni o'chirmoqchimisiz? Uni faqat admin qayta tiklay oladi.");

            if (!confirmed) {
                return;
            }

            const response = await authorizedFetch(`/api/admin/feedbacks/${encodeURIComponent(feedbackId)}`, {
                method: "DELETE"
            });
            const payload = await parseApiResponse(response);

            if (!response.ok) {
                throw new Error(payload.message || "Feedbackni o'chirib bo'lmadi.");
            }

            if (elements.feedbacksMessage) {
                elements.feedbacksMessage.textContent = payload.message || "Feedback o'chirildi.";
            }

            loadFeedbacks();
            return;
        }

        const response = await authorizedFetch(`/api/admin/feedbacks/${encodeURIComponent(feedbackId)}/pin`, {
            method: "POST"
        });
        const payload = await parseApiResponse(response);

        if (!response.ok) {
            throw new Error(payload.message || "Pin holatini saqlab bo'lmadi.");
        }

        loadFeedbacks();
    } catch (error) {
        if (isUnauthorized(error)) {
            handleLogout();
            return;
        }

        if (elements.feedbacksMessage) {
            elements.feedbacksMessage.textContent = error.message || "Feedback bilan amal bajarilmadi.";
        }
    }
}

async function handleDiscussionActions(event) {
    const button = event.target.closest("[data-action='delete-discussion-post'], [data-action='delete-discussion-reply']");

    if (!button) {
        return;
    }

    const postId = button.dataset.postId;

    if (!postId) {
        return;
    }

    try {
        if (button.dataset.action === "delete-discussion-reply") {
            const replyId = button.dataset.replyId;

            if (!replyId) {
                return;
            }

            const confirmed = window.confirm("Bu discussion replyni o'chirmoqchimisiz? Uni faqat admin qayta tiklay oladi.");

            if (!confirmed) {
                return;
            }

            const response = await authorizedFetch(`/api/admin/discussions/posts/${encodeURIComponent(postId)}/replies/${encodeURIComponent(replyId)}`, {
                method: "DELETE"
            });
            const payload = await parseApiResponse(response);

            if (!response.ok) {
                throw new Error(payload.message || "Discussion replyni o'chirib bo'lmadi.");
            }

            elements.discussionsMessage.textContent = payload.message || "Discussion reply o'chirildi.";
            loadDiscussions();
            return;
        }

        const confirmed = window.confirm("Bu discussion postni o'chirmoqchimisiz? Ichidagi barcha replylar ham o'chadi.");

        if (!confirmed) {
            return;
        }

        const response = await authorizedFetch(`/api/admin/discussions/posts/${encodeURIComponent(postId)}`, {
            method: "DELETE"
        });
        const payload = await parseApiResponse(response);

        if (!response.ok) {
            throw new Error(payload.message || "Discussion postni o'chirib bo'lmadi.");
        }

        elements.discussionsMessage.textContent = payload.message || "Discussion post o'chirildi.";
        loadDiscussions();
    } catch (error) {
        if (isUnauthorized(error)) {
            handleLogout();
            return;
        }

        elements.discussionsMessage.textContent = error.message || "Chat bilan amal bajarilmadi.";
    }
}

function updateActiveSubject(subjectId) {
    elements.activeSubjectLabel.textContent = SUBJECT_LABELS[subjectId] || subjectId;
}

function postsToAdminView(posts) {
    return posts.map((post) => ({
        id: String(post?.id || ""),
        categoryLabel: String(post?.categoryLabel || "Chat"),
        authorName: String(post?.authorName || "Foydalanuvchi"),
        authorPhotoDataUrl: String(post?.authorPhotoDataUrl || ""),
        message: String(post?.message || "").trim(),
        createdAt: post?.createdAt || new Date().toISOString(),
        replies: Array.isArray(post?.replies)
            ? post.replies.map((reply) => ({
                id: String(reply?.id || ""),
                authorName: String(reply?.authorName || "Foydalanuvchi"),
                authorPhotoDataUrl: String(reply?.authorPhotoDataUrl || ""),
                message: String(reply?.message || "").trim(),
                createdAt: reply?.createdAt || new Date().toISOString()
            }))
            : [],
        replyCount: Array.isArray(post?.replies) ? post.replies.length : 0
    }));
}

function setBroadcastStatus(message, isError = false) {
    if (!elements.broadcastStatus) {
        return;
    }

    elements.broadcastStatus.textContent = message || "";
    elements.broadcastStatus.classList.toggle("is-error", Boolean(message) && isError);
    elements.broadcastStatus.classList.toggle("is-success", Boolean(message) && !isError);
}

function getAnswerKey(question) {
    const index = question.options.findIndex((option) => option === question.answer);
    return Object.keys(ANSWER_KEY_MAP).find((key) => ANSWER_KEY_MAP[key] === index) || "A";
}

function stringifyQuestionsAsCsv(questions) {
    const header = "question,optionA,optionB,optionC,optionD,answer";
    const rows = questions.map((question) => [
        question.question,
        question.options[0] || "",
        question.options[1] || "",
        question.options[2] || "",
        question.options[3] || "",
        question.answer
    ]);

    return [header]
        .concat(rows.map((row) => row.map(escapeCsvValue).join(",")))
        .join("\n");
}

function parseCsvToQuestions(csv) {
    const trimmedCsv = String(csv || "").trim();

    if (!trimmedCsv) {
        throw new Error("CSV matnini kiriting.");
    }

    const lines = trimmedCsv
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    if (lines.length < 2) {
        throw new Error("Kamida bitta savol qatori bo'lishi kerak.");
    }

    return lines.slice(1).map((line) => {
        const row = parseCsvLine(line);

        if (row.length < 6) {
            throw new Error("Har bir qatorda 6 ta ustun bo'lishi kerak.");
        }

        return {
            question: row[0],
            options: row.slice(1, 5),
            answer: row[5]
        };
    });
}

function parseCsvLine(line) {
    const values = [];
    let current = "";
    let isInsideQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
        const character = line[index];
        const nextCharacter = line[index + 1];

        if (character === '"') {
            if (isInsideQuotes && nextCharacter === '"') {
                current += '"';
                index += 1;
            } else {
                isInsideQuotes = !isInsideQuotes;
            }
            continue;
        }

        if (character === "," && !isInsideQuotes) {
            values.push(current.trim());
            current = "";
            continue;
        }

        current += character;
    }

    values.push(current.trim());
    return values;
}

function escapeCsvValue(value) {
    const safeValue = String(value ?? "");
    return `"${safeValue.replaceAll('"', '""')}"`;
}

function setStudentStatus(status, message) {
    elements.studentsStatus.textContent = status;
    elements.message.textContent = message;
}

function setTestStatus(message) {
    elements.testsMessage.textContent = message;
}

async function getFeedbackEntries() {
    try {
        const response = await fetch("/api/feedbacks");
        const payload = await parseApiResponse(response);
        return Array.isArray(payload.feedbacks) ? payload.feedbacks.map(normalizeFeedbackEntry) : [];
    } catch {
        return [];
    }
}

function normalizeFeedbackEntry(entry) {
    const likedBy = Array.isArray(entry?.likedBy)
        ? Array.from(new Set(entry.likedBy.map((value) => String(value || "").trim()).filter(Boolean)))
        : [];
    const replies = Array.isArray(entry?.replies)
        ? entry.replies.filter(Boolean)
        : [];

    return {
        id: entry?.id || `feedback_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        authorName: String(entry?.authorName || "Foydalanuvchi"),
        authorEmail: String(entry?.authorEmail || ""),
        username: String(entry?.username || "@foydalanuvchi"),
        message: String(entry?.message || "").trim(),
        authorPhotoDataUrl: String(entry?.authorPhotoDataUrl || ""),
        createdAt: entry?.createdAt || new Date().toISOString(),
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

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
}

async function authorizedFetch(url, options = {}) {
    const headers = new Headers(options.headers || {});

    if (state.token) {
        headers.set("Authorization", `Bearer ${state.token}`);
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401) {
        const error = new Error("Admin sessiyasi tugagan. Qayta kiring.");
        error.code = 401;
        throw error;
    }

    return response;
}

async function parseApiResponse(response) {
    const rawText = await response.text();

    if (!rawText.trim()) {
        if (response.ok) {
            return {};
        }

        throw new Error("Server bo'sh javob qaytardi. Serverni qayta ishga tushirib ko'ring.");
    }

    try {
        return JSON.parse(rawText);
    } catch {
        if (rawText.startsWith("<!DOCTYPE") || rawText.startsWith("<html")) {
            throw new Error("API o'rniga HTML qaytdi. Serverni qayta ishga tushiring.");
        }

        throw new Error("Serverdan noto'g'ri formatdagi javob keldi.");
    }
}

function isUnauthorized(error) {
    return error?.code === 401;
}

function formatDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleString("uz-UZ");
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function renderStudentAvatar(student) {
    const initials = escapeHtml(getInitials(student.fullName || "F"));

    if (student.photoDataUrl) {
        return `<span class="feedback-avatar feedback-avatar--photo"><img class="feedback-avatar__img" src="${student.photoDataUrl}" alt="${escapeHtml(student.fullName || "Profil rasmi")}"></span>`;
    }

    return `<span class="feedback-avatar">${initials}</span>`;
}

function renderStudentDetailAvatar(student) {
    const initials = escapeHtml(getInitials(student.fullName || "F"));

    if (student.photoDataUrl) {
        elements.detailStudentAvatar.innerHTML = `<img class="feedback-avatar__img" src="${student.photoDataUrl}" alt="${escapeHtml(student.fullName || "Profil rasmi")}">`;
        return;
    }

    elements.detailStudentAvatar.textContent = initials || "MS";
}

function renderFeedbackAvatar(photoDataUrl, authorName) {
    const initials = escapeHtml(getInitials(authorName || "F"));

    if (photoDataUrl) {
        return `<span class="feedback-avatar feedback-avatar--photo"><img class="feedback-avatar__img" src="${photoDataUrl}" alt="${escapeHtml(authorName || "Profil rasmi")}"></span>`;
    }

    return `<span class="feedback-avatar">${initials}</span>`;
}

function getInitials(fullName) {
    return String(fullName || "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join("");
}
