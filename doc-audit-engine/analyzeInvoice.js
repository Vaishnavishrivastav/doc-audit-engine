import { GoogleGenAI, Type } from '@google/genai';
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Analyzes a logistics/shipping invoice PDF buffer and returns structured JSON.
 * @param {Buffer} pdfBuffer - Raw PDF file bytes.
 * @returns {Promise<object>} Structured audit report.
 */
export async function analyzeInvoice(pdfBuffer) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        inlineData: {
          data: pdfBuffer.toString('base64'),
          mimeType: 'application/pdf',
        },
      },
      'Analyze this logistics/shipping invoice. Extract the key data fields and explicitly look for any billing errors or unexpected surcharges.',
    ],
    config: {
      systemInstruction:
        'You are an expert B2B forensic accountant. Extract data fields exactly as they appear and flag anomalies like duplicate tracking numbers, mathematical errors, or hidden fees.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          vendorName: { type: Type.STRING },
          invoiceNumber: { type: Type.STRING },
          totalAmountDue: { type: Type.NUMBER },
          billingDiscrepanciesFound: { type: Type.BOOLEAN },
          extractedLineItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                amount: { type: Type.NUMBER },
              },
              required: ['description', 'amount'],
            },
          },
          auditSummaryNotes: { type: Type.STRING },
        },
        required: [
          'vendorName',
          'invoiceNumber',
          'totalAmountDue',
          'billingDiscrepanciesFound',
          'extractedLineItems',
        ],
      },
    },
  });

  return JSON.parse(response.text);
}
