const LAST_RESULT_STORAGE_KEY = "milliy-last-result";
const RESULTS_BY_SUBJECT_STORAGE_KEY = "milliy-results-by-subject";
const ACTIVE_SECTION_STORAGE_KEY = "milliy-dashboard-active-section";
const UNIVERSAL_CERTIFICATE_BANDS = [
    { min: 36, grade: "A+", percent: 100 },
    { min: 31, grade: "A", percent: 100 },
    { min: 27, grade: "B+", percent: 85 },
    { min: 23, grade: "B", percent: 75 },
    { min: 19, grade: "C+", percent: 65 },
    { min: 15, grade: "C", percent: 55 },
    { min: 0, grade: "Fail", percent: null }
];

const elements = {
    resultsSubject: document.getElementById("results-subject"),
    resultsTitle: document.getElementById("results-title"),
    resultsMessage: document.getElementById("results-message"),
    resultsGrade: document.getElementById("results-grade"),
    resultsPoints: document.getElementById("results-points"),
    resultsTotalPoints: document.getElementById("results-total-points"),
    resultsPercent: document.getElementById("results-percent"),
    statTotal: document.getElementById("stat-total"),
    statCorrect: document.getElementById("stat-correct"),
    statIncorrect: document.getElementById("stat-incorrect"),
    reviewBody: document.getElementById("results-review-body"),
    reviewSubjectLink: document.getElementById("review-subject-link"),
    reviewFeedbackLink: document.getElementById("review-feedback-link")
};

let hasShownResultsScrollToast = false;

bootResults();

function bootResults() {
    const subjectId = new URLSearchParams(window.location.search).get("subject");
    const result = normalizeResultPresentation(getResult(subjectId));

    if (!result) {
        window.location.href = "dashboard.html";
        return;
    }

    elements.resultsSubject.textContent = `${result.subjectLabel} imtihon natijasi`;
    elements.resultsGrade.textContent = result.grade;
    elements.resultsPoints.textContent = `Ball: ${formatPointsSummary(result)}`;
    elements.resultsTotalPoints.textContent = `Maksimal ball: ${formatPointsValue(result.totalPoints ?? 0)}`;
    elements.resultsPercent.textContent = `Foiz: ${formatPercentValue(result.percent)}%`;
    elements.statTotal.textContent = String(result.total);
    elements.statCorrect.textContent = String(result.correct);
    elements.statIncorrect.textContent = String(result.incorrect);
    elements.resultsTitle.textContent = result.grade === "A+" || result.grade === "A" ? "Tabriklaymiz!" : "Imtihon yakunlandi";
    elements.resultsMessage.textContent = `${result.subjectLabel} bo'yicha yakuniy baho: ${result.grade}${getCertificatePercent(result) !== null ? ` | Sertifikat darajasi: ${getCertificatePercent(result)}%` : ""}`;
    elements.reviewSubjectLink.href = `dashboard.html`;
    if (elements.reviewFeedbackLink) {
        elements.reviewFeedbackLink.href = "dashboard.html";
    }
    bindReviewLinks();
    launchResultConfetti();

    elements.reviewBody.innerHTML = result.responses
        .map((item, index) => {
            const answerState = getAnswerState(item.selectedAnswer, item.correctAnswer);

            return `
            <tr class="results-review__row results-review__row--${answerState}">
                <td>${index + 1}</td>
                <td>${escapeHtml(item.question || `${index + 1}-savol`)}</td>
                <td class="results-review__answer results-review__answer--correct">${formatAnswer(item.correctAnswer)}</td>
                <td class="results-review__answer results-review__answer--${answerState}">${formatAnswer(hasAnswer(item.selectedAnswer) ? item.selectedAnswer : "Javob berilmagan")}</td>
                <td class="results-review__status results-review__status--${answerState}">${getAnswerStateLabel(answerState)}</td>
            </tr>
        `;
        })
        .join("");

    bindResultsScrollNotification();
}

function bindReviewLinks() {
    if (elements.reviewSubjectLink) {
        elements.reviewSubjectLink.addEventListener("click", () => {
            window.localStorage.setItem(ACTIVE_SECTION_STORAGE_KEY, "analysis");
            window.sessionStorage.setItem(ACTIVE_SECTION_STORAGE_KEY, "analysis");
        });
    }
    if (elements.reviewFeedbackLink) {
        elements.reviewFeedbackLink.addEventListener("click", () => {
            window.localStorage.setItem(ACTIVE_SECTION_STORAGE_KEY, "feedback");
            window.sessionStorage.setItem(ACTIVE_SECTION_STORAGE_KEY, "feedback");
        });
    }
}

function getResult(subjectId) {
    const subjectResult = getResultBySubject(subjectId);

    if (subjectResult) {
        return subjectResult;
    }

    return getLastResult();
}

