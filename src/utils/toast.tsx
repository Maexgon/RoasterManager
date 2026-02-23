import toast from 'react-hot-toast';
import { CheckCircle2, XCircle } from 'lucide-react';

export const showSuccessToast = (title: string, description?: string) => {
    toast.custom((t) => (
        <div className={`${t.visible ? 'animate-in fade-in zoom-in-95' : 'animate-out fade-out zoom-out-95'} bg-emerald-600 text-white px-4 py-3.5 rounded-2xl shadow-lg flex items-start gap-3 max-w-sm w-full drop-shadow-md`}>
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
                <h3 className="font-bold text-sm leading-tight">{title}</h3>
                {description && <p className="text-xs text-emerald-100 mt-1 border-t border-emerald-500/50 pt-1 leading-snug">{description}</p>}
            </div>
        </div>
    ), { duration: 4000, position: 'top-right' });
}

export const showErrorToast = (title: string, description?: string) => {
    toast.custom((t) => (
        <div className={`${t.visible ? 'animate-in fade-in zoom-in-95' : 'animate-out fade-out zoom-out-95'} bg-red-600 text-white px-4 py-3.5 rounded-2xl shadow-lg flex items-start gap-3 max-w-sm w-full drop-shadow-md`}>
            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
                <h3 className="font-bold text-sm leading-tight">{title}</h3>
                {description && <p className="text-xs text-red-100 mt-1 border-t border-red-500/50 pt-1 leading-snug">{description}</p>}
            </div>
        </div>
    ), { duration: 5000, position: 'top-right' });
}
