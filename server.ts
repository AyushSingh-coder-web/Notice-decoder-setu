import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Health and AI status endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'Notice Decoder — Academic Change Intelligence',
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

async function extractPdfText(buffer: Buffer): Promise<{ text: string; numPages: number }> {
  const pdfParseModule = require('pdf-parse');

  // pdf-parse v2.x exports { PDFParse: class ... }
  if (pdfParseModule.PDFParse && typeof pdfParseModule.PDFParse === 'function') {
    const parser = new pdfParseModule.PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      let extractedText = '';
      if (Array.isArray(result.pages) && result.pages.length > 0) {
        extractedText = result.pages
          .map((p: any) => (p && typeof p.text === 'string' ? p.text.trim() : ''))
          .filter(Boolean)
          .join('\n\n');
      }
      if (!extractedText && typeof result.text === 'string') {
        extractedText = result.text.trim();
      }
      const numPages = result.total || (Array.isArray(result.pages) ? result.pages.length : 1);
      return { text: extractedText, numPages };
    } finally {
      if (typeof parser.destroy === 'function') {
        await parser.destroy().catch(() => {});
      }
    }
  }

  // Fallback for legacy v1 function export if present
  if (typeof pdfParseModule === 'function') {
    const data = await pdfParseModule(buffer);
    return {
      text: (data.text || '').trim(),
      numPages: data.numpages || 1,
    };
  }

  if (typeof pdfParseModule.default === 'function') {
    const data = await pdfParseModule.default(buffer);
    return {
      text: (data.text || '').trim(),
      numPages: data.numpages || 1,
    };
  }

  throw new Error('PDF parser engine could not be initialized.');
}

// PDF Parsing Endpoint
app.post('/api/extract-pdf', async (req, res) => {
  try {
    const { fileBase64, fileName } = req.body;
    if (!fileBase64) {
      return res.status(400).json({ success: false, error: 'No PDF fileBase64 provided.' });
    }

    const buffer = Buffer.from(fileBase64, 'base64');
    const { text: rawText, numPages } = await extractPdfText(buffer);

    if (!rawText || rawText.length < 5) {
      return res.status(200).json({
        success: false,
        scanned: true,
        fileName: fileName || 'Uploaded Document',
        message:
          'This PDF appears to be a scanned document or image without an extractable text layer. Optical Character Recognition (OCR) is not locally configured. Please copy and paste the notice text directly.',
      });
    }

    return res.json({
      success: true,
      text: rawText,
      numPages,
      fileName: fileName || 'Uploaded Document',
    });
  } catch (err: any) {
    console.error('PDF extraction error:', err);
    return res.status(500).json({
      success: false,
      error: `Failed to parse PDF document: ${err?.message || 'Invalid or corrupted file.'}`,
    });
  }
});

