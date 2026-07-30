import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({
  children,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <label
      className={`text-xs font-black uppercase tracking-wider text-[var(--nb-text)] flex items-center gap-1 select-none ${className}`}
      {...props}
    >
      <span>{children}</span>
      {required && <span className="text-[#FF4D79] font-black">*</span>}
    </label>
  );
};
