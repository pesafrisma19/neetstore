import React, { createContext, useContext } from 'react';

interface RadioContextType {
  value: string;
  onChange: (val: string) => void;
  name?: string;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export interface RadioGroupProps {
  value: string;
  onChange?: (val: string) => void;
  onValueChange?: (val: string) => void;
  name?: string;
  className?: string;
  children: React.ReactNode;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onChange,
  onValueChange,
  name,
  className = '',
  children,
}) => {
  const handler = onChange || onValueChange || (() => {});
  return (
    <RadioContext.Provider value={{ value, onChange: handler, name }}>
      <div className={`flex flex-col gap-3.5 ${className}`}>{children}</div>
    </RadioContext.Provider>
  );
};

export interface RadioGroupItemProps {
  value: string;
  label?: string;
  tone?: 'yellow' | 'pink' | 'mint' | 'purple';
  disabled?: boolean;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

export const RadioGroupItem: React.FC<RadioGroupItemProps> = ({
  value,
  label,
  tone = 'yellow',
  disabled = false,
  className = '',
}) => {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error('RadioGroupItem must be used inside RadioGroup');

  const isChecked = ctx.value === value;

  const toneBg = {
    yellow: 'bg-[var(--nb-yellow)]',
    pink: 'bg-[var(--nb-pink)]',
    mint: 'bg-[var(--nb-mint)]',
    purple: 'bg-[var(--nb-purple)]',
  };

  return (
    <label
      className={`inline-flex items-center gap-3 cursor-pointer select-none ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      } ${className}`}
    >
      <input
        type="radio"
        name={ctx.name}
        value={value}
        checked={isChecked}
        onChange={() => !disabled && ctx.onChange(value)}
        className="sr-only"
      />
      <div
        className={`w-6 h-6 border-[3px] border-[var(--nb-border)] bg-[var(--nb-surface)] shadow-[2px_2px_0px_0px_var(--nb-shadow)] flex items-center justify-center p-1 transition-all ${
          isChecked ? toneBg[tone] : ''
        }`}
      >
        {isChecked && <div className="w-2.5 h-2.5 bg-black border-[1.5px] border-[var(--nb-border)]" />}
      </div>
      {label && <span className="text-xs font-black uppercase text-[var(--nb-text)]">{label}</span>}
    </label>
  );
};
