const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const SRC_DIR = path.join(__dirname, "src");
const DATA_DIR = path.join(__dirname, "backend-data");
const DEFAULT_SITE_NAME = "Milliy Sertifikat Platformasi";
const DEFAULT_SITE_DESCRIPTION = "Milliy sertifikat imtihoniga tayyorgarlik uchun mo'ljallangan ko'p fanli test va natija platformasi.";
const SITE_NAME = String(process.env.SITE_NAME || DEFAULT_SITE_NAME).trim();
const SITE_DESCRIPTION = String(process.env.SITE_DESCRIPTION || DEFAULT_SITE_DESCRIPTION).trim();
const STUDENTS_FILE = path.join(DATA_DIR, "students.json");
const VISITS_FILE = path.join(DATA_DIR, "visits.json");
const FEEDBACKS_FILE = path.join(DATA_DIR, "feedbacks.json");
const DISCUSSIONS_FILE = path.join(DATA_DIR, "discussions.json");
const NOTIFICATIONS_FILE = path.join(DATA_DIR, "notifications.json");
const RESULTS_FILE = path.join(DATA_DIR, "results.json");
const TEST_DATA_DIR = path.join(SRC_DIR, "data");
const TEST_SUBJECT_FILES = {
    "mother-tongue": path.join(TEST_DATA_DIR, "mother-tongue.json"),
    math: path.join(TEST_DATA_DIR, "math.json"),
    chemistry: path.join(TEST_DATA_DIR, "chemistry.json"),
    biology: path.join(TEST_DATA_DIR, "biology.json")
};
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "Islombek2508";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin2508";
const ADMIN_TOKEN_TTL_MS = 1000 * 60 * 60 * 12;
const ONLINE_WINDOW_MS = 1000 * 60 * 3;
const STUDENT_SESSION_COOKIE = "student_session";
const STUDENT_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 365;
const adminSessions = new Map();

app.use(express.json({ limit: "10mb" }));
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});
app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
});
app.use(express.static(SRC_DIR));

app.get("/", (_req, res) => {
    res.sendFile(path.join(SRC_DIR, "index.html"));
});

app.get("/robots.txt", (req, res) => {
    const siteUrl = resolveSiteUrl(req);
    const robotsBody = [
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin.html",
        "Disallow: /dashboard.html",
        "Disallow: /exam.html",
        "Disallow: /results.html",
        "",
        `Sitemap: ${siteUrl}/sitemap.xml`
    ].join("\n");

    res.type("text/plain; charset=utf-8");
    res.send(robotsBody);
});

app.get("/sitemap.xml", (req, res) => {
    const siteUrl = resolveSiteUrl(req);
    const pages = [
        { path: "/", priority: "1.0", changefreq: "daily" },
        { path: "/index.html", priority: "0.9", changefreq: "daily" },
        { path: "/test.html", priority: "0.7", changefreq: "weekly" }
    ];
    const xmlBody = [
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
        "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
        ...pages.map((page) => [
            "  <url>",
            `    <loc>${encodeXml(`${siteUrl}${page.path}`)}</loc>`,
            `    <changefreq>${page.changefreq}</changefreq>`,
            `    <priority>${page.priority}</priority>`,
            "  </url>"
        ].join("\n")),
        "</urlset>"
    ].join("\n");

    res.type("application/xml; charset=utf-8");
    res.send(xmlBody);
});

app.get("/api/site-config", (req, res) => {
    res.json({
        siteName: SITE_NAME,
        siteDescription: SITE_DESCRIPTION,
        siteUrl: resolveSiteUrl(req)
    });
});

app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
});

app.get("/api/student/session/current", async (req, res) => {
    try {
        const students = await readStudents();
        const student = findStudentBySessionToken(students, getStudentSessionToken(req));

        if (!student) {
            return res.status(404).json({ message: "Student session topilmadi." });
        }

        student.lastSeenAt = new Date().toISOString();
        student.updatedAt = student.lastSeenAt;
        await writeStudents(students);

        return res.json({
            ok: true,
            student: serializeStudent(student)
        });
    } catch (error) {
        console.error("Student session topilmadi.", error);
        return res.status(500).json({ message: "Student session topilmadi." });
    }
});

app.post("/api/visits/track", async (req, res) => {
    try {
        const visitorId = String(req.body?.visitorId || "").trim();
        const ipAddress = getClientIp(req);
        const visits = await readVisits();
        const uniqueKey = visitorId || ipAddress || `guest_${Date.now()}`;

        visits.totalVisits += 1;
        visits.updatedAt = new Date().toISOString();

        if (!visits.uniqueVisitors[uniqueKey]) {
            visits.uniqueVisitors[uniqueKey] = {
                firstSeenAt: new Date().toISOString(),
                lastSeenAt: new Date().toISOString(),
                visitCount: 1,
                ipAddress
            };
        } else {
            visits.uniqueVisitors[uniqueKey].lastSeenAt = new Date().toISOString();
            visits.uniqueVisitors[uniqueKey].visitCount += 1;
            visits.uniqueVisitors[uniqueKey].ipAddress = ipAddress;
        }

        await writeVisits(visits);

        res.status(201).json({
            totalVisits: visits.totalVisits,
            uniqueVisitors: Object.keys(visits.uniqueVisitors).length
        });
    } catch (error) {
        console.error("Tashrifni saqlab bo'lmadi.", error);
        res.status(500).json({ message: "Tashrifni saqlab bo'lmadi." });
    }
});

app.post("/api/admin/login", (req, res) => {
    const username = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "").trim();

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Parol yoki foydalanuvchi nom xato. Bu yerga faqat admin kira oladi va tizimni boshqara oladi." });
    }

    const token = crypto.randomBytes(24).toString("hex");
    adminSessions.set(token, Date.now() + ADMIN_TOKEN_TTL_MS);

    return res.json({
        token,
        username: ADMIN_USERNAME,
        expiresInMs: ADMIN_TOKEN_TTL_MS
    });
});

app.get("/api/admin/session", requireAdminAuth, (_req, res) => {
    res.json({ ok: true });
});

app.get("/api/students", requireAdminAuth, async (_req, res) => {
    try {
        const students = await readStudents();
        res.json({
            students: students
                .map((student) => ({
                    ...student,
                    isOnline: isStudentOnline(student)
                }))
                .sort((left, right) => new Date(right.lastSeenAt || right.createdAt || 0) - new Date(left.lastSeenAt || left.createdAt || 0))
        });
    } catch (error) {
        console.error("Studentlarni o'qib bo'lmadi.", error);
        res.status(500).json({ message: "Studentlar ro'yxatini o'qib bo'lmadi." });
    }
});

app.get("/api/admin/visits", requireAdminAuth, async (_req, res) => {
    try {
        const visits = await readVisits();
        const visitEntries = Object.entries(visits.uniqueVisitors)
            .map(([visitorId, visit]) => ({
                visitorId,
                ipAddress: visit.ipAddress || "-",
                firstSeenAt: visit.firstSeenAt || null,
                lastSeenAt: visit.lastSeenAt || null,
                visitCount: Number(visit.visitCount || 0)
            }))
            .sort((left, right) => new Date(right.lastSeenAt || 0) - new Date(left.lastSeenAt || 0));

        res.json({
            totalVisits: visits.totalVisits,
            uniqueVisitors: Object.keys(visits.uniqueVisitors).length,
            updatedAt: visits.updatedAt || null,
            visitEntries
        });
    } catch (error) {
        console.error("Tashrif statistikasini o'qib bo'lmadi.", error);
        res.status(500).json({ message: "Tashrif statistikasini o'qib bo'lmadi." });
    }
});

