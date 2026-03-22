const STUDENT_STORAGE_KEY = "math-student-profile";
const LAST_RESULT_STORAGE_KEY = "milliy-last-result";
const RESULTS_BY_SUBJECT_STORAGE_KEY = "milliy-results-by-subject";
const VISITOR_ID_STORAGE_KEY = "milliy-visitor-id";
const SESSION_HEARTBEAT_MS = 1000 * 60;
const API_BASE_URL = getApiBaseUrl();

const SUBJECTS = {
    "mother-tongue": {
        id: "mother-tongue",
        label: "Ona tili",
        file: "data/mother-tongue.json",
        durationSeconds: 10800,
        gradeBands: [
            { min: 41, grade: "A+" },
            { min: 37, grade: "A" },
            { min: 34, grade: "B+" },
            { min: 30, grade: "B" },
            { min: 25, grade: "C+" },
            { min: 16, grade: "C" },
            { min: 0, grade: "Fail" }
        ]
    },
    math: {
        id: "math",
        label: "Matematika",
        file: "data/math.json",
        durationSeconds: 10800,
        gradeBands: [
            { min: 42, grade: "A+" },
            { min: 37, grade: "A" },
            { min: 33, grade: "B+" },
            { min: 28, grade: "B" },
            { min: 24, grade: "C+" },
            { min: 16, grade: "C" },
            { min: 0, grade: "Fail" }
        ]
    },
    chemistry: {
        id: "chemistry",
        label: "Kimyo",
        file: "data/chemistry.json",
        durationSeconds: 10800,
        gradeBands: [
            { min: 41, grade: "A+" },
            { min: 37, grade: "A" },
            { min: 33, grade: "B+" },
            { min: 28, grade: "B" },
            { min: 23, grade: "C+" },
            { min: 16, grade: "C" },
            { min: 0, grade: "Fail" }
        ]
    },
    biology: {
        id: "biology",
        label: "Biologiya",
        file: "data/biology.json",
        durationSeconds: 10800,
        gradeBands: [
            { min: 40, grade: "A+" },
            { min: 36, grade: "A" },
            { min: 31, grade: "B+" },
            { min: 26, grade: "B" },
            { min: 21, grade: "C+" },
            { min: 16, grade: "C" },
            { min: 0, grade: "Fail" }
        ]
    },
    history: {
        id: "history",
        label: "Tarix",
        file: "data/history.json",
        durationSeconds: 10800,
        certificateBands: [
            { min: 93, grade: "A+", percent: 100 },
            { min: 91, grade: "A", percent: 100 },
            { min: 84, grade: "B+", percent: 85 },
            { min: 75, grade: "B", percent: 75 },
            { min: 67, grade: "C+", percent: 65 },
            { min: 52, grade: "C", percent: 55 }
        ]
    },
    physics: {
        id: "physics",
        label: "Fizika",
        file: "data/physics.json",
        durationSeconds: 10800,
        certificateBands: [
            { min: 42, grade: "A+", percent: 100 },
            { min: 40, grade: "A", percent: 100 },
            { min: 36, grade: "B+", percent: 85 },
            { min: 31, grade: "B", percent: 75 },
            { min: 26, grade: "C+", percent: 65 },
            { min: 21, grade: "C", percent: 55 }
        ]
    }
};

const DEFAULT_GRADE_BANDS = [
    { min: 41, grade: "A+" },
    { min: 37, grade: "A" },
    { min: 34, grade: "B+" },
    { min: 30, grade: "B" },
    { min: 25, grade: "C+" },
    { min: 16, grade: "C" },
    { min: 0, grade: "Fail" }
];

