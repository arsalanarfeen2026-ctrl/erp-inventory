export const BASE_ITEMS = [
  { id: 'ITM-0001', name: 'Acrylic Sticker 20×30',        uom: 'Packet', packing: 100, section: 'Offset',      cat: 'Raw Material',  status: 'Active' },
  { id: 'ITM-0002', name: 'Art Card 210 25×36',            uom: 'Packet', packing: 100, section: 'Offset',      cat: 'Raw Material',  status: 'Active' },
  { id: 'ITM-0003', name: 'Art Card 350 25×36',            uom: 'Packet', packing: 100, section: 'Offset',      cat: 'Raw Material',  status: 'Active' },
  { id: 'ITM-0004', name: 'Art Card 350 18.6×25',          uom: 'Packet', packing: 100, section: 'Offset',      cat: 'Raw Material',  status: 'Active' },
  { id: 'ITM-0005', name: 'Art Paper 128 25×36',           uom: 'Rim',    packing: 500, section: 'Offset',      cat: 'Raw Material',  status: 'Active' },
  { id: 'ITM-0006', name: 'Bleached Board 250 25×36',      uom: 'Packet', packing: 100, section: 'Offset',      cat: 'Raw Material',  status: 'Active' },
  { id: 'ITM-0007', name: 'Bleached Board 230 25×36',      uom: 'Packet', packing: 100, section: 'Offset',      cat: 'Raw Material',  status: 'Active' },
  { id: 'ITM-0008', name: 'Bleached Board 300 25×33',      uom: 'Packet', packing: 100, section: 'Offset',      cat: 'Raw Material',  status: 'Active' },
  { id: 'ITM-0009', name: 'NCR Pink Paper 50 17×24',       uom: 'Rim',    packing: 500, section: 'Offset',      cat: 'Raw Material',  status: 'Active' },
  { id: 'ITM-0010', name: 'NCR White Paper 50 17×24',      uom: 'Rim',    packing: 500, section: 'Offset',      cat: 'Raw Material',  status: 'Active' },
  { id: 'ITM-0011', name: 'NCR Yellow Paper 50 17×24',     uom: 'Rim',    packing: 500, section: 'Offset',      cat: 'Raw Material',  status: 'Active' },
  { id: 'ITM-0012', name: 'Offset Paper 75 25×36',         uom: 'Rim',    packing: 500, section: 'Offset',      cat: 'Raw Material',  status: 'Active' },
  { id: 'ITM-0013', name: 'Offset Paper 90 25×36',         uom: 'Rim',    packing: 500, section: 'Offset',      cat: 'Raw Material',  status: 'Active' },
  { id: 'ITM-0014', name: 'Transparent Sticker 20×30',     uom: 'Packet', packing: 100, section: 'Flexo',       cat: 'Raw Material',  status: 'Active' },
  { id: 'ITM-0015', name: 'White Sticker 20×30',           uom: 'Packet', packing: 100, section: 'Flexo',       cat: 'Raw Material',  status: 'Active' },
  { id: 'ITM-0016', name: 'Taffeta 10.5×15',               uom: 'Pcs',    packing: 1,   section: 'Sublimation', cat: 'Raw Material',  status: 'Active' },
  { id: 'ITM-0017', name: 'Taffeta 8×14.5',                uom: 'Pcs',    packing: 1,   section: 'Sublimation', cat: 'Raw Material',  status: 'Active' },
  { id: 'ITM-0018', name: 'Taffeta 9.5×14.5',              uom: 'Pcs',    packing: 1,   section: 'Sublimation', cat: 'Raw Material',  status: 'Active' },
  { id: 'ITM-0019', name: 'Taffeta 9×15',                  uom: 'Pcs',    packing: 1,   section: 'Sublimation', cat: 'Raw Material',  status: 'Active' },
  { id: 'ITM-0020', name: 'Tyvek 11.5×12',                 uom: 'Pcs',    packing: 1,   section: 'Letterflex',  cat: 'Raw Material',  status: 'Active' },
  { id: 'ITM-0021', name: 'Tyvek 10.5×15',                 uom: 'Pcs',    packing: 1,   section: 'Letterflex',  cat: 'Raw Material',  status: 'Active' },
];

// Alias
export const ITEMS = BASE_ITEMS;

export const DEFAULT_SECTIONS   = ['Offset', 'Flexo', 'Sublimation', 'Letterflex'];
export const DEFAULT_CATEGORIES = ['Raw Material', 'Consumables', 'General Items'];
export const DEFAULT_UOMS       = ['Packet', 'Rim', 'Pcs', 'Kg', 'Roll', 'Box', 'Sheet'];

export const MONTHS        = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const CURRENT_MONTH = 'Jun';
export const TODAY         = new Date().toISOString().slice(0, 10);
