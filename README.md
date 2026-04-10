# Uzbek Student Assessment

This project is a student-friendly assessment website for mathematics. Students must enter their Gmail address, phone number, and full name before they can access the quiz.

## What Improved

- Clearer landing page and access form
- Stronger Gmail, phone, and full-name validation
- Better mobile layout and spacing
- Student summary shown during the quiz
- Instant result score, percentage, and performance label
- Saved student details restored automatically on the next visit
- Local backend for saving registered students
- Admin page for viewing registered students

## Project Structure

```text
uzbek-student-assessment
|-- src
|   |-- index.html
|   |-- test.html
|   |-- admin.html
|   |-- css
|   |   `-- styles.css
|   |-- js
|   |   |-- app.js
|   |   |-- admin.js
|   |   |-- login.js
|   |   |-- quiz.js
|   |   `-- utils.js
|   `-- data
|       |-- math.json
|       |-- mother-tongue.json
|       `-- english.json
|-- assets
|-- backend-data
|   `-- students.json
|-- server.js
`-- package.json
```

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the website and backend:

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

You can also use:

```bash
npm run dev
```

## Manual Testing

Check these flows in the browser:

1. Submit with empty fields and confirm the form blocks access.
2. Submit with a non-Gmail address and confirm validation appears.
3. Submit with a valid Gmail, phone number, and full name and confirm the quiz opens.
4. Open `http://localhost:3000/admin.html` and confirm new students appear in the table.
5. Answer questions and confirm progress, feedback, and results update correctly.
6. Refresh the page and confirm the last student details are restored.

## Notes

- The frontend is served by a local Express backend.
- Quiz questions are loaded from `src/data/math.json`.
- Registered students are stored in `backend-data/students.json`.

## SEO and Mobile Readiness

This project is now prepared for:

- Google indexing on public pages like `/` and `/test.html`
- PWA install support with `manifest.webmanifest`
- mobile-friendly usage with a registered service worker
- future Android packaging through a WebView, Trusted Web Activity, or Capacitor-based wrapper

Added platform files:

- `src/manifest.webmanifest`
- `src/service-worker.js`
- `src/assets/favicon.svg`
- `src/assets/icon-192.svg`
- `src/assets/icon-512.svg`
- `src/assets/icon-maskable.svg`
- `src/assets/social-preview.svg`
- dynamic `robots.txt` and `sitemap.xml` routes in `server.js`

## Environment Variables

Copy `.env.example` to `.env` when preparing for deployment.

Important variables:

- `SITE_URL`: your production domain, used for sitemap and robots output
- `ADMIN_USERNAME`: admin login username
- `ADMIN_PASSWORD`: admin login password
- `SITE_NAME`: platform name for metadata
- `SITE_DESCRIPTION`: platform description for metadata
- `SITE_KEYWORDS`: optional comma-separated search keywords for public page metadata
- `DATABASE_URL`: persistent PostgreSQL connection string for students, results, visits, feedback, and notifications
- `DATABASE_SSL`: set to `false` only if your PostgreSQL server does not require SSL

## Persistent Data

By default, the app can still work with local JSON files inside `backend-data/`.

For production deployment, set `DATABASE_URL` to a PostgreSQL database such as Supabase. When `DATABASE_URL` is present:

- all students, visits, results, feedbacks, discussions, and notifications are stored in PostgreSQL
- existing local `backend-data` content is used as initial seed only when the database table is empty
- future deploys will not wipe user data as long as the database stays active

## Recommended Next Steps

1. Deploy the Node.js app to a hosting provider that supports Express.
2. Set `SITE_URL` to your final domain.
3. Submit `https://your-domain.com/sitemap.xml` to Google Search Console.
4. Add a real custom domain before starting Android app packaging.
5. When ready, wrap the live website as an Android app or migrate it to Capacitor.