const elements = {
    examSubjectTitle: document.getElementById("exam-subject-title"),
    examTimer: document.getElementById("exam-timer"),
    examStudentName: document.getElementById("exam-student-name"),
    examStartScreen: document.getElementById("exam-start-screen"),
    examStartTitle: document.getElementById("exam-start-title"),
    examStartDescription: document.getElementById("exam-start-description"),
    openAnswerRule: document.getElementById("open-answer-rule"),
    beginExamButton: document.getElementById("begin-exam"),
    examWorkspace: document.getElementById("exam-workspace"),
    examPassage: document.getElementById("exam-passage"),
    examPassageLabel: document.getElementById("exam-passage-label"),
    examPassageTitle: document.getElementById("exam-passage-title"),
    examPassageBody: document.getElementById("exam-passage-body"),
    examPassageContent: document.getElementById("exam-passage-content"),
    togglePassageButton: document.getElementById("toggle-passage"),
    examQuestionIndex: document.getElementById("exam-question-index"),
    examQuestionLabel: document.getElementById("exam-question-label"),
    examQuestionStatus: document.getElementById("exam-question-status"),
    markReviewButton: document.getElementById("mark-review"),
    examQuestionImageWrap: document.getElementById("exam-question-image-wrap"),
    examQuestionImage: document.getElementById("exam-question-image"),
    examQuestionCopy: document.getElementById("exam-question-copy"),
    examQuestionCopyHead: document.getElementById("exam-question-copy-head"),
    examQuestionCopyBody: document.getElementById("exam-question-copy-body"),
    toggleQuestionTextButton: document.getElementById("toggle-question-text"),
    examQuestionText: document.getElementById("exam-question-text"),
    examQuestionContext: document.getElementById("exam-question-context"),
    examOptions: document.getElementById("exam-options"),
    previousQuestionButton: document.getElementById("previous-question"),
    nextQuestionButton: document.getElementById("next-question"),
    footerProgressText: document.getElementById("footer-progress-text"),
    openFinishModalButton: document.getElementById("open-finish-modal"),
    finishModal: document.getElementById("finish-modal"),
    finishModalText: document.getElementById("finish-modal-text"),
    cancelFinishButton: document.getElementById("cancel-finish"),
    confirmFinishButton: document.getElementById("confirm-finish"),
    openQuestionMapButton: document.getElementById("open-question-map"),
    questionMapModal: document.getElementById("question-map-modal"),
    closeQuestionMapButton: document.getElementById("close-question-map"),
    questionMapGrid: document.getElementById("question-map-grid")
};

const state = {
    student: null,
    subject: null,
    questions: [],
    currentIndex: 0,
    timeLeft: 0,
    timerId: null,
    responses: [],
    isReady: false,
    passages: {},
    isPassageCollapsed: false,
    isQuestionTextCollapsed: false
};

bootExam();

elements.beginExamButton.addEventListener("click", beginExam);
elements.previousQuestionButton.addEventListener("click", goToPreviousQuestion);
elements.nextQuestionButton.addEventListener("click", goToNextQuestion);
elements.openFinishModalButton.addEventListener("click", openFinishModal);
elements.cancelFinishButton.addEventListener("click", closeFinishModal);
elements.confirmFinishButton.addEventListener("click", finishExam);
elements.markReviewButton.addEventListener("click", toggleReviewFlag);
elements.openQuestionMapButton.addEventListener("click", openQuestionMap);
elements.closeQuestionMapButton.addEventListener("click", closeQuestionMap);
elements.togglePassageButton.addEventListener("click", togglePassageVisibility);
elements.toggleQuestionTextButton.addEventListener("click", toggleQuestionTextVisibility);

function bootExam() {
    const student = getSavedStudent();
    const subjectId = new URLSearchParams(window.location.search).get("subject");
    const subject = SUBJECTS[subjectId];
    const savedResult = getStoredSubjectResult(subjectId);

    if (!student || !subject) {
        window.location.href = "dashboard.html";
        return;
    }

    if (savedResult) {
        window.localStorage.setItem(LAST_RESULT_STORAGE_KEY, JSON.stringify(savedResult));
        window.location.href = `results.html?subject=${subjectId}`;
        return;
    }

    state.student = student;
    state.subject = subject;
    state.timeLeft = subject.durationSeconds;
    syncStudentSession();
    window.setInterval(syncStudentSession, SESSION_HEARTBEAT_MS);

    elements.examSubjectTitle.textContent = subject.label;
    elements.examStartTitle.textContent = `${subject.label} bo'limi`;
    elements.examStartDescription.textContent = "Savollar yuklangach, bo'limni boshlashingiz mumkin.";
    if (elements.openAnswerRule) {
        elements.openAnswerRule.innerHTML = getOpenAnswerRule(subject.id);
    }
    elements.examStudentName.textContent = student.fullName;
    elements.beginExamButton.disabled = true;
    updateTimer();

    fetch(subject.file)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Savollar faylini yuklab bo'lmadi.");
            }

            return response.json();
        })
        .then((payload) => {
            state.passages = payload.passages || {};
            state.questions = payload.questions || [];
            state.responses = state.questions.map((question) => ({
                question: question.question,
                correctAnswer: question.answer,
                selectedAnswer: null,
                flagged: false
            }));

            if (!state.questions.length) {
                throw new Error("Bu fan uchun savollar topilmadi.");
            }

            state.isReady = true;
            elements.beginExamButton.disabled = false;
            elements.examStartDescription.textContent = "Savollar yuklandi, imtihonni boshlashingiz mumkin.";
        })
        .catch((error) => {
            console.error(error);
            state.isReady = false;
            elements.examStartDescription.textContent = error.message || "Savollarni yuklab bo'lmadi.";
            elements.beginExamButton.disabled = true;
        });
}

