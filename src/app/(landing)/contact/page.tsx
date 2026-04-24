'use client'

import LandingLayout from '@/components/landing/LandingLayout'
import { useState } from 'react'

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const form = e.currentTarget
    const data = {
      firstName: (form.elements.namedItem('firstname1') as HTMLInputElement).value,
      lastName: (form.elements.namedItem('lastname1') as HTMLInputElement).value,
      discordUsername: (form.elements.namedItem('username1') as HTMLInputElement).value,
      email: (form.elements.namedItem('email1') as HTMLInputElement).value,
      description: (form.elements.namedItem('bio1') as HTMLTextAreaElement).value,
    }

    const webhookUrl = 'https://discord.com/api/webhooks/1248159215646933033/sQxCVXfpZORj6BELPRY9FxpgwAeW-isGkhi8sN4qUwS2vLGwGMYVxTeDW82HsUTXCUaM'
    const payload = {
      content: '<@853620650592567304>',
      embeds: [{
        title: 'New Contact Form Submission:',
        color: 3092790,
        fields: [
          { name: 'First Name', value: data.firstName, inline: true },
          { name: 'Last Name', value: data.lastName, inline: true },
          { name: 'Discord Username', value: data.discordUsername || 'Not provided', inline: true },
          { name: 'Email', value: data.email || 'Not provided', inline: true },
          { name: 'Description', value: data.description, inline: false },
        ],
      }],
    }

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <LandingLayout title="Contact">
      <div className="main-content">
        <div className="rainbow-contact-area rainbow-section-gapTop-big">
          <div className="container">
            <div className="row mt--40 row--15">
              <div className="col-lg-8">
                <div className="contact-details-box">
                  <h3 className="title">Contact</h3>
                  <div className="profile-details-tab">
                    <div className="tab-content">
                      <div className="tab-pane fade active show" role="tabpanel">
                        <form onSubmit={handleSubmit} className="rbt-profile-row rbt-default-form row row--15">
                          <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                            <div className="form-group">
                              <label htmlFor="firstname1">First Name</label>
                              <input id="firstname1" name="firstname1" type="text" placeholder="First name" required />
                            </div>
                          </div>
                          <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                            <div className="form-group">
                              <label htmlFor="lastname1">Last Name</label>
                              <input id="lastname1" name="lastname1" type="text" placeholder="Last name" required />
                            </div>
                          </div>
                          <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                            <div className="form-group">
                              <label htmlFor="username1">Discord Username</label>
                              <input id="username1" name="username1" type="text" placeholder="username" />
                            </div>
                          </div>
                          <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                            <div className="form-group">
                              <label htmlFor="email1">Email</label>
                              <input id="email1" name="email1" type="email" placeholder="example@example.com" />
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="form-group">
                              <label htmlFor="bio1">How can we help you?</label>
                              <textarea id="bio1" name="bio1" cols={20} rows={5} required></textarea>
                            </div>
                          </div>
                          <div className="col-12 mt--20">
                            <div className="form-group mb--0">
                              <button type="submit" className="btn btn-default" disabled={status === 'sending'}>
                                {status === 'sending' ? 'Sending...' : status === 'sent' ? 'Sent!' : 'Send Message'}
                              </button>
                              {status === 'error' && <p style={{ color: 'red', marginTop: 8 }}>Failed to send. Please try again.</p>}
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 mt_md--30 mt_sm--30">
                <div className="rainbow-address">
                  <div className="icon"><i className="fa-sharp fa-regular fa-envelope"></i></div>
                  <div className="inner">
                    <h4 className="title">Our Email Address</h4>
                    <p className="b2"><a href="mailto:support@wace.live">support@wace.live</a></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <br /><br /><br /><br /><br /><br /><br />
    </LandingLayout>
  )
}
