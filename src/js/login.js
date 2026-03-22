const STUDENT_STORAGE_KEY = "math-student-profile";
const VISITOR_ID_STORAGE_KEY = "milliy-visitor-id";
const REGISTRATION_SUCCESS_KEY = "milliy-registration-success";
const API_BASE_URL = getApiBaseUrl();

const elements = {
    accessForm: document.getElementById("student-access-form"),
    emailInput: document.getElementById("email"),
    phoneInput: document.getElementById("phone"),
    fullNameInput: document.getElementById("full-name"),
    formMessage: document.getElementById("form-message"),
    submitButton: document.getElementById("enter-platform")
};

bootLoginPage();
trackVisit();

if (elements.accessForm) {
    elements.accessForm.addEventListener("submit", handleAccessSubmit);
    elements.accessForm.addEventListener("input", clearFormMessage);
}

async function bootLoginPage() {
    const savedStudent = hydrateSavedStudent();

    if (savedStudent) {
        redirectToDashboard();
        return;
    }

    await restoreStudentSession();
}

function handleAccessSubmit(event) {
    event.preventDefault();

    const validation = validateStudentAccess();

    if (!validation.isValid) {
        showFormMessage(validation.message, "error");
        validation.field?.focus();
        return;
    }

    submitStudent(validation.student);
}

function validateStudentAccess() {
    const email = elements.emailInput.value.trim().toLowerCase();
    const phone = normalizePhone(elements.phoneInput.value);
    const fullName = normalizeFullName(elements.fullNameInput.value);
    const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const phonePattern = /^\+?\d[\d\s()-]{8,}$/;
    const fullNamePattern = /^[\p{L}'\-\s]{5,}$/u;

    if (!email) {
        return { isValid: false, message: "Gmail manzilingizni kiriting.", field: elements.emailInput };
    }

    if (!gmailPattern.test(email)) {
        return { isValid: false, message: "Faqat @gmail.com bilan tugaydigan Gmail manzil kiriting.", field: elements.emailInput };
    }

    if (!phone) {
        return { isValid: false, message: "Telefon raqamingizni kiriting.", field: elements.phoneInput };
    }

    if (!phonePattern.test(phone)) {
        return { isValid: false, message: "Telefon raqamini to'g'ri formatda kiriting.", field: elements.phoneInput };
    }

    if (!fullName) {
        return { isValid: false, message: "To'liq ism-familyangizni kiriting.", field: elements.fullNameInput };
    }

    if (!fullNamePattern.test(fullName) || fullName.split(" ").length < 2) {
        return { isValid: false, message: "Ism va familiyani to'liq kiriting.", field: elements.fullNameInput };
    }

    return {
        isValid: true,
        student: {
            email,
            phone,
            fullName
        }
    };
}

function persistStudent(student) {
    try {
        window.localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(student));
    } catch (error) {
        console.error("Talaba ma'lumotlarini saqlab bo'lmadi.", error);
    }
}

function markRegistrationSuccess() {
    try {
        window.localStorage.setItem(
            REGISTRATION_SUCCESS_KEY,
            JSON.stringify({
                message: "Tabriklaymiz, platformamizga muvaffaqiyatli ro'yxatdan o'tdingiz!",
                createdAt: Date.now()
            })
        );
    } catch (error) {
        console.error("Ro'yxatdan o'tish xabarini saqlab bo'lmadi.", error);
    }
}

function hydrateSavedStudent() {
    try {
        const rawStudent = window.localStorage.getItem(STUDENT_STORAGE_KEY);

        if (!rawStudent) {
            return null;
        }

        const student = JSON.parse(rawStudent);

        if (!student?.email || !student?.phone || !student?.fullName) {
            return null;
        }

        elements.emailInput.value = student.email;
        elements.phoneInput.value = student.phone;
        elements.fullNameInput.value = student.fullName;
        showFormMessage("Oxirgi kiritilgan ma'lumotlar tiklandi.", "success");
        return student;
    } catch (error) {
        console.error("Talaba ma'lumotlarini tiklab bo'lmadi.", error);
        return null;
    }
}

function normalizePhone(value) {
    return value.trim().replace(/\s+/g, " ");
}

function normalizeFullName(value) {
    return value.trim().replace(/\s+/g, " ");
}

function showFormMessage(message, type) {
    elements.formMessage.textContent = message;
    elements.formMessage.classList.remove("is-error", "is-success");
    elements.formMessage.classList.add(type === "error" ? "is-error" : "is-success");
}

function clearFormMessage() {
    if (!elements.formMessage.textContent) {
        return;
    }

    elements.formMessage.textContent = "";
    elements.formMessage.classList.remove("is-error", "is-success");
    elements.submitButton.disabled = false;
    elements.submitButton.textContent = "Platformaga kirish";
}

async function submitStudent(student) {
    const visitorId = ensureVisitorId();

    try {
        elements.submitButton.disabled = true;
        elements.submitButton.textContent = "Saqlanmoqda...";
        showFormMessage("Ma'lumotlar serverga yuborilmoqda...", "success");

        const response = await fetch(buildApiUrl("/api/register"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...student,
                visitorId
            })
        });

        const rawResponse = await response.text();
        let payload = null;

        try {
            payload = rawResponse ? JSON.parse(rawResponse) : null;
        } catch {
            payload = null;
        }

        if (!response.ok) {
            throw new Error(payload?.message || "Server hozircha tayyor emas. Ma'lumot vaqtincha brauzerda saqlandi.");
        }

        persistStudent(payload?.student || student);
        markRegistrationSuccess();
        showFormMessage("Ma'lumotlar qabul qilindi. Bosh panel ochilmoqda...", "success");
        elements.submitButton.textContent = "O'tilmoqda...";
        window.setTimeout(redirectToDashboard, 350);
    } catch (error) {
        persistStudent(student);
        markRegistrationSuccess();
        showFormMessage("Backend yoqilmagan. Ma'lumot brauzerda saqlandi va bosh panel ochiladi.", "success");
        elements.submitButton.textContent = "O'tilmoqda...";
        window.setTimeout(redirectToDashboard, 350);
    }
}

async function restoreStudentSession() {
    try {
        const response = await fetch(buildApiUrl("/api/student/session/current"), {
            credentials: "same-origin"
        });

        if (!response.ok) {
            return;
        }

        const payload = await response.json();

        if (!payload?.student?.email || !payload?.student?.fullName) {
            return;
        }

        persistStudent(payload.student);
        showFormMessage("Profil tiklandi. Bosh panel ochilmoqda...", "success");
        window.setTimeout(redirectToDashboard, 250);
    } catch (error) {
        console.error("Student session tiklanmadi.", error);
    }
}

async function trackVisit() {
    const visitorId = ensureVisitorId();

    try {
        await fetch(buildApiUrl("/api/visits/track"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ visitorId })
        });
    } catch (error) {
        console.error("Tashrifni hisoblab bo'lmadi.", error);
    }
}

function ensureVisitorId() {
    try {
        const savedVisitorId = window.localStorage.getItem(VISITOR_ID_STORAGE_KEY);

        if (savedVisitorId) {
            return savedVisitorId;
        }

        const visitorId = `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        window.localStorage.setItem(VISITOR_ID_STORAGE_KEY, visitorId);
        return visitorId;
    } catch {
        return `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    }
}

function redirectToDashboard() {
    window.location.href = "dashboard.html";
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
