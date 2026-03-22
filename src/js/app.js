const STUDENT_STORAGE_KEY = "math-student-profile";

const SUBJECTS = {
    "mother-tongue": {
        id: "mother-tongue",
        label: "Ona tili",
        shortLabel: "Ona tili",
        description: "Imlo, ma'no, antonim va sodda grammatik savollar.",
        file: "data/mother-tongue.json",
        durationSeconds: 10800
    },
    math: {
        id: "math",
        label: "Matematika",
        shortLabel: "Matematika",
        description: "Arifmetika, foiz, sodda tenglama va amaliy misollar.",
        file: "data/math.json",
        durationSeconds: 10800
    },
    chemistry: {
        id: "chemistry",
        label: "Kimyo",
        shortLabel: "Kimyo",
        description: "Elementlar, formulalar va asosiy kimyoviy tushunchalar.",
        file: "data/chemistry.json",
        durationSeconds: 10800
    },
    biology: {
        id: "biology",
        label: "Biologiya",
        shortLabel: "Biologiya",
        description: "Hujayra, tirik organizmlar va biologik jarayonlar bo'yicha savollar.",
        file: "data/biology.json",
        durationSeconds: 10800
    },
    history: {
        id: "history",
        label: "Tarix",
        shortLabel: "Tarix",
        description: "O'zbekiston va jahon tarixi bo'yicha asosiy savollar.",
        file: "data/history.json",
        durationSeconds: 10800
    },
    physics: {
        id: "physics",
        label: "Fizika",
        shortLabel: "Fizika",
        description: "Harakat, kuch, energiya va elektr bo'yicha asosiy savollar.",
        file: "data/physics.json",
        durationSeconds: 10800
    }
};

const elements = {
    platformHero: document.getElementById("platform-hero"),
    subjectInfoCard: document.getElementById("subject-info-card"),
    subjectSelector: document.getElementById("subject-selector"),
    subjectGrid: document.getElementById("subject-grid"),
    restartButton: document.getElementById("restart-quiz"),
    retryButton: document.getElementById("retry-quiz"),
    changeSubjectButton: document.getElementById("change-subject"),
    chooseSubjectButton: document.getElementById("choose-subject"),
    quizPanel: document.getElementById("quiz-panel"),
    resultPanel: document.getElementById("result-panel"),
    selectedSubjectTitle: document.getElementById("selected-subject-title"),
    selectedSubjectDescription: document.getElementById("selected-subject-description"),
    questionCounter: document.getElementById("question-counter"),
    quizStatus: document.getElementById("quiz-status"),
    progressBar: document.getElementById("progress-bar"),
    questionText: document.getElementById("question-text"),
    answers: document.getElementById("answers"),
    resultSubjectTitle: document.getElementById("result-subject-title"),
    resultScore: document.getElementById("result-score"),
    resultPercent: document.getElementById("result-percent"),
    resultFeedback: document.getElementById("result-feedback"),
    resultBadge: document.getElementById("result-badge"),
    quizHelper: document.getElementById("quiz-helper"),
    timerDisplay: document.getElementById("timer-display"),
    currentSubjectLabel: document.getElementById("current-subject-label"),
    studentName: document.getElementById("student-name"),
    studentEmail: document.getElementById("student-email"),
    studentPhone: document.getElementById("student-phone"),
    summaryName: document.getElementById("summary-name"),
    summaryEmail: document.getElementById("summary-email"),
    summaryPhone: document.getElementById("summary-phone"),
    summaryMath: document.getElementById("summary-math"),
    summaryMotherTongue: document.getElementById("summary-mother-tongue"),
    summaryChemistry: document.getElementById("summary-chemistry"),
    summaryBiology: document.getElementById("summary-biology")
};

const state = {
    student: null,
    currentSubjectId: null,
    questions: [],
    currentIndex: 0,
    score: 0,
    timeLeft: 0,
    timerId: null,
    isAnswerLocked: false,
    subjectResults: {}
};

bootPlatform();

if (elements.restartButton) {
    elements.restartButton.addEventListener("click", restartCurrentSubject);
}

if (elements.retryButton) {
    elements.retryButton.addEventListener("click", restartCurrentSubject);
}

if (elements.changeSubjectButton) {
    elements.changeSubjectButton.addEventListener("click", resetWorkspace);
}

if (elements.chooseSubjectButton) {
    elements.chooseSubjectButton.addEventListener("click", resetWorkspace);
}

function bootPlatform() {
    const student = getSavedStudent();

    if (!student) {
        window.location.href = "index.html";
        return;
    }

    state.student = student;
    renderStudentProfile(student);
    renderSubjectCards();
    renderSubjectSummary();
    resetWorkspace();
}