app.get("/api/admin/student-results", requireAdminAuth, async (_req, res) => {
    try {
        const students = await readStudents();
        const results = await readResults();
        const visits = await readVisits();
        const mergedStudents = mergeStudentsByIdentity(students);
        const resultsByStudent = groupResultsByStudent(results);
        const resultsByEmail = groupResultsByEmail(results);

        const studentSummaries = mergedStudents
            .map((student) => {
                const studentResults = mergeStudentResults(
                    student,
                    resultsByStudent,
                    resultsByEmail
                );
                const visitSummary = getVisitSummaryForStudent(student, visits);
                const bestResult = studentResults
                    .slice()
                    .sort((left, right) => Number(right.percent || 0) - Number(left.percent || 0))[0] || null;

                return {
                    ...student,
                    isOnline: isStudentOnline(student),
                    firstSeenAt: visitSummary.firstSeenAt || student.createdAt || null,
                    visitCount: Number(visitSummary.visitCount || 0),
                    ipAddress: visitSummary.ipAddress || "-",
                    results: studentResults,
                    bestResult,
                    completedTestsCount: studentResults.length
                };
            })
            .sort((left, right) => new Date(right.lastSeenAt || right.createdAt || 0) - new Date(left.lastSeenAt || left.createdAt || 0));

        res.json({ students: studentSummaries });
    } catch (error) {
        console.error("Student natijalarini o'qib bo'lmadi.", error);
        res.status(500).json({ message: "Student natijalarini o'qib bo'lmadi." });
    }
});

app.get("/api/feedbacks", async (_req, res) => {
    try {
        const feedbacks = await readFeedbacks();
        res.json({ feedbacks });
    } catch (error) {
        console.error("Feedbacklarni o'qib bo'lmadi.", error);
        res.status(500).json({ message: "Feedbacklarni o'qib bo'lmadi." });
    }
});

app.get("/api/discussions", async (_req, res) => {
    try {
        const posts = await readDiscussions();
        res.json({ posts });
    } catch (error) {
        console.error("Discussion postlarini o'qib bo'lmadi.", error);
        res.status(500).json({ message: "Discussion postlarini o'qib bo'lmadi." });
    }
});

app.post("/api/discussions/posts", async (req, res) => {
    try {
        const posts = await readDiscussions();
        const post = normalizeDiscussionPost({
            id: `discussion_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            categoryId: req.body?.categoryId,
            categoryLabel: req.body?.categoryLabel,
            authorName: req.body?.authorName,
            authorEmail: req.body?.authorEmail,
            username: req.body?.username,
            authorPhotoDataUrl: req.body?.authorPhotoDataUrl,
            message: req.body?.message,
            attachments: req.body?.attachments,
            metadata: req.body?.metadata,
            createdAt: new Date().toISOString(),
            reactions: {},
            replies: []
        });

        if (!post.categoryId) {
            return res.status(400).json({ message: "Bo'lim tanlanishi kerak." });
        }

        if (!post.message && !post.attachments.length) {
            return res.status(400).json({ message: "Post uchun kamida matn yoki media kerak." });
        }

        posts.push(post);
        await writeDiscussions(posts);
        res.status(201).json({ post });
    } catch (error) {
        console.error("Discussion posti saqlanmadi.", error);
        res.status(500).json({ message: "Discussion posti saqlanmadi." });
    }
});

app.post("/api/discussions/posts/:postId/replies", async (req, res) => {
    try {
        const posts = await readDiscussions();
        const post = posts.find((entry) => entry.id === req.params.postId);

        if (!post) {
            return res.status(404).json({ message: "Post topilmadi." });
        }

        const reply = normalizeDiscussionReply({
            id: `discussion_reply_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            authorName: req.body?.authorName,
            authorEmail: req.body?.authorEmail,
            username: req.body?.username,
            authorPhotoDataUrl: req.body?.authorPhotoDataUrl,
            message: req.body?.message,
            attachments: req.body?.attachments,
            createdAt: new Date().toISOString(),
            reactions: {}
        });

        if (!reply.message && !reply.attachments.length) {
            return res.status(400).json({ message: "Reply uchun kamida matn yoki media kerak." });
        }

        post.replies = Array.isArray(post.replies) ? post.replies : [];
        post.replies.push(reply);
        await writeDiscussions(posts);
        res.status(201).json({ reply, post });
    } catch (error) {
        console.error("Discussion reply saqlanmadi.", error);
        res.status(500).json({ message: "Discussion reply saqlanmadi." });
    }
});

app.post("/api/discussions/posts/:postId/reactions/toggle", async (req, res) => {
    try {
        const posts = await readDiscussions();
        const post = posts.find((entry) => entry.id === req.params.postId);
        const reactionType = String(req.body?.reactionType || "").trim();
        const username = String(req.body?.username || "").trim();

        if (!post) {
            return res.status(404).json({ message: "Post topilmadi." });
        }

        if (!reactionType || !username) {
            return res.status(400).json({ message: "Reaction turi va username talab qilinadi." });
        }

        post.reactions = normalizeDiscussionReactions(post.reactions);
        const currentUsers = post.reactions[reactionType] || [];
        post.reactions[reactionType] = currentUsers.includes(username)
            ? currentUsers.filter((value) => value !== username)
            : currentUsers.concat(username);

        await writeDiscussions(posts);
        res.json({ post });
    } catch (error) {
        console.error("Discussion reaction saqlanmadi.", error);
        res.status(500).json({ message: "Discussion reaction saqlanmadi." });
    }
});

app.delete("/api/admin/discussions/posts/:postId", requireAdminAuth, async (req, res) => {
    try {
        const posts = await readDiscussions();
        const nextPosts = posts.filter((entry) => entry.id !== req.params.postId);

        if (nextPosts.length === posts.length) {
            return res.status(404).json({ message: "Discussion post topilmadi." });
        }

        await writeDiscussions(nextPosts);
        return res.json({ message: "Discussion post o'chirildi.", posts: nextPosts });
    } catch (error) {
        console.error("Discussion postni o'chirib bo'lmadi.", error);
        return res.status(500).json({ message: "Discussion postni o'chirib bo'lmadi." });
    }
});

app.delete("/api/admin/discussions/posts/:postId/replies/:replyId", requireAdminAuth, async (req, res) => {
    try {
        const posts = await readDiscussions();
        const post = posts.find((entry) => entry.id === req.params.postId);

        if (!post) {
            return res.status(404).json({ message: "Discussion post topilmadi." });
        }

        const currentReplies = Array.isArray(post.replies) ? post.replies : [];
        const nextReplies = currentReplies.filter((entry) => entry.id !== req.params.replyId);

        if (nextReplies.length === currentReplies.length) {
            return res.status(404).json({ message: "Discussion reply topilmadi." });
        }

        post.replies = nextReplies;
        await writeDiscussions(posts);
        return res.json({ message: "Discussion reply o'chirildi.", post });
    } catch (error) {
        console.error("Discussion replyni o'chirib bo'lmadi.", error);
        return res.status(500).json({ message: "Discussion replyni o'chirib bo'lmadi." });
    }
});

