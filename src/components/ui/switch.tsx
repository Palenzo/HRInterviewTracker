import * as React from 'react'

export function Switch({ checked, onChange }: { checked: boolean, onChange: (v: boolean)=>void }) {
  return (
    <button aria-label="Toggle" aria-pressed={checked ? 'true' : 'false'} onClick={() => onChange(!checked)} className={`h-6 w-11 rounded-full transition ${checked ? 'bg-blue-600' : 'bg-slate-300'} relative`}>
      <span className={`absolute top-[2px] h-5 w-5 rounded-full bg-white transition ${checked ? 'right-[2px]' : 'left-[2px]'}`} />
    </button>
  )
}
