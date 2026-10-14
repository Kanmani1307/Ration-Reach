# RationReach Architecture

```text
Beneficiary / Shop Operator / Admin
              |
              v
       React Web Frontend
              |
          REST API
              |
              v
       Express Backend
              |
       Demo Data Provider
              |
              v
        db.json / Demo Data

Future:
Express Backend -> GovernmentDataProvider -> Authorized PDS APIs
```

## Main modules

1. Authentication/demo role selection
2. Ration shop management
3. Stock monitoring
4. Shortage prediction
5. Alerts
6. Distribution and queue information
7. Smart Visit
8. Complaint reporting
9. Admin analytics

## Data flow

Stock Update -> Validation -> Prediction -> Risk Classification -> Beneficiary Alert

## Important

The current prototype uses simulated data. No government API is claimed or fabricated.