app.get("/api/notifications", async (req, res) => {
    try {
        const studentEmail = String(req.query?.studentEmail || "").trim().toLowerCase();

        if (!studentEmail) {
            return res.status(400).json({ message: "Student email talab qilinadi." });
        }

        const notifications = await readNotifications();
        const studentNotifications = notifications
            .filter((entry) => entry.studentEmail === studentEmail)
            .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0));

        res.json({ notifications: studentNotifications });
    } catch (error) {
        console.error("Notificationlarni o'qib bo'lmadi.", error);
        res.status(500).json({ message: "Notificationlarni o'qib bo'lmadi." });
    }
});

app.post("/api/notifications/mark-read", async (req, res) => {
    try {
        const studentEmail = String(req.body?.studentEmail || "").trim().toLowerCase();
        const notificationIds = Array.isArray(req.body?.notificationIds)
            ? req.body.notificationIds.map((value) => String(value || "").trim()).filter(Boolean)
            : [];

        if (!studentEmail) {
            return res.status(400).json({ message: "Student email talab qilinadi." });
        }

        const notifications = await readNotifications();
        let hasChanges = false;

        notifications.forEach((entry) => {
            const isOwnedByStudent = entry.studentEmail === studentEmail;
            const shouldMark = !notificationIds.length || notificationIds.includes(entry.id);

            if (isOwnedByStudent && shouldMark && !entry.isRead) {
                entry.isRead = true;
                hasChanges = true;
            }
        });

        if (hasChanges) {
            await writeNotifications(notifications);
        }

        const studentNotifications = notifications
            .filter((entry) => entry.studentEmail === studentEmail)
            .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0));

        res.json({ notifications: studentNotifications });
    } catch (error) {
        console.error("Notification holatini yangilab bo'lmadi.", error);
        res.status(500).json({ message: "Notification holatini yangilab bo'lmadi." });
    }
});

app.post("/api/admin/notifications/broadcast", requireAdminAuth, async (req, res) => {
    try {
        const title = String(req.body?.title || "").trim();
        const message = String(req.body?.message || "").trim();

        if (title.length < 3) {
            return res.status(400).json({ message: "Bildirishnoma sarlavhasi kamida 3 ta belgidan iborat bo'lishi kerak." });
        }

        if (message.length < 6) {
            return res.status(400).json({ message: "Bildirishnoma matni kamida 6 ta belgidan iborat bo'lishi kerak." });
        }

        const students = await readStudents();
        const notifications = await readNotifications();
        const now = new Date().toISOString();
        const targetStudents = students.filter((student) => String(student?.email || "").trim());

        if (!targetStudents.length) {
            return res.status(400).json({ message: "Bildirishnoma yuborish uchun studentlar topilmadi." });
        }

        targetStudents.forEach((student) => {
            notifications.push(normalizeNotificationEntry({
                id: `notification_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                studentEmail: student.email,
                type: "admin-broadcast",
                title,
                message,
                isRead: false,
                createdAt: now
            }));
        });

        await writeNotifications(notifications);
        return res.status(201).json({
            message: `Bildirishnoma ${targetStudents.length} ta foydalanuvchiga yuborildi.`
        });
    } catch (error) {
        console.error("Ommaviy bildirishnoma yuborilmadi.", error);
        return res.status(500).json({ message: "Ommaviy bildirishnoma yuborilmadi." });
    }
});

app.post("/api/feedbacks", async (req, res) => {
    try {
        const feedbacks = await readFeedbacks();
        const feedback = normalizeFeedbackEntry({
            id: `feedback_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            authorName: req.body?.authorName,
            authorEmail: req.body?.authorEmail,
            username: req.body?.username,
            message: req.body?.message,
            authorPhotoDataUrl: req.body?.authorPhotoDataUrl,
            createdAt: new Date().toISOString(),
            likes: 0,
            likedBy: [],
            replies: [],
            isPinned: false
        });

        if (!feedback.message) {
            return res.status(400).json({ message: "Feedback matni bo'sh bo'lmasligi kerak." });
        }

        feedbacks.push(feedback);
        await writeFeedbacks(feedbacks);
        res.status(201).json({ feedback });
    } catch (error) {
        console.error("Feedbackni saqlab bo'lmadi.", error);
        res.status(500).json({ message: "Feedbackni saqlab bo'lmadi." });
    }
});

app.put("/api/feedbacks/:feedbackId", async (req, res) => {
    try {
        const feedbackId = String(req.params.feedbackId || "").trim();
        const authorEmail = String(req.body?.authorEmail || "").trim().toLowerCase();
        const message = String(req.body?.message || "").trim();

        if (!feedbackId) {
            return res.status(400).json({ message: "Feedback ID talab qilinadi." });
        }

        if (!authorEmail) {
            return res.status(400).json({ message: "Author email talab qilinadi." });
        }

        if (message.length < 6) {
            return res.status(400).json({ message: "Feedback kamida 6 ta belgidan iborat bo'lishi kerak." });
        }

        const feedbacks = await readFeedbacks();
        const feedback = feedbacks.find((entry) => entry.id === feedbackId);

        if (!feedback) {
            return res.status(404).json({ message: "Feedback topilmadi." });
        }

        if (String(feedback.authorEmail || "").trim().toLowerCase() !== authorEmail) {
            return res.status(403).json({ message: "Faqat o'zingiz yozgan feedbackni tahrirlashingiz mumkin." });
        }

        feedback.message = message;
        feedback.updatedAt = new Date().toISOString();
        await writeFeedbacks(feedbacks);

        return res.json({ feedback: normalizeFeedbackEntry(feedback) });
    } catch (error) {
        console.error("Feedbackni tahrirlab bo'lmadi.", error);
        return res.status(500).json({ message: "Feedbackni tahrirlab bo'lmadi." });
    }
});

app.post("/api/feedbacks/:feedbackId/replies", async (req, res) => {
    try {
        const feedbacks = await readFeedbacks();
        const notifications = await readNotifications();
        const feedback = feedbacks.find((entry) => entry.id === req.params.feedbackId);

        if (!feedback) {
            return res.status(404).json({ message: "Feedback topilmadi." });
        }

        const reply = {
            id: `reply_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            authorName: String(req.body?.authorName || "Foydalanuvchi"),
            authorEmail: String(req.body?.authorEmail || ""),
            username: String(req.body?.username || "@foydalanuvchi"),
            message: String(req.body?.message || "").trim(),
            authorPhotoDataUrl: String(req.body?.authorPhotoDataUrl || ""),
            createdAt: new Date().toISOString()
        };

        if (!reply.message) {
            return res.status(400).json({ message: "Reply matni bo'sh bo'lmasligi kerak." });
        }

        feedback.replies = Array.isArray(feedback.replies) ? feedback.replies : [];
        feedback.replies.push(reply);
        await writeFeedbacks(feedbacks);
        if (feedback.authorEmail && feedback.authorEmail !== reply.authorEmail) {
            notifications.push(normalizeNotificationEntry({
                id: `notification_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                studentEmail: feedback.authorEmail,
                type: "feedback-reply",
                title: "Feedbackingizga javob keldi",
                message: `${reply.authorName} sizning feedbackingizga reply yozdi.`,
                feedbackId: feedback.id,
                replyId: reply.id,
                isRead: false,
                createdAt: new Date().toISOString()
            }));
            await writeNotifications(notifications);
        }
        res.status(201).json({ reply, feedback });
    } catch (error) {
        console.error("Replyni saqlab bo'lmadi.", error);
        res.status(500).json({ message: "Replyni saqlab bo'lmadi." });
    }
});

