# API Documentation

Base URL: `http://localhost:4000/api`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /health | API health |
| POST | /login | Demo login |
| GET | /shops | List ration shops |
| GET | /shops/:id | Shop details |
| GET | /shops/:id/stock | Shop stock + prediction |
| GET | /predictions/:shopId | Shortage prediction |
| GET | /alerts/:beneficiaryId | Beneficiary alerts |
| GET | /beneficiaries/:id | Beneficiary details |
| POST | /shops/:id/stock | Update stock |
| POST | /complaints | Submit complaint |
| GET | /admin/summary | Admin statistics |
