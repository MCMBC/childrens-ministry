# Setup Guide — Google Sheets Backend
### Children's Ministry Information System

This guide walks you through connecting the app to a Google Sheet so multiple volunteers can share one live roster across different devices. Budget about 15 minutes the first time.

You'll need:
- A regular Google account (or your church's Workspace account)
- The three files that came with this app: `index.html`, `AppsScript.gs`, and this guide

---

## Step 1 — Create the Google Sheet

1. Go to **sheets.google.com** and click the **+** to create a blank sheet.
2. Rename it something recognizable, like *"Children's Ministry — Mt. Calvary"*.
3. Leave it open — you'll need this tab for Step 2.

---

## Step 2 — Open the Apps Script editor

1. In your sheet, click **Extensions** → **Apps Script** in the menu bar.
2. A new tab opens with a code editor showing a default file called `Code.gs` with a stub `function myFunction() {}`.
3. Select everything in that editor (Ctrl+A or Cmd+A) and **delete it**.
4. Open the `AppsScript.gs` file from this app in any text editor.
5. **Copy everything** from that file and **paste it** into the empty Apps Script editor.

---

## Step 3 — Set your private passcode

This is the password your volunteers will type into the app to connect. Anyone who has this passcode can read and write your records, so treat it like a real password — don't use `password123` or your church name.

1. At the top of the pasted script, find this line (around line 15):
   ```js
   const PASSCODE = 'CHANGE-ME-TO-A-PRIVATE-PASSCODE';
   ```
2. Replace `CHANGE-ME-TO-A-PRIVATE-PASSCODE` with something only your ministry team knows. A phrase of 3-4 random words works well — easy to remember, hard to guess. For example:
   ```js
   const PASSCODE = 'violet-harbor-lantern-nine';
   ```
3. Save the script: **Ctrl+S** (or **Cmd+S** on Mac), or click the disk icon. Apps Script might ask you to name the project — call it something like *"Children's Ministry Backend"*.

---

## Step 4 — Run the one-time Setup

This creates the two tabs (`Children` and `Attendance`) with the right column headers.

1. At the top of the Apps Script editor, find the **function dropdown** next to the Debug button. It probably says `doGet`.
2. Click it and select **Setup**.
3. Click the **Run** button (▶️ play icon).
4. **The first time**, Google will ask you to authorize the script:
   - A popup says *"Authorization required"* — click **Review permissions**.
   - Choose your Google account.
   - You'll see a scary screen: *"Google hasn't verified this app"*. This is normal for your own scripts. Click **Advanced** → **Go to [project name] (unsafe)** → **Allow**.
   - (It says "unsafe" because Google hasn't reviewed it, not because the script is doing anything dangerous. You wrote it, you know what it does.)
5. The script runs. Switch back to your Google Sheet tab — you should see two new sheet tabs at the bottom: **Children** and **Attendance**, each with bold column headers.

If a dialog pops up saying *"Setup complete!"*, you're good.

---

## Step 5 — Deploy as a Web App

This turns the script into a URL that your app can call.

1. Back in the Apps Script editor, click the blue **Deploy** button (top right) → **New deployment**.
2. Click the **gear icon** (⚙️) next to *"Select type"* and choose **Web app**.
3. Fill in the form:
   - **Description**: *"Children's Ministry v1"* (or anything — just for your records)
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone** ⚠️ *(this is the step most people get wrong)*
4. Click **Deploy**.
5. A dialog shows your **Web app URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```
6. **Click Copy** to copy it. Save it somewhere temporarily (an email to yourself, a sticky note) — you need it in Step 6.
7. Click **Done**.

### ⚠️ About "Anyone" access

"Anyone" means the URL is reachable without a Google login. It does **not** mean your data is public — your passcode (from Step 3) is what protects the data. Without the passcode, anyone hitting the URL just gets `{"ok":false,"error":"Invalid passcode"}`.

If your organization's Google Workspace admin has disabled "Anyone" sharing, you can use **"Anyone within [your-org]"** instead, but then only people with your org's Google account can connect. This usually won't work for volunteers using personal devices.

---

## Step 6 — Host the app (or just open it locally)

You can open `index.html` directly on any computer (double-click it) and it will work. But if you want to access it from multiple devices, put it on a free host. The README covers five free options — GitHub Pages, Netlify Drop, Cloudflare Pages, Vercel, or none at all.

The simplest: go to **app.netlify.com/drop**, drag `index.html` in, and you get a live URL in seconds.

---

## Step 7 — Connect the app to your sheet

1. Open `index.html` — either the hosted version or locally.
2. You'll see a login screen asking for a Web App URL and a Passcode.
3. Paste the Web App URL from Step 5.
4. Type the passcode you set in Step 3.
5. Click **Connect**.

If everything's right, you'll land on the dashboard and the sheet's data will load. The header shows a green *"Synced"* indicator. You can now add children, check them in on Sundays, and everything flows into your Google Sheet in real time.

---

## What this looks like when working

- **Your Google Sheet** has two tabs — `Children` and `Attendance` — that fill up as you use the app. You can view, sort, filter, and print directly from Sheets.
- **Your volunteers** each open the app on their own device, tap Connect once, and stay connected. They all see the same roster.
- **Offline** writes (no Wi-Fi at the check-in station) are saved locally and automatically uploaded when the connection returns. The header indicator shows *"Offline"* or *"N pending"* until they sync.

---

## Troubleshooting

**"Could not connect" when I click Connect:**
- Double-check the URL — it should start with `https://script.google.com/macros/s/` and end with `/exec`.
- Re-check your passcode for typos.
- Make sure you set **"Who has access"** to **"Anyone"** (not "Anyone within [org]" unless all your users have that Google domain).
- If you changed the passcode in the script *after* deploying, you need to redeploy: Deploy → Manage deployments → pencil icon → Version: New version → Deploy.

**The script says "Setup complete" but the tabs aren't appearing:**
- Make sure you ran `Setup` *while the sheet you intend to use was active*. If in doubt, reload the sheet and re-run.

**I changed the code but the app still behaves the old way:**
- Every code change needs a **new deployment version**: Deploy → Manage deployments → pencil → Version: *New version* → Deploy. Simply saving the script is not enough.

**I want to change my passcode later:**
- Edit line 15 of the script, save, then redeploy (Manage deployments → edit → New version → Deploy). Tell your volunteers the new passcode; they'll reconnect using Settings → Disconnect → Connect.

**Multiple volunteers editing at once — what happens if two people add a child at the same time?**
- Both rows are appended to the sheet. No conflict because each record has a unique ID generated client-side. This is fine for a team of a few people.

**Can I edit data directly in the Google Sheet?**
- Yes — the app re-reads the sheet every time it refreshes. Just don't change column headers or the `id` column.

**How do I back up my data?**
- Your Google Sheet is itself the backup. Google keeps revision history (File → Version history) so you can roll back if someone deletes rows. You can also click **Backup** in the app to download a JSON file.

---

## Inviting others to your sheet (optional)

If you want other volunteers to be able to *view the Google Sheet directly* (not just use the app), share it normally from the Sheet's **Share** button. This is independent of the app — sharing the Sheet only affects who can open it in Google Sheets. The app's access is controlled entirely by the passcode.

---

May this little system bless the ministry.
