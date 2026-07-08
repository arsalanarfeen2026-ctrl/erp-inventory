export function getStock(itemId, opening, receiving, issuance, adjustments) {
  const open = opening[itemId] || 0;
  const rcv  = receiving.filter(r => r.itemId === itemId).reduce((a, r) => a + r.qty, 0);
  const iss  = issuance.filter(r => r.itemId === itemId).reduce((a, r) => a + r.qty, 0);
  const adj  = adjustments.filter(r => r.itemId === itemId).reduce((a, r) => a + r.qty, 0);
  return { open, rcv, iss, adj, close: open + rcv - iss + adj };
}

export function getDailyDemand(itemId, monthlyDemand) {
  return (monthlyDemand[itemId] || 0) / 30;
}

export function getROP(itemId, monthlyDemand, leadTime, safetyStock) {
  const dd = getDailyDemand(itemId, monthlyDemand);
  const lt = leadTime[itemId] || 7;
  const ss = safetyStock[itemId] || 0;
  return Math.ceil(dd * lt + ss);
}

export function getKPI(itemId, opening, receiving, issuance, adjustments, monthlyDemand, leadTime, safetyStock, maxStock) {
  const { close } = getStock(itemId, opening, receiving, issuance, adjustments);
  const dd  = getDailyDemand(itemId, monthlyDemand);
  const rop = getROP(itemId, monthlyDemand, leadTime, safetyStock);
  const ss  = safetyStock[itemId] || 0;
  const max = maxStock[itemId] || 20;

  const lastIss = [...issuance]
    .filter(r => r.itemId === itemId)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const lastRcv = [...receiving]
    .filter(r => r.itemId === itemId)
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  const today = new Date('2026-06-28');
  const daysSinceIss = lastIss ? Math.floor((today - new Date(lastIss.date)) / 86400000) : 999;
  const daysSinceRcv = lastRcv ? Math.floor((today - new Date(lastRcv.date)) / 86400000) : 999;

  let fsn = 'Non-Moving';
  if (daysSinceIss <= 30)      fsn = 'Fast';
  else if (daysSinceIss <= 90) fsn = 'Slow';

  return {
    close,
    dd,
    rop,
    ss,
    max,
    fsn,
    forecastDays: dd > 0 ? Math.floor(close / dd) : null,
    stockout:     close <= 0,
    reorder:      close <= rop && close > 0,
    overstock:    close > max,
    deadStock:    daysSinceIss > 180 && daysSinceRcv > 180,
  };
}

export function getABCClass(items, issuance) {
  const data = items.map(i => ({
    id: i.id,
    iss: issuance.filter(r => r.itemId === i.id).reduce((a, r) => a + r.qty, 0),
  })).sort((a, b) => b.iss - a.iss);

  const total = data.reduce((a, x) => a + x.iss, 0);
  let cum = 0;
  const result = {};
  data.forEach(x => {
    cum += total > 0 ? x.iss / total : 0;
    result[x.id] = cum <= 0.7 ? 'A' : cum <= 0.9 ? 'B' : 'C';
  });
  return result;
}
