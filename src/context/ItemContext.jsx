import React, { createContext, useContext, useState } from 'react';
import { BASE_ITEMS } from '../data/items';

function loadItems() {
  try {
    const stored = localStorage.getItem('erp_items');
    return stored ? JSON.parse(stored) : BASE_ITEMS;
  } catch { return BASE_ITEMS; }
}

function saveItems(items) {
  localStorage.setItem('erp_items', JSON.stringify(items));
}

function generateItemId(items) {
  const nums = items.map(i => parseInt(i.id.replace('ITM-', ''))).filter(n => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return 'ITM-' + String(next).padStart(4, '0');
}

const ItemContext = createContext(null);

export function ItemProvider({ children }) {
  const [items, setItems] = useState(loadItems);

  function addItem(data) {
    const id = generateItemId(items);
    const newItem = { ...data, id, status: 'Active' };
    const updated = [...items, newItem];
    setItems(updated);
    saveItems(updated);
    return id;
  }

  function updateItem(id, data) {
    const updated = items.map(i => i.id === id ? { ...i, ...data } : i);
    setItems(updated);
    saveItems(updated);
  }

  function toggleItemStatus(id) {
    const updated = items.map(i => i.id === id ? { ...i, status: i.status === 'Active' ? 'Inactive' : 'Active' } : i);
    setItems(updated);
    saveItems(updated);
  }

  // Only active items for new transactions
  const activeItems = items.filter(i => i.status === 'Active');

  return (
    <ItemContext.Provider value={{ items, activeItems, addItem, updateItem, toggleItemStatus }}>
      {children}
    </ItemContext.Provider>
  );
}

export function useItems() { return useContext(ItemContext); }
