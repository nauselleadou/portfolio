import { useEffect, useRef, useState } from 'react';
import { Download, FileImage, Loader2, X, ZoomIn, ZoomOut } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PdfCvModalProps {
  pdfUrl: string;
  title?: string;
  onClose: () => void;
  onDownloadPdf: () => Promise<void> | void;
  downloadingPdf?: boolean;
}

export function PdfCvModal({
  pdfUrl,
  title = 'CV — Adou Marie-Nauselle',
  onClose,
  onDownloadPdf,
  downloadingPdf = false,
}: PdfCvModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.15);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const firstCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: pdfjsLib.PDFDocumentLoadingTask | null = null;

    async function renderPdf() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(pdfUrl, { credentials: 'same-origin', cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const buffer = await res.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const hasPdfHeader =
          bytes.length >= 4 &&
          bytes[0] === 0x25 &&
          bytes[1] === 0x50 &&
          bytes[2] === 0x44 &&
          bytes[3] === 0x46;

        if (!hasPdfHeader) {
          throw new Error('Format PDF invalide.');
        }

        if (cancelled) return;

        loadingTask = pdfjsLib.getDocument({ data: bytes });
        const pdfDoc = await loadingTask.promise;
        if (cancelled) {
          await pdfDoc.cleanup();
          return;
        }

        setNumPages(pdfDoc.numPages);

        const host = containerRef.current;
        if (!host) return;
        host.innerHTML = '';
        firstCanvasRef.current = null;

        const outputScale = Math.min(window.devicePixelRatio || 1, 2.5);

        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
          if (cancelled) break;
          const page = await pdfDoc.getPage(pageNum);
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = `${Math.floor(viewport.height)}px`;
          canvas.className =
            'mx-auto rounded-lg shadow-md border border-[#D8CCB8] bg-white max-w-full h-auto block';

          if (pageNum === 1) {
            firstCanvasRef.current = canvas;
          }

          host.appendChild(canvas);

          const transform =
            outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

          await page.render({
            canvas,
            viewport,
            transform,
          }).promise;
        }
      } catch {
        if (!cancelled) {
          setError('Impossible d’afficher l’aperçu du CV pour le moment.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    renderPdf();

    return () => {
      cancelled = true;
      if (loadingTask) {
        loadingTask.destroy().catch(() => {});
      }
    };
  }, [pdfUrl, scale]);

  const handleDownloadPng = () => {
    const canvas = firstCanvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'CV_Adou_Marie_Nauselle.png';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
    }, 'image/png');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0B1622]/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full h-[88vh] bg-[#F6F3EC] rounded-2xl p-3 sm:p-4 shadow-2xl border border-[#D8CCB8] flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2 min-w-0">
            <h6 className="text-sm font-bold text-[#0B1622] truncate">{title}</h6>
            {numPages > 0 && (
              <span className="text-xs font-mono text-[#4A5562] shrink-0">
                · {numPages} page{numPages > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {/* Zoom Controls */}
            <div className="hidden sm:inline-flex items-center rounded-lg border border-[#D8CCB8] bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setScale((s) => Math.max(0.75, +(s - 0.15).toFixed(2)))}
                className="p-1.5 hover:bg-[#EAE3D5] text-[#0B1622] cursor-pointer"
                aria-label="Réduire le zoom"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-mono text-[#4A5562] tabular-nums">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setScale((s) => Math.min(1.85, +(s + 0.15).toFixed(2)))}
                className="p-1.5 hover:bg-[#EAE3D5] text-[#0B1622] cursor-pointer"
                aria-label="Agrandir le zoom"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={onDownloadPdf}
              disabled={downloadingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B1622] hover:bg-[#184354] disabled:opacity-60 text-[#F5F1E8] text-xs font-semibold transition-colors cursor-pointer"
            >
              {downloadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9EC0D1]" aria-hidden="true" />
              ) : (
                <Download className="w-3.5 h-3.5 text-[#9EC0D1]" aria-hidden="true" />
              )}
              <span>Télécharger PDF</span>
            </button>

            {!loading && !error && (
              <button
                type="button"
                onClick={handleDownloadPng}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#EAE3D5] text-[#0B1622] border border-[#D8CCB8] text-xs font-semibold transition-colors cursor-pointer"
                title="Enregistrer en image PNG"
              >
                <FileImage className="w-3.5 h-3.5 text-[#184354]" aria-hidden="true" />
                <span>PNG</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white hover:bg-[#EAE3D5] text-[#0B1622] border border-[#D8CCB8] cursor-pointer"
              aria-label="Fermer l’aperçu du CV"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable PDF Canvas Container */}
        <div className="relative flex-1 overflow-y-auto rounded-xl bg-[#EAE3D5]/70 border border-[#D8CCB8] p-3 sm:p-5">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-[#184354]">
              <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
              <span className="text-xs font-medium">Chargement du CV en cours...</span>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
              <p className="text-sm text-[#0B1622] font-medium">{error}</p>
              <button
                type="button"
                onClick={onDownloadPdf}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B1622] hover:bg-[#184354] text-[#F5F1E8] text-xs font-semibold cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#9EC0D1]" />
                <span>Télécharger le fichier PDF</span>
              </button>
            </div>
          )}

          <div
            ref={containerRef}
            className={`space-y-4 ${loading || error ? 'hidden' : 'block'}`}
          />
        </div>
      </div>
    </div>
  );
}
