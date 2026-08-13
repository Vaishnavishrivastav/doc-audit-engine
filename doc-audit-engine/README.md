# doc-audit-engine (SmartAudit AI backend)

AI-powered logistics/shipping invoice auditor. Upload a PDF, get back structured JSON with flagged billing discrepancies.

## Quick start

```bash
npm install
cp .env.example .env
# paste your real Gemini API key into .env
npm start
```

Server runs at `http://localhost:3001`.

## Test it

```bash
curl -X POST http://localhost:3001/api/analyze-invoice \
  -F "invoice=@./sample_invoice.pdf"
```

Response shape:

```json
{
  "success": true,
  "data": {
    "vendorName": "...",
    "invoiceNumber": "...",
    "totalAmountDue": 0,
    "billingDiscrepanciesFound": true,
    "extractedLineItems": [{ "description": "...", "amount": 0 }],
    "auditSummaryNotes": "..."
  }
}
```

## Next steps (Days 7-9 of the hackathon plan)

1. Wire a Next.js/React 2-page dashboard: upload page + results table.
2. Add Stripe Checkout in front of `/api/analyze-invoice` to gate usage.
3. Deploy: frontend to Vercel, backend to Railway/Render.
