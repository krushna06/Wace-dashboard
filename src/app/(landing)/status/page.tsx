'use client'

import { useEffect, useState } from 'react'
import LandingLayout from '@/components/landing/LandingLayout'
import { getBotStats, type BotStats } from '@/services/api'
import { BOT_NAME } from '@/lib/botConfig'

function formatUptime(ms: number): string {
  const d = Math.floor(ms / 86400000)
  const h = Math.floor((ms % 86400000) / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function fmt(n: number): string {
  return n.toLocaleString()
}

export default function StatusPage() {
  const [stats, setStats] = useState<BotStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBotStats()
      .then((res) => {
        console.log('[BotStats raw]', res)
        // handle possible wrapper
        const data = (res as any).data ?? res
        setStats(data)
      })
      .catch((err) => {
        console.error('[BotStats error]', err?.response?.status, err?.response?.data, err?.message)
        setStats(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const cards = stats ? [
    { label: 'Uptime', value: formatUptime(stats.uptime), icon: 'fa-circle-check', desc: 'Current session' },
    { label: 'Servers', value: fmt(stats.guilds), icon: 'fa-server', desc: 'Active guilds' },
    { label: 'Users', value: fmt(stats.registeredUsers), icon: 'fa-users', desc: 'Registered users' },
    { label: 'Active VCs', value: fmt(stats.activeVCs), icon: 'fa-headphones', desc: 'Right now' },
    { label: 'Songs Played', value: fmt(stats.songsPlayed), icon: 'fa-music', desc: 'All time' },
  ] : []

  return (
    <LandingLayout>
      <div className="main-content">
        <div className="rainbow-contact-area rainbow-section-gapTop-big" style={{ paddingBottom: '8rem' }}>
          <div className="container">

            <div className="section-title text-center" style={{ marginBottom: 48 }}>
              <h4 className="subtitle"><span className="theme-gradient"># Status</span></h4>
              <h2 className="title" style={{ marginBottom: 12 }}>Bot Status</h2>
              <p className="b1" style={{ color: '#BCC3D7', marginBottom: 0 }}>
                Live overview of {BOT_NAME}&apos;s performance and reach.
              </p>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                <div className="loader">
                  <div className="circle"></div>
                  <div className="circle"></div>
                  <div className="circle"></div>
                  <div className="circle"></div>
                  <div className="circle"></div>
                </div>
              </div>
            ) : !stats ? (
              <div style={{ textAlign: 'center', color: '#BCC3D7', padding: '4rem 0' }}>
                <i className="fa-sharp fa-regular fa-triangle-exclamation" style={{ fontSize: 32, marginBottom: 12, display: 'block', color: '#FFC876' }}></i>
                Could not load stats. Please try again later.
              </div>
            ) : (
              <div className="row row--20 justify-content-center">
                {cards.map(({ label, value, icon, desc }) => (
                  <div key={label} className="col-lg-4 col-md-6 col-12" style={{ marginTop: 20 }}>
                    <div style={{ padding: '2rem', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                      <i className={'fa-sharp fa-regular ' + icon} style={{ fontSize: 32, color: '#BCC3D7', display: 'block', marginBottom: 14 }}></i>
                      <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: 4, lineHeight: 1 }}>{value}</div>
                      <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{label}</div>
                      <div style={{ color: '#BCC3D7', fontSize: 13 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </LandingLayout>
  )
}
