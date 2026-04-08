import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface NavBarProps {
  title: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  onBack?: () => void;
}

export function NavBar({ title, leftAction, rightAction, onBack }: NavBarProps) {
  return (
    <div className="ios-nav-blur fixed top-0 left-0 right-0 h-24 flex items-end justify-between px-4 pb-3 z-50">
      <div className="flex items-center w-20">
        {onBack ? (
          <button onClick={onBack} className="flex items-center text-ios-blue">
            <ChevronLeft className="w-7 h-7 -ml-2" />
            <span className="text-lg">Atrás</span>
          </button>
        ) : (
          leftAction
        )}
      </div>
      
      <h1 className="text-lg font-semibold text-center flex-1 truncate px-2">
        {title}
      </h1>
      
      <div className="flex items-center justify-end w-20">
        {rightAction}
      </div>
    </div>
  );
}
