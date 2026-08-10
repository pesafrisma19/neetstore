import React from 'react';

export interface CountryOption {
  code: string;
  flag: string;
  name: string;
}

export const COUNTRY_LIST: CountryOption[] = [
  { code: '+62', flag: '🇮🇩', name: 'Indonesia' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+1', flag: '🇺🇸', name: 'USA/Canada' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
];

export interface CountryPhoneInputProps {
  countryCode: string;
  phone: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneChange: (phone: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const CountryPhoneInput: React.FC<CountryPhoneInputProps> = ({
  countryCode,
  phone,
  onCountryCodeChange,
  onPhoneChange,
  label = 'Nomor WhatsApp',
  required = true,
  placeholder = '85220581369',
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="font-black text-xs uppercase tracking-wider text-[var(--nb-text)]">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex gap-2">
        <select
          value={countryCode}
          onChange={(e) => onCountryCodeChange(e.target.value)}
          disabled={disabled}
          className="px-3 py-2.5 bg-[var(--nb-surface)] border-[2.5px] border-[var(--nb-border)] font-bold text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--nb-yellow)] cursor-pointer disabled:opacity-50"
        >
          {COUNTRY_LIST.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code}
            </option>
          ))}
        </select>

        <input
          type="tel"
          placeholder={placeholder}
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          required={required}
          disabled={disabled}
          className="flex-1 px-3 py-2.5 bg-[var(--nb-surface)] border-[2.5px] border-[var(--nb-border)] font-bold text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--nb-yellow)] disabled:opacity-50"
        />
      </div>
    </div>
  );
};
