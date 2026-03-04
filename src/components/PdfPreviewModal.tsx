import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Eye, RefreshCw, Loader2, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { generateDuerpPreviewPDF } from '../services/duerpPreviewPdfService';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  typeDiagnostic: string;
}

const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  clientId,
  typeDiagnostic,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const previousUrlRef = useRef<string | null>(null);

  const generatePreview = useCallback(async () => {
    if (!clientId || !typeDiagnostic) return;

    setLoading(true);
    setError(null);

    try {
      const url = await generateDuerpPreviewPDF(clientId, typeDiagnostic);

      if (previousUrlRef.current) {
        URL.revokeObjectURL(previousUrlRef.current);
      }

      previousUrlRef.current = url;
      setPdfUrl(url);
      setLastUpdate(
        new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    } catch (err: any) {
      console.error('Erreur generation apercu PDF:', err);
      setError(err?.message || 'Erreur lors de la generation de l\'apercu');
    } finally {
      setLoading(false);
    }
  }, [clientId, typeDiagnostic]);

  useEffect(() => {
    if (isOpen) {
      generatePreview();
    }

    return () => {
      if (previousUrlRef.current) {
        URL.revokeObjectURL(previousUrlRef.current);
        previousUrlRef.current = null;
      }
      setPdfUrl(null);
    };
  }, [isOpen, generatePreview]);

  const handleDownloadPreview = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `apercu_duerp_${new Date().getTime()}.pdf`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-[95vw] h-[95vh] max-w-7xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#1e3a5f] to-[#2d5f8a] border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Apercu du rapport DUERP
              </h2>
              {lastUpdate && (
                <p className="text-xs text-white/60">
                  Derniere mise a jour : {lastUpdate}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={generatePreview}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-sm font-medium border border-white/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            {pdfUrl && (
              <button
                onClick={handleDownloadPreview}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/80 hover:bg-emerald-500 text-white rounded-lg transition-all text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Telecharger
              </button>
            )}
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-red-500/80 text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-gray-100 relative">
          {loading && !pdfUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <Eye className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-800">
                  Generation de l'apercu...
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Le PDF se met a jour avec vos dernieres reponses
                </p>
              </div>
            </div>
          )}

          {loading && pdfUrl && (
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              Mise a jour...
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-800">
                  Erreur de generation
                </p>
                <p className="text-sm text-red-500 mt-1">{error}</p>
              </div>
              <button
                onClick={generatePreview}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Reessayer
              </button>
            </div>
          )}

          {pdfUrl && (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="Apercu du rapport DUERP"
            />
          )}
        </div>

        <div className="px-6 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <p className="text-xs text-amber-700 font-medium">
            Cet apercu se regenere a chaque ouverture. Cliquez sur "Actualiser" pour voir les dernieres modifications.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PdfPreviewModal;