function beginExam() {
    if (!state.isReady || !state.questions.length) {
        elements.examStartDescription.textContent = "Savollar hali tayyor emas. Bir necha soniyadan keyin qayta urinib ko'ring.";
        return;
    }

    elements.examStartScreen.classList.add("is-hidden");
    elements.examWorkspace.classList.remove("is-hidden");
    updateQuestion();
    startTimer();
    lockNavigation();
}

function updateQuestion() {
    const question = state.questions[state.currentIndex];
    const response = state.responses[state.currentIndex];

    if (!question || !response) {
        elements.examPassage.classList.add("is-hidden");
        elements.examQuestionImageWrap.classList.add("is-hidden");
        elements.examQuestionText.textContent = "Savollarni ko'rsatishda muammo yuz berdi.";
        elements.examQuestionContext.innerHTML = "";
        elements.examOptions.innerHTML = "";
        return;
    }

    elements.examQuestionIndex.textContent = `${state.currentIndex + 1}-savol / ${state.questions.length}`;
    elements.examQuestionLabel.textContent = `${state.currentIndex + 1}-savol`;
    elements.markReviewButton.textContent = response.flagged ? "Review belgilangan" : "Ko'rib chiqish uchun belgilash";
    elements.examQuestionStatus.textContent = hasAnswer(response.selectedAnswer) ? "Javob kiritilgan" : "Javob tanlanmagan";
    elements.footerProgressText.textContent = `Savol ${state.currentIndex + 1} / ${state.questions.length}`;
    elements.previousQuestionButton.disabled = state.currentIndex === 0;
    renderPassage(question);
    renderQuestionImage(question);
    elements.examQuestionText.innerHTML = formatRichText(question.question || "");
    renderQuestionText(question);
    elements.examQuestionContext.innerHTML = Array.isArray(question.contextItems) && question.contextItems.length
        ? `
            <ol class="exam-question-context__list">
                ${question.contextItems.map((item) => `<li>${formatRichText(item)}</li>`).join("")}
            </ol>
        `
        : "";
    renderAnswerInput(question, response);

    renderQuestionMap();
}

function renderQuestionText(question) {
    const shouldCollapse = shouldCollapseQuestionText(question);

    elements.examQuestionCopyHead.classList.toggle("is-hidden", !shouldCollapse);

    if (!shouldCollapse) {
        state.isQuestionTextCollapsed = false;
        elements.examQuestionCopy.classList.remove("is-collapsible");
        elements.examQuestionCopyBody.classList.remove("is-collapsed");
        elements.toggleQuestionTextButton.textContent = "Savolni yoyish";
        return;
    }

    state.isQuestionTextCollapsed = true;
    elements.examQuestionCopy.classList.add("is-collapsible");
    elements.examQuestionCopyBody.classList.add("is-collapsed");
    elements.toggleQuestionTextButton.textContent = "Savolni yoyish";
}

function shouldCollapseQuestionText(question) {
    if (state.subject?.id !== "biology") {
        return false;
    }

    return state.currentIndex >= Math.max(state.questions.length - 3, 0);
}

