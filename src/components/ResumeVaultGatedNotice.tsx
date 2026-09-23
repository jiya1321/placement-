import React from 'react';
import { 
  FileWarning, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Bot,
  Search,
  Check
} from 'lucide-react';
import { ResumeDropzone } from './ResumeDropzone';

interface ResumeVaultGatedNoticeProps {
  serviceName: string;
  serviceDescription: string;
  onParsed: (data: {
    filename: string;
    extracted_text: string;
    detected_skills: string[];
    word_count: number;
  }) => void;
  isParsing: boolean;
  setIsParsing: (val: boolean) => void;
  onError: (errMsg: string) => void;
  onQuickLoadPreset?: () => void;
}

export const ResumeVaultGatedNotice: React.FC<ResumeVaultGatedNoticeProps> = ({
  serviceName,
  serviceDescription,
  onParsed,
  isParsing,
  setIsParsing,
  onError,
  onQuickLoadPreset
}) => {
  const [pasteMode, setPasteMode] = React.useState(false);
  const [pastedContent, setPastedContent] = React.useState('');

  const handlePasteSubmit = () => {
    if (!pastedContent.trim() || pastedContent.trim().length < 30) {
      onError("Please provide at least 30 characters of your resume/academic background.");
      return;
    }
    const words = pastedContent.trim().split(/\s+/).filter(Boolean).length;
    onParsed({
      filename: "Candidate-Resume.txt",
      extracted_text: pastedContent.trim(),
      detected_skills: [],
      word_count: words
    });
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-amber-300/80 shadow-md overflow-hidden max-w-3xl mx-auto my-6 animate-fade-in">
      {/* Top Banner Alert */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <FileWarning className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wide uppercase">
              Please Upload Resume First
            </h3>
            <p className="text-xs text-amber-100">
              {serviceName} is locked until your resume is added to your profile.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs">
          Step 1 Required
        </span>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1F1E1B]">
            Upload Your Resume to Unlock {serviceName}
          </h2>
          <p className="text-xs sm:text-sm text-[#1F1E1B]/70 mt-1.5 leading-relaxed">
            {serviceDescription} PlacePilot saves your resume directly to your candidate profile, allowing our AI agents to extract your skills, calculate real ATS match scores, and generate tailored applications.
          </p>
        </div>

        {/* Feature Highlights unlocked by resume */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="bg-[#FAF8F3] border border-[#1F1E1B]/10 rounded-xl p-3.5 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#1F1E1B]">ATS Flaw Diagnosis</p>
              <p className="text-[11px] text-[#1F1E1B]/60 leading-tight mt-0.5">Automated scoring & 1-click line rewrites</p>
            </div>
          </div>

          <div className="bg-[#FAF8F3] border border-[#1F1E1B]/10 rounded-xl p-3.5 flex items-start gap-2.5">
            <Search className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#1F1E1B]">Job Match Scores</p>
              <p className="text-[11px] text-[#1F1E1B]/60 leading-tight mt-0.5">Real companies matched to your skills</p>
            </div>
          </div>

          <div className="bg-[#FAF8F3] border border-[#1F1E1B]/10 rounded-xl p-3.5 flex items-start gap-2.5">
            <Bot className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#1F1E1B]">Tailored Applications</p>
              <p className="text-[11px] text-[#1F1E1B]/60 leading-tight mt-0.5">Custom cover letters and interview prep</p>
            </div>
          </div>
        </div>

        {/* Upload Box or Paste Mode */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1F1E1B]">
              {pasteMode ? "Paste Resume Text Below:" : "Upload PDF, Word (.docx), or ODF Document:"}
            </span>
            <button
              type="button"
              onClick={() => setPasteMode(!pasteMode)}
              className="text-xs font-semibold text-[#143823] hover:underline flex items-center gap-1"
            >
              {pasteMode ? (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Switch to File Upload</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Or Paste Plain Text</span>
                </>
              )}
            </button>
          </div>

          {!pasteMode ? (
            <div className="bg-[#FAF8F3] p-4 rounded-xl border border-[#1F1E1B]/15">
              <ResumeDropzone
                onParsed={onParsed}
                isParsing={isParsing}
                setIsParsing={setIsParsing}
                onError={onError}
              />
            </div>
          ) : (
            <div className="space-y-3 bg-[#FAF8F3] p-4 rounded-xl border border-[#1F1E1B]/15">
              <textarea
                rows={8}
                value={pastedContent}
                onChange={(e) => setPastedContent(e.target.value)}
                placeholder="Paste your education, experience, technical skills, and coursework here..."
                className="w-full bg-white border border-[#1F1E1B]/15 rounded-lg p-3 text-xs font-mono text-[#1F1E1B] focus:outline-none focus:ring-2 focus:ring-[#143823]/30"
              />
              <button
                type="button"
                onClick={handlePasteSubmit}
                className="w-full py-2.5 bg-[#143823] hover:bg-[#1E4D32] text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>Save Resume to Profile & Unlock {serviceName}</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Demo Pre-fill option if available */}
        {onQuickLoadPreset && (
          <div className="flex items-center justify-between pt-2 border-t border-[#1F1E1B]/10 text-xs text-[#1F1E1B]/60">
            <span>Testing the platform? You can also load a demo sample profile:</span>
            <button
              type="button"
              onClick={onQuickLoadPreset}
              className="text-xs font-bold text-[#143823] hover:underline"
            >
              Load Sample Engineering Resume
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
