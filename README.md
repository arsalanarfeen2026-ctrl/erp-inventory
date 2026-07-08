# InvTrack ERP — Inventory Management System

A full-featured ERP Inventory Management System built with React.

## Requirements

- Node.js 16 or higher
- npm 8 or higher

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm start
```

The app will open at **http://localhost:3000** in your browser.

## Project Structure

```
src/
├── App.jsx                  # Root component, state management (useReducer)
├── index.js                 # React entry point
├── index.css                # Global styles
├── data/
│   ├── items.js             # Master item list (21 SKUs)
│   └── seedData.js          # Demo transactions
├── utils/
│   └── stockCalc.js         # Stock calculations, KPI logic, ABC/FSN
├── components/
│   ├── Sidebar.jsx          # Navigation sidebar
│   ├── Modal.jsx            # Reusable modal shell
│   ├── BarChart.jsx         # Horizontal bar chart
│   └── Toast.jsx            # Toast notifications
├── pages/
│   ├── Dashboard.jsx        # Live stock summary + charts
│   ├── ItemMaster.jsx       # Item list with search/filter
│   ├── MonthlyDemand.jsx    # Monthly & daily demand view
│   ├── StockOpening.jsx     # Opening balance view
│   ├── StockReceiving.jsx   # Receiving transactions
│   ├── StockIssuance.jsx    # Issuance transactions
│   ├── StockAdjustment.jsx  # Adjustment transactions
│   ├── Reports.jsx          # Item-wise & month-wise consumption
│   └── KPIAlerts.jsx        # ABC/FSN classification + alerts
└── modals/
    └── Modals.jsx           # All form modals (receiving, issuance, etc.)
```

## Modules

| Module | Description |
|---|---|
| **Dashboard** | Live stock summary, KPI cards, bar charts, alert feed |
| **Item Master** | All 21 SKUs with editable lead time & safety stock |
| **Monthly Demand** | Set monthly demand; daily demand auto-calculated |
| **Stock Opening** | Set opening balances per item |
| **Stock Receiving** | Log GIN/JC entries; validates qty > 0 |
| **Stock Issuance** | Log JC issuances; prevents over-issuance |
| **Stock Adjustment** | +/− adjustments with reason codes |
| **Reports** | Item-wise turnover + month-wise charts |
| **KPI & Alerts** | Stockout, reorder, overstock, ABC, FSN, dead stock |

## Formulas Used

| KPI | Formula |
|---|---|
| Closing Stock | Opening + Receiving − Issuance ± Adjustment |
| Daily Demand | Monthly Demand ÷ 30 |
| Reorder Point | (Daily Demand × Lead Time) + Safety Stock |
| Forecast Days | Closing Stock ÷ Daily Demand |
| ABC Class | Cumulative issuance value: A ≤70%, B ≤90%, C >90% |
| FSN | Fast ≤30 days, Slow 31–90 days, Non-Moving >90 days |
