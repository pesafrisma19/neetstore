import React, { createContext, useContext, useState } from 'react';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (val: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  className = '',
  children,
}) => {
  const [internalTab, setInternalTab] = useState(defaultValue);

  const activeTab = value !== undefined ? value : internalTab;

  const setActiveTab = (val: string) => {
    if (value === undefined) {
      setInternalTab(val);
    }
    if (onValueChange) {
      onValueChange(val);
    }
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`flex flex-col gap-4 ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  const randomTone = React.useMemo(() => {
    const tones = ['yellow', 'pink', 'mint', 'purple', 'cyan'] as const;
    return tones[Math.floor(Math.random() * tones.length)];
  }, []);

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-2 p-1.5 bg-[var(--nb-surface-alt)] border-[length:var(--nb-border-width)] border-[var(--nb-border)] rounded-[var(--nb-radius-element)] ${className}`}
      style={{
        boxShadow: `var(--nb-shadow-x) var(--nb-shadow-y) var(--nb-shadow-blur) var(--nb-shadow-spread) var(--nb-shadow-${randomTone})`,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  activeBg?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  activeBg,
  children,
  className = '',
  ...props
}) => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsTrigger must be used inside Tabs');

  const isActive = ctx.activeTab === value;

  const randomTheme = React.useMemo(() => {
    const tones = ['yellow', 'pink', 'mint', 'purple', 'cyan'] as const;
    return tones[Math.floor(Math.random() * tones.length)];
  }, []);

  const bgClasses: Record<string, string> = {
    yellow: 'bg-[var(--nb-yellow)]',
    pink: 'bg-[var(--nb-pink)]',
    mint: 'bg-[var(--nb-mint)]',
    purple: 'bg-[var(--nb-purple)]',
    cyan: 'bg-[var(--nb-cyan)]',
  };

  const activeBgClass = bgClasses[randomTheme] || 'bg-[var(--nb-yellow)]';

  return (
    <button
      type="button"
      onClick={() => ctx.setActiveTab(value)}
      className={`px-4 py-2 text-xs md:text-sm font-black uppercase tracking-wider border-[length:var(--nb-border-width-sm)] rounded-[var(--nb-radius-element)] transition-all cursor-pointer select-none ${
        isActive
          ? `${activeBgClass} text-[var(--nb-text-on-accent)] border-[var(--nb-border)] -translate-y-[1px]`
          : 'border-transparent text-[var(--nb-text-muted)] hover:text-[var(--nb-text)] hover:border-[var(--nb-border)]/30'
      } ${className}`}
      style={
        isActive
          ? {
              boxShadow: `var(--nb-shadow-sm-x) var(--nb-shadow-sm-y) var(--nb-shadow-blur) var(--nb-shadow-spread) var(--nb-shadow-${randomTheme})`,
            }
          : {}
      }
      {...props}
    >
      {children}
    </button>
  );
};

export interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  className = '',
  children,
}) => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsContent must be used inside Tabs');

  if (ctx.activeTab !== value) return null;

  return <div className={`w-full ${className}`}>{children}</div>;
};
