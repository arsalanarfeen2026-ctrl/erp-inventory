import * as XLSX from 'xlsx';
import { ITEMS } from '../data/items';

// ── EXPORT FUNCTIONS ──────────────────────────────────────────────────────────

export function exportMonthlyDemand(monthlyDemand, items = ITEMS) {
  const rows = items.map((item, idx) => ({
    'Sr':             idx + 1,
    'Section':        item.section || '',
    'Category':       item.cat     || '',
    'Item ID':        item.id,
    'Item Name':      item.name,
    'UOM':            item.uom,
    'Sheet Packing':  item.packing,
    'Monthly Demand': monthlyDemand[item.id] || 0,
    'Daily Demand':   ((monthlyDemand[item.id] || 0) / 30).toFixed(2),
  }));
  downloadExcel(rows, 'Monthly_Demand', 'Monthly Demand');
}

export function exportStockOpening(opening, openingVal = {}, items = ITEMS) {
  const rows = items.map((item, idx) => ({
    'Sr':                idx + 1,
    'Section':           item.section || '',
    'Category':          item.cat     || '',
    'Item ID':           item.id,
    'Item Name':         item.name,
    'UOM':               item.uom,
    'Sheet Packing':     item.packing,
    'Opening Qty':       opening[item.id]    || 0,
    'Valuation (PKR)':   openingVal[item.id] || 0,
  }));
  downloadExcel(rows, 'Stock_Opening', 'Stock Opening');
}

export function exportStockReceiving(receiving) {
  const rows = receiving.map((r, idx) => {
    const item = ITEMS.find(i => i.id === r.itemId);
    return {
      'Sr': idx + 1,
      'Entry ID': r.id,
      'Date': r.date,
      'Month': r.month,
      'GIN / JC No': r.gin || '',
      'Type': r.type,
      'Item ID': r.itemId,
      'Item Name': item ? item.name : r.itemId,
      'UOM': item ? item.uom : '',
      'Qty': r.qty,
    };
  });
  downloadExcel(rows, 'Stock_Receiving', 'Stock Receiving');
}

export function exportStockIssuance(issuance) {
  const rows = issuance.map((r, idx) => {
    const item = ITEMS.find(i => i.id === r.itemId);
    return {
      'Sr': idx + 1,
      'Entry ID': r.id,
      'Date': r.date,
      'Month': r.month,
      'JC No': r.jc || '',
      'Type': r.type,
      'Item ID': r.itemId,
      'Item Name': item ? item.name : r.itemId,
      'UOM': item ? item.uom : '',
      'Qty': r.qty,
    };
  });
  downloadExcel(rows, 'Stock_Issuance', 'Stock Issuance');
}

export function exportStockAdjustment(adjustments) {
  const rows = adjustments.map((r, idx) => {
    const item = ITEMS.find(i => i.id === r.itemId);
    return {
      'Sr': idx + 1,
      'Entry ID': r.id,
      'Date': r.date,
      'Month': r.month,
      'Ref No': r.ref || '',
      'Item ID': r.itemId,
      'Item Name': item ? item.name : r.itemId,
      'UOM': item ? item.uom : '',
      'Qty (+/-)': r.qty,
      'Reason': r.reason || '',
    };
  });
  downloadExcel(rows, 'Stock_Adjustment', 'Stock Adjustment');
}

// ── TEMPLATE DOWNLOADS ────────────────────────────────────────────────────────

export function downloadReceivingTemplate() {
  const rows = ITEMS.map(item => ({
    'Date (YYYY-MM-DD)': '2026-06-28',
    'Month': 'Jun',
    'GIN / JC No': '',
    'Type': 'Purchase',
    'Item ID': item.id,
    'Item Name': item.name,
    'UOM': item.uom,
    'Qty': 0,
  }));
  downloadExcel(rows, 'Receiving_Template', 'Template');
}

export function downloadIssuanceTemplate() {
  const rows = ITEMS.map(item => ({
    'Date (YYYY-MM-DD)': '2026-06-28',
    'Month': 'Jun',
    'JC No': '',
    'Type': 'Production',
    'Item ID': item.id,
    'Item Name': item.name,
    'UOM': item.uom,
    'Qty': 0,
  }));
  downloadExcel(rows, 'Issuance_Template', 'Template');
}

export function downloadAdjustmentTemplate() {
  const rows = ITEMS.map(item => ({
    'Date (YYYY-MM-DD)': '2026-06-28',
    'Month': 'Jun',
    'Ref No': '',
    'Item ID': item.id,
    'Item Name': item.name,
    'UOM': item.uom,
    'Qty (+/-)': 0,
    'Reason': 'Damage',
  }));
  downloadExcel(rows, 'Adjustment_Template', 'Template');
}

