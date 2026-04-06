import { X } from 'lucide-react';

interface ModalProps {
  onClose: () => void;
  accentColor: 'indigo' | 'green' | 'red';
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const borderClass = {
  indigo: 'border-indigo-500/30',
  green: 'border-green-500/30',
  red: 'border-red-500/30',
};

const shadowClass = {
  indigo: 'shadow-indigo-500/10',
  green: 'shadow-green-500/10',
  red: 'shadow-red-500/10',
};

export default function Modal({ onClose, accentColor, icon, title, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative bg-gradient-to-br from-slate-900 to-slate-800 border ${borderClass[accentColor]} rounded-2xl p-6 w-full max-w-md shadow-2xl ${shadowClass[accentColor]}`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          {icon}
          <h2 className="text-white font-bold text-lg">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
}
