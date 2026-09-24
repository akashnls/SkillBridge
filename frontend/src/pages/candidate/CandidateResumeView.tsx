import React, { useState, useEffect } from 'react';
import { candidateAPI, CandidateResumeItem } from '../../services/api.js';
import { PageHeader } from '../../components/PageHeader.js';
import {
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
  Star,
  Download,
  Eye,
  Plus,
  AlertCircle,
  X
} from 'lucide-react';

export const CandidateResumeView: React.FC = () => {
  const [resumes, setResumes] = useState<CandidateResumeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewResume, setPreviewResume] = useState<CandidateResumeItem | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [contentText, setContentText] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResumes();
  }, []);

  useEffect(() => {
    if (!previewResume?.content_text) {
      setPdfUrl(null);
      return;
    }

    const text = previewResume.content_text;
    const isPdf =
      previewResume.file_name?.toLowerCase().endsWith('.pdf') ||
      text.startsWith('%PDF') ||
      text.includes('data:application/pdf');

    if (isPdf) {
      try {
        if (text.startsWith('data:application/pdf')) {
          setPdfUrl(text);
          return;
        }

        const bytes = new Uint8Array(text.length);
        for (let i = 0; i < text.length; i++) {
          bytes[i] = text.charCodeAt(i) & 0xff;
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);

        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.error('Failed to create PDF object URL', err);
        setPdfUrl(null);
      }
    } else {
      setPdfUrl(null);
    }
  }, [previewResume]);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const res = await candidateAPI.getResumes();
      if (res.data?.success) {
        setResumes(res.data.resumes || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) {
      alert('Resume file name is required');
      return;
    }

    try {
      setSubmitting(true);
      const res = await candidateAPI.uploadResume({
        file_name: fileName.trim(),
        content_text: contentText.trim(),
        is_primary: isPrimary
      });
      if (res.data?.success) {
        setShowUploadModal(false);
        setFileName('');
        setContentText('');
        setIsPrimary(false);
        await loadResumes();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload resume');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await candidateAPI.setPrimaryResume(id);
      setResumes(prev => prev.map(r => ({ ...r, is_primary: r.id === id ? 1 : 0 })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await candidateAPI.deleteResume(id);
      setResumes(prev => prev.filter(r => r.id !== id));
      if (previewResume?.id === id) setPreviewResume(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = (resume: CandidateResumeItem) => {
    const text = resume.content_text || '';
    const isPdf =
      resume.file_name?.toLowerCase().endsWith('.pdf') ||
      text.startsWith('%PDF') ||
      text.includes('data:application/pdf');

    const element = document.createElement('a');
    let file: Blob;
    if (isPdf && text) {
      const bytes = new Uint8Array(text.length);
      for (let i = 0; i < text.length; i++) {
        bytes[i] = text.charCodeAt(i) & 0xff;
      }
      file = new Blob([bytes], { type: 'application/pdf' });
    } else {
      file = new Blob([text || 'No text content'], { type: 'text/plain' });
    }
    element.href = URL.createObjectURL(file);
    element.download = resume.file_name || 'resume.pdf';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };

  // Simulates reading a local file and setting fileName and content
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setContentText(text);
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#4a5e2f]/20 border-t-[#4a5e2f] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <PageHeader
        badge="RESUME MANAGEMENT"
        badgeSubtext="Tailored Applications"
        icon={<FileText className="w-6 h-6" />}
        title="Resume Manager"
        subtitle="Upload and manage tailored versions of your resume for job applications."
        actions={
          <button
            onClick={() => setShowUploadModal(true)}
            className="sb-btn-primary px-4 py-2.5 text-xs font-bold shadow-[0_0_15px_rgba(182,255,59,0.3)]"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Resume</span>
          </button>
        }
      />

      {/* Resumes List */}
      {resumes.length === 0 ? (
        <div className="p-12 bg-[#f5f0e8]/60 rounded-2xl border border-[#4a4636] text-center space-y-3">
          <FileText className="w-12 h-12 text-[#9a8e7a] mx-auto" />
          <h3 className="text-base font-bold text-[#f0ebe0]">No Resumes Uploaded Yet</h3>
          <p className="text-xs text-[#9a8e7a] max-w-sm mx-auto">
            Upload your resume so you can attach it directly to recruiter applications with a single click.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-[#4a5e2f] hover:bg-[#4a5e2f] text-[#f0ebe0] rounded-xl text-xs font-semibold cursor-pointer"
          >
            Upload Resume Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="p-5 bg-[#f5f0e8]/70 rounded-2xl border border-[#4a4636] hover:border-[#4a4636] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-[#f5f0e8] rounded-xl border border-[#4a4636] text-[#4a5e2f]">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#f0ebe0]">{resume.file_name}</h3>
                    {resume.is_primary === 1 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4a5e2f]/20 text-[#4a5e2f] border border-[#4a5e2f]/30 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current text-[#b45309]" />
                        Primary Resume
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#9a8e7a] mt-0.5">
                    Uploaded on {new Date(resume.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {resume.content_text && (
                  <button
                    onClick={() => setPreviewResume(resume)}
                    className="p-2 text-[#9a8e7a] hover:text-[#f0ebe0] rounded-lg hover:bg-[#f5f0e8] transition-colors"
                    title="Preview resume"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => handleDownload(resume)}
                  className="p-2 text-[#9a8e7a] hover:text-[#f0ebe0] rounded-lg hover:bg-[#f5f0e8] transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>

                {resume.is_primary !== 1 && (
                  <button
                    onClick={() => handleSetPrimary(resume.id)}
                    className="px-3 py-1.5 bg-[#f5f0e8] hover:bg-[#3a3828] text-[#b5aa96] border border-[#4a4636] rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Set as Primary
                  </button>
                )}

                <button
                  onClick={() => handleDelete(resume.id)}
                  className="p-2 text-[#9a8e7a] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Delete resume"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#f5f0e8] border border-[#4a4636] rounded-2xl max-w-4xl w-full p-6 space-y-4 relative shadow-2xl h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#4a4636]">
              <h2 className="text-base font-bold text-[#f0ebe0] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#4a5e2f]" />
                <span>{previewResume.file_name}</span>
              </h2>
              <button
                onClick={() => setPreviewResume(null)}
                className="p-1 text-[#9a8e7a] hover:text-[#f0ebe0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {pdfUrl ? (
              <div className="flex-1 w-full bg-[#1e2022] rounded-xl border border-[#4a4636] overflow-hidden min-h-[450px]">
                <iframe
                  src={pdfUrl}
                  title={previewResume.file_name}
                  className="w-full h-full min-h-[450px] border-0 rounded-xl"
                />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 bg-[#f5f0e8] rounded-xl border border-[#4a4636] text-xs text-[#b5aa96] font-mono whitespace-pre-wrap leading-relaxed">
                {previewResume.content_text || 'No text content available for this resume.'}
              </div>
            )}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handleDownload(previewResume)}
                className="px-3.5 py-2 bg-[#f5f0e8] hover:bg-[#3a3828] text-[#b5aa96] border border-[#4a4636] rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
              <button
                onClick={() => setPreviewResume(null)}
                className="px-4 py-2 bg-[#3a3828] text-[#9a8e7a] hover:text-[#f0ebe0] rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#f5f0e8] border border-[#4a4636] rounded-2xl max-w-lg w-full p-6 space-y-4 relative shadow-2xl">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute right-4 top-4 text-[#9a8e7a] hover:text-[#f0ebe0] p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-black text-[#f0ebe0]">Upload New Resume</h2>
              <p className="text-xs text-[#9a8e7a] mt-1">Select a local resume file or paste text content</p>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#b5aa96] mb-1.5">
                  Select File from Computer
                </label>
                <input
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="w-full text-xs text-[#9a8e7a] file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#3a3828] file:text-[#4a5e2f] hover:file:bg-[#4a4636] cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Resume Name / Title *</label>
                <input
                  type="text"
                  required
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. Alex_Johnson_Resume_2026.pdf"
                  className="w-full px-3.5 py-2 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-xs text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#b5aa96] mb-1">
                  Resume Text Content (Optional - used for ATS parsing & search)
                </label>
                <textarea
                  rows={5}
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                  placeholder="Paste your plain text resume content here for optimal search matching..."
                  className="w-full px-3.5 py-2 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-xs text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f] font-mono resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="primaryCheck"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="rounded border-[#4a4636] text-[#4a5e2f] focus:ring-0"
                />
                <label htmlFor="primaryCheck" className="text-xs text-[#b5aa96] cursor-pointer">
                  Set as Primary Resume for one-click job applications
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#4a4636]">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-[#f5f0e8] hover:bg-[#3a3828] text-[#b5aa96] rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !fileName.trim()}
                  className="px-5 py-2 bg-[#4a5e2f] hover:bg-[#4a5e2f] text-[#f0ebe0] rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Uploading...' : 'Save Resume'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