export function downloadDemandTemplate(items = ITEMS) {
  const rows = items.map(item => ({
    'Section':        item.section || '',
    'Category':       item.cat     || '',
    'Item ID':        item.id,
    'Item Name':      item.name,
    'UOM':            item.uom,
    'Monthly Demand': 0,
  }));
  downloadExcel(rows, 'Demand_Template', 'Template');
}

export function downloadOpeningTemplate(items = ITEMS) {
  const rows = items.map(item => ({
    'Section':         item.section || '',
    'Category':        item.cat     || '',
    'Item ID':         item.id,
    'Item Name':       item.name,
    'UOM':             item.uom,
    'Opening Qty':     0,
    'Valuation (PKR)': 0,
  }));
  downloadExcel(rows, 'Opening_Template', 'Template');
}

// ── IMPORT PARSERS ────────────────────────────────────────────────────────────

export function parseReceivingImport(file) {
  return parseExcel(file).then(rows => {
    return rows
      .filter(r => r['Item ID'] && parseInt(r['Qty']) > 0)
      .map((r, idx) => ({
        id: 'RCV-IMP-' + Date.now() + '-' + idx,
        date: r['Date (YYYY-MM-DD)'] || new Date().toISOString().slice(0, 10),
        month: r['Month'] || 'Jun',
        gin: r['GIN / JC No'] || '',
        type: r['Type'] || 'Purchase',
        itemId: r['Item ID'],
        qty: parseInt(r['Qty']) || 0,
      }));
  });
}

export function parseIssuanceImport(file) {
  return parseExcel(file).then(rows => {
    return rows
      .filter(r => r['Item ID'] && parseInt(r['Qty']) > 0)
      .map((r, idx) => ({
        id: 'ISS-IMP-' + Date.now() + '-' + idx,
        date: r['Date (YYYY-MM-DD)'] || new Date().toISOString().slice(0, 10),
        month: r['Month'] || 'Jun',
        jc: r['JC No'] || '',
        type: r['Type'] || 'Production',
        itemId: r['Item ID'],
        qty: parseInt(r['Qty']) || 0,
      }));
  });
}

export function parseAdjustmentImport(file) {
  return parseExcel(file).then(rows => {
    return rows
      .filter(r => r['Item ID'] && parseInt(r['Qty (+/-)']) !== 0)
      .map((r, idx) => ({
        id: 'ADJ-IMP-' + Date.now() + '-' + idx,
        date: r['Date (YYYY-MM-DD)'] || new Date().toISOString().slice(0, 10),
        month: r['Month'] || 'Jun',
        ref: r['Ref No'] || '',
        itemId: r['Item ID'],
        qty: parseInt(r['Qty (+/-)']) || 0,
        reason: r['Reason'] || 'Other',
      }));
  });
}

export function parseDemandImport(file) {
  return parseExcel(file).then(rows => {
    const errors = [];
    const result = {};

    rows.forEach((r, idx) => {
      const rowNum = idx + 2;
      if (!r['Section']  || String(r['Section']).trim() === '')  errors.push(`Row ${rowNum}: Section is required`);
      if (!r['Category'] || String(r['Category']).trim() === '') errors.push(`Row ${rowNum}: Category is required`);
      if (!r['Item ID']  || String(r['Item ID']).trim() === '')  errors.push(`Row ${rowNum}: Item ID is required`);
      if (r['Item ID']) {
        result[r['Item ID']] = {
          qty:     parseInt(r['Monthly Demand']) || 0,
          section: String(r['Section']  || '').trim(),
          cat:     String(r['Category'] || '').trim(),
        };
      }
    });

    if (errors.length) throw new Error('Validation errors:\n' + errors.slice(0, 5).join('\n'));
    return result;
  });
}

export function parseOpeningImport(file) {
  return parseExcel(file).then(rows => {
    const errors = [];
    const result = {};

    rows.forEach((r, idx) => {
      const rowNum = idx + 2;
      if (!r['Section']  || String(r['Section']).trim() === '')  errors.push(`Row ${rowNum}: Section is required`);
      if (!r['Category'] || String(r['Category']).trim() === '') errors.push(`Row ${rowNum}: Category is required`);
      if (!r['Item ID']  || String(r['Item ID']).trim() === '')  errors.push(`Row ${rowNum}: Item ID is required`);
      if (r['Item ID']) {
        result[r['Item ID']] = {
          qty:       parseInt(r['Opening Qty'])     || 0,
          valuation: parseFloat(r['Valuation (PKR)']) || 0,
          section:   String(r['Section']  || '').trim(),
          cat:       String(r['Category'] || '').trim(),
        };
      }
    });

    if (errors.length) throw new Error('Validation errors:\n' + errors.slice(0, 5).join('\n'));
    return result;
  });
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function downloadExcel(rows, filename, sheetName) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  // Auto column widths
  const cols = Object.keys(rows[0] || {}).map(k => ({ wch: Math.max(k.length + 2, 14) }));
  ws['!cols'] = cols;
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