app.post("/api/feedbacks/:feedbackId/likes/toggle", async (req, res) => {
    try {
        const username = String(req.body?.username || "").trim();

        if (!username) {
            return res.status(400).json({ message: "Username talab qilinadi." });
        }

        const feedbacks = await readFeedbacks();
        const feedback = feedbacks.find((entry) => entry.id === req.params.feedbackId);

        if (!feedback) {
            return res.status(404).json({ message: "Feedback topilmadi." });
        }

        feedback.likedBy = Array.isArray(feedback.likedBy) ? feedback.likedBy : [];

        if (feedback.likedBy.includes(username)) {
            feedback.likedBy = feedback.likedBy.filter((value) => value !== username);
        } else {
            feedback.likedBy.push(username);
        }

        feedback.likes = feedback.likedBy.length;
        await writeFeedbacks(feedbacks);
        res.json({ feedback });
    } catch (error) {
        console.error("Like holatini saqlab bo'lmadi.", error);
        res.status(500).json({ message: "Like holatini saqlab bo'lmadi." });
    }
});

app.post("/api/admin/feedbacks/:feedbackId/pin", requireAdminAuth, async (req, res) => {
    try {
        const feedbacks = await readFeedbacks();
        const feedbackId = req.params.feedbackId;

        const nextFeedbacks = feedbacks.map((entry) => ({
            ...entry,
            isPinned: entry.id === feedbackId ? !entry.isPinned : false
        }));

        await writeFeedbacks(nextFeedbacks);
        res.json({ feedbacks: nextFeedbacks });
    } catch (error) {
        console.error("Feedbackni pin qilib bo'lmadi.", error);
        res.status(500).json({ message: "Feedbackni pin qilib bo'lmadi." });
    }
});

app.delete("/api/admin/feedbacks/:feedbackId", requireAdminAuth, async (req, res) => {
    try {
        const feedbacks = await readFeedbacks();
        const feedbackId = req.params.feedbackId;
        const nextFeedbacks = feedbacks.filter((entry) => entry.id !== feedbackId);

        if (nextFeedbacks.length === feedbacks.length) {
            return res.status(404).json({ message: "Feedback topilmadi." });
        }

        await writeFeedbacks(nextFeedbacks);
        res.json({ message: "Feedback o'chirildi.", feedbacks: nextFeedbacks });
    } catch (error) {
        console.error("Feedbackni o'chirib bo'lmadi.", error);
        res.status(500).json({ message: "Feedbackni o'chirib bo'lmadi." });
    }
});

app.get("/api/tests/:subjectId", requireAdminAuth, async (req, res) => {
    try {
        const subjectId = req.params.subjectId;
        const questions = await readQuestions(subjectId);
        res.json({ subjectId, questions });
    } catch (error) {
        handleTestError(res, error, "Savollarni o'qib bo'lmadi.");
    }
});

app.post("/api/tests/:subjectId/questions", requireAdminAuth, async (req, res) => {
    try {
        const subjectId = req.params.subjectId;
        const validation = validateQuestion(req.body);

        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message });
        }

        const questions = await readQuestions(subjectId);
        questions.push(validation.question);
        await writeQuestions(subjectId, questions);

        return res.status(201).json({
            message: "Savol muvaffaqiyatli qo'shildi.",
            question: validation.question,
            total: questions.length
        });
    } catch (error) {
        handleTestError(res, error, "Savolni saqlab bo'lmadi.");
    }
});

app.put("/api/tests/:subjectId/questions/:questionIndex", requireAdminAuth, async (req, res) => {
    try {
        const subjectId = req.params.subjectId;
        const questionIndex = parseQuestionIndex(req.params.questionIndex);
        const validation = validateQuestion(req.body);

        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message });
        }

        const questions = await readQuestions(subjectId);

        if (!questions[questionIndex]) {
            return res.status(404).json({ message: "Savol topilmadi." });
        }

        questions[questionIndex] = validation.question;
        await writeQuestions(subjectId, questions);

        return res.json({
            message: "Savol yangilandi.",
            question: validation.question
        });
    } catch (error) {
        handleTestError(res, error, "Savolni yangilab bo'lmadi.");
    }
});

app.delete("/api/tests/:subjectId/questions/:questionIndex", requireAdminAuth, async (req, res) => {
    try {
        const subjectId = req.params.subjectId;
        const questionIndex = parseQuestionIndex(req.params.questionIndex);
        const questions = await readQuestions(subjectId);

        if (!questions[questionIndex]) {
            return res.status(404).json({ message: "Savol topilmadi." });
        }

        questions.splice(questionIndex, 1);
        await writeQuestions(subjectId, questions);

        return res.json({
            message: "Savol o'chirildi.",
            total: questions.length
        });
    } catch (error) {
        handleTestError(res, error, "Savolni o'chirib bo'lmadi.");
    }
});

app.post("/api/tests/:subjectId/import", requireAdminAuth, async (req, res) => {
    try {
        const subjectId = req.params.subjectId;
        const csv = String(req.body?.csv || "");
        const importedQuestions = parseCsvQuestions(csv);
        const questions = await readQuestions(subjectId);
        const mergedQuestions = questions.concat(importedQuestions);

        await writeQuestions(subjectId, mergedQuestions);

        return res.status(201).json({
            message: `${importedQuestions.length} ta savol import qilindi.`,
            importedCount: importedQuestions.length,
            total: mergedQuestions.length
        });
    } catch (error) {
        handleTestError(res, error, "CSV importni bajarib bo'lmadi.");
    }
});

app.put("/api/tests/:subjectId", requireAdminAuth, async (req, res) => {
    try {
        const subjectId = req.params.subjectId;
        const questions = validateQuestionSet(req.body?.questions);
        await writeQuestions(subjectId, questions);

        return res.json({
            message: "Fan savollari to'liq yangilandi.",
            total: questions.length
        });
    } catch (error) {
        handleTestError(res, error, "Fan savollarini saqlab bo'lmadi.");
    }
});

app.post("/api/register", async (req, res) => {
    try {
        const validation = validateStudent(req.body);

        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message });
        }

        const students = await readStudents();
        const now = new Date().toISOString();
        const visitorId = String(req.body?.visitorId || "").trim();
        const existingStudent = students.find((entry) => entry.email === validation.student.email);
        const sessionToken = existingStudent?.sessionToken || createStudentSessionToken();
        const student = existingStudent
            ? {
                ...existingStudent,
                phone: validation.student.phone,
                fullName: validation.student.fullName,
                updatedAt: now,
                lastSeenAt: now,
                visitorId: visitorId || existingStudent.visitorId || "",
                currentPage: "dashboard",
                sessionToken
            }
            : {
                id: createStudentId(),
                email: validation.student.email,
                phone: validation.student.phone,
                fullName: validation.student.fullName,
                createdAt: now,
                updatedAt: now,
                lastSeenAt: now,
                photoDataUrl: "",
                visitorId,
                currentPage: "dashboard",
                sessionToken
            };

        if (existingStudent) {
            const existingIndex = students.findIndex((entry) => entry.id === existingStudent.id);
            students[existingIndex] = student;
        } else {
            students.push(student);
        }
        await writeStudents(students);
        setStudentSessionCookie(res, sessionToken);

        return res.status(201).json({
            message: "Talaba muvaffaqiyatli ro'yxatdan o'tdi.",
            student: serializeStudent(student)
        });
    } catch (error) {
        console.error("Talabani saqlab bo'lmadi.", error);
        return res.status(500).json({ message: "Talaba ma'lumotlarini saqlab bo'lmadi." });
    }
});

