# Children's Ministry Information System
### Mt. Calvary Missionary Baptist Church

A complete, free, browser-based system for managing your children's ministry: registrations, allergy and medical alerts, authorized pick-up lists, weekly attendance, and parent communication preferences. Records live in a **shared Google Sheet** so volunteers on different devices all see the same live roster.

> *"Let the little children come to me." — Matthew 19:14*

---

## What's included

| File | What it is |
|---|---|
| **`index.html`** | The full app. Open in any browser. |
| **`AppsScript.gs`** | The backend code that you paste into your Google Sheet's script editor. |
| **`SETUP.md`** | Step-by-step setup guide for connecting the two — **start here.** |
| **`ChildrensChurchApp.jsx`** | The same app as a React component, for developers. |

---

## How it works

- The app runs entirely in the browser. No server to maintain.
- Your records live in a Google Sheet you own. You can open it in Google Sheets any time to view, sort, filter, or print.
- A small Google Apps Script acts as a secure middleman between the app and your sheet. Access is protected by a passcode you set.
- When Wi-Fi drops at the check-in station, writes are saved locally and sync automatically the next time you're online.

**Total monthly cost:** $0. Google's free tier is more than enough for a church ministry.

---

## Features

- **Child registration** with every field from your ministry overview: personal info, guardians, safety & medical, communication consent, ministry engagement.
- **Safety alerts** — severe allergies and medical conditions surface on the dashboard, roster, child detail view, and check-in screen so volunteers can't miss them.
- **Sunday check-in / check-out** with timestamps and classroom assignment.
- **Weekly attendance chart** showing the last 8 Sundays.
- **Search** by child, parent, classroom, or grade.
- **Offline-first** — the app keeps working if the network drops; changes sync when it's back.
- **Shared live data** — every connected volunteer sees the same roster in real time.
- **CSV export** for printing rosters or sharing with pastors / leadership.
- **JSON backup & restore** for extra safety beyond Google's own version history.
- **Warm, readable design** — serif typography suited for a church ministry, not a tech startup.

---

## Quick start

1. Read **`SETUP.md`** and follow the 7 steps. It takes about 15 minutes the first time.
2. After setup, bookmark the app on the ministry's check-in device.
3. On Sunday, open the app, tap **Check-In**, and start tapping children in as they arrive.
4. Google's built-in revision history on the Sheet means every change is recoverable — but tapping **Backup** weekly never hurts.

---

## Free hosting — pick one (optional)

You don't actually need to host the app anywhere — you can open `index.html` directly from the desktop. But hosting makes it reachable from any device.

1. **Netlify Drop** (easiest) — drag `index.html` onto `app.netlify.com/drop`. Done.
2. **GitHub Pages** — create a free repo, upload `index.html`, enable Pages in Settings.
3. **Cloudflare Pages** — free account, drag in `index.html`, deploy.
4. **Vercel** — free account, upload, deploy.
5. **No hosting** — save `index.html` to the check-in computer's desktop, pin to the taskbar.

All five work identically. Pick whichever feels easiest.

---

## Data & privacy

- Records live in **your Google Sheet**, which only you and people you share it with can open directly.
- The app talks to that sheet through an Apps Script Web App protected by a **passcode you set**. Without the passcode, the URL just returns an "invalid passcode" error.
- The app caches data in the browser's local storage for offline use. If you log a volunteer out (Settings → Disconnect), that local cache is wiped.
- The passcode is stored in the browser after successful login. If you share a device between volunteers and don't want everyone to inherit the login, use **Disconnect** when handing it off.

**If your church needs HIPAA compliance or handles legally sensitive data**, Google Sheets is not the right backend — look at a paid service with a Business Associate Agreement (for US HIPAA, that's Google Workspace Business/Enterprise with a signed BAA, or a specialized church management platform).

---

## Maintenance

- **Google never deletes your data** as long as the account stays active. Just log in occasionally.
- **Apps Script quotas** on free accounts allow roughly 20,000 URL fetches per day — thousands of Sundays' worth for a church.
- **To update the app**, replace `index.html` on your host. No re-deploy of the backend needed.
- **To update the backend**, edit the script and redeploy (see SETUP.md troubleshooting).

---

## When to graduate to a "real" database

Switch to Supabase or Firebase if:
- You consistently have 50+ volunteers writing simultaneously (Google Sheets isn't built for heavy concurrent writes).
- You need row-level permissions (e.g., volunteers can see only children in their classroom).
- You need real-time push (changes appear on other devices without a refresh).

For a single-congregation children's ministry with a handful of volunteers, you will never need to switch.

---

May this little system bless the ministry.
