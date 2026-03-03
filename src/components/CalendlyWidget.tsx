import { useEffect } from 'react';
import { X } from 'lucide-react';

const CALENDLY_URL = 'https://calendly.com/aberdeencarehomes';

interface CalendlyWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CalendlyWidget({ isOpen, onClose }: CalendlyWidgetProps) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-3xl mx-4 bg-warm-ivory rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ height: 'min(90vh, 760px)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-sage-mist bg-warm-ivory">
          <div>
            <p className="text-sm text-stone-taupe font-medium uppercase tracking-widest">Aberdeen Manor</p>
            <h2 className="text-xl font-bold text-evergreen-shadow" style={{ fontFamily: 'Georgia, serif' }}>
              Schedule Your Personal Tour
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-soft-charcoal hover:bg-sage-mist/40 hover:text-evergreen-shadow transition-all duration-200"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <iframe
            src={`${CALENDLY_URL}?embed_type=Inline&hide_event_type_details=0&hide_gdpr_banner=1`}
            width="100%"
            height="100%"
            frameBorder="0"
            title="Schedule a Tour at Aberdeen Manor"
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