app.post("/api/results", async (req, res) => {
    try {
        const validation = validateResultPayload(req.body);

        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message });
        }

        const results = await readResults();
        const normalizedResult = {
            ...validation.result,
            id: `result_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            createdAt: new Date().toISOString()
        };
        const existingIndex = results.findIndex((entry) => (
            (entry.studentId === normalizedResult.studentId || entry.studentEmail === normalizedResult.studentEmail) &&
            entry.subjectId === normalizedResult.subjectId
        ));

        if (existingIndex >= 0) {
            normalizedResult.id = results[existingIndex].id || normalizedResult.id;
            normalizedResult.createdAt = results[existingIndex].createdAt || normalizedResult.createdAt;
            results[existingIndex] = normalizedResult;
        } else {
            results.push(normalizedResult);
        }

        await writeResults(results);
        res.status(201).json({ result: normalizedResult });
    } catch (error) {
        console.error("Natijani saqlab bo'lmadi.", error);
        res.status(500).json({ message: "Natijani saqlab bo'lmadi." });
    }
});

app.post("/api/student/session", async (req, res) => {
    try {
        const studentId = String(req.body?.studentId || "").trim();
        const visitorId = String(req.body?.visitorId || "").trim();
        const currentPage = String(req.body?.currentPage || "").trim();

        if (!studentId) {
            return res.status(400).json({ message: "Student ID talab qilinadi." });
        }

        const students = await readStudents();
        const student = students.find((entry) => entry.id === studentId);

        if (!student) {
            return res.status(404).json({ message: "Student topilmadi." });
        }

        student.lastSeenAt = new Date().toISOString();
        student.updatedAt = student.lastSeenAt;

        if (visitorId) {
            student.visitorId = visitorId;
        }

        if (currentPage) {
            student.currentPage = currentPage;
        }

        await writeStudents(students);
        res.json({ ok: true, student: serializeStudent(student) });
    } catch (error) {
        console.error("Student session yangilanmadi.", error);
        res.status(500).json({ message: "Student session yangilanmadi." });
    }
});

app.post("/api/student/profile-photo", async (req, res) => {
    try {
        const studentId = String(req.body?.studentId || "").trim();
        const photoDataUrl = String(req.body?.photoDataUrl || "").trim();

        if (!studentId) {
            return res.status(400).json({ message: "Student ID talab qilinadi." });
        }

        const students = await readStudents();
        const student = students.find((entry) => entry.id === studentId);

        if (!student) {
            return res.status(404).json({ message: "Student topilmadi." });
        }

        student.photoDataUrl = photoDataUrl;
        student.updatedAt = new Date().toISOString();
        await writeStudents(students);

        const feedbacks = await readFeedbacks();
        let feedbacksUpdated = false;

        feedbacks.forEach((entry) => {
            if (entry.authorEmail && entry.authorEmail === student.email) {
                entry.authorPhotoDataUrl = photoDataUrl;
                feedbacksUpdated = true;
            }

            if (Array.isArray(entry.replies)) {
                entry.replies.forEach((reply) => {
                    if (reply.authorEmail && reply.authorEmail === student.email) {
                        reply.authorPhotoDataUrl = photoDataUrl;
                        feedbacksUpdated = true;
                    }
                });
            }
        });

        if (feedbacksUpdated) {
            await writeFeedbacks(feedbacks);
        }

        res.json({ student: serializeStudent(student) });
    } catch (error) {
        console.error("Profil rasmi saqlanmadi.", error);
        res.status(500).json({ message: "Profil rasmi saqlanmadi." });
    }
});

app.post("/api/student/goals", async (req, res) => {
    try {
        const studentId = String(req.body?.studentId || "").trim();
        const dreamScore = String(req.body?.dreamScore || "").trim();
        const dreamUniversity = String(req.body?.dreamUniversity || "").trim();

        if (!studentId) {
            return res.status(400).json({ message: "Student ID talab qilinadi." });
        }

        if (!dreamScore || Number(dreamScore) < 100 || Number(dreamScore) > 189) {
            return res.status(400).json({ message: "Dream score 100 dan 189 gacha bo'lishi kerak." });
        }

        if (!dreamUniversity) {
            return res.status(400).json({ message: "Dream universitet tanlanishi kerak." });
        }

        const students = await readStudents();
        const student = students.find((entry) => entry.id === studentId);

        if (!student) {
            return res.status(404).json({ message: "Student topilmadi." });
        }

        student.dreamScore = dreamScore;
        student.dreamUniversity = dreamUniversity;
        student.updatedAt = new Date().toISOString();
        await writeStudents(students);

        return res.json({ student: serializeStudent(student) });
    } catch (error) {
        console.error("Dream maqsadlar saqlanmadi.", error);
        return res.status(500).json({ message: "Dream maqsadlar saqlanmadi." });
    }
});

app.listen(PORT, async () => {
    await ensureStorage();
    console.log(`Server ishga tushdi: http://localhost:${PORT}`);
});

function resolveSiteUrl(req) {
    const configuredSiteUrl = String(process.env.SITE_URL || "").trim().replace(/\/$/, "");

    if (configuredSiteUrl) {
        return configuredSiteUrl;
    }

    const forwardedProto = String(req?.headers["x-forwarded-proto"] || "").split(",")[0].trim();
    const protocol = forwardedProto || req?.protocol || "http";
    const host = String(req?.headers["x-forwarded-host"] || req?.get?.("host") || "").split(",")[0].trim();

    if (!host) {
        return `http://localhost:${PORT}`;
    }

    return `${protocol}://${host}`;
}

function encodeXml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}

async function ensureStorage() {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(TEST_DATA_DIR, { recursive: true });

    try {
        await fs.access(STUDENTS_FILE);
    } catch {
        await fs.writeFile(STUDENTS_FILE, "[]", "utf8");
    }

    try {
        await fs.access(VISITS_FILE);
    } catch {
        await fs.writeFile(VISITS_FILE, JSON.stringify({
            totalVisits: 0,
            uniqueVisitors: {},
            updatedAt: null
        }, null, 2), "utf8");
    }

    try {
        await fs.access(FEEDBACKS_FILE);
    } catch {
        await fs.writeFile(FEEDBACKS_FILE, "[]", "utf8");
    }

    try {
        await fs.access(DISCUSSIONS_FILE);
    } catch {
        await fs.writeFile(DISCUSSIONS_FILE, "[]", "utf8");
    }

    try {
        await fs.access(NOTIFICATIONS_FILE);
    } catch {
        await fs.writeFile(NOTIFICATIONS_FILE, "[]", "utf8");
    }

    try {
        await fs.access(RESULTS_FILE);
    } catch {
        await fs.writeFile(RESULTS_FILE, "[]", "utf8");
    }
}

async function readStudents() {
    await ensureStorage();
    const raw = await fs.readFile(STUDENTS_FILE, "utf8");
    return JSON.parse(raw);
}

async function writeStudents(students) {
    await fs.writeFile(STUDENTS_FILE, JSON.stringify(students, null, 2), "utf8");
}

