import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  MapPin,
  ArrowRight,
  ShieldAlert,
  FileCode,
  Tag,
  Users,
  Info,
} from 'lucide-react';
import { AcademicEvent } from '../../types';
import { SAMPLE_NOTICES } from '../../lib/demoData';
import { formatDisplayDate, formatDisplayTime } from '../../lib/dateTime';

interface DecodeNoticeTabProps {
  onExtract: (text: string, title?: string) => Promise<AcademicEvent[]>;
  onCommitEvents: (events: AcademicEvent[]) => void;
  onOpenEditModal: (event: AcademicEvent) => void;
  isProcessing: boolean;
}

export const DecodeNoticeTab: React.FC<DecodeNoticeTabProps> = ({
  onExtract,
  onCommitEvents,
  onOpenEditModal,
  isProcessing,
}) => {
  const [inputText, setInputText] = useState('');
  const [noticeTitle, setNoticeTitle] = useState('Department Academic Notice');
  const [extractedList, setExtractedList] = useState<AcademicEvent[]>([]);
  const [extractedMessage, setExtractedMessage] = useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!inputText.trim()) return;
    setExtractedMessage(null);
    setUploadError(null);
    const results = await onExtract(inputText, noticeTitle);
    setExtractedList(results);
    if (results.length > 0) {
      const isAi = results.some((r) => r.extractionSource === 'ai');
      setExtractedMessage(
        `Successfully extracted ${results.length} academic event candidate${results.length !== 1 ? 's' : ''} using ${
          isAi ? 'Gemini 3.8 Flash AI context analysis' : 'local deterministic extraction'
        }.`
      );
    } else {
      setExtractedMessage('No distinct academic events or dates detected. Please verify your notice text.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setExtractedMessage(null);

    // Check size (15MB max)
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('File size exceeds 15MB limit. Please upload a smaller document.');
      return;
    }

    // Handle PDF upload
    if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
      setIsPdfLoading(true);
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.split(',')[1];

            const res = await fetch('/api/extract-pdf', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileBase64: base64,
                fileName: file.name,
              }),
            });

            const data = await res.json();
            if (data.success && data.text) {
              setInputText(data.text);
              setNoticeTitle(file.name.replace(/\.[^/.]+$/, ''));
              setExtractedMessage(`Loaded PDF "${file.name}" (${data.numPages || 1} pages). Ready to extract events.`);
            } else if (data.scanned) {
              setUploadError(data.message);
            } else {
              setUploadError(data.error || 'Failed to extract text from PDF document.');
            }
          } catch (err: any) {
            setUploadError(`Error processing PDF: ${err?.message || 'Server error'}`);
          } finally {
            setIsPdfLoading(false);
          }
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setIsPdfLoading(false);
        setUploadError('Failed to read uploaded PDF file.');
      }
      return;
    }

    // Handle Text / Markdown file upload
    if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setInputText(text);
        setNoticeTitle(file.name.replace(/\.[^/.]+$/, ''));
        setExtractedMessage(`Loaded file "${file.name}". Click Extract to process.`);
      };
      reader.readAsText(file);
      return;
    }

    setUploadError('Unsupported file type. Please upload a PDF (.pdf) or plain text (.txt / .md) document.');
  };

  const handleCommitAll = () => {
    onCommitEvents(extractedList);
    setExtractedList([]);
    setInputText('');
    setExtractedMessage(null);
  };

  const handleDeleteCandidate = (id: string) => {
    setExtractedList((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-base font-bold text-[#F5F7FA]">Decode Academic Notice</h2>
        <p className="text-xs text-[#A6ACB8]">
          Upload PDF circulars, paste announcements, or select benchmark notices to extract verified events with AI context analysis.
        </p>
      </div>

      {/* Input Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Notice Input Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="p-4 rounded-xl bg-[#0F1115] border border-[#252936] space-y-3">
            {/* Title & Actions row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <input
                type="text"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                placeholder="Notice Header / Subject"
                className="px-3 py-1.5 bg-[#151820] border border-[#252936] rounded-lg text-xs text-[#F5F7FA] font-medium focus:outline-none focus:border-violet-500 w-full sm:w-72"
              />

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#A6ACB8] hover:text-[#F5F7FA] bg-[#151820] hover:bg-[#1f2432] border border-[#252936] rounded-lg cursor-pointer transition-colors whitespace-nowrap">
                  <Upload className="w-3.5 h-3.5 text-violet-400" />
                  <span>{isPdfLoading ? 'Parsing PDF...' : 'Upload PDF / Text'}</span>
                  <input
                    type="file"
                    accept=".pdf,.txt,.md"
                    onChange={handleFileUpload}
                    disabled={isPdfLoading}
                    className="hidden"
                  />
                </label>

                {inputText && (
                  <button
                    onClick={() => {
                      setInputText('');
                      setExtractedList([]);
                      setUploadError(null);
                      setExtractedMessage(null);
                    }}
                    className="p-1.5 text-[#A6ACB8] hover:text-red-400 rounded-lg transition-colors"
                    title="Clear input text"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {uploadError && (
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p>{uploadError}</p>
              </div>
            )}

            {/* Main Textarea */}
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={9}
                placeholder="Paste notice text here (e.g. 'All Il-year CSE students: Internal Test 2 will be held on 13 Nov 2026 from 10:00 AM to 11:30 AM in Room 204...')"
                className="w-full p-3 bg-[#151820] border border-[#252936] rounded-lg text-xs text-[#F5F7FA] placeholder-[#A6ACB8]/60 focus:outline-none focus:border-violet-500 leading-relaxed font-mono"
              />
              <div className="absolute bottom-3 right-3 text-[10px] text-[#A6ACB8] font-mono pointer-events-none">
                {inputText.length} chars
              </div>
            </div>

            {/* Quick Sample Notice Buttons */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-[#A6ACB8] uppercase tracking-wider block">
                Load Sample Notices
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_NOTICES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputText(sample.text);
                      setNoticeTitle(sample.name);
                      setUploadError(null);
                    }}
                    className="px-2.5 py-1 text-xs text-violet-300 hover:text-white bg-violet-950/30 hover:bg-violet-900/40 border border-violet-800/40 rounded-lg transition-colors text-left"
                  >
                    <span>{sample.name}</span>
                    <span className="ml-1 text-[10px] text-[#A6ACB8]">({sample.tag})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Extract Button */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[#252936]">
              <span className="text-[11px] text-[#A6ACB8] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI contextual analysis with date inference & ambiguity review</span>
              </span>
              <button
                onClick={handleExtract}
                disabled={!inputText.trim() || isProcessing || isPdfLoading}
                className="flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-lg shadow-lg shadow-violet-900/30 transition-all whitespace-nowrap"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Extract Academic Events</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Extracted Candidates Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#F5F7FA]">Extracted Candidates</h3>
              <p className="text-xs text-[#A6ACB8]">
                {extractedList.length} candidate{extractedList.length !== 1 ? 's' : ''} ready for verification
              </p>
            </div>

            {extractedList.length > 0 && (
              <button
                onClick={handleCommitAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save to Schedule</span>
              </button>
            )}
          </div>

          {extractedMessage && (
            <div className="p-3 rounded-lg bg-[#151820] border border-cyan-500/30 text-xs text-cyan-300">
              {extractedMessage}
            </div>
          )}

          {extractedList.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#0F1115] border border-[#252936] text-center space-y-2">
              <FileText className="w-8 h-8 text-[#A6ACB8] mx-auto" />
              <h4 className="text-xs font-semibold text-[#F5F7FA]">No Candidates Extracted</h4>
              <p className="text-xs text-[#A6ACB8] max-w-xs mx-auto">
                Paste an announcement or upload a PDF notice on the left to extract academic events.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {extractedList.map((cand) => (
                <div
                  key={cand.id}
                  className="p-3.5 rounded-xl bg-[#0F1115] border border-[#252936] space-y-2.5 hover:border-violet-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-wider">
                          {cand.eventType}
                        </span>
                        {cand.extractionSource && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#151820] border border-[#252936] text-cyan-300">
                            {cand.extractionSource === 'ai' ? 'Gemini 3.8 Flash' : 'Rule Engine'}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-[#F5F7FA]">{cand.title}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenEditModal(cand)}
                        className="p-1 text-[#A6ACB8] hover:text-[#F5F7FA] rounded hover:bg-[#151820] transition-colors"
                        title="Edit event before saving"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCandidate(cand.id)}
                        className="p-1 text-[#A6ACB8] hover:text-red-400 rounded hover:bg-[#151820] transition-colors"
                        title="Discard candidate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#A6ACB8]">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#A6ACB8]" />
                      <span>{formatDisplayDate(cand.date)}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-[#A6ACB8]" />
                      <span>
                        {cand.startTime
                          ? `${formatDisplayTime(cand.startTime)} – ${formatDisplayTime(cand.endTime)}`
                          : `Deadline: ${formatDisplayTime(cand.deadlineTime)}`}
                      </span>
                    </div>
                    {cand.venue && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#A6ACB8]" />
                        <span>{cand.venue}</span>
                      </div>
                    )}
                  </div>

                  {/* Topic & Audience tags if available */}
                  {(cand.topic || cand.targetAudience) && (
                    <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px]">
                      {cand.topic && (
                        <span className="text-cyan-300 flex items-center gap-1">
                          <Tag className="w-3 h-3 text-cyan-400" />
                          <span>Topic: {cand.topic}</span>
                        </span>
                      )}
                      {cand.targetAudience && (
                        <span className="text-violet-300 flex items-center gap-1">
                          <Users className="w-3 h-3 text-violet-400" />
                          <span>{cand.targetAudience}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Inferred Context Notice */}
                  {cand.inferredFields && cand.inferredFields.length > 0 && (
                    <div className="text-[10px] text-cyan-300 bg-cyan-950/20 border border-cyan-500/20 px-2 py-1 rounded">
                      <span className="font-semibold">Context Inference:</span> {cand.inferredFields.join(', ')}
                    </div>
                  )}

                  {/* Ambiguity / OCR typo warnings */}
                  {cand.ambiguities && cand.ambiguities.length > 0 && (
                    <div className="text-[10px] text-amber-300 bg-amber-950/20 border border-amber-500/30 px-2 py-1 rounded space-y-0.5">
                      <span className="font-semibold text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Review Ambiguity / OCR:</span>
                      </span>
                      {cand.ambiguities.map((a, i) => (
                        <p key={i} className="text-[#F5F7FA]/90">{a}</p>
                      ))}
                    </div>
                  )}

                  {/* Source Quote */}
                  <div className="text-[11px] text-[#A6ACB8] italic bg-[#151820] p-2 rounded border border-[#252936]">
                    "{cand.sourceExcerpt}"
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
