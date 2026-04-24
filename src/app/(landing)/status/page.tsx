'use client'

import LandingLayout from '@/components/landing/LandingLayout'

const stats = [
  { label: 'Uptime', value: '99.9%', icon: 'fa-circle-check', desc: 'Last 30 days' },
  { label: 'Servers', value: '10,482', icon: 'fa-server', desc: 'Active guilds' },
  { label: 'Users', value: '84,310', icon: 'fa-users', desc: 'Registered users' },
  { label: 'Active VCs', value: '1,204', icon: 'fa-headphones', desc: 'Right now' },
  { label: 'Songs Played', value: '2,841,990', icon: 'fa-music', desc: 'All time' },
]

export default function StatusPage() {
  return (
    <LandingLayout>
      <div className="main-content">
        <div className="rainbow-contact-area rainbow-section-gapTop-big" style={{ paddingBottom: '21rem' }}>
          <div className="container">

            {/* Header */}
            <div className="section-title text-center" style={{ marginBottom: 48 }}>
              <h4 className="subtitle"><span className="theme-gradient"># Status</span></h4>
              <h2 className="title" style={{ marginBottom: 12 }}>Bot Status</h2>
              <p className="b1" style={{ color: '#BCC3D7', marginBottom: 0 }}>
                Live overview of Wace&apos;s performance and reach.
              </p>
            </div>

            {/* Stats grid */}
            <div className="row row--20 justify-content-center">
              {stats.map(({ label, value, icon, desc }) => (
                <div key={label} className="col-lg-4 col-md-6 col-12" style={{ marginTop: 20 }}>
                  <div style={{ padding: '2rem', borderRadius: 16, background: '#16181E', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
                    <i className={'fa-sharp fa-regular ' + icon} style={{ fontSize: 32, color: '#BCC3D7', display: 'block', marginBottom: 14 }}></i>
                    <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: 4, lineHeight: 1 }}>{value}</div>
                    <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{label}</div>
                    <div style={{ color: '#BCC3D7', fontSize: 13 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </LandingLayout>
  )
}