async function readFeedbacks() {
    await ensureStorage();
    const raw = await fs.readFile(FEEDBACKS_FILE, "utf8");
    const payload = JSON.parse(raw);
    return Array.isArray(payload) ? payload.map(normalizeFeedbackEntry) : [];
}

async function writeFeedbacks(feedbacks) {
    await fs.writeFile(FEEDBACKS_FILE, JSON.stringify(feedbacks.map(normalizeFeedbackEntry), null, 2), "utf8");
}

async function readDiscussions() {
    await ensureStorage();
    const raw = await fs.readFile(DISCUSSIONS_FILE, "utf8");
    const payload = JSON.parse(raw);
    return Array.isArray(payload) ? payload.map(normalizeDiscussionPost) : [];
}

async function writeDiscussions(posts) {
    await fs.writeFile(DISCUSSIONS_FILE, JSON.stringify(posts.map(normalizeDiscussionPost), null, 2), "utf8");
}

async function readNotifications() {
    await ensureStorage();
    const raw = await fs.readFile(NOTIFICATIONS_FILE, "utf8");
    const payload = JSON.parse(raw);
    return Array.isArray(payload) ? payload.map(normalizeNotificationEntry) : [];
}

async function writeNotifications(notifications) {
    await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify(notifications.map(normalizeNotificationEntry), null, 2), "utf8");
}

async function readResults() {
    await ensureStorage();
    const raw = await fs.readFile(RESULTS_FILE, "utf8");
    const payload = JSON.parse(raw);
    return Array.isArray(payload) ? payload.map(normalizeResultEntry) : [];
}

async function writeResults(results) {
    await fs.writeFile(RESULTS_FILE, JSON.stringify(results.map(normalizeResultEntry), null, 2), "utf8");
}

async function readVisits() {
    await ensureStorage();
    const raw = await fs.readFile(VISITS_FILE, "utf8");
    const payload = JSON.parse(raw);

    return {
        totalVisits: Number(payload?.totalVisits || 0),
        uniqueVisitors: payload?.uniqueVisitors && typeof payload.uniqueVisitors === "object"
            ? payload.uniqueVisitors
            : {},
        updatedAt: payload?.updatedAt || null
    };
}

async function writeVisits(visits) {
    await fs.writeFile(VISITS_FILE, JSON.stringify(visits, null, 2), "utf8");
}

async function readQuestions(subjectId) {
    const filePath = getTestFilePath(subjectId);
    const raw = await fs.readFile(filePath, "utf8");
    const payload = JSON.parse(raw);
    return Array.isArray(payload?.questions) ? payload.questions : [];
}

async function writeQuestions(subjectId, questions) {
    const filePath = getTestFilePath(subjectId);
    const payload = { questions };
    await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
}

function serializeStudent(student) {
    return {
        ...student,
        isOnline: isStudentOnline(student),
        sessionToken: undefined
    };
}

function createStudentSessionToken() {
    return crypto.randomBytes(32).toString("hex");
}

function setStudentSessionCookie(res, sessionToken) {
    res.setHeader("Set-Cookie", `${STUDENT_SESSION_COOKIE}=${sessionToken}; Max-Age=${Math.floor(STUDENT_SESSION_TTL_MS / 1000)}; Path=/; SameSite=Lax`);
}

function getStudentSessionToken(req) {
    const cookiesHeader = String(req.headers?.cookie || "");

    if (!cookiesHeader) {
        return "";
    }

    const cookies = cookiesHeader
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean);

    for (const cookie of cookies) {
        const separatorIndex = cookie.indexOf("=");

        if (separatorIndex <= 0) {
            continue;
        }

        const key = cookie.slice(0, separatorIndex).trim();
        const value = cookie.slice(separatorIndex + 1).trim();

        if (key === STUDENT_SESSION_COOKIE) {
            return value;
        }
    }

    return "";
}

function findStudentBySessionToken(students, sessionToken) {
    if (!sessionToken) {
        return null;
    }

    return students.find((entry) => entry.sessionToken === sessionToken) || null;
}

function getTestFilePath(subjectId) {
    const filePath = TEST_SUBJECT_FILES[subjectId];

    if (!filePath) {
        const error = new Error("Noto'g'ri fan tanlandi.");
        error.statusCode = 404;
        throw error;
    }

    return filePath;
}

function parseQuestionIndex(value) {
    const questionIndex = Number.parseInt(value, 10);

    if (!Number.isInteger(questionIndex) || questionIndex < 0) {
        const error = new Error("Savol indeksi noto'g'ri.");
        error.statusCode = 400;
        throw error;
    }

    return questionIndex;
}

function validateQuestion(payload) {
    const type = String(payload?.type || "").trim();
    const question = String(payload?.question || "").trim();
    const answer = String(payload?.answer || "").trim();
    const options = Array.isArray(payload?.options)
        ? payload.options.map((option) => String(option || "").trim())
        : [];

    if (!question) {
        return { isValid: false, message: "Savol matnini kiriting." };
    }

    if (type === "closed") {
        const answers = Array.isArray(payload?.answer)
            ? payload.answer.map((value) => String(value || "").trim()).filter(Boolean)
            : [String(payload?.answer || "").trim()].filter(Boolean);

        if (!answers.length) {
            return { isValid: false, message: "Ochiq savol uchun javobni kiriting." };
        }

        return {
            isValid: true,
            question: {
                type: "closed",
                question,
                placeholder: String(payload?.placeholder || "Javobni yozing"),
                answer: answers
            }
        };
    }

    if (type === "closed-pair" || type === "closed-multi") {
        const fields = Array.isArray(payload?.fields) ? payload.fields : [];
        const answers = Array.isArray(payload?.answer) ? payload.answer : [];

        if (!answers.length) {
            return { isValid: false, message: "Yozma savol uchun javob qismlarini kiriting." };
        }

        const normalizedAnswers = answers.map((group) => (
            Array.isArray(group)
                ? group.map((value) => String(value || "").trim()).filter(Boolean)
                : [String(group || "").trim()].filter(Boolean)
        ));

        if (normalizedAnswers.some((group) => !group.length)) {
            return { isValid: false, message: "Har bir qism uchun kamida bitta javob kiriting." };
        }

        return {
            isValid: true,
            question: {
                type,
                question,
                fields: normalizedFieldList(fields, normalizedAnswers.length),
                answer: normalizedAnswers
            }
        };
    }

    if (options.length !== 4 || options.some((option) => !option)) {
        return { isValid: false, message: "4 ta javob variantini to'liq kiriting." };
    }

    if (!answer) {
        return { isValid: false, message: "To'g'ri javobni kiriting." };
    }

    if (!options.includes(answer)) {
        return { isValid: false, message: "To'g'ri javob variantlardan biri bo'lishi kerak." };
    }

    return {
        isValid: true,
        question: {
            question,
            options,
            answer
        }
    };
}

function validateQuestionSet(questions) {
    if (!Array.isArray(questions) || !questions.length) {
        const error = new Error("Kamida bitta savol bo'lishi kerak.");
        error.statusCode = 400;
        throw error;
    }

    return questions.map((questionPayload) => {
        const validation = validateQuestion(questionPayload);

        if (!validation.isValid) {
            const error = new Error(validation.message);
            error.statusCode = 400;
            throw error;
        }

        return validation.question;
    });
}

