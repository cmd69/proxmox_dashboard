import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

// Note: We cannot use hooks in class components, so we'll use Spanish by default
// and fallback to English based on localStorage
const getErrorText = () => {
  const savedLang = localStorage.getItem('language') || 'es';
  return savedLang === 'es' 
    ? { title: 'Ha ocurrido un error inesperado.', button: 'Recargar Página' }
    : { title: 'An unexpected error occurred.', button: 'Reload Page' };
};

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const text = getErrorText();
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900">
          <div className="flex flex-col items-center w-full max-w-2xl p-8 bg-white dark:bg-slate-900 rounded-lg shadow-xl border-2 border-red-200 dark:border-red-800">
            <div className="p-4 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 rounded-full mb-6">
              <AlertTriangle
                size={48}
                className="text-red-600 dark:text-red-400 flex-shrink-0"
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{text.title}</h2>

            <div className="p-4 w-full rounded bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 overflow-auto mb-6 border border-gray-300 dark:border-gray-600">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-break-spaces">
                {this.state.error?.stack}
              </pre>
            </div>

            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-lg font-semibold",
                "bg-gradient-to-r from-blue-600 to-indigo-600 text-white",
                "hover:from-blue-700 hover:to-indigo-700 cursor-pointer transition-all shadow-md hover:shadow-lg"
              )}
            >
              <RotateCcw size={16} />
              {text.button}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
