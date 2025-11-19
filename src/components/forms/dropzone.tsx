import * as React from 'react'
import { cn } from '@/utils/cn'

export function Dropzone({ onFiles }: { onFiles: (files: FileList) => void }) {
  const [drag, setDrag] = React.useState(false)
  return (
    <div
      className={cn('glass flex h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center', drag ? 'border-blue-400' : 'border-slate-300')}
      onDragOver={(e)=>{e.preventDefault(); setDrag(true)}}
      onDragLeave={()=>setDrag(false)}
      onDrop={(e)=>{e.preventDefault(); setDrag(false); if(e.dataTransfer.files?.length) onFiles(e.dataTransfer.files)}}
      onClick={() => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.csv,.xlsx,.xls'
        input.onchange = () => { if (input.files) onFiles(input.files) }
        input.click()
      }}
      role="button"
      aria-label="Upload files"
    >
      <div className="text-slate-800">Drag & drop your sheet here</div>
      <div className="text-sm text-slate-500">CSV or XLSX. Click to browse.</div>
    </div>
  )
}