function parseCsvQuestions(csv) {
    const trimmedCsv = String(csv || "").trim();

    if (!trimmedCsv) {
        const error = new Error("CSV matnini kiriting.");
        error.statusCode = 400;
        throw error;
    }

    const lines = trimmedCsv
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    if (lines.length < 2) {
        const error = new Error("CSV ichida kamida bitta savol bo'lishi kerak.");
        error.statusCode = 400;
        throw error;
    }

    const rows = lines.slice(1).map(parseCsvLine);
    const importedQuestions = rows.map((row) => {
        if (row.length < 6) {
            const error = new Error("Har bir CSV qatorida question, optionA, optionB, optionC, optionD, answer ustunlari bo'lishi kerak.");
            error.statusCode = 400;
            throw error;
        }

        const payload = {
            question: row[0],
            options: row.slice(1, 5),
            answer: row[5]
        };
        const validation = validateQuestion(payload);

        if (!validation.isValid) {
            const error = new Error(validation.message);
            error.statusCode = 400;
            throw error;
        }

        return validation.question;
    });

    if (!importedQuestions.length) {
        const error = new Error("CSV ichida import qilinadigan savol topilmadi.");
        error.statusCode = 400;
        throw error;
    }

    return importedQuestions;
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

function normalizedFieldList(fields, answerCount) {
    const safeCount = Math.max(Number(answerCount || 0), 0);

    return Array.from({ length: safeCount }, (_, index) => ({
        label: String(fields?.[index]?.label || `${String.fromCharCode(97 + index)}) Javob`),
        placeholder: String(fields?.[index]?.placeholder || `${String.fromCharCode(97 + index)}) javobni kiriting`)
    }));
}

function requireAdminAuth(req, res, next) {
    cleanupExpiredAdminSessions();

    const token = getBearerToken(req);

    if (!token || !adminSessions.has(token)) {
        return res.status(401).json({ message: "Admin ruxsati talab qilinadi." });
    }

    adminSessions.set(token, Date.now() + ADMIN_TOKEN_TTL_MS);
    next();
}

function getBearerToken(req) {
    const authHeader = String(req.headers.authorization || "");

    if (!authHeader.startsWith("Bearer ")) {
        return "";
    }

    return authHeader.slice(7).trim();
}

function cleanupExpiredAdminSessions() {
    const now = Date.now();

    for (const [token, expiresAt] of adminSessions.entries()) {
        if (expiresAt <= now) {
            adminSessions.delete(token);
        }
    }
}

function handleTestError(res, error, fallbackMessage) {
    console.error(fallbackMessage, error);
    res.status(error.statusCode || 500).json({
        message: error.message || fallbackMessage
    });
}

function validateStudent(payload) {
    const email = String(payload?.email || "").trim().toLowerCase();
    const phone = String(payload?.phone || "").trim().replace(/\s+/g, " ");
    const fullName = String(payload?.fullName || "").trim().replace(/\s+/g, " ");
    const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const phonePattern = /^\+?\d[\d\s()-]{8,}$/;
    const fullNamePattern = /^[\p{L}'\-\s]{5,}$/u;

    if (!email) {
        return { isValid: false, message: "Gmail manzilingizni kiriting." };
    }

    if (!gmailPattern.test(email)) {
        return { isValid: false, message: "Faqat @gmail.com bilan tugaydigan Gmail manzil kiriting." };
    }

    if (!phone) {
        return { isValid: false, message: "Telefon raqamingizni kiriting." };
    }

    if (!phonePattern.test(phone)) {
        return { isValid: false, message: "Telefon raqamini to'g'ri formatda kiriting." };
    }

    if (!fullName) {
        return { isValid: false, message: "To'liq ism-familyangizni kiriting." };
    }

    if (!fullNamePattern.test(fullName) || fullName.split(" ").length < 2) {
        return { isValid: false, message: "Ism va familiyani to'liq kiriting." };
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

function createStudentId() {
    return `student_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getClientIp(req) {
    const forwardedFor = String(req.headers["x-forwarded-for"] || "").trim();

    if (forwardedFor) {
        return forwardedFor.split(",")[0].trim();
    }

    return String(req.socket?.remoteAddress || "").trim();
}

function normalizeFeedbackEntry(entry) {
    const likedBy = Array.isArray(entry?.likedBy)
        ? Array.from(new Set(entry.likedBy.map((value) => String(value || "").trim()).filter(Boolean)))
        : [];
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
        likes: Math.max(Number(entry?.likes || 0), likedBy.length),
        likedBy,
        replies,
        isPinned: Boolean(entry?.isPinned)
    };
}

function normalizeDiscussionAttachment(attachment) {
    const type = String(attachment?.type || "").trim();
    const dataUrl = String(attachment?.dataUrl || "").trim();

    return {
        id: String(attachment?.id || `attachment_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
        type: type === "audio" ? "audio" : "image",
        name: String(attachment?.name || ""),
        dataUrl: dataUrl
    };
}

function normalizeDiscussionReactions(reactions) {
    const source = reactions && typeof reactions === "object" ? reactions : {};
    const normalized = {};

    Object.entries(source).forEach(([reactionType, users]) => {
        const key = String(reactionType || "").trim();

        if (!key) {
            return;
        }

        normalized[key] = Array.isArray(users)
            ? Array.from(new Set(users.map((value) => String(value || "").trim()).filter(Boolean)))
            : [];
    });

    return normalized;
}

function normalizeDiscussionReply(reply) {
    const attachments = Array.isArray(reply?.attachments)
        ? reply.attachments.map(normalizeDiscussionAttachment).filter((item) => item.dataUrl)
        : [];

    return {
        id: String(reply?.id || `discussion_reply_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
        authorName: String(reply?.authorName || "Foydalanuvchi"),
        authorEmail: String(reply?.authorEmail || "").trim().toLowerCase(),
        username: String(reply?.username || "@foydalanuvchi"),
        authorPhotoDataUrl: String(reply?.authorPhotoDataUrl || ""),
        message: String(reply?.message || "").trim(),
        attachments,
        createdAt: reply?.createdAt || new Date().toISOString(),
        reactions: normalizeDiscussionReactions(reply?.reactions)
    };
}

function normalizeDiscussionPost(post) {
    const attachments = Array.isArray(post?.attachments)
        ? post.attachments.map(normalizeDiscussionAttachment).filter((item) => item.dataUrl)
        : [];
    const replies = Array.isArray(post?.replies)
        ? post.replies.map(normalizeDiscussionReply).filter((reply) => reply.message || reply.attachments.length)
        : [];
    const metadataSource = post?.metadata && typeof post.metadata === "object" ? post.metadata : {};

    return {
        id: String(post?.id || `discussion_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
        categoryId: String(post?.categoryId || ""),
        categoryLabel: String(post?.categoryLabel || ""),
        authorName: String(post?.authorName || "Foydalanuvchi"),
        authorEmail: String(post?.authorEmail || "").trim().toLowerCase(),
        username: String(post?.username || "@foydalanuvchi"),
        authorPhotoDataUrl: String(post?.authorPhotoDataUrl || ""),
        message: String(post?.message || "").trim(),
        attachments,
        metadata: {
            universityName: String(metadataSource.universityName || "").trim(),
            studySubjects: Array.isArray(metadataSource.studySubjects)
                ? metadataSource.studySubjects.map((value) => String(value || "").trim()).filter(Boolean)
                : []
        },
        createdAt: post?.createdAt || new Date().toISOString(),
        reactions: normalizeDiscussionReactions(post?.reactions),
        replies
    };
}

function normalizeNotificationEntry(entry) {
    return {
        id: String(entry?.id || `notification_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
        studentEmail: String(entry?.studentEmail || "").trim().toLowerCase(),
        type: String(entry?.type || "general"),
        title: String(entry?.title || "Yangi notification"),
        message: String(entry?.message || "").trim(),
        feedbackId: String(entry?.feedbackId || ""),
        replyId: String(entry?.replyId || ""),
        isRead: Boolean(entry?.isRead),
        createdAt: entry?.createdAt || new Date().toISOString()
    };
}

function isStudentOnline(student) {
    const lastSeenTime = new Date(student?.lastSeenAt || 0).getTime();
    return Number.isFinite(lastSeenTime) && Date.now() - lastSeenTime <= ONLINE_WINDOW_MS;
}

function validateResultPayload(payload) {
    const studentId = String(payload?.studentId || "").trim();
    const studentEmail = String(payload?.studentEmail || "").trim().toLowerCase();
    const studentFullName = String(payload?.studentFullName || "").trim();
    const subjectId = String(payload?.subjectId || "").trim();
    const subjectLabel = String(payload?.subjectLabel || "").trim();

    if (!studentId || !studentEmail || !studentFullName) {
        return { isValid: false, message: "Student ma'lumotlari yetarli emas." };
    }

    if (!subjectId || !subjectLabel) {
        return { isValid: false, message: "Fan ma'lumotlari yetarli emas." };
    }

    return {
        isValid: true,
        result: normalizeResultEntry({
            studentId,
            studentEmail,
            studentFullName,
            subjectId,
            subjectLabel,
            total: payload?.total,
            correct: payload?.correct,
            incorrect: payload?.incorrect,
            percent: payload?.percent,
            grade: payload?.grade,
            points: payload?.points,
            earnedPoints: payload?.earnedPoints,
            totalPoints: payload?.totalPoints,
            completedAt: payload?.completedAt,
            responses: payload?.responses
        })
    };
}

function normalizeResultEntry(entry) {
    return {
        id: String(entry?.id || ""),
        studentId: String(entry?.studentId || ""),
        studentEmail: String(entry?.studentEmail || "").trim().toLowerCase(),
        studentFullName: String(entry?.studentFullName || "").trim(),
        subjectId: String(entry?.subjectId || ""),
        subjectLabel: String(entry?.subjectLabel || ""),
        total: Number(entry?.total || 0),
        correct: Number(entry?.correct || 0),
        incorrect: Number(entry?.incorrect || 0),
        percent: Number(entry?.percent || 0),
        grade: String(entry?.grade || "Fail"),
        points: String(entry?.points || ""),
        earnedPoints: Number(entry?.earnedPoints || 0),
        totalPoints: Number(entry?.totalPoints || 0),
        completedAt: entry?.completedAt || entry?.createdAt || new Date().toISOString(),
        createdAt: entry?.createdAt || entry?.completedAt || new Date().toISOString(),
        responses: Array.isArray(entry?.responses) ? entry.responses : []
    };
}

function groupResultsByStudent(results) {
    return results.reduce((accumulator, result) => {
        if (!result.studentId) {
            return accumulator;
        }

        if (!accumulator[result.studentId]) {
            accumulator[result.studentId] = [];
        }

        accumulator[result.studentId].push(result);
        accumulator[result.studentId].sort((left, right) => new Date(right.completedAt || 0) - new Date(left.completedAt || 0));
        return accumulator;
    }, {});
}

function groupResultsByEmail(results) {
    return results.reduce((accumulator, result) => {
        if (!result.studentEmail) {
            return accumulator;
        }

        if (!accumulator[result.studentEmail]) {
            accumulator[result.studentEmail] = [];
        }

        accumulator[result.studentEmail].push(result);
        accumulator[result.studentEmail].sort((left, right) => new Date(right.completedAt || 0) - new Date(left.completedAt || 0));
        return accumulator;
    }, {});
}

function mergeStudentsByIdentity(students) {
    const studentMap = new Map();

    students.forEach((student) => {
        const key = student.email || student.visitorId || student.id;
        const existing = studentMap.get(key);

        if (!existing) {
            studentMap.set(key, {
                ...student,
                mergedStudentIds: [student.id],
                visitorIds: student.visitorId ? [student.visitorId] : []
            });
            return;
        }

        const latestStudent = new Date(student.updatedAt || student.lastSeenAt || student.createdAt || 0) > new Date(existing.updatedAt || existing.lastSeenAt || existing.createdAt || 0)
            ? student
            : existing;

        studentMap.set(key, {
            ...existing,
            ...latestStudent,
            id: existing.id,
            createdAt: new Date(student.createdAt || 0) < new Date(existing.createdAt || 0) ? student.createdAt : existing.createdAt,
            photoDataUrl: latestStudent.photoDataUrl || existing.photoDataUrl || "",
            dreamUniversity: latestStudent.dreamUniversity || existing.dreamUniversity || "",
            dreamScore: latestStudent.dreamScore || existing.dreamScore || "",
            mergedStudentIds: Array.from(new Set([...existing.mergedStudentIds, student.id].filter(Boolean))),
            visitorIds: Array.from(new Set([...existing.visitorIds, student.visitorId].filter(Boolean)))
        });
    });

    return Array.from(studentMap.values());
}

function mergeStudentResults(student, resultsByStudent, resultsByEmail) {
    const studentIdResults = Array.isArray(student.mergedStudentIds)
        ? student.mergedStudentIds.flatMap((studentId) => resultsByStudent[studentId] || [])
        : (resultsByStudent[student.id] || []);
    const emailResults = student.email ? (resultsByEmail[student.email] || []) : [];
    const combinedResults = [...studentIdResults, ...emailResults];
    const uniqueResults = new Map();

    combinedResults.forEach((result) => {
        const key = `${result.studentEmail}|${result.subjectId}`;
        const existing = uniqueResults.get(key);

        if (!existing || new Date(result.completedAt || 0) > new Date(existing.completedAt || 0)) {
            uniqueResults.set(key, result);
        }
    });

    return Array.from(uniqueResults.values())
        .sort((left, right) => new Date(right.completedAt || 0) - new Date(left.completedAt || 0));
}

function getVisitSummaryForStudent(student, visits) {
    const visitorIds = Array.isArray(student.visitorIds)
        ? student.visitorIds
        : [student.visitorId].filter(Boolean);
    const visitEntries = visitorIds
        .map((visitorId) => visits.uniqueVisitors?.[visitorId])
        .filter(Boolean);

    if (!visitEntries.length) {
        return {
            firstSeenAt: null,
            visitCount: 0,
            ipAddress: "-"
        };
    }

    const firstSeenAt = visitEntries
        .map((entry) => entry.firstSeenAt)
        .filter(Boolean)
        .sort((left, right) => new Date(left) - new Date(right))[0] || null;
    const latestVisit = visitEntries
        .slice()
        .sort((left, right) => new Date(right.lastSeenAt || 0) - new Date(left.lastSeenAt || 0))[0];

    return {
        firstSeenAt,
        visitCount: visitEntries.reduce((sum, entry) => sum + Number(entry.visitCount || 0), 0),
        ipAddress: latestVisit?.ipAddress || "-"
    };
}
