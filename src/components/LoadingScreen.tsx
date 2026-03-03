export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 bg-warm-ivory flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-velvet-green/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-sage-mist/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-antique-brass/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="relative flex flex-col items-center gap-8">
        <div className="relative">
          <div className="absolute inset-0 bg-velvet-green rounded-full blur-xl opacity-20 animate-pulse"></div>

          <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-velvet-green/20">
            <img
              src="/ChatGPT_Image_Mar_1,_2026,_09_55_21_AM.png"
              alt="Aberdeen Manor Logo"
              className="w-20 h-20 object-contain animate-pulse-scale"
            />
          </div>

          <div className="absolute -inset-4">
            <div className="w-full h-full border-2 border-velvet-green/20 rounded-full animate-ping-slow"></div>
          </div>

          <div className="absolute -inset-6">
            <div className="w-full h-full border border-moss-silk/20 rounded-full animate-ping-slower"></div>
          </div>
        </div>

        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">
            <span className="text-velvet-green animate-gradient">
              Aberdeen Manor
            </span>
          </h2>

          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-antique-brass rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-antique-brass rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-antique-brass rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>

        <div className="w-64 h-1 bg-sage-mist/30 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-velvet-green to-antique-brass rounded-full animate-loading-bar"></div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-scale {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }

        @keyframes ping-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.1;
          }
        }

        @keyframes ping-slower {
          0%, 100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.15);
            opacity: 0;
          }
        }

        @keyframes gradient {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-pulse-scale {
          animation: pulse-scale 2s ease-in-out infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-ping-slower {
          animation: ping-slower 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-gradient {
          animation: gradient 3s ease infinite;
        }

        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