function renderQuestionImage(question) {
    if (!question.image) {
        elements.examQuestionImageWrap.classList.add("is-hidden");
        elements.examQuestionImageWrap.classList.remove("exam-question-image--compact");
        elements.examQuestionImageWrap.classList.remove("exam-question-image--tiny");
        elements.examQuestionImage.removeAttribute("src");
        elements.examQuestionImage.alt = "";
        return;
    }

    elements.examQuestionImageWrap.classList.remove("is-hidden");
    elements.examQuestionImageWrap.classList.toggle("exam-question-image--compact", question.imageSize === "small");
    elements.examQuestionImageWrap.classList.toggle("exam-question-image--tiny", question.imageSize === "tiny");
    elements.examQuestionImage.src = question.image;
    elements.examQuestionImage.alt = question.imageAlt || question.question || "Savol rasmi";
}

function renderAnswerInput(question, response) {
    if (question.type === "closed-multi") {
        const fieldCount = Math.max(
            Array.isArray(question.fields) ? question.fields.length : 0,
            Array.isArray(question.answer) ? question.answer.length : 0,
            0
        );
        const selectedAnswers = Array.isArray(response.selectedAnswer)
            ? response.selectedAnswer.slice(0, fieldCount)
            : Array(fieldCount).fill("");

        while (selectedAnswers.length < fieldCount) {
            selectedAnswers.push("");
        }

        elements.examOptions.innerHTML = `
            <div class="exam-text-answer exam-text-answer--multi">
                ${selectedAnswers.map((value, index) => `
                    <label class="exam-text-answer__field">
                        <span class="exam-text-answer__label">${escapeHtml(question.fields?.[index]?.label || `${String.fromCharCode(97 + index)}) Javob`)}</span>
                        <input
                            class="exam-text-answer__input"
                            id="exam-text-answer-input-${index}"
                            type="text"
                            value="${escapeHtml(value || "")}"
                            placeholder="${escapeHtml(question.fields?.[index]?.placeholder || `${String.fromCharCode(97 + index)}) javobni kiriting`)}"
                            autocomplete="off"
                            spellcheck="false"
                        >
                    </label>
                `).join("")}
            </div>
        `;

        selectedAnswers.forEach((_, index) => {
            const input = document.getElementById(`exam-text-answer-input-${index}`);

            if (input) {
                input.addEventListener("input", () => {
                    const nextAnswers = Array.isArray(response.selectedAnswer)
                        ? response.selectedAnswer.slice(0, fieldCount)
                        : Array(fieldCount).fill("");

                    while (nextAnswers.length < fieldCount) {
                        nextAnswers.push("");
                    }

                    nextAnswers[index] = input.value.trim();
                    response.selectedAnswer = nextAnswers;
                    elements.examQuestionStatus.textContent = nextAnswers.every(Boolean) ? "Javob kiritilgan" : "Javob tanlanmagan";
                    renderQuestionMap();
                });
            }
        });

        return;
    }

    if (question.type === "closed-pair") {
        const selectedAnswers = Array.isArray(response.selectedAnswer) ? response.selectedAnswer : ["", ""];

        elements.examOptions.innerHTML = `
            <div class="exam-text-answer exam-text-answer--pair">
                <label class="exam-text-answer__field">
                    <span class="exam-text-answer__label">a) Javob</span>
                    <input
                        class="exam-text-answer__input"
                        id="exam-text-answer-input-a"
                        type="text"
                        value="${escapeHtml(selectedAnswers[0] || "")}"
                        placeholder="${escapeHtml(question.placeholders?.[0] || "a) javobni kiriting")}"
                        autocomplete="off"
                        spellcheck="false"
                    >
                </label>
                <label class="exam-text-answer__field">
                    <span class="exam-text-answer__label">b) Javob</span>
                    <input
                        class="exam-text-answer__input"
                        id="exam-text-answer-input-b"
                        type="text"
                        value="${escapeHtml(selectedAnswers[1] || "")}"
                        placeholder="${escapeHtml(question.placeholders?.[1] || "b) javobni kiriting")}"
                        autocomplete="off"
                        spellcheck="false"
                    >
                </label>
            </div>
        `;

        ["a", "b"].forEach((key, index) => {
            const input = document.getElementById(`exam-text-answer-input-${key}`);

            if (input) {
                input.addEventListener("input", () => {
                    const nextAnswers = Array.isArray(response.selectedAnswer) ? response.selectedAnswer.slice(0, 2) : ["", ""];
                    nextAnswers[index] = input.value.trim();
                    response.selectedAnswer = nextAnswers;
                    elements.examQuestionStatus.textContent = nextAnswers.every(Boolean) ? "Javob kiritilgan" : "Javob tanlanmagan";
                    renderQuestionMap();
                });
            }
        });

        return;
    }

    if (question.type === "closed") {
        elements.examOptions.innerHTML = `
            <label class="exam-text-answer">
                <span class="exam-text-answer__label">Javobni yozing</span>
                <input
                    class="exam-text-answer__input"
                    id="exam-text-answer-input"
                    type="text"
                    value="${escapeHtml(response.selectedAnswer || "")}"
                    placeholder="${escapeHtml(question.placeholder || "Javobni kiriting")}"
                    autocomplete="off"
                    spellcheck="false"
                >
            </label>
        `;

        const input = document.getElementById("exam-text-answer-input");

        if (input) {
            input.addEventListener("input", () => {
                response.selectedAnswer = input.value.trim();
                elements.examQuestionStatus.textContent = response.selectedAnswer ? "Javob kiritilgan" : "Javob tanlanmagan";
                renderQuestionMap();
            });
        }

        return;
    }

    elements.examOptions.innerHTML = question.options
        .map((option, index) => `
            <label class="exam-option${response.selectedAnswer === option ? " is-selected" : ""}">
                <input type="radio" name="exam-option" value="${escapeHtml(option)}" ${response.selectedAnswer === option ? "checked" : ""}>
                <span>${formatOptionLabel(option, index)}</span>
            </label>
        `)
        .join("");

    elements.examOptions.querySelectorAll('input[name="exam-option"]').forEach((input) => {
        input.addEventListener("change", () => {
            response.selectedAnswer = input.value;
            updateQuestion();
        });
    });
}

