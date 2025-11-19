import * as React from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { type Round } from '@/types'
import { useCollection, addItem, setItem, deleteItem } from '@/hooks/useFirestore'
import { orderBy } from 'firebase/firestore'
import { Pencil, Trash2, GripVertical } from 'lucide-react'

function SortableItem({ id, label, onEdit, onDelete }: { id: string, label: string, onEdit: () => void, onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex cursor-grab items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <GripVertical size={16} className="text-slate-400" />
        <div className="text-sm font-medium">{label}</div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="secondary" onClick={(e: React.MouseEvent<HTMLButtonElement>)=>{ e.stopPropagation(); onEdit() }} className="h-8 px-2 text-xs"><Pencil size={14} /></Button>
        <Button variant="destructive" onClick={(e: React.MouseEvent<HTMLButtonElement>)=>{ e.stopPropagation(); onDelete() }} className="h-8 px-2 text-xs"><Trash2 size={14} /></Button>
      </div>
    </div>
  )
}

export default function RoundsPage() {
  const { data: rounds = [] } = useCollection<Round>('rounds', [orderBy('order','asc') as any])
  const items: string[] = rounds.map((r: Round) => r.name)
  const [openAdd, setOpenAdd] = React.useState(false)
  const [openRename, setOpenRename] = React.useState<{open: boolean, index: number | null}>({ open: false, index: null })
  const [openDelete, setOpenDelete] = React.useState<{open: boolean, index: number | null}>({ open: false, index: null })
  const [value, setValue] = React.useState('')

  const sensors = useSensors(useSensor(PointerSensor))

  const onDragEnd = async (event: any) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i: string) => i === active.id)
      const newIndex = items.findIndex((i: string) => i === over.id)
      const newOrder: Round[] = arrayMove(rounds, oldIndex, newIndex)
      await Promise.all(newOrder.map((r: Round, idx: number) => setItem('rounds', r.id!, { order: idx })))
    }
  }

  return (
    <PageContainer>
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Rounds</div>
            <Button onClick={() => { setValue(''); setOpenAdd(true) }}>Add Round</Button>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {items.map((label: string, idx: number) => (
                  <div key={label} onDoubleClick={()=>{ setValue(label); setOpenRename({ open: true, index: idx }) }}>
                    <SortableItem id={label} label={label} onEdit={()=>{ setValue(label); setOpenRename({ open: true, index: idx }) }} onDelete={()=> setOpenDelete({ open: true, index: idx })} />
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogHeader><DialogTitle>Create new round</DialogTitle></DialogHeader>
        <div className="mt-2"><Input placeholder="Round name" value={value} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setValue(e.target.value)} /></div>
        <DialogFooter>
          <Button variant="secondary" onClick={()=>setOpenAdd(false)}>Cancel</Button>
          <Button onClick={async ()=>{ if(value.trim()) { await addItem('rounds', { name: value.trim(), order: (rounds.length||0) } as any); } setOpenAdd(false) }}>Create</Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={openRename.open} onOpenChange={(v: boolean)=>setOpenRename({ open: v, index: null })}>
        <DialogHeader><DialogTitle>Rename round</DialogTitle></DialogHeader>
        <div className="mt-2"><Input placeholder="Round name" value={value} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setValue(e.target.value)} /></div>
        <DialogFooter>
          <Button variant="secondary" onClick={()=>setOpenRename({ open: false, index: null })}>Cancel</Button>
          <Button onClick={async ()=>{
            if(value.trim() && openRename.index!==null) {
              const r = rounds[openRename.index]
              if (r?.id) await setItem('rounds', r.id, { name: value.trim() })
            }
            setOpenRename({ open: false, index: null })
          }}>Save</Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={openDelete.open} onOpenChange={(v: boolean)=>setOpenDelete({ open: v, index: null })}>
        <DialogHeader><DialogTitle>Delete round</DialogTitle></DialogHeader>
        <div className="mt-2 text-sm">Are you sure you want to delete this round? This cannot be undone.</div>
        <DialogFooter>
          <Button variant="secondary" onClick={()=>setOpenDelete({ open: false, index: null })}>Cancel</Button>
          <Button variant="destructive" onClick={async ()=>{
            if (openDelete.index!==null) {
              const r = rounds[openDelete.index]
              if (r?.id) {
                await deleteItem('rounds', r.id)
                // Reindex remaining rounds
                const remaining = rounds.filter((x: Round)=> x.id !== r.id)
                await Promise.all(remaining.map((rr: Round, idx: number)=> rr.id ? setItem('rounds', rr.id, { order: idx }) : Promise.resolve()))
              }
            }
            setOpenDelete({ open: false, index: null })
          }}>Delete</Button>
        </DialogFooter>
      </Dialog>
    </PageContainer>
  )
}
