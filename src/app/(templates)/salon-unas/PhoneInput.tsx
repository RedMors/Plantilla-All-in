'use client'

import { useState } from 'react'

type Country = {
  code: string
  dial: string
  flag: string
  min: number
  max: number
}

const COUNTRIES: Country[] = [
  { code: 'SV', dial: '+503', flag: '🇸🇻', min: 8, max: 8 },
  { code: 'GT', dial: '+502', flag: '🇬🇹', min: 8, max: 8 },
  { code: 'HN', dial: '+504', flag: '🇭🇳', min: 8, max: 8 },
  { code: 'NI', dial: '+505', flag: '🇳🇮', min: 8, max: 8 },
  { code: 'CR', dial: '+506', flag: '🇨🇷', min: 8, max: 8 },
  { code: 'PA', dial: '+507', flag: '🇵🇦', min: 7, max: 8 },
  { code: 'MX', dial: '+52',  flag: '🇲🇽', min: 10, max: 10 },
  { code: 'CO', dial: '+57',  flag: '🇨🇴', min: 10, max: 10 },
  { code: 'AR', dial: '+54',  flag: '🇦🇷', min: 10, max: 10 },
  { code: 'CL', dial: '+56',  flag: '🇨🇱', min: 9,  max: 9  },
  { code: 'PE', dial: '+51',  flag: '🇵🇪', min: 9,  max: 9  },
  { code: 'EC', dial: '+593', flag: '🇪🇨', min: 9,  max: 9  },
  { code: 'VE', dial: '+58',  flag: '🇻🇪', min: 10, max: 10 },
  { code: 'DO', dial: '+1',   flag: '🇩🇴', min: 10, max: 10 },
  { code: 'US', dial: '+1',   flag: '🇺🇸', min: 10, max: 10 },
  { code: 'ES', dial: '+34',  flag: '🇪🇸', min: 9,  max: 9  },
]

const inputClass =
  'flex-1 bg-transparent outline-none text-sm placeholder-[#B0A89E] min-w-0 py-2.5'
const labelClass =
  'block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#B0A89E] mb-1.5'

type Props = {
  name: string
  required?: boolean
  value: string
  onChange: (full: string) => void
  placeholder?: string
}

export default function PhoneInput({ name, required, value, onChange, placeholder }: Props) {
  const [country, setCountry] = useState<Country>(COUNTRIES[0])
  const [local, setLocal] = useState('')

  function handleNumberChange(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, country.max)
    setLocal(digits)
    onChange(digits.length >= country.min ? `${country.dial} ${digits}` : '')
  }

  const isValid = local.length >= country.min
  const hint = `${country.min}${country.min !== country.max ? `–${country.max}` : ''} dígitos`

  return (
    <div>
      <label className={labelClass}>Teléfono / WhatsApp</label>
      <div className="flex items-center border-b border-[#EDE9E3] focus-within:border-[#C4965A] transition-colors gap-2">
        <select
          value={country.dial}
          onChange={e => {
            const selected = COUNTRIES.find(c => `${c.code}${c.dial}` === e.target.value)
            if (selected) { setCountry(selected); setLocal(''); onChange('') }
          }}
          className="bg-transparent outline-none text-sm py-2.5 cursor-pointer shrink-0 text-[#1A1A1A]"
          aria-label="País"
        >
          {COUNTRIES.map(c => (
            <option key={c.code} value={`${c.code}${c.dial}`}>
              {c.flag} {c.dial}
            </option>
          ))}
        </select>
        <span className="text-[#EDE9E3]">|</span>
        <input
          type="tel"
          name={name}
          required={required}
          value={local}
          onChange={e => handleNumberChange(e.target.value)}
          placeholder={placeholder ?? hint}
          className={inputClass}
          style={{ color: '#1A1A1A' }}
          inputMode="numeric"
          pattern={`[0-9]{${country.min},${country.max}}`}
          title={`Ingresa ${hint} para ${country.flag} ${country.dial}`}
        />
        {local.length > 0 && (
          <span className={`text-[10px] shrink-0 pr-1 ${isValid ? 'text-green-500' : 'text-[#B0A89E]'}`}>
            {local.length}/{country.max}
          </span>
        )}
      </div>
      {/* Hidden input con valor combinado para Server Actions */}
      <input type="hidden" name={`${name}_full`} value={local.length >= country.min ? `${country.dial} ${local}` : ''} />
    </div>
  )
}
