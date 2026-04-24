'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { adminApi, type BlacklistEntry, type PremiumKey, type PremiumUser } from '@/services/api'
import { Shield, Ban, Key, Users, Trash2, Plus, RefreshCw, Copy, Check, Terminal, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

type Tab = 'blacklist' | 'keys' | 'users' | 'commands'

const PLANS = ['daily', 'weekly', 'monthly', 'yearly', 'lifetime'] as const

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [tab, setTab] = useState<Tab>('blacklist')

  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([])
  const [blLoading, setBlLoading] = useState(false)
  const [blId, setBlId] = useState('')
  const [blType, setBlType] = useState<'user' | 'guild'>('user')
  const [blReason, setBlReason] = useState('')
  const [blAdding, setBlAdding] = useState(false)

  const [keys, setKeys] = useState<PremiumKey[]>([])
  const [keysLoading, setKeysLoading] = useState(false)
  const [keyPlan, setKeyPlan] = useState<typeof PLANS[number]>('monthly')
  const [keyAmount, setKeyAmount] = useState(1)
  const [keyGenerating, setKeyGenerating] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const [premiumUsers, setPremiumUsers] = useState<PremiumUser[]>([])
  const [puLoading, setPuLoading] = useState(false)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editPlan, setEditPlan] = useState('')
  const [editExpiry, setEditExpiry] = useState('')

  const [commands, setCommands] = useState<any[]>([])
  const [cmdLoading, setCmdLoading] = useState(false)
  const [cmdSearch, setCmdSearch] = useState('')
  const [togglingKey, setTogglingKey] = useState<string | null>(null)

  const uid = session?.user?.id

  useEffect(() => {
    if (!uid) return
    adminApi.getMe(uid)
      .then(d => setAuthorized(d.authorized))
      .catch(() => setAuthorized(false))
  }, [uid])

  useEffect(() => {
    if (authorized === false) router.replace('/guilds')
  }, [authorized, router])

  useEffect(() => {
    if (!authorized || !uid) return
    if (tab === 'blacklist') loadBlacklist()
    if (tab === 'keys') loadKeys()
    if (tab === 'users') loadPremiumUsers()
    if (tab === 'commands') loadCommands()
  }, [tab, authorized])

  async function loadBlacklist() {
    setBlLoading(true)
    try {
      const res = await adminApi.getBlacklist(uid!)
      const arr = Array.isArray(res) ? res : (res as any).entries ?? (res as any).data ?? []
      setBlacklist(arr)
    } catch { toast.error('Failed to load blacklist') }
    setBlLoading(false)
  }

  async function loadKeys() {
    setKeysLoading(true)
    try {
      const res = await adminApi.getKeys(uid!)
      const arr = Array.isArray(res) ? res : (res as any).keys ?? (res as any).data ?? []
      setKeys(arr)
    } catch { toast.error('Failed to load keys') }
    setKeysLoading(false)
  }

  async function loadPremiumUsers() {
    setPuLoading(true)
    try {
      const res = await adminApi.getPremiumUsers(uid!)
      const arr = Array.isArray(res) ? res : (res as any).users ?? (res as any).data ?? []
      setPremiumUsers(arr)
    } catch { toast.error('Failed to load premium users') }
    setPuLoading(false)
  }

  async function loadCommands() {
    setCmdLoading(true)
    try {
      const res = await adminApi.getCommands(uid!)
      const raw = (res as any).categories ?? res
      const arr = Array.isArray(raw)
        ? raw
        : Object.entries(raw).map(([category, commands]) => ({ category, commands }))
      setCommands(arr as any)
    } catch { toast.error('Failed to load commands') }
    setCmdLoading(false)
  }

  async function handleToggleCommand(key: string, isPremium: boolean) {
    setTogglingKey(key)
    try {
      await adminApi.setCommandPremium(uid!, key, isPremium)
      setCommands(prev => prev.map(cat => ({
        ...cat,
        commands: cat.commands.map((cmd: any) => cmd.key === key ? { ...cmd, isPremium, hasOverride: true } : cmd)
      })))
      toast.success(`Command ${isPremium ? 'set to premium' : 'set to free'}`)
    } catch { toast.error('Failed to update command') }
    setTogglingKey(null)
  }

  async function handleResetCommand(key: string) {
    setTogglingKey(key)
    try {
      await adminApi.resetCommandOverride(uid!, key)
      setCommands(prev => prev.map(cat => ({
        ...cat,
        commands: cat.commands.map((cmd: any) => {
          if (cmd.key !== key) return cmd
          const original = cmd.originalAccessableby === 'premium'
          return { ...cmd, isPremium: original, hasOverride: false }
        })
      })))
      toast.success('Override removed')
    } catch { toast.error('Failed to reset command') }
    setTogglingKey(null)
  }

  async function handleAddBlacklist() {
    if (!blId.trim()) return
    setBlAdding(true)
    try {
      await adminApi.addBlacklist(uid!, { id: blId.trim(), type: blType, reason: blReason || undefined })
      toast.success('Added to blacklist')
      setBlId(''); setBlReason('')
      loadBlacklist()
    } catch { toast.error('Failed to add') }
    setBlAdding(false)
  }

  async function handleRemoveBlacklist(id: string) {
    try {
      await adminApi.removeBlacklist(uid!, id)
      toast.success('Removed')
      setBlacklist(prev => prev.filter(e => e.id !== id))
    } catch { toast.error('Failed to remove') }
  }

  async function handleGenerateKeys() {
    setKeyGenerating(true)
    try {
      const res = await adminApi.generateKeys(uid!, keyPlan, keyAmount)
      const codes: string[] = (res as any).codes ?? []
      toast.success(`Generated ${codes.length} key(s)`)
      loadKeys()
    } catch { toast.error('Failed to generate keys') }
    setKeyGenerating(false)
  }

  async function handleDeleteKey(code: string) {
    try {
      await adminApi.deleteKey(uid!, code)
      toast.success('Key deleted')
      setKeys(prev => prev.filter(k => k.code !== code))
    } catch { toast.error('Failed to delete key') }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  async function handleRevoke(targetId: string) {
    try {
      await adminApi.revokePremium(uid!, targetId)
      toast.success('Premium revoked')
      loadPremiumUsers()
    } catch { toast.error('Failed to revoke') }
  }

  async function handleUpdatePremium(targetId: string) {
    try {
      await adminApi.updatePremium(uid!, targetId, {
        plan: editPlan || undefined,
        expiresAt: editExpiry || undefined,
      })
      toast.success('Updated')
      setEditingUser(null)
      loadPremiumUsers()
    } catch { toast.error('Failed to update') }
  }

  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  const tabBtn = (t: Tab, label: string, Icon: React.ElementType) => (
    <button
      onClick={() => setTab(t)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
      style={tab === t ? { background: 'linear-gradient(135deg,rgba(128,90,245,0.25),rgba(205,153,255,0.15))', border: '1px solid rgba(128,90,245,0.3)' } : {}}
    >
      <Icon className="w-4 h-4" />{label}
    </button>
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-7 h-7 text-purple-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-zinc-400 text-sm">Manage blacklist and premium</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        {tabBtn('blacklist', 'Blacklist', Ban)}
        {tabBtn('keys', 'Premium Keys', Key)}
        {tabBtn('users', 'Premium Users', Users)}
        {tabBtn('commands', 'Commands', Terminal)}
      </div>

      {/* ── Blacklist ── */}
      {tab === 'blacklist' && (
        <div className="space-y-4">
          {/* Add form */}
          <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h2 className="text-white font-semibold">Add to Blacklist</h2>
            <div className="flex gap-2 flex-wrap">
              <input
                className="flex-1 min-w-[160px] px-3 py-2 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                placeholder="User or Guild ID"
                value={blId}
                onChange={e => setBlId(e.target.value)}
              />
              <select
                className="px-3 py-2 rounded-lg text-white text-sm focus:outline-none"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                value={blType}
                onChange={e => setBlType(e.target.value as 'user' | 'guild')}
              >
                <option value="user">User</option>
                <option value="guild">Guild</option>
              </select>
              <input
                className="flex-1 min-w-[160px] px-3 py-2 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                placeholder="Reason (optional)"
                value={blReason}
                onChange={e => setBlReason(e.target.value)}
              />
              <button
                onClick={handleAddBlacklist}
                disabled={blAdding || !blId.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 hover:opacity-80 transition-opacity"
                style={{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-secondary))' }}
              >
                <Plus className="w-4 h-4" />{blAdding ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>

          {/* List */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
              <span className="text-white font-semibold">Entries ({blacklist.length})</span>
              <button onClick={loadBlacklist} className="text-zinc-400 hover:text-white transition-colors"><RefreshCw className="w-4 h-4" /></button>
            </div>
            {blLoading ? (
              <div className="flex justify-center py-8" style={{ background: 'var(--color-surface)' }}>
                <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
              </div>
            ) : blacklist.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-sm" style={{ background: 'var(--color-surface)' }}>No entries</div>
            ) : (
              <div style={{ background: 'var(--color-surface)' }}>
                {blacklist.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white text-sm font-mono">{entry.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${entry.type === 'user' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>{entry.type}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {entry.reason && <span className="text-zinc-400 text-xs">{entry.reason}</span>}
                        {entry.blacklistedBy && <span className="text-zinc-500 text-xs">by {entry.blacklistedBy}</span>}
                        {entry.blacklistedAt && <span className="text-zinc-500 text-xs">{new Date(entry.blacklistedAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <button onClick={() => handleRemoveBlacklist(entry.id)} className="text-red-400 hover:text-red-300 transition-colors p-1 flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Premium Keys ── */}
      {tab === 'keys' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h2 className="text-white font-semibold">Generate Keys</h2>
            <div className="flex gap-2 flex-wrap items-center">
              <select
                className="px-3 py-2 rounded-lg text-white text-sm focus:outline-none"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                value={keyPlan}
                onChange={e => setKeyPlan(e.target.value as typeof PLANS[number])}
              >
                {PLANS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
              <input
                type="number"
                min={1}
                max={100}
                className="w-24 px-3 py-2 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                value={keyAmount}
                onChange={e => setKeyAmount(Math.min(100, Math.max(1, Number(e.target.value))))}
              />
              <button
                onClick={handleGenerateKeys}
                disabled={keyGenerating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 hover:opacity-80 transition-opacity"
                style={{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-secondary))' }}
              >
                <Key className="w-4 h-4" />{keyGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
              <span className="text-white font-semibold">Unused Keys ({keys.length})</span>
              <button onClick={loadKeys} className="text-zinc-400 hover:text-white transition-colors"><RefreshCw className="w-4 h-4" /></button>
            </div>
            {keysLoading ? (
              <div className="flex justify-center py-8" style={{ background: 'var(--color-surface)' }}>
                <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
              </div>
            ) : keys.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-sm" style={{ background: 'var(--color-surface)' }}>No unused keys</div>
            ) : (
              <div style={{ background: 'var(--color-surface)' }}>
                {keys.map(k => (
                  <div key={k.code} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-white text-sm font-mono">{k.code}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">{k.plan}</span>
                      {k.createdAt && <span className="text-xs text-zinc-500">{new Date(k.createdAt).toLocaleDateString()}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => copyCode(k.code)} className="text-zinc-400 hover:text-white transition-colors p-1">
                        {copiedCode === k.code ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleDeleteKey(k.code)} className="text-red-400 hover:text-red-300 transition-colors p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Premium Users ── */}
      {tab === 'users' && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
            <span className="text-white font-semibold">Premium Users ({premiumUsers.length})</span>
            <button onClick={loadPremiumUsers} className="text-zinc-400 hover:text-white transition-colors"><RefreshCw className="w-4 h-4" /></button>
          </div>
          {puLoading ? (
            <div className="flex justify-center py-8" style={{ background: 'var(--color-surface)' }}>
              <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
            </div>
          ) : premiumUsers.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-sm" style={{ background: 'var(--color-surface)' }}>No premium users</div>
          ) : (
            <div style={{ background: 'var(--color-surface)' }}>
              {premiumUsers.map(u => {
                const uid2 = u.id ?? u.userId ?? ''
                const name = u.redeemedBy?.globalName ?? u.redeemedBy?.username ?? uid2
                const expiry = u.expiresAt
                const expiryLabel = !expiry ? null
                  : expiry === 'lifetime' ? 'Lifetime'
                  : isNaN(Number(expiry)) ? String(expiry)
                  : new Date(Number(expiry)).toLocaleDateString()
                const isExpired = u.expired ?? (expiry && expiry !== 'lifetime' && Number(expiry) < Date.now())
                return (
                <div key={uid2} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{name}</p>
                        <p className="text-zinc-500 text-xs font-mono">{uid2}</p>
                      </div>
                      {u.plan && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 flex-shrink-0">{u.plan}</span>}
                      {isExpired && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 flex-shrink-0">Expired</span>}
                      {expiryLabel && <span className="text-xs text-zinc-500 flex-shrink-0">{expiryLabel}</span>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => { setEditingUser(editingUser === uid2 ? null : uid2); setEditPlan(u.plan ?? ''); setEditExpiry('') }}
                        className="text-xs px-3 py-1 rounded-lg text-zinc-300 hover:text-white transition-colors"
                        style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                      >
                        Edit
                      </button>
                      <button onClick={() => handleRevoke(uid2)} className="text-red-400 hover:text-red-300 transition-colors p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {editingUser === uid2 && (
                    <div className="px-4 pb-3 flex gap-2 flex-wrap" style={{ background: 'var(--color-surface-2)' }}>
                      <select
                        className="px-3 py-1.5 rounded-lg text-white text-sm focus:outline-none"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                        value={editPlan}
                        onChange={e => setEditPlan(e.target.value)}
                      >
                        {PLANS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                      </select>
                      <input
                        type="datetime-local"
                        className="px-3 py-1.5 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                        value={editExpiry ? editExpiry.slice(0, 16) : ''}
                        onChange={e => setEditExpiry(e.target.value)}
                      />
                      <button
                        onClick={() => handleUpdatePremium(uid2)}
                        className="px-3 py-1.5 rounded-lg text-white text-sm font-medium hover:opacity-80 transition-opacity"
                        style={{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-secondary))' }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="px-3 py-1.5 rounded-lg text-zinc-400 text-sm hover:text-white transition-colors"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'commands' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              className="flex-1 px-3 py-2 rounded-lg text-white text-sm"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              placeholder="Search commands..."
              value={cmdSearch}
              onChange={e => setCmdSearch(e.target.value)}
            />
            <button onClick={loadCommands} className="text-zinc-400 hover:text-white transition-colors p-2">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {cmdLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
            </div>
          ) : !Array.isArray(commands) || commands.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm">No commands found</div>
          ) : (
            commands.map(cat => {
              const filtered = cat.commands.filter((cmd: any) =>
                !cmdSearch || cmd.name.toLowerCase().includes(cmdSearch.toLowerCase()) || cmd.key.toLowerCase().includes(cmdSearch.toLowerCase())
              )
              if (filtered.length === 0) return null
              return (
                <div key={cat.category} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                  <div className="px-4 py-2" style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">{cat.category}</span>
                  </div>
                  <div style={{ background: 'var(--color-surface)' }}>
                    {filtered.map((cmd: any) => (
                      <div key={cmd.key} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white text-sm font-medium">{cmd.name}</span>
                            <span className="text-zinc-500 text-xs font-mono">{cmd.key}</span>
                            {cmd.isPremium && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">Premium</span>}
                            {cmd.hasOverride && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">Overridden</span>}
                          </div>
                          {cmd.description && <p className="text-zinc-500 text-xs mt-0.5 truncate">{cmd.description}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                          {/* Toggle */}
                          <button
                            onClick={() => handleToggleCommand(cmd.key, !cmd.isPremium)}
                            disabled={togglingKey === cmd.key}
                            className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50"
                            style={{ background: cmd.isPremium ? 'var(--color-primary)' : 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                            title={cmd.isPremium ? 'Set to free' : 'Set to premium'}
                          >
                            <span
                              className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform"
                              style={{ transform: cmd.isPremium ? 'translateX(18px)' : 'translateX(2px)' }}
                            />
                          </button>
                          {/* Reset override */}
                          {cmd.hasOverride && (
                            <button
                              onClick={() => handleResetCommand(cmd.key)}
                              disabled={togglingKey === cmd.key}
                              className="text-zinc-400 hover:text-yellow-400 transition-colors p-1 disabled:opacity-50"
                              title="Reset to original"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
