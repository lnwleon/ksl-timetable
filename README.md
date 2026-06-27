# KSL Study Timetable

Kenya School of Law — Personal Study Timetable Web App

**Oral Exams:** 20 July 2026  
**Main Exams:** November 2026

---

## Files in this project

```
ksl-timetable/
├── index.html     ← Main page (structure)
├── style.css      ← All styles (mobile-first)
├── app.js         ← All logic (timers, edits, storage)
├── vercel.json    ← Vercel deployment config
└── README.md      ← This file
```

---

## Features

- Live countdown timers to both exams
- Today's schedule shown at the top every day
- Daily motivational quote
- Edit any timetable cell — change name and colour
- Save changes to browser (persists every visit)
- Study progress tracker per unit (tap bars to update)
- Works on all phones, tablets, and desktop browsers
- No internet needed after first load (all data stays in browser)

---

## How to deploy to Vercel (Free — step by step)

### Step 1 — Create a GitHub account (if you don't have one)
1. Go to https://github.com
2. Click **Sign up**
3. Choose a username, enter your email, create a password
4. Verify your email

### Step 2 — Create a new repository on GitHub
1. Once logged in, click the **+** button (top right) → **New repository**
2. Name it: `ksl-timetable`
3. Set it to **Public**
4. Click **Create repository**

### Step 3 — Upload your files to GitHub
On the repository page:
1. Click **uploading an existing file** (or drag and drop)
2. Upload ALL four files:
   - `index.html`
   - `style.css`
   - `app.js`
   - `vercel.json`
3. Scroll down → click **Commit changes**

### Step 4 — Deploy to Vercel
1. Go to https://vercel.com
2. Click **Sign up** → choose **Continue with GitHub**
3. Authorise Vercel to access your GitHub
4. Click **Add New Project**
5. Find and select your `ksl-timetable` repository → click **Import**
6. Leave all settings as default
7. Click **Deploy**
8. Wait about 30 seconds

### Step 5 — Get your live link
- Vercel will show you a URL like: `https://ksl-timetable.vercel.app`
- That is your live website — open it on your phone and bookmark it!

### Future updates
Whenever you change any file on GitHub (edit and commit),
Vercel automatically redeploys within 30 seconds. No action needed.

---

## How to edit the timetable on the website

1. Open the website
2. Tap **✏️ Edit** (top right)
3. Tap any coloured cell to edit it
4. Change the name and pick a colour
5. Tap **Save** in the popup
6. When done editing, tap **💾 Save** in the nav bar
7. Your changes are now saved and will appear every time you open the site

---

## Browsers supported

- Chrome (Android & iOS) ✅
- Safari (iPhone & iPad) ✅
- Samsung Internet ✅
- Firefox ✅
- Edge ✅
- Opera Mini ✅

---

## Notes

- All data (edits, progress) is saved in your browser's localStorage
- If you clear your browser data, you will need to re-enter edits
- The timetable works offline after the first visit
- Saturday is a full rest day — protected in the default schedule
