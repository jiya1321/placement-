import React from 'react';
import { 
  UploadCloud, 
  FileText, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  ShieldCheck 
} from 'lucide-react';
import { ResumeDropzone } from './ResumeDropzone';

interface UploadResumePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParsed: (data: {
    filename: string;
    extracted_text: string;
    detected_skills: string[];
    word_count: number;
  }) => void;
  isParsing: boolean;
  setIsParsing: (val: boolean) => void;
  onError: (errMsg: string) => void;
  serviceAttempted?: string;
  onManualTextFill?: (text: string) => void;
}

export const UploadResumePromptModal: React.FC<UploadResumePromptModalProps> = ({
  isOpen,
  onClose,
  onParsed,
  isParsing,
  setIsParsing,
  onError,
  serviceAttempted = "this career intelligence service",
  onManualTextFill
}) => {
  const [activeMode, setActiveMode] = React.useState<'dropzone' | 'paste'>('dropzone');
  const [pasteText, setPasteText] = React.useState<string>('');

  if (!isOpen) return null;

  const handlePasteSubmit = () => {
    if (!pasteText.trim() || pasteText.trim().length < 30) {
      onError("Please enter at least 30 characters of your resume or academic background.");
      return;
    }
    const words = pasteText.trim().split(/\s+/).filter(Boolean).length;
    onParsed({
      filename: "Pasted-Resume.txt",
      extracted_text: pasteText.trim(),
      detected_skills: [],
      word_count: words
    });
    if (onManualTextFill) {
      onManualTextFill(pasteText.trim());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#1F1E1B]/15 overflow-hidden my-6">
        {/* Header decoration */}
        <div className="bg-[#143823] text-white p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
            <span className="text-[11px] font-bold tracking-wider uppercase text-amber-300">
              Resume Required
            </span>
          </div>

          <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
            Please Upload Your Resume First
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100/85 mt-1.5 leading-relaxed">
            To use <strong className="text-white underline decoration-emerald-400">{serviceAttempted}</strong>, PlacePilot requires your resume to extract skills, calculate authentic ATS match scores, and tailor interview strategies.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 bg-[#FAF8F3]">
          {/* Mode Switcher */}
          <div className="flex items-center justify-between bg-white p-1 rounded-xl border border-[#1F1E1B]/10">
            <button
              type="button"
              onClick={() => setActiveMode('dropzone')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeMode === 'dropzone'
                  ? 'bg-[#143823] text-white shadow-xs'
                  : 'text-[#1F1E1B]/70 hover:text-[#1F1E1B]'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Document (PDF / DOCX / ODF)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('paste')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeMode === 'paste'
                  ? 'bg-[#143823] text-white shadow-xs'
                  : 'text-[#1F1E1B]/70 hover:text-[#1F1E1B]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Plain Text</span>
            </button>
          </div>

          {activeMode === 'dropzone' ? (
            <div className="bg-white p-4 rounded-xl border border-[#1F1E1B]/10 shadow-xs">
              <ResumeDropzone
                onParsed={(data) => {
                  onParsed(data);
                  onClose();
                }}
                isParsing={isParsing}
                setIsParsing={setIsParsing}
                onError={onError}
              />
            </div>
          ) : (
            <div className="bg-white p-4 rounded-xl border border-[#1F1E1B]/10 shadow-xs space-y-3">
              <label className="text-xs font-bold text-[#1F1E1B] block">
                Paste Resume / Experience Text:
              </label>
              <textarea
                rows={7}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste your education, skills, projects, and work experience here..."
                className="w-full bg-[#FAF8F3] border border-[#1F1E1B]/15 rounded-lg p-3 text-xs font-mono text-[#1F1E1B] focus:outline-none focus:ring-2 focus:ring-[#143823]/20"
              />
              <button
                type="button"
                onClick={handlePasteSubmit}
                className="w-full py-2.5 bg-[#143823] hover:bg-[#1E4D32] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>Save Resume to Profile & Unlock Services</span>
              </button>
            </div>
          )}

          {/* Value callout */}
          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3.5 flex items-start gap-3 text-xs text-emerald-950">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Once uploaded, your resume is permanently saved to your user profile. PlacePilot uses it to unlock the <strong>ATS Auditor</strong>, <strong>Real Company Internship Matches</strong>, <strong>Tailored Cover Letters</strong>, and <strong>AI Career Sprint</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