function renderPassage(question) {
    const passage = getPassageForQuestion(question);

    if (!passage) {
        elements.examPassage.classList.add("is-hidden");
        elements.examPassageContent.innerHTML = "";
        return;
    }

    elements.examPassage.classList.remove("is-hidden");
    elements.examPassageLabel.textContent = passage.label || "Matn";
    elements.examPassageTitle.textContent = passage.title || "O'qish uchun matn";
    elements.examPassageContent.innerHTML = formatPassageContent(passage.text || "");
    elements.examPassageBody.classList.toggle("is-collapsed", state.isPassageCollapsed);
    elements.togglePassageButton.textContent = state.isPassageCollapsed ? "Matnni ko'rsatish" : "Matnni berkitish";
}

function getPassageForQuestion(question) {
    if (question.sharedPassageId && state.passages?.[question.sharedPassageId]) {
        return state.passages[question.sharedPassageId];
    }

    if (question.passageText) {
        return {
            label: question.passageLabel,
            title: question.passageTitle,
            text: question.passageText
        };
    }

    return null;
}

function formatPassageContent(text) {
    return String(text)
        .split(/\n{2,}/)
        .map((paragraph) => `<p>${formatRichText(paragraph).replace(/\n/g, "<br>")}</p>`)
        .join("");
}

function formatRichText(value) {
    return escapeHtml(value)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\^\{(.+?)\}/g, "<sup>$1</sup>")
        .replaceAll("&lt;sup&gt;", "<sup>")
        .replaceAll("&lt;/sup&gt;", "</sup>")
        .replaceAll("&lt;sub&gt;", "<sub>")
        .replaceAll("&lt;/sub&gt;", "</sub>")
        .replaceAll("&amp;middot;", "&middot;")
        .replaceAll("&amp;minus;", "&minus;")
        .replaceAll("&amp;omega;", "&omega;")
        .replaceAll("&amp;radic;", "&radic;")
        .replaceAll("&amp;deg;", "&deg;");
}

function togglePassageVisibility() {
    state.isPassageCollapsed = !state.isPassageCollapsed;
    const question = state.questions[state.currentIndex];

    if (question) {
        renderPassage(question);
    }
}

