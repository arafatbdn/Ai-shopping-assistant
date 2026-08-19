import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200">
            <AlertTriangle size={28} />
          </div>
          <h2 className="font-display text-xl font-bold text-[#0f1111]">Something went wrong</h2>
          <p className="mt-2 max-w-md text-xs text-[#565959]">
            {this.state.error?.message || 'An unexpected error occurred while rendering this component.'}
          </p>
          <button
            onClick={this.handleReload}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#fcd200] bg-[#ffd814] px-5 py-2.5 text-xs font-bold text-[#0f1111] shadow-sm transition hover:bg-[#f7ca00]"
          >
            <RefreshCw size={14} /> Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
