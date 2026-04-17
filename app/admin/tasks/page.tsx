'use client'

import { useState, useEffect, useMemo } from 'react'
import { Circle, CheckCircle, CheckCircle2, PauseCircle, Trash2, Plus } from 'lucide-react'

type Status = 'open' | 'closed' | 'validated' | 'parked'

type Task = {
  id: string
  label: string
  category: string
  status: Status
  done: boolean
  priority: string | null
  notes: string | null
  completed_at: string | null
  sort_order: number | null
}

const PRIORITIES = ['low', 'normal', 'high', 'critical']
const FILTERS = ['all', 'open', 'closed', 'validated', 'parked'] as const
type Filter = typeof FILTERS[number]

const ALLOWED_NEXT: Record<Status, Status[]> = {
  open: ['closed', 'parked'],
  closed: ['validated'],
  validated: [],
  parked: ['open'],
}

function StatusIcon({ status }: { status: Status }) {
  if (status === 'open')      return <Circle size={16} className="text-[#ccc]" />
  if (status === 'closed')    return <CheckCircle size={16} className="text-[#666]" />
  if (status === 'validated') return <CheckCircle2 size={16} className="text-green-500" />
  return <PauseCircle size={16} className="text-amber-500" />
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [newLabel, setNewLabel] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newPriority, setNewPriority] = useState('normal')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetch('/api/admin/tasks')
      .then(r => r.ok ? r.json() : { tasks: [] })
      .then(d => { setTasks(d.tasks || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    const set = new Set(tasks.map(t => t.category).filter(Boolean))
    return Array.from(set)
  }, [tasks])

  const filtered = useMemo(() => {
    if (filter === 'all') return tasks
    return tasks.filter(t => t.status === filter)
  }, [tasks, filter])

  const grouped = useMemo(() => {
    const map: Record<string, Task[]> = {}
    for (const t of filtered) {
      const key = t.category || 'Uncategorized'
      if (!map[key]) map[key] = []
      map[key].push(t)
    }
    return map
  }, [filtered])

  const active = tasks.filter(t => t.status !== 'parked')
  const total = active.length
  const doneCount = active.filter(t => t.status === 'closed' || t.status === 'validated').length
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0

  async function transition(task: Task, next: Status) {
    const prev = task
    const now = new Date().toISOString()
    setTasks(ts => ts.map(t => t.id === task.id ? {
      ...t,
      status: next,
      done: next === 'closed' || next === 'validated',
      completed_at: next === 'closed' && !t.completed_at ? now
                  : next === 'open' ? null
                  : t.completed_at,
    } : t))
    try {
      const res = await fetch(`/api/admin/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setTasks(ts => ts.map(t => t.id === task.id ? prev : t))
    }
  }

  async function deleteTask(task: Task) {
    if (!confirm(`Delete "${task.label}"?`)) return
    const prev = tasks
    setTasks(ts => ts.filter(t => t.id !== task.id))
    try {
      const res = await fetch(`/api/admin/tasks/${task.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
    } catch {
      setTasks(prev)
    }
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newLabel.trim() || !newCategory.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newLabel.trim(), category: newCategory.trim(), priority: newPriority }),
      })
      const data = await res.json()
      if (data.task) {
        setTasks(ts => [...ts, data.task])
        setNewLabel('')
      }
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-6 max-w-[1100px]">
      {/* Progress */}
      <div className="bg-white border border-[#e8e8e8] rounded-xl p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#999] mb-1">Progress</div>
            <div className="text-[20px] font-semibold text-[#111]">{doneCount} / {total} <span className="text-[13px] font-normal text-[#999]">tasks done</span></div>
          </div>
          <div className="text-[24px] font-semibold text-[#111]">{pct}%</div>
        </div>
        <div className="w-full h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
          <div className="h-full bg-[#111] rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* New task */}
      <form onSubmit={createTask} className="bg-white border border-[#e8e8e8] rounded-xl p-4 mb-5 flex flex-wrap gap-2 items-center">
        <input
          type="text"
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          placeholder="New task label"
          className="flex-1 min-w-[200px] px-3 py-2 text-[13px] border border-[#e8e8e8] rounded-md text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#111]"
        />
        <input
          type="text"
          list="categories"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          placeholder="Category"
          className="w-[180px] px-3 py-2 text-[13px] border border-[#e8e8e8] rounded-md text-[#111] placeholder:text-[#bbb] focus:outline-none focus:border-[#111]"
        />
        <datalist id="categories">
          {categories.map(c => <option key={c} value={c} />)}
        </datalist>
        <select
          value={newPriority}
          onChange={e => setNewPriority(e.target.value)}
          className="px-3 py-2 text-[13px] border border-[#e8e8e8] rounded-md text-[#111] focus:outline-none focus:border-[#111]"
        >
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button
          type="submit"
          disabled={creating || !newLabel.trim() || !newCategory.trim()}
          className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-white bg-[#111] rounded-md hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={14} /> Add task
        </button>
      </form>

      {/* Filter */}
      <div className="flex items-center gap-1 mb-4">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-[12px] rounded-md transition-colors capitalize ${
              filter === f ? 'bg-[#111] text-white' : 'text-[#666] hover:bg-[#f0f0f0]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Tasks grouped by category */}
      {loading ? (
        <div className="text-[13px] text-[#999]">Loading…</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="bg-white border border-[#e8e8e8] rounded-xl p-8 text-center text-[13px] text-[#999]">No tasks.</div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([cat, items]) => {
            const groupActive = items.filter(i => i.status !== 'parked')
            const groupDone = groupActive.filter(i => i.status === 'closed' || i.status === 'validated').length
            return (
            <div key={cat} className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[#e8e8e8] bg-[#fafafa] flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#666]">{cat}</span>
                <span className="text-[11px] text-[#999]">{groupDone}/{groupActive.length}</span>
              </div>
              <div className="divide-y divide-[#f0f0f0]">
                {items.map(task => {
                  const nexts = ALLOWED_NEXT[task.status]
                  const dim = task.status === 'closed' || task.status === 'validated' || task.status === 'parked'
                  return (
                  <div key={task.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#fafafa] group">
                    <span className="flex-shrink-0"><StatusIcon status={task.status} /></span>
                    <span className={`flex-1 text-[13px] ${dim ? 'text-[#aaa]' : 'text-[#111]'} ${task.status === 'closed' || task.status === 'validated' ? 'line-through' : ''}`}>
                      {task.label}
                    </span>
                    {task.priority && task.priority !== 'normal' && (
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        task.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        task.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                        'bg-[#f0f0f0] text-[#666]'
                      }`}>
                        {task.priority}
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      {nexts.includes('closed') && (
                        <button onClick={() => transition(task, 'closed')} className="text-[11px] px-2 py-1 rounded bg-[#f0f0f0] text-[#444] hover:bg-[#111] hover:text-white transition-colors">Close</button>
                      )}
                      {nexts.includes('validated') && (
                        <button onClick={() => transition(task, 'validated')} className="text-[11px] px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-600 hover:text-white transition-colors">Validate</button>
                      )}
                      {nexts.includes('parked') && (
                        <button onClick={() => transition(task, 'parked')} className="text-[11px] px-2 py-1 rounded text-[#888] hover:bg-amber-50 hover:text-amber-700 transition-colors">Park</button>
                      )}
                      {nexts.includes('open') && (
                        <button onClick={() => transition(task, 'open')} className="text-[11px] px-2 py-1 rounded text-[#888] hover:bg-[#f0f0f0] hover:text-[#111] transition-colors">Unpark</button>
                      )}
                    </div>
                    <button
                      onClick={() => deleteTask(task)}
                      className="opacity-0 group-hover:opacity-100 text-[#bbb] hover:text-red-500 transition-all p-1"
                      title="Delete task"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )})}
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  )
}
