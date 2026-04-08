import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ios-bg flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white rounded-3xl p-8 shadow-xl max-w-sm w-full space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Algo salió mal</h1>
            <p className="text-sm text-gray-500">
              La aplicación ha encontrado un error inesperado.
            </p>
            <div className="bg-gray-50 p-3 rounded-xl text-left overflow-auto max-h-32">
              <code className="text-[10px] text-red-600">
                {this.state.error?.message}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-ios-blue text-white py-3 rounded-xl font-semibold active:scale-95 transition-transform"
            >
              Reiniciar aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