// Evidence-backed AI extraction enhancement endpoint (server-side Gemini 3.8 Flash)
app.post('/api/ai/extract', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      success: false,
      fallback: true,
      reason: 'NO_API_KEY',
      message: 'GEMINI_API_KEY is not configured on server. Use local deterministic extraction engine.',
    });
  }

  const { noticeText } = req.body;
  if (!noticeText || typeof noticeText !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid noticeText supplied' });
  }

  try {
    const ai = new GoogleGenAI();
    const prompt = `You are the expert academic event extractor for Notice Decoder.
Given the college notice text below, thoroughly analyze and extract all academic events, examinations, lectures, deadlines, labs, or submissions.

CRITICAL EXTRACTION REQUIREMENTS:
1. Extract ALL distinct academic events mentioned in the notice.
2. For each event, output:
   - title: Concise, professional title (e.g. "Internal Test 2", "Lab Record Submission", "Guest Lecture")
   - eventType: One of "exam", "lecture", "deadline", "lab", "assignment", "meeting", "other"
   - date: YYYY-MM-DD. (IMPORTANT: If a year is missing for an event like "13 Nov" but another event in the same notice explicitly mentions "13 Nov 2026", resolve the date to 2026-11-13 and record that the year was context-inferred).
   - startTime: HH:mm in 24hr format (e.g. "10:00", "11:00") or null
   - endTime: HH:mm in 24hr format (e.g. "11:30", "12:30") or null
   - deadlineTime: HH:mm in 24hr format if it is a submission cutoff (e.g. "12:00" for 12:00 noon) or null
   - venue: Venue name or submission location (e.g. "Room 204", "Department office", "Seminar Hall") or null
   - topic: Specific topic or subject if stated (e.g. "AI in Healthcare") or null
   - targetAudience: Specific target student cohort if mentioned (e.g. "II-year CSE students") or null
   - sourceSentence: Exact excerpt from notice text stating this event
   - confidence: "high" | "medium" | "low"
   - inferredFields: Array of strings explaining any fields inferred from context (e.g. ["Year 2026 inferred from notice date context"])
   - ambiguities: Array of strings noting any potential OCR errors, ambiguous characters, or typos in the source text that need human verification (e.g. ["'Il-year' flagged as potential OCR typo for 'II-year' (2nd Year)", "'Al in Healthcare' flagged as potential OCR typo for 'AI in Healthcare'"])
   - uncertainFields: Array of field names if any are uncertain (e.g. ["year", "venue"])
   - isRescheduleOrChange: boolean (true if the text mentions rescheduled, revised, cancelled, postponed)

Respond strictly in valid JSON format matching this schema:
{
  "events": [
    {
      "title": "string",
      "eventType": "exam | lecture | deadline | lab | assignment | meeting | other",
      "date": "YYYY-MM-DD",
      "startTime": "HH:mm or null",
      "endTime": "HH:mm or null",
      "deadlineTime": "HH:mm or null",
      "venue": "string or null",
      "topic": "string or null",
      "targetAudience": "string or null",
      "sourceSentence": "string",
      "confidence": "high | medium | low",
      "inferredFields": ["string"],
      "ambiguities": ["string"],
      "uncertainFields": ["string"],
      "isRescheduleOrChange": false
    }
  ]
}

NOTICE TEXT:
"""
${noticeText}
"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({
      success: true,
      data: parsed.events || [],
      provider: 'gemini-3.8-flash',
    });
  } catch (err: any) {
    console.error('Server AI extract error:', err);
    return res.status(200).json({
      success: false,
      fallback: true,
      reason: 'AI_CALL_FAILED',
      error: err?.message || 'Error communicating with Gemini model',
    });
  }
});

// Evidence-backed AI Assistant endpoint
app.post('/api/ai/assistant', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const { query, context } = req.body;

  if (!query) {
    return res.status(400).json({ success: false, error: 'Query is required' });
  }

  if (!apiKey) {
    return res.status(200).json({
      success: false,
      fallback: true,
      reason: 'NO_API_KEY',
      message: 'GEMINI_API_KEY is not configured. Switching to deterministic evidence-grounded local assistant.',
    });
  }

  try {
    const ai = new GoogleGenAI();
    const systemPrompt = `You are the Notice Decoder AI Assistant, an academic change intelligence co-pilot.
Your task is to answer the student's question based strictly on their notices, extracted events, detected revisions, schedule overlaps, and deadline collisions provided in context.

STRICT GROUNDING RULES:
1. ONLY state facts verifiable in the provided context.
2. When mentioning an event, date, time, change, or conflict, quote or cite the source notice or event ID.
3. If an event has a conflict (overlap or deadline collision), use the calculated conflict details from context as the ground truth.
4. If information is missing, ambiguous, or not mentioned in the context, explicitly state that it is not available.
5. Provide crisp, structured answers with markdown bullets. Do not invent dates or schedule changes.

CONTEXT:
${JSON.stringify(context, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nSTUDENT QUESTION:\n${query}` }] },
      ],
    });

    return res.json({
      success: true,
      answer: response.text,
      provider: 'gemini-3.8-flash',
    });
  } catch (err: any) {
    console.error('Server AI assistant error:', err);
    return res.status(200).json({
      success: false,
      fallback: true,
      reason: 'AI_CALL_FAILED',
      error: err?.message || 'Error communicating with Gemini model',
    });
  }
});

// Setup Vite middlewares in dev or serve dist in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Notice Decoder server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