function renderStudentProfile(student) {
    elements.studentName.textContent = student.fullName;
    elements.studentEmail.textContent = student.email;
    elements.studentPhone.textContent = student.phone;
    elements.summaryName.textContent = student.fullName;
    elements.summaryEmail.textContent = student.email;
    elements.summaryPhone.textContent = student.phone;
}

function renderSubjectCards() {
    elements.subjectGrid.innerHTML = Object.values(SUBJECTS)
        .map((subject) => {
            const result = state.subjectResults[subject.id];
            const status = result ? `${result.score}/${result.total} | ${result.percent}%` : "Boshlanmagan";

            return `
                <button class="subject-card${state.currentSubjectId === subject.id ? " is-active" : ""}" type="button" data-subject-id="${subject.id}">
                    <span class="subject-card__label">${subject.label}</span>
                    <strong class="subject-card__title">${subject.shortLabel} testi</strong>
                    <p class="subject-card__text">${subject.description}</p>
                    <span class="subject-card__meta">Timer: ${formatTime(subject.durationSeconds)}</span>
                    <span class="subject-card__status">${status}</span>
                </button>
            `;
        })
        .join("");

    elements.subjectGrid.querySelectorAll(".subject-card").forEach((button) => {
        button.addEventListener("click", () => startSubject(button.dataset.subjectId));
    });
}

async function startSubject(subjectId) {
    const subject = SUBJECTS[subjectId];

    if (!subject) {
        return;
    }

    clearTimer();
    state.currentSubjectId = subjectId;
    state.currentIndex = 0;
    state.score = 0;
    state.isAnswerLocked = false;
    state.timeLeft = subject.durationSeconds;

    elements.selectedSubjectTitle.textContent = subject.label;
    elements.selectedSubjectDescription.textContent = subject.description;
    elements.currentSubjectLabel.textContent = subject.label;
    elements.quizStatus.textContent = "Yuklanmoqda...";
    elements.quizHelper.textContent = "Savolga to'g'ri deb hisoblagan javobni tanlang.";
    elements.resultPanel.classList.add("is-hidden");
    elements.quizPanel.classList.remove("is-hidden");
    document.body.classList.add("test-mode");

    renderSubjectCards();
    updateTimerUI();

    try {
        const response = await fetch(subject.file);

        if (!response.ok) {
            throw new Error(`${subject.label} JSON yuklanmadi`);
        }

        const payload = await response.json();
        state.questions = payload.questions || [];
        elements.quizStatus.textContent = "Jarayonda";
    } catch (error) {
        state.questions = [];
        elements.quizStatus.textContent = "Xatolik";
        elements.questionText.textContent = `${subject.label} savollarini yuklab bo'lmadi.`;
        elements.answers.innerHTML = "";
        console.error(error);
        return;
    }

    startTimer();
    renderQuestion();
}

function renderQuestion() {
    const question = state.questions[state.currentIndex];

    if (!question) {
        showResult(false);
        return;
    }

    const total = state.questions.length;
    const progress = Math.round(((state.currentIndex + 1) / total) * 100);

    state.isAnswerLocked = false;
    elements.questionCounter.textContent = `${state.currentIndex + 1} / ${total}`;
    elements.progressBar.style.width = `${progress}%`;
    elements.questionText.innerHTML = formatRichText(question.question || "");
    elements.answers.innerHTML = "";

    question.options.forEach((option, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "answer-button";
        button.innerHTML = `${String.fromCharCode(65 + index)}. ${formatRichText(option)}`;
        button.dataset.option = option;
        button.setAttribute("role", "listitem");
        button.addEventListener("click", () => submitAnswer(button, option));
        elements.answers.appendChild(button);
    });
}

function submitAnswer(selectedButton, selectedOption) {
    if (state.isAnswerLocked) {
        return;
    }

    state.isAnswerLocked = true;
    const currentQuestion = state.questions[state.currentIndex];
    const answerButtons = Array.from(elements.answers.querySelectorAll(".answer-button"));
    const isCorrect = selectedOption === currentQuestion.answer;

    elements.quizHelper.textContent = "Javob qabul qilindi. Keyingi savolga o'tilmoqda.";

    answerButtons.forEach((button) => {
        button.disabled = true;
        button.classList.add("is-selected");
    });

    if (isCorrect) {
        state.score += 1;
    }

    window.setTimeout(() => {
        state.currentIndex += 1;
        renderQuestion();
    }, 450);
}

