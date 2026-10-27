import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const typeStyles = {
            success: 'bg-emerald-900/90 text-white border-emerald-700/50 shadow-emerald-900/20',
            error: 'bg-rose-900/90 text-white border-rose-700/50 shadow-rose-900/20',
            info: 'bg-slate-900/90 text-white border-slate-700/50 shadow-slate-900/20',
          };

          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />,
            info: <Info className="w-5 h-5 text-indigo-400 flex-shrink-0" />,
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-2xl shadow-xl backdrop-blur-md border text-xs font-medium flex items-start gap-3 transition-all animate-in slide-in-from-bottom-5 duration-200 ${
                typeStyles[toast.type] || typeStyles.info
              }`}
            >
              {icons[toast.type] || icons.info}
              <div className="flex-1 leading-relaxed">{toast.message}</div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-white/60 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
