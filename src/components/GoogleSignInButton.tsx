import React from 'react';

interface GoogleSignInButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  userEmail?: string | null;
  onSignOut?: () => void;
  className?: string;
  variant?: 'full' | 'compact';
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onClick,
  isLoading = false,
  userEmail,
  onSignOut,
  className = '',
  variant = 'full',
}) => {
  if (userEmail) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-[#c5a47e]/30 text-white text-xs ${className}`}>
        <div className="w-5 h-5 flex-shrink-0">
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
          </svg>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-white/50 leading-tight">Google Connected</span>
          <span className="font-mono text-[11px] truncate max-w-[140px] text-[#c5a47e]">{userEmail}</span>
        </div>
        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="ml-1 text-white/40 hover:text-red-400 p-1 transition-colors"
            title="Disconnect Google Account"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
          </button>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white text-black hover:bg-neutral-100 font-medium text-xs shadow-md transition-all disabled:opacity-50 ${className}`}
      >
        <div className="w-4 h-4 flex-shrink-0">
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
          </svg>
        </div>
        <span>{isLoading ? 'Connecting...' : 'Connect Sheets'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={`relative inline-flex items-center justify-center gap-3 px-5 py-2.5 rounded-xl bg-white text-neutral-800 hover:bg-neutral-100 font-medium text-xs tracking-wide shadow-lg shadow-black/40 transition-all border border-neutral-200 disabled:opacity-50 active:scale-[0.98] ${className}`}
    >
      <div className="w-5 h-5 flex-shrink-0">
        <svg viewBox="0 0 48 48" className="w-full h-full">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        </svg>
      </div>
      <span>{isLoading ? 'Connecting to Google...' : 'Sign in with Google'}</span>
    </button>
  );
};