function startTimer() {
    updateTimerUI();
    clearTimer();

    state.timerId = window.setInterval(() => {
        state.timeLeft -= 1;
        updateTimerUI();

        if (state.timeLeft <= 0) {
            clearTimer();
            showResult(true);
        }
    }, 1000);
}

function updateTimerUI() {
    elements.timerDisplay.textContent = formatTime(Math.max(state.timeLeft, 0));
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#39;");
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

function showResult(fromTimeout) {
    clearTimer();

    const total = state.questions.length;
    const percent = total ? Math.round((state.score / total) * 100) : 0;
    const subject = SUBJECTS[state.currentSubjectId];

    elements.quizPanel.classList.add("is-hidden");
    elements.resultPanel.classList.remove("is-hidden");
    elements.resultSubjectTitle.textContent = `${subject.label} natijasi`;
    elements.resultScore.textContent = `${state.score} / ${total} ta to'g'ri javob`;
    elements.resultPercent.textContent = `${percent}% natija`;
    elements.resultFeedback.textContent = fromTimeout
        ? "Vaqt tugadi. Test avtomatik yakunlandi."
        : getFeedback(percent);
    elements.resultBadge.textContent = getResultLabel(percent);

    state.subjectResults[state.currentSubjectId] = {
        score: state.score,
        total,
        percent
    };

    renderSubjectSummary();
    renderSubjectCards();
}

function renderSubjectSummary() {
    elements.summaryMotherTongue.textContent = getSubjectSummaryText("mother-tongue");
    elements.summaryMath.textContent = getSubjectSummaryText("math");
    elements.summaryChemistry.textContent = getSubjectSummaryText("chemistry");
    elements.summaryBiology.textContent = getSubjectSummaryText("biology");
}

function getSubjectSummaryText(subjectId) {
    const result = state.subjectResults[subjectId];

    if (!result) {
        return "Boshlanmagan";
    }

    return `${result.score}/${result.total} | ${result.percent}%`;
}

function restartCurrentSubject() {
    if (!state.currentSubjectId) {
        return;
    }

    startSubject(state.currentSubjectId);
}

function resetWorkspace() {
    clearTimer();
    state.currentSubjectId = null;
    state.questions = [];
    state.currentIndex = 0;
    state.score = 0;
    state.timeLeft = 0;
    state.isAnswerLocked = false;

    elements.selectedSubjectTitle.textContent = "Fan tanlang";
    elements.selectedSubjectDescription.textContent = "Quyidagi bloklardan birini tanlang. Har bir fan uchun alohida test va alohida natija mavjud.";
    elements.currentSubjectLabel.textContent = "Fan tanlanmagan";
    elements.questionCounter.textContent = "0 / 0";
    elements.quizStatus.textContent = "Kutilmoqda";
    elements.quizHelper.textContent = "Testni boshlash uchun fan blokini tanlang.";
    elements.questionText.textContent = "";
    elements.answers.innerHTML = "";
    elements.progressBar.style.width = "0%";
    elements.timerDisplay.textContent = "00:00";
    elements.quizPanel.classList.add("is-hidden");
    elements.resultPanel.classList.add("is-hidden");
    document.body.classList.remove("test-mode");
    renderSubjectCards();
}

function clearTimer() {
    if (state.timerId) {
        window.clearInterval(state.timerId);
        state.timerId = null;
    }
}

function getSavedStudent() {
    try {
        const rawStudent = window.localStorage.getItem(STUDENT_STORAGE_KEY);

        if (!rawStudent) {
            return null;
        }

        const student = JSON.parse(rawStudent);

        if (!student?.email || !student?.phone || !student?.fullName) {
            return null;
        }

        return student;
    } catch (error) {
        console.error("Talaba ma'lumotlarini o'qib bo'lmadi.", error);
        return null;
    }
}

function getFeedback(percent) {
    if (percent >= 80) {
        return "Natija juda yaxshi. Shu fan bo'yicha tayyorgarlik darajasi yuqori.";
    }

    if (percent >= 50) {
        return "Asosiy tushunchalar bor. Shu fan bo'yicha yana bir oz mashq qiling.";
    }

    return "Boshlang'ich tayyorgarlik kerak. Shu blok savollarini yana qayta ishlang.";
}

function getResultLabel(percent) {
    if (percent >= 80) {
        return "Daraja: Juda yaxshi";
    }

    if (percent >= 50) {
        return "Daraja: O'rtacha";
    }

    return "Daraja: Boshlang'ich";
}

function formatTime(totalSeconds) {
    const safeSeconds = Math.max(totalSeconds, 0);
    const hours = String(Math.floor(safeSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(safeSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
}