function toggleQuestionTextVisibility() {
    const question = state.questions[state.currentIndex];

    if (!question || !shouldCollapseQuestionText(question)) {
        return;
    }

    state.isQuestionTextCollapsed = !state.isQuestionTextCollapsed;
    elements.examQuestionCopyBody.classList.toggle("is-collapsed", state.isQuestionTextCollapsed);
    elements.toggleQuestionTextButton.textContent = state.isQuestionTextCollapsed ? "Savolni yoyish" : "Savolni yig'ish";
}

function goToPreviousQuestion() {
    if (state.currentIndex > 0) {
        state.currentIndex -= 1;
        updateQuestion();
    }
}

function goToNextQuestion() {
    if (state.currentIndex < state.questions.length - 1) {
        state.currentIndex += 1;
        updateQuestion();
        return;
    }

    openFinishModal();
}

function toggleReviewFlag() {
    const response = state.responses[state.currentIndex];

    if (!response) {
        return;
    }

    response.flagged = !response.flagged;
    updateQuestion();
}

function openQuestionMap() {
    if (!state.questions.length) {
        return;
    }

    renderQuestionMap();
    elements.questionMapModal.classList.remove("is-hidden");
}

function closeQuestionMap() {
    elements.questionMapModal.classList.add("is-hidden");
}

function renderQuestionMap() {
    if (!elements.questionMapGrid) {
        return;
    }

    elements.questionMapGrid.innerHTML = state.responses
        .map((response, index) => {
            const classNames = ["question-map-item"];

            if (index === state.currentIndex) {
                classNames.push("is-current");
            } else if (response.flagged) {
                classNames.push("is-review");
            } else if (hasAnswer(response.selectedAnswer)) {
                classNames.push("is-answered");
            } else {
                classNames.push("is-empty");
            }

            return `
                <button class="${classNames.join(" ")}" type="button" data-question-jump="${index}">
                    ${index + 1}
                </button>
            `;
        })
        .join("");

    elements.questionMapGrid.querySelectorAll("[data-question-jump]").forEach((button) => {
        button.addEventListener("click", () => {
            state.currentIndex = Number(button.dataset.questionJump);
            closeQuestionMap();
            updateQuestion();
        });
    });
}

function openFinishModal() {
    if (!state.questions.length) {
        return;
    }

    const unanswered = state.responses.filter((item) => !hasAnswer(item.selectedAnswer)).length;
    elements.finishModalText.textContent = `Sizda ${unanswered} ta javobsiz savol bor. Bo'limni yakunlashni tasdiqlaysizmi?`;
    elements.finishModal.classList.remove("is-hidden");
}

function closeFinishModal() {
    elements.finishModal.classList.add("is-hidden");
}

async function finishExam() {
    if (!state.questions.length) {
        return;
    }

    closeFinishModal();
    clearTimer();

    const total = state.responses.length;
    const correct = state.responses.filter((item) => isCorrectAnswer(item.selectedAnswer, item.correctAnswer)).length;
    const incorrect = total - correct;
    const totalPoints = roundPoints(state.questions.reduce((sum, question) => sum + getQuestionPoints(question), 0));
    const earnedPoints = roundPoints(state.questions.reduce((sum, question, index) => {
        const response = state.responses[index];
        return sum + (isCorrectAnswer(response?.selectedAnswer, response?.correctAnswer) ? getQuestionPoints(question) : 0);
    }, 0));
    const grade = getGrade(correct, earnedPoints);
    const certificatePercent = getCertificatePercent(grade, earnedPoints);
    const percent = getResultPercent(correct, total, certificatePercent);

    const result = {
        studentId: state.student.id,
        studentEmail: state.student.email,
        studentFullName: state.student.fullName,
        subjectId: state.subject.id,
        subjectLabel: state.subject.label,
        total,
        correct,
        incorrect,
        percent,
        grade,
        certificatePercent,
        points: `${formatPoints(earnedPoints)}/${formatPoints(totalPoints)}`,
        earnedPoints,
        totalPoints,
        completedAt: new Date().toISOString(),
        responses: state.responses
    };

    window.localStorage.setItem(LAST_RESULT_STORAGE_KEY, JSON.stringify(result));
    saveSubjectResult(result);
    await syncResultToServer(result);
    unlockNavigation();
    window.location.href = `results.html?subject=${state.subject.id}`;
}

function startTimer() {
    state.timerId = window.setInterval(() => {
        state.timeLeft -= 1;
        updateTimer();

        if (state.timeLeft <= 0) {
            finishExam();
        }
    }, 1000);
}

