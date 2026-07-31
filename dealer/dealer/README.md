# Dealer Seed Stock + Patta Verification Feature

Adds the flow you described: a dealer lists seed stock in units (e.g. 4 tons of
corn in Coimbatore), a farmer requests some of it and uploads their patta
(land document), a dealer/admin verifies that document, and only on approval
does the stock actually decrease (4 ton - 1 ton = 3 ton remaining).

## 1. Copy these files into your existing `server` folder

```
server/
├── models/
│   ├── SeedStock.js       ← copy in
│   └── SeedRequest.js     ← copy in
├── middleware/
│   └── upload.js          ← copy in (your auth.js middleware already exists)
├── routes/
│   ├── seedStock.js       ← copy in
│   └── seedRequest.js     ← copy in
└── uploads/
    └── patta-documents/   ← created automatically on first upload
```

## 2. Install the one new dependency

```bash
npm install multer
```

## 3. Wire the routes into server.js

Add these two lines near your other `app.use('/api/...')` lines:

```js
app.use('/api/seed-stock', require('./routes/seedStock'));
app.use('/api/seed-requests', require('./routes/seedRequest'));
```

Also serve the uploaded documents statically so they can be viewed/downloaded:

```js
app.use('/uploads', express.static('uploads'));
```

## 4. Make sure your User model's role enum includes "dealer"

Your existing `User.js` role field probably looks like:

```js
role: { type: String, enum: ['farmer', 'buyer', 'supplier'], required: true }
```

Add `dealer` (or reuse `supplier` if that's what you already call this role —
just be consistent with what you pass to `authorize(...)` in the routes):

```js
role: { type: String, enum: ['farmer', 'buyer', 'supplier', 'dealer'], required: true }
```

## The flow, end to end

1. **Dealer creates stock** — `POST /api/seed-stock`
   ```json
   { "seedType": "Corn", "location": "Coimbatore", "unit": "ton", "totalQuantity": 4 }
   ```

2. **Farmer requests seed + uploads patta** — `POST /api/seed-requests`
   (multipart/form-data: `seedStockId`, `requestedQuantity`, `pattaDocument` file)
   → creates a request with `verificationStatus: "Pending"`, stock untouched.

3. **Dealer views pending requests** — `GET /api/seed-requests/pending`

4. **Dealer verifies the document** — `PUT /api/seed-requests/:id/verify`
   ```json
   { "decision": "Verified", "note": "Patta matches farmer's name and location" }
   ```

5. **Dealer approves the request** — `PUT /api/seed-requests/:id/approve`
   - Blocked with an error if the document isn't verified yet.
   - Blocked with an error if there isn't enough stock left (handles two
     dealers approving at the same time safely).
   - On success: stock's `availableQuantity` drops from 4 → 3, and the
     request's `orderStatus` becomes `"Approved"`.

Farmers can check progress anytime via `GET /api/seed-requests/my-requests`.