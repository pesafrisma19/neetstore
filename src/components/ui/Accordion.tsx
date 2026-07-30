import React, { createContext, useContext, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionContextType {
  openValues: string[];
  toggleItem: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

export interface AccordionProps {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  className?: string;
  children: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({
  type = 'single',
  collapsible = true,
  defaultValue,
  value: controlledValue,
  onValueChange,
  className = '',
  children,
}) => {
  const initialOpen = Array.isArray(defaultValue)
    ? defaultValue
    : defaultValue
    ? [defaultValue]
    : [];

  const [internalValues, setInternalValues] = useState<string[]>(initialOpen);

  const currentValues = controlledValue !== undefined
    ? (Array.isArray(controlledValue) ? controlledValue : controlledValue ? [controlledValue] : [])
    : internalValues;

  const toggleItem = (val: string) => {
    let next: string[];
    if (type === 'single') {
      if (currentValues.includes(val)) {
        next = collapsible ? [] : [val];
      } else {
        next = [val];
      }
    } else {
      if (currentValues.includes(val)) {
        next = currentValues.filter((v) => v !== val);
      } else {
        next = [...currentValues, val];
      }
    }

    if (controlledValue === undefined) {
      setInternalValues(next);
    }
    if (onValueChange) {
      onValueChange(type === 'single' ? (next[0] || '') : next);
    }
  };

  return (
    <AccordionContext.Provider value={{ openValues: currentValues, toggleItem }}>
      <div
        className={`flex flex-col gap-3 border-[3px] border-[var(--nb-border)] p-3 bg-[var(--nb-surface-alt)] ${className}`}
        style={{ boxShadow: `5px 5px 0px 0px var(--nb-shadow)` }}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

interface AccordionItemContextType {
  value: string;
  disabled?: boolean;
}

const AccordionItemContext = createContext<AccordionItemContextType | undefined>(undefined);

export interface AccordionItemProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  value,
  disabled = false,
  className = '',
  children,
}) => {
  return (
    <AccordionItemContext.Provider value={{ value, disabled }}>
      <div className={`border-[3px] border-[var(--nb-border)] bg-[var(--nb-surface)] overflow-hidden ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
};

export interface AccordionTriggerProps {
  triggerBg?: string;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
  triggerBg,
  className = '',
  children,
  style,
}) => {
  const accordionCtx = useContext(AccordionContext);
  const itemCtx = useContext(AccordionItemContext);

  if (!accordionCtx || !itemCtx) {
    throw new Error('AccordionTrigger must be used within Accordion & AccordionItem');
  }

  const isOpen = accordionCtx.openValues.includes(itemCtx.value);

  const customBgStyle = triggerBg ? { backgroundColor: triggerBg, ...style } : style;

  return (
    <button
      type="button"
      onClick={() => !itemCtx.disabled && accordionCtx.toggleItem(itemCtx.value)}
      style={customBgStyle}
      className={`w-full flex items-center justify-between p-4 font-black text-left text-[var(--nb-text)] transition-colors border-b-0 hover:opacity-90 select-none ${
        isOpen ? 'border-b-[3px] border-[var(--nb-border)]' : ''
      } ${!triggerBg ? 'bg-[var(--nb-surface-alt)]' : ''} ${className}`}
    >
      <span className="flex items-center gap-2">{children}</span>
      <ChevronDown
        className={`w-5 h-5 transition-transform duration-200 stroke-[3] ${
          isOpen ? 'rotate-180' : ''
        }`}
      />
    </button>
  );
};

export interface AccordionContentProps {
  className?: string;
  children: React.ReactNode;
}

export const AccordionContent: React.FC<AccordionContentProps> = ({
  className = '',
  children,
}) => {
  const accordionCtx = useContext(AccordionContext);
  const itemCtx = useContext(AccordionItemContext);

  if (!accordionCtx || !itemCtx) {
    throw new Error('AccordionContent must be used within Accordion & AccordionItem');
  }

  const isOpen = accordionCtx.openValues.includes(itemCtx.value);

  if (!isOpen) return null;

  return (
    <div className={`p-4 bg-[var(--nb-surface)] font-medium text-[var(--nb-text)] text-sm leading-relaxed ${className}`}>
      {children}
    </div>
  );
};
