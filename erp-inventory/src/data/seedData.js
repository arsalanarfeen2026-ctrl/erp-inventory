import { BASE_ITEMS } from './items';

export function generateSeedData() {
  const receiving = [];
  const issuance = [];
  const adjustments = [];

  BASE_ITEMS.forEach((item, idx) => {
    const r = idx % 3;
    receiving.push({
      id: 'RCV-' + String(idx + 1).padStart(4, '0'),
      date: '2026-06-' + String(Math.min(idx + 1, 28)).padStart(2, '0'),
      month: 'Jun', gin: 'GIN-' + String(100 + idx),
      itemId: item.id, qty: r === 0 ? 5 : r === 1 ? 3 : 8,
      type: 'Purchase', rate: r === 0 ? 5000 : r === 1 ? 8000 : 12000,
    });
    if (idx % 4 !== 3) {
      issuance.push({
        id: 'ISS-' + String(idx + 1).padStart(4, '0'),
        date: '2026-06-' + String(Math.min(idx + 2, 28)).padStart(2, '0'),
        month: 'Jun', jc: 'JC-' + String(200 + idx),
        itemId: item.id, qty: r === 0 ? 2 : r === 1 ? 1 : 3,
        type: 'Production',
      });
    }
  });

  adjustments.push({ id: 'ADJ-0001', date: '2026-06-15', month: 'Jun', ref: 'ADJ-001', itemId: 'ITM-0003', qty: -1, reason: 'Damage' });
  adjustments.push({ id: 'ADJ-0002', date: '2026-06-20', month: 'Jun', ref: 'ADJ-002', itemId: 'ITM-0009', qty: 2,  reason: 'Count Correction' });

  return { receiving, issuance, adjustments };
}
