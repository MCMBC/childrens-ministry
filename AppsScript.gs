/**
 * Mt. Calvary M.B. Church — Children's Ministry Backend
 * Google Apps Script Web App
 *
 * This script turns a Google Sheet into a simple backend for the
 * Children's Ministry app. Paste this entire file into the Apps Script
 * editor attached to your sheet (Extensions → Apps Script), then deploy
 * it as a Web App (see the setup guide).
 *
 * The sheet must have two tabs named exactly:  Children  and  Attendance
 * The Setup() function will create them for you if you run it once.
 */

// ============================================================
// CONFIG — CHANGE THIS PASSCODE TO SOMETHING PRIVATE
// ============================================================
const PASSCODE = 'CHANGE-ME-TO-A-PRIVATE-PASSCODE';

// Tab names — don't change unless you rename your sheets
const CHILDREN_SHEET = 'Children';
const ATTENDANCE_SHEET = 'Attendance';

// Column definitions (order matters — the script reads/writes in this order)
const CHILD_COLS = [
  'id','fullName','birthdate','gradeLevel','school','parentNames','phoneNumbers',
  'emails','preferredContact','allergies','allergySeverity','medicalConditions',
  'specialNeeds','emergencyContact','authorizedPickup','photoConsent','newsletterOptIn',
  'visitorStatus','churchMembership','prayerRequests','classroom','createdAt','updatedAt'
];

const ATTENDANCE_COLS = [
  'id','childId','date','checkInAt','checkOutAt','classroom'
];

// ============================================================
// ONE-TIME SETUP
// Run this once from the Apps Script editor to create the tabs
// and header rows. Select "Setup" from the function dropdown and
// click Run.
// ============================================================
function Setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet(ss, CHILDREN_SHEET, CHILD_COLS);
  ensureSheet(ss, ATTENDANCE_SHEET, ATTENDANCE_COLS);
  SpreadsheetApp.getUi().alert(
    'Setup complete!\n\n' +
    'Two tabs have been created: "Children" and "Attendance".\n\n' +
    'Next step: deploy this script as a Web App (Deploy → New deployment).'
  );
}

function ensureSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  // Write headers if row 1 is empty or mismatched
  const existing = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
  const needsHeaders = headers.some((h, i) => existing[i] !== h);
  if (needsHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

// ============================================================
// WEB APP ENTRY POINTS
// ============================================================

// GET — returns all children and attendance (requires ?passcode=...)
function doGet(e) {
  try {
    if (!checkPasscode(e.parameter.passcode)) {
      return jsonResponse({ ok: false, error: 'Invalid passcode' });
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    return jsonResponse({
      ok: true,
      children: readSheet(ss.getSheetByName(CHILDREN_SHEET), CHILD_COLS),
      attendance: readSheet(ss.getSheetByName(ATTENDANCE_SHEET), ATTENDANCE_COLS)
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

// POST — accepts a JSON body describing an action
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (!checkPasscode(body.passcode)) {
      return jsonResponse({ ok: false, error: 'Invalid passcode' });
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = body.action;

    if (action === 'upsertChild')   return jsonResponse({ ok: true, child: upsertChild(ss, body.child) });
    if (action === 'deleteChild')   return jsonResponse({ ok: true, deleted: deleteChild(ss, body.id) });
    if (action === 'addAttendance') return jsonResponse({ ok: true, record: addAttendance(ss, body.record) });
    if (action === 'updateAttendance') return jsonResponse({ ok: true, record: updateAttendance(ss, body.record) });
    if (action === 'bulkImport')    return jsonResponse({ ok: true, imported: bulkImport(ss, body.children, body.attendance) });

    return jsonResponse({ ok: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

// ============================================================
// ACTIONS
// ============================================================

function upsertChild(ss, child) {
  const sheet = ss.getSheetByName(CHILDREN_SHEET);
  child.updatedAt = new Date().toISOString();
  if (!child.id) {
    child.id = generateId();
    child.createdAt = child.updatedAt;
    sheet.appendRow(CHILD_COLS.map(c => toCellValue(child[c])));
    return child;
  }
  // Find existing row by id
  const rowIdx = findRowById(sheet, child.id);
  if (rowIdx === -1) {
    // Not found — append
    if (!child.createdAt) child.createdAt = child.updatedAt;
    sheet.appendRow(CHILD_COLS.map(c => toCellValue(child[c])));
    return child;
  }
  // Preserve createdAt if client didn't send one
  if (!child.createdAt) {
    const createdIdx = CHILD_COLS.indexOf('createdAt');
    child.createdAt = sheet.getRange(rowIdx, createdIdx + 1).getValue();
  }
  sheet.getRange(rowIdx, 1, 1, CHILD_COLS.length).setValues([CHILD_COLS.map(c => toCellValue(child[c]))]);
  return child;
}

function deleteChild(ss, id) {
  const childSheet = ss.getSheetByName(CHILDREN_SHEET);
  const attSheet = ss.getSheetByName(ATTENDANCE_SHEET);
  const rowIdx = findRowById(childSheet, id);
  if (rowIdx > 1) childSheet.deleteRow(rowIdx);
  // Remove related attendance records
  const lastRow = attSheet.getLastRow();
  if (lastRow > 1) {
    const childIdCol = ATTENDANCE_COLS.indexOf('childId') + 1;
    const ids = attSheet.getRange(2, childIdCol, lastRow - 1, 1).getValues();
    // Delete from bottom up to avoid shifting
    for (let i = ids.length - 1; i >= 0; i--) {
      if (String(ids[i][0]) === String(id)) attSheet.deleteRow(i + 2);
    }
  }
  return id;
}

function addAttendance(ss, record) {
  const sheet = ss.getSheetByName(ATTENDANCE_SHEET);
  if (!record.id) record.id = generateId();
  sheet.appendRow(ATTENDANCE_COLS.map(c => toCellValue(record[c])));
  return record;
}

function updateAttendance(ss, record) {
  const sheet = ss.getSheetByName(ATTENDANCE_SHEET);
  const rowIdx = findRowById(sheet, record.id);
  if (rowIdx === -1) throw new Error('Attendance record not found: ' + record.id);
  sheet.getRange(rowIdx, 1, 1, ATTENDANCE_COLS.length).setValues([ATTENDANCE_COLS.map(c => toCellValue(record[c]))]);
  return record;
}

function bulkImport(ss, children, attendance) {
  const childSheet = ss.getSheetByName(CHILDREN_SHEET);
  const attSheet = ss.getSheetByName(ATTENDANCE_SHEET);
  // Clear existing data (keep headers)
  if (childSheet.getLastRow() > 1) {
    childSheet.deleteRows(2, childSheet.getLastRow() - 1);
  }
  if (attSheet.getLastRow() > 1) {
    attSheet.deleteRows(2, attSheet.getLastRow() - 1);
  }
  // Write new data
  if (children && children.length) {
    const rows = children.map(c => CHILD_COLS.map(col => toCellValue(c[col])));
    childSheet.getRange(2, 1, rows.length, CHILD_COLS.length).setValues(rows);
  }
  if (attendance && attendance.length) {
    const rows = attendance.map(a => ATTENDANCE_COLS.map(col => toCellValue(a[col])));
    attSheet.getRange(2, 1, rows.length, ATTENDANCE_COLS.length).setValues(rows);
  }
  return { children: children ? children.length : 0, attendance: attendance ? attendance.length : 0 };
}

// ============================================================
// HELPERS
// ============================================================

function checkPasscode(provided) {
  return provided && String(provided) === PASSCODE;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function readSheet(sheet, cols) {
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const values = sheet.getRange(2, 1, lastRow - 1, cols.length).getValues();
  return values.map(row => {
    const obj = {};
    cols.forEach((c, i) => {
      let v = row[i];
      if (v instanceof Date) v = v.toISOString();
      if (c === 'photoConsent' || c === 'newsletterOptIn') v = v === true || v === 'TRUE' || v === 'true';
      obj[c] = v === '' ? (typeof v === 'boolean' ? v : '') : v;
    });
    return obj;
  }).filter(r => r.id); // drop empty rows
}

function findRowById(sheet, id) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return i + 2;
  }
  return -1;
}

function toCellValue(v) {
  if (v === undefined || v === null) return '';
  if (typeof v === 'boolean') return v;
  return v;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
