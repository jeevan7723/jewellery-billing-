import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto my-12 animate-in fade-in zoom-in-95 duration-300">
          <div className="glass-panel p-8 rounded-3xl border border-rose-500/30 shadow-2xl bg-obsidian-900/90 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-white">
                Something went wrong in this section
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {this.state.error?.message || 'An unexpected rendering error occurred.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-obsidian-950/80 border border-white/5 text-left font-mono text-[11px] text-rose-300 overflow-x-auto max-h-36">
              <code>{this.state.error?.stack || String(this.state.error)}</code>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>

              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  if (this.props.onNavigateDashboard) {
                    this.props.onNavigateDashboard();
                  } else {
                    window.location.reload();
                  }
                }}
                className="px-5 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold flex items-center gap-2 cursor-pointer shadow-gold-glow"
              >
                <Home className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
