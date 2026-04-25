'use client'
import LandingLayout from '@/components/landing/LandingLayout'
import RotatingText from '@/components/landing/RotatingText'
import { BOT_NAME, BOT_LOGO, INVITE_URL } from '@/lib/botConfig'
export default function Home() {
  return (
    <LandingLayout>
      {/* Hero */}
      <div className="slider-area slider-style-1 variation-default slider-bg-image bg-banner1 slider-bg-shape" data-black-overlay="1">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-12">
              <div className="inner text-center mt--140">
                <br /><br /><br /><br /><br /><br /><br /><br />
                <h1 className="title display-one">Play music from
                  <br />
                  <span className="header-caption">
                    <RotatingText />
                  </span>
                </h1>
                <p className="description">Bring rhythm and melody to your community
                  <br /> with its versatility and powerful features.</p>
              </div>
            </div>
          </div>
        </div>
        <br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      </div>

      {/* Features Tabs */}
      <div className="rainbow-service-area rainbow-section-gap">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title text-center pb--60">
                <h4 className="subtitle"><span className="theme-gradient"># Features Overview</span></h4>
                <h2 className="title mb--0">View the key features.</h2>
              </div>
            </div>
          </div>
          <div className="row row--30 align-items-center">
            <div className="col-lg-12">
              <div className="rainbow-default-tab style-three generator-tab-defalt">
                <ul className="nav nav-tabs tab-button" role="tablist">
                  <li className="nav-item tabs__tab" role="presentation">
                    <button className="nav-link rainbow-gradient-btn without-shape-circle" id="premium-system-tab" data-bs-toggle="tab" data-bs-target="#premium-system" type="button" aria-controls="premium-system" aria-selected="false">
                      <span className="generator-icon">Premium System</span><span className="border-bottom-style"></span>
                    </button>
                  </li>
                  <li className="nav-item tabs__tab" role="presentation">
                    <button className="nav-link rainbow-gradient-btn without-shape-circle active" id="setup-system-tab" data-bs-toggle="tab" data-bs-target="#setup-system" type="button" aria-controls="setup-system" aria-selected="true">
                      <span className="generator-icon">Setup System</span><span className="border-bottom-style"></span>
                    </button>
                  </li>
                  <li className="nav-item tabs__tab" role="presentation">
                    <button className="nav-link rainbow-gradient-btn without-shape-circle" id="lock-system-tab" data-bs-toggle="tab" data-bs-target="#lock-system" type="button" aria-controls="lock-system" aria-selected="false">
                      <span className="generator-icon">24/7</span><span className="border-bottom-style"></span>
                    </button>
                  </li>
                  <li className="nav-item tabs__tab" role="presentation">
                    <button className="nav-link rainbow-gradient-btn without-shape-circle" id="playlist-tab" data-bs-toggle="tab" data-bs-target="#playlist" type="button" aria-controls="playlist" aria-selected="false">
                      <span className="generator-icon">Playlist</span><span className="border-bottom-style"></span>
                    </button>
                  </li>
                </ul>
                <div className="rainbow-tab-content tab-content">
                  <div className="tab-pane fade" id="premium-system" role="tabpanel">
                    <div className="inner"><div className="row">
                      <div className="col-xl-6">
                        <div className="section-title">
                          <h2 className="title">Premium commands for our premium users.</h2>
                          <div className="features-section"><ul className="list-style--1">
                            <li><i className="fa-regular fa-circle-check"></i>Premium Features</li>
                            <li><i className="fa-regular fa-circle-check"></i>Premium Commands</li>
                            <li><i className="fa-regular fa-circle-check"></i>Quick Support</li>
                          </ul></div>
                          <div className="read-more"><a className="btn-default color-blacked" href={INVITE_URL}>Start Exploring Now</a></div>
                        </div>
                      </div>
                      <div className="col-xl-6 mt_md--30 mt_sm--30">
                        <div className="export-img"><div className="inner-without-padding"><div className="export-img img-bg-shape">
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <img src="/landing/images/features/guildlist.png" alt="feature preview" style={{ display: 'block', width: '100%' }} />
                            <img src="/landing/images/features/profile.png" alt="feature preview" className="overlay-image" style={{ position: 'absolute', top: 120, left: -170, width: '80%', borderRadius: 2 }} />
                          </div>
                          <br /><br /><br /><br />
                        </div></div></div>
                      </div>
                    </div></div>
                  </div>
                  <div className="tab-pane fade show active" id="setup-system" role="tabpanel">
                    <div className="inner"><div className="row">
                      <div className="col-xl-6">
                        <div className="section-title">
                          <h2 className="title">A dedicated channel only for {BOT_NAME}.</h2>
                          <div className="features-section"><ul className="list-style--1">
                            <li><i className="fa-regular fa-circle-check"></i>Just enter the song name/link.</li>
                            <li><i className="fa-regular fa-circle-check"></i>No need of slash or prefix.</li>
                            <li><i className="fa-regular fa-circle-check"></i>Button controls.</li>
                            <li><i className="fa-regular fa-circle-check"></i>Queue list.</li>
                          </ul></div>
                          <div className="read-more"><a className="btn-default color-blacked" href={INVITE_URL}>Start Exploring Now</a></div>
                        </div>
                      </div>
                      <div className="col-xl-6 mt_md--30 mt_sm--30">
                        <div className="export-img"><div className="inner-without-padding"><div className="export-img img-bg-shape">
                          <img src="/landing/images/features/setup.png" alt="feature preview" />
                        </div></div></div>
                      </div>
                    </div></div>
                  </div>
                  <div className="tab-pane fade" id="lock-system" role="tabpanel">
                    <div className="inner"><div className="row">
                      <div className="col-xl-6">
                        <div className="section-title">
                          <h2 className="title">Always with you, 24/7.</h2>
                          <div className="features-section"><ul className="list-style--1">
                            <li><i className="fa-regular fa-circle-check"></i>Can play music 24/7.</li>
                            <li><i className="fa-regular fa-circle-check"></i>Autojoins if kicked.</li>
                          </ul></div>
                          <div className="read-more"><a className="btn-default color-blacked" href={INVITE_URL}>Start Exploring Now</a></div>
                        </div>
                      </div>
                      <div className="col-xl-6 mt_md--30 mt_sm--30">
                        <div className="export-img"><div className="inner-without-padding"><div className="export-img img-bg-shape">
                          <img src="/landing/images/features/channel.png" alt="feature preview" />
                        </div></div></div>
                      </div>
                    </div></div>
                  </div>
                  <div className="tab-pane fade" id="playlist" role="tabpanel">
                    <div className="inner"><div className="row">
                      <div className="col-xl-6">
                        <div className="section-title">
                          <h2 className="title">Import youtube/spotify/etc playlists and save them.</h2>
                          <div className="features-section"><ul className="list-style--1">
                            <li><i className="fa-regular fa-circle-check"></i>Playlist save</li>
                            <li><i className="fa-regular fa-circle-check"></i>Playlist import from various sources.</li>
                            <li><i className="fa-regular fa-circle-check"></i>Set playlist public/private.</li>
                            <li><i className="fa-regular fa-circle-check"></i>Save the current queue as a playlist.</li>
                          </ul></div>
                          <div className="read-more"><a className="btn-default color-blacked" href={INVITE_URL}>Start Exploring Now</a></div>
                        </div>
                      </div>
                      <div className="col-xl-6 mt_md--30 mt_sm--30">
                        <div className="export-img"><div className="inner-without-padding">
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <img src="/landing/images/features/pleditor.png" alt="feature preview" style={{ display: 'block', width: '100%' }} />
                            <img src="/landing/images/features/pladd.png" alt="feature preview" style={{ position: 'absolute', top: '80%', left: '50%', transform: 'translateX(-50%)', width: '80%', borderRadius: 2 }} />
                          </div>
                        </div></div>
                      </div>
                    </div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why BOT_NAME grid */}
      <div className="rainbow-service-area rainbow-section-gap">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title text-center pb--60">
                <h4 className="subtitle"><span className="theme-gradient"># Why {BOT_NAME}</span></h4>
                <h2 className="title mb--0">Everything you need in one bot.</h2>
              </div>
            </div>
          </div>
          <div className="row row--15">
            {[
              { icon: 'fa-music', title: 'High Quality Audio', desc: 'Crystal clear audio streaming with no lag or buffering, powered by Lavalink nodes.' },
              { icon: 'fa-list-music', title: 'Smart Queue', desc: 'Manage your queue with ease - skip, shuffle, insert, remove and save as a playlist.' },
              { icon: 'fa-waveform-lines', title: 'Audio Filters', desc: 'Bassboost, nightcore, vaporwave, 3D and 20+ more filters to enhance your listening.' },
              { icon: 'fa-clock', title: '24/7 Mode', desc: `Keep the music going around the clock. ${BOT_NAME} auto-rejoins if kicked from the channel.` },
              { icon: 'fa-chart-bar', title: 'Detailed Stats', desc: 'Track songs played, top users, top tracks and more with the built-in stats dashboard.' },
              { icon: 'fa-star', title: 'Premium System', desc: 'Unlock exclusive commands and features with affordable premium plans for users and guilds.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="col-lg-4 col-md-6 col-12 mt--30">
                <div style={{ height: '100%', padding: '2rem', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                  <div style={{ marginBottom: 16 }}>
                    <i className={'fa-sharp fa-regular ' + icon} style={{ fontSize: 32, background: 'linear-gradient(135deg,#805AF5,#CD99FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}></i>
                  </div>
                  <div className="content">
                    <h4 className="title" style={{ color: '#fff', marginBottom: 8 }}>{title}</h4>
                    <p style={{ color: '#BCC3D7', margin: 0, fontSize: 14, lineHeight: 1.7 }}>{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platforms */}
      <div className="rainbow-section-gap">
        <div className="container">
          <div className="section-title text-center pb--40">
            <h4 className="subtitle"><span className="theme-gradient"># Sources</span></h4>
            <h2 className="title mb--0">Play from anywhere.</h2>
          </div>
          <div className="row justify-content-center align-items-center row--20">
            {[
              { icon: 'fa-sharp fa-regular fa-link', label: 'Direct Links', color: '#805AF5' },
              { icon: 'fa-sharp fa-regular fa-radio', label: 'Radio', color: '#CD99FF' },
              { icon: 'fa-sharp fa-regular fa-file-audio', label: 'Files', color: '#A238FF' },
              { icon: 'fa-sharp fa-regular fa-list-music', label: 'Playlists', color: '#805AF5' },
              { icon: 'fa-sharp fa-regular fa-magnifying-glass', label: 'Search', color: '#CD99FF' },
              { icon: 'fa-sharp fa-regular fa-waveform-lines', label: 'Filters', color: '#A238FF' },
            ].map(({ icon, label }) => (
              <div key={label} className="col-lg-2 col-md-3 col-4 mt--20">
                <div className="text-center" style={{ padding: '1.5rem 1rem', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <i className={icon} style={{ fontSize: 36, color: '#BCC3D7', display: 'block', marginBottom: 10 }}></i>
                  <p style={{ color: '#BCC3D7', margin: 0, fontSize: 13 }}>{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integration */}
      <div className="rainbow-collobration-area rainbow-section-gap-big">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title text-center">
                <h4 className="subtitle"><span className="theme-gradient"># Integration</span></h4>
                <h2 className="title mb--20">Multiple Integrations</h2>
                <a className="btn-default btn-large color-blacked" href={INVITE_URL}>Try It Now</a>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12 mt--60" style={{ position: 'relative', width: '100%', textAlign: 'center' }}>
              <div className="collaboration-image-section" style={{ position: 'relative' }}>
                <img src="/landing/images/split-2.png" alt="collaboration-image" style={{ width: '100%', height: 'auto' }} />
                <div className="logo-section" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                  <img src={BOT_LOGO} alt={`${BOT_NAME} Logo`} className="small-logo" style={{ width: 200, height: 'auto', borderRadius: 50, boxShadow: '0 0 70px rgba(238, 158, 247, 0.7)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="rainbow-rn-cta">
        <div className="container">
          <div className="row row--0 align-items-center content-wrapper">
            <div className="col-lg-8">
              <div className="inner">
                <div className="content text-left">
                  <h4 className="title sal-animate">Join the {BOT_NAME} Premium Team</h4>
                  <p className="sal-animate">Meet our loads of premium users/guilds who are currently satisfied by the premium bot.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="right-content">
                <div className="call-to-btn text-start text-lg-end sal-animate">
                  <div className="team-image"><img src="/landing/images/team-01.png" alt="Group Image" /></div>
                  <a className="btn-default" href="https://discord.gg/wacebot">Get a trial today.</a>
                </div>
              </div>
            </div>
            <div className="bg-shape"><img src="/landing/images/bg-shape-01.png" alt="BG Shape" /></div>
          </div>
        </div>
      </div>
      <br /><br /><br /><br />
    </LandingLayout>
  )
}
