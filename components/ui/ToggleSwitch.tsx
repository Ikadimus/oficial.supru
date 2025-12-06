
import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  // Fix: Add disabled prop to allow the component to be disabled, resolving a type error in SettingsPage.tsx.
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label, disabled = false }) => {
  const handleToggle = () => {
    onChange(!checked);
  };

  return (
    <label className={`flex items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={handleToggle} disabled={disabled} />
        <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-4' : ''}`}></div>
      </div>
      {label && <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
    </label>
  );
};

export default ToggleSwitch;
