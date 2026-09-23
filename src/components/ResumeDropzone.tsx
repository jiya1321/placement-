import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles,
  FileCode,
  X
} from 'lucide-react';

interface ResumeDropzoneProps {
  onParsed: (data: {
    filename: string;
    extracted_text: string;
    detected_skills: string[];
    word_count: number;
  }) => void;
  isParsing: boolean;
  setIsParsing: (val: boolean) => void;
  onError: (errMsg: string) => void;
}

export const ResumeDropzone: React.FC<ResumeDropzoneProps> = ({
  onParsed,
  isParsing,
  setIsParsing,
  onError
}) => {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [uploadedFileSummary, setUploadedFileSummary] = useState<{
    name: string;
    sizeKb: number;
    wordCount?: number;
    skillsCount?: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const validExtensions = ['.pdf', '.docx', '.doc', '.odt', '.txt', '.rtf'];
    const fileNameLower = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileNameLower.endsWith(ext));

    if (!isValid) {
      onError(`Unsupported file type. Please upload a PDF (.pdf), Word document (.docx/.doc), ODF (.odt), or text file.`);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      onError(`File exceeds 15MB size limit.`);
      return;
    }

    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64String = reader.result as string;
        
        const response = await fetch('/api/resume/parse-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            file_base64: base64String,
            file_type: file.type
          })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to extract text from document.');
        }

        setUploadedFileSummary({
          name: file.name,
          sizeKb: Math.round(file.size / 1024),
          wordCount: data.word_count,
          skillsCount: data.detected_skills?.length || 0
        });

        onParsed({
          filename: file.name,
          extracted_text: data.extracted_text,
          detected_skills: data.detected_skills || [],
          word_count: data.word_count
        });
      } catch (err: any) {
        console.error('File parsing error:', err);
        onError(err.message || 'Error parsing document text.');
      } finally {
        setIsParsing(false);
      }
    };

    reader.onerror = () => {
      setIsParsing(false);
      onError('Failed to read file from disk.');
    };

    reader.readAsDataURL(file);
  };

  const clearUploadedFile = () => {
    setUploadedFileSummary(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        id="resume-file-input"
        accept=".pdf,.docx,.doc,.odt,.txt,.rtf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/vnd.oasis.opendocument.text"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isParsing && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-[#2F4F3A] bg-[#2F4F3A]/5 scale-[1.01]'
            : 'border-[#1F1E1B]/20 bg-[#FAF8F3] hover:border-[#2F4F3A]/60 hover:bg-[#EFECE6]/50'
        }`}
      >
        {isParsing ? (
          <div className="py-3 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-7 h-7 text-[#2F4F3A] animate-spin" />
            <div className="text-xs font-bold text-[#1F1E1B]">
              Extracting Text from Document...
            </div>
            <p className="text-[11px] text-[#1F1E1B]/60 max-w-xs">
              Parsing PDF layout, Word XML styles, or ODF markers and detecting candidate skills...
            </p>
          </div>
        ) : uploadedFileSummary ? (
          <div className="py-1 flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#1F1E1B] flex items-center gap-1.5">
                  <span className="truncate max-w-[200px] sm:max-w-[320px]">{uploadedFileSummary.name}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </div>
                <div className="text-[11px] text-[#1F1E1B]/60 flex items-center gap-2 flex-wrap">
                  <span>{uploadedFileSummary.sizeKb} KB</span>
                  <span>•</span>
                  <span>{uploadedFileSummary.wordCount} words extracted</span>
                  <span>•</span>
                  <span className="text-[#2F4F3A] font-semibold">{uploadedFileSummary.skillsCount} skills recognized</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#2F4F3A] font-semibold underline hidden sm:inline">
                Upload different file
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearUploadedFile();
                }}
                className="p-1 rounded text-[#1F1E1B]/40 hover:text-[#1F1E1B] hover:bg-[#1F1E1B]/5"
                title="Remove uploaded document"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="py-2 flex flex-col items-center justify-center space-y-1.5">
            <div className="w-10 h-10 rounded-full bg-[#2F4F3A]/10 text-[#2F4F3A] flex items-center justify-center mb-0.5">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-[#1F1E1B]">
              Drop your resume here, or <span className="text-[#2F4F3A] underline font-semibold">browse files</span>
            </div>
            <p className="text-[11px] text-[#1F1E1B]/60 max-w-sm">
              Supports <strong>PDF (.pdf)</strong>, <strong>Word (.docx / .doc)</strong>, <strong>ODF (.odt)</strong>, and plain text
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