function updateTimer() {
    const safeSeconds = Math.max(state.timeLeft, 0);
    const hours = String(Math.floor(safeSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(safeSeconds % 60).padStart(2, "0");
    elements.examTimer.textContent = `${hours}:${minutes}:${seconds}`;
}

function clearTimer() {
    if (state.timerId) {
        window.clearInterval(state.timerId);
        state.timerId = null;
    }
}

function lockNavigation() {
    window.history.pushState(null, "", window.location.href);

    window.addEventListener("beforeunload", warnBeforeUnload);
    window.addEventListener("popstate", keepOnExam);
}

function unlockNavigation() {
    window.removeEventListener("beforeunload", warnBeforeUnload);
    window.removeEventListener("popstate", keepOnExam);
}

function warnBeforeUnload(event) {
    event.preventDefault();
    event.returnValue = "";
}

function keepOnExam() {
    window.history.pushState(null, "", window.location.href);
}

function getGrade(correctCount, earnedPoints = 0) {
    if (Array.isArray(state.subject?.certificateBands)) {
        const referenceValue = (state.subject?.id === "history" || state.subject?.id === "physics")
            ? correctCount
            : earnedPoints;
        return state.subject.certificateBands.find((item) => referenceValue >= item.min)?.grade || "Fail";
    }

    const gradeBands = state.subject?.gradeBands || DEFAULT_GRADE_BANDS;
    return gradeBands.find((item) => correctCount >= item.min)?.grade || "Fail";
}

function getQuestionPoints(question) {
    return Number(question?.points) > 0 ? Number(question.points) : 1;
}

function roundPoints(value) {
    return Math.round((Number(value) + Number.EPSILON) * 10) / 10;
}

function formatPoints(value) {
    const roundedValue = roundPoints(value);
    return Number.isInteger(roundedValue) ? String(roundedValue) : roundedValue.toFixed(1);
}

function isCorrectAnswer(selectedAnswer, correctAnswer) {
    if (Array.isArray(correctAnswer) && Array.isArray(selectedAnswer)) {
        if (correctAnswer.length !== selectedAnswer.length) {
            return false;
        }

        return correctAnswer.every((answer, index) => isAnswerVariantMatch(selectedAnswer[index], answer));
    }

    if (Array.isArray(correctAnswer)) {
        return correctAnswer.some((answer) => answersMatch(selectedAnswer, answer));
    }

    return answersMatch(selectedAnswer, correctAnswer);
}

function isAnswerVariantMatch(selectedAnswer, expectedAnswer) {
    if (Array.isArray(expectedAnswer)) {
        return expectedAnswer.some((answer) => answersMatch(selectedAnswer, answer));
    }

    return answersMatch(selectedAnswer, expectedAnswer);
}

function answersMatch(selectedAnswer, expectedAnswer) {
    const normalizedSelected = normalizeAnswer(selectedAnswer);
    const normalizedExpected = normalizeAnswer(expectedAnswer);

    if (normalizedSelected === normalizedExpected) {
        return true;
    }

    return normalizeAnswer(selectedAnswer, { loose: true }) === normalizeAnswer(expectedAnswer, { loose: true });
}

function normalizeAnswer(value, options = {}) {
    const normalized = String(value || "")
        .trim()
        .toLocaleLowerCase("uz-UZ")
        .normalize("NFKC")
        .replace(/[ʻʼ‘’`´]/g, "'")
        .replace(/[–—−]/g, "-")
        .replace(/\s*([,;:%/=()\-+])\s*/g, "$1")
        .replace(/\s+/g, " ");

    if (options.loose) {
        return normalized
            .replace(/,/g, ".")
            .replace(/['".;:%/=()\-+\s]/g, "");
    }

    return normalized;
}

function getCertificatePercent(grade, earnedPoints = 0) {
    if (Array.isArray(state.subject?.certificateBands)) {
        const referenceValue = (state.subject?.id === "history" || state.subject?.id === "physics")
            ? state.responses.filter((item) => isCorrectAnswer(item.selectedAnswer, item.correctAnswer)).length
            : earnedPoints;
        return state.subject.certificateBands.find((item) => item.grade === grade && referenceValue >= item.min)?.percent || null;
    }

    return grade === "A" || grade === "A+" ? 100 : null;
}

function getResultPercent(correctCount, totalQuestions, certificatePercent) {
    if (certificatePercent !== null) {
        return certificatePercent;
    }

    return totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0;
}

function hasAnswer(selectedAnswer) {
    if (Array.isArray(selectedAnswer)) {
        return selectedAnswer.every((item) => String(item || "").trim());
    }

    return Boolean(String(selectedAnswer || "").trim());
}

function getSavedStudent() {
    try {
        const rawStudent = window.localStorage.getItem(STUDENT_STORAGE_KEY);
        return rawStudent ? JSON.parse(rawStudent) : null;
    } catch {
        return null;
    }
}

async function syncStudentSession() {
    if (!state.student?.id || !state.subject?.id) {
        return;
    }

    try {
        await fetch(buildApiUrl("/api/student/session"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                studentId: state.student.id,
                visitorId: getVisitorId(),
                currentPage: `exam:${state.subject.id}`
            })
        });
    } catch (error) {
        console.error("Student session yuborilmadi.", error);
    }
}

function getVisitorId() {
    try {
        return window.localStorage.getItem(VISITOR_ID_STORAGE_KEY) || "";
    } catch {
        return "";
    }
}

function getStoredSubjectResult(subjectId) {
    try {
        const rawResults = window.localStorage.getItem(RESULTS_BY_SUBJECT_STORAGE_KEY);

        if (!rawResults) {
            return null;
        }

        const resultsBySubject = JSON.parse(rawResults);
        return resultsBySubject?.[subjectId] || null;
    } catch {
        return null;
    }
}

function saveSubjectResult(result) {
    try {
        const rawResults = window.localStorage.getItem(RESULTS_BY_SUBJECT_STORAGE_KEY);
        const resultsBySubject = rawResults ? JSON.parse(rawResults) : {};
        resultsBySubject[result.subjectId] = result;
        window.localStorage.setItem(RESULTS_BY_SUBJECT_STORAGE_KEY, JSON.stringify(resultsBySubject));
    } catch (error) {
        console.error("Natijani fan bo'yicha saqlab bo'lmadi.", error);
    }
}

async function syncResultToServer(result) {
    try {
        const response = await fetch(buildApiUrl("/api/results"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(result)
        });

        return response.ok;
    } catch (error) {
        console.error("Natijani serverga saqlab bo'lmadi.", error);
        return false;
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

function formatOptionLabel(option, index) {
    const optionText = String(option || "").trim();
    const expectedLetter = String.fromCharCode(65 + index);

    if (optionText === expectedLetter) {
        return escapeHtml(optionText);
    }

    return `${expectedLetter}. ${formatRichText(option)}`;
}

function getOpenAnswerRule(subjectId) {
    if (subjectId === "history") {
        return "Ochiq testlarda so'zlar soni ikkitadan yoki undan ortiq so'zdan iborat bo'lishi mumkin.";
    }

    if (subjectId === "math") {
        return "Sonlarni butun, kasr yoki o'nli ko'rinishda yozsangiz ham bo'ladi. Formuladagi daraja, ildiz va boshqa belgilarni oddiy yozuvda kiritsangiz ham javob hisobga olinadi.";
    }

    if (subjectId === "chemistry") {
        return "Kimyoviy formulalarda raqamlarni oddiy ko'rinishda yozsangiz ham bo'ladi. Shuningdek, <code>g</code>, <code>%</code>, <code>mol</code> kabi birliklarni qo'shib yoki tushirib yozsangiz ham javob hisobga olinadi.";
    }

    if (subjectId === "physics") {
        return "Butunli sonlarni kasrli ko'rinishda yozsangiz ham bo'ladi. Va kasr chizig'ini <code>/</code> shu belgi bilan javoblarda yozsangiz ham to'g'ri deb hisobga olinadi.";
    }

    return "Butunli sonlarni kasrli ko'rinishda yozsangiz ham bo'ladi. Shuningdek, <code>g</code> va <code>%</code> belgilarini qo'shib yoki tushirib yozsangiz, formuladagi raqamlarni esa oddiy yoki pastki indeks ko'rinishida yozsangiz ham javob hisobga olinadi.";
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