function getResultBySubject(subjectId) {
    try {
        if (!subjectId) {
            return null;
        }

        const rawResults = window.localStorage.getItem(RESULTS_BY_SUBJECT_STORAGE_KEY);

        if (!rawResults) {
            return null;
        }

        const resultsBySubject = JSON.parse(rawResults);

        if (resultsBySubject?.[subjectId]) {
            return resultsBySubject[subjectId];
        }

        const lastResult = getLastResult();
        return lastResult?.subjectId === subjectId ? lastResult : null;
    } catch {
        return null;
    }
}

function getLastResult() {
    try {
        const rawResult = window.localStorage.getItem(LAST_RESULT_STORAGE_KEY);
        return rawResult ? JSON.parse(rawResult) : null;
    } catch {
        return null;
    }
}

function normalizeResultPresentation(result) {
    if (!result) {
        return result;
    }

    const correct = Number(result.correct);

    if (!Number.isFinite(correct)) {
        return result;
    }

    const certificateBand = getCertificateBand(correct);

    return {
        ...result,
        grade: certificateBand.grade,
        certificatePercent: certificateBand.percent,
        percent: certificateBand.percent ?? result.percent
    };
}

function getCertificateBand(correctCount) {
    return UNIVERSAL_CERTIFICATE_BANDS.find((item) => correctCount >= item.min) || UNIVERSAL_CERTIFICATE_BANDS.at(-1);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function formatAnswer(value) {
    if (Array.isArray(value)) {
        return escapeHtml(value.join(" | "));
    }

    return escapeHtml(value);
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
        .replace(/[\u00ab\u00bb\u2018\u2019`\u00b4]/g, "'")
        .replace(/[\u2013\u2014\u2212]/g, "-")
        .replace(/\s*([,;:%/=()\-+])\s*/g, "$1")
        .replace(/\s+/g, " ");

    if (options.loose) {
        return normalized
            .replace(/,/g, ".")
            .replace(/['".;:%/=()\-+\s]/g, "");
    }

    return normalized;
}

function getCertificatePercent(result) {
    if (Number.isFinite(Number(result?.certificatePercent))) {
        return Math.round(Number(result.certificatePercent));
    }

    return result?.grade === "A" || result?.grade === "A+" ? 100 : null;
}

function hasAnswer(selectedAnswer) {
    if (Array.isArray(selectedAnswer)) {
        return selectedAnswer.every((item) => String(item || "").trim());
    }

    return Boolean(String(selectedAnswer || "").trim());
}

function getAnswerState(selectedAnswer, correctAnswer) {
    if (!hasAnswer(selectedAnswer)) {
        return "empty";
    }

    return isCorrectAnswer(selectedAnswer, correctAnswer) ? "correct" : "incorrect";
}

function getAnswerStateLabel(answerState) {
    if (answerState === "correct") {
        return "To'g'ri";
    }

    if (answerState === "empty") {
        return "Javob berilmagan";
    }

    return "Noto'g'ri";
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

function launchResultConfetti() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const container = document.createElement("div");
    container.className = "results-confetti";
    document.body.appendChild(container);

    const colors = ["#ffcf14", "#ff7a18", "#3657b7", "#14b8a6", "#ef4444", "#8b5cf6"];
    const piecesCount = 48;

    for (let index = 0; index < piecesCount; index += 1) {
        const piece = document.createElement("span");
        const size = 8 + Math.random() * 10;
        const left = Math.random() * 100;
        const delay = Math.random() * 0.9;
        const duration = 2.8 + Math.random() * 1.8;
        const drift = (Math.random() * 160 - 80).toFixed(0);
        const rotation = (Math.random() * 720 - 360).toFixed(0);

        piece.className = "results-confetti__piece";
        piece.style.left = `${left}%`;
        piece.style.width = `${size}px`;
        piece.style.height = `${Math.max(size * 0.45, 6)}px`;
        piece.style.background = colors[index % colors.length];
        piece.style.animationDelay = `${delay}s`;
        piece.style.animationDuration = `${duration}s`;
        piece.style.setProperty("--confetti-drift", `${drift}px`);
        piece.style.setProperty("--confetti-rotate", `${rotation}deg`);
        piece.style.opacity = String(0.75 + Math.random() * 0.25);

        if (index % 3 === 0) {
            piece.style.borderRadius = "999px";
        }

        container.appendChild(piece);
    }

    window.setTimeout(() => {
        container.classList.add("is-fading");
    }, 3200);

    window.setTimeout(() => {
        container.remove();
    }, 4200);
}

function bindResultsScrollNotification() {
    const handleScroll = () => {
        if (hasShownResultsScrollToast) {
            return;
        }

        const scrollPosition = window.scrollY + window.innerHeight;
        const pageBottom = document.documentElement.scrollHeight - 24;

        if (scrollPosition < pageBottom) {
            return;
        }

        hasShownResultsScrollToast = true;
        showResultsToast("Testlarni Testlar tahlili panelida tahlil qiling va test haqida o'z fikrlaringizni Feedback panelida qoldiring.");
        window.removeEventListener("scroll", handleScroll);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
}

function showResultsToast(message, durationMs = 4200) {
    if (!message) {
        return;
    }

    const toast = document.createElement("div");
    toast.className = "dashboard-welcome-toast dashboard-welcome-toast--danger";
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
