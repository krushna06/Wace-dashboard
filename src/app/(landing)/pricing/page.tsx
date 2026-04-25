'use client'

import { useState } from 'react'
import { BOT_NAME, BOT_LOGO, INVITE_URL, SITE_MAIL } from '@/lib/botConfig'
import LandingLayout from '@/components/landing/LandingLayout'

const faqs = [
  { q: 'What is the price for the Premium plan?', a: 'The Premium plan costs $3 Per Month.' },
  { q: 'What features are included in the Premium plan?', a: 'Playlists, personalized recommendations, enhanced queue management, audio effects, and priority support.' },
  { q: `What is the price for the ${BOT_NAME} plan?`, a: `The ${BOT_NAME} plan costs $5 Per Month.` },
  { q: 'Is there a limited offer available?', a: `Yes, both the Premium and ${BOT_NAME} plans have a limited offer available.` },
  { q: 'How can I get started with a plan?', a: 'Click the "Get Started" button on the respective plan.' },
  { q: `What is the difference between the Premium and ${BOT_NAME} plans?`, a: `The main difference is the price. Premium is $3/month and ${BOT_NAME} is $5/month.` },
]

export default function PricingPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  return (
    <LandingLayout title="Pricing">
      <div className="main-content">
        <div className="rainbow-pricing-area rainbow-section-gap">
          <div className="container-fluid">
            <div className="wrapper rainbow-section-gap">
              <div className="container">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="section-title text-center" data-sal="slide-up" data-sal-duration="400" data-sal-delay="150">
                      <h4 className="subtitle"><span className="theme-gradient">Pricing</span></h4>
                      <h2 className="title w-600 mb--20">Commence Journey With {BOT_NAME} Premium</h2>
                      <p className="description b1">Choose the perfect plan for you/guild.</p>
                    </div>
                  </div>
                </div>
                <div className="row row--15">
                  {/* Basic */}
                  <div className="col-xl-4 col-lg-6 col-md-6 col-12 mt--30">
                    <div className="rainbow-pricing style-wacebot">
                      <div className="pricing-table-inner">
                        <div className="pricing-top">
                          <div className="pricing-header">
                            <div className="icon"><i className="fa-regular fa-circle-radiation"></i></div>
                            <h4 className="title color-var-one">Basic</h4>
                            <p className="subtitle">For large guilds &amp; users.</p>
                            <div className="pricing"><span className="price-text">Free</span></div>
                          </div>
                          <div className="pricing-body">
                            <div className="features-section">
                              <h6>Features</h6>
                              <ul className="list-style--1">
                                <li><i className="fa-regular fa-circle-check"></i> Ability to create playlists and queue songs.</li>
                                <li><i className="fa-regular fa-circle-check"></i> Personalized recommendations based on listening history.</li>
                                <li><i className="fa-regular fa-circle-check"></i> Enhanced queue management with multiple playlists.</li>
                                <li><i className="fa-regular fa-circle-check"></i> Advanced audio effects and filters.</li>
                                <li><i className="fa-regular fa-circle-check"></i> Priority support for troubleshooting.</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Premium */}
                  <div className="col-xl-4 col-lg-6 col-md-6 col-12 mt--30">
                    <div className="rainbow-pricing style-wacebot active">
                      <div className="pricing-table-inner">
                        <div className="pricing-top">
                          <div className="pricing-header">
                            <div className="icon"><i className="fa-sharp fa-regular fa-flower"></i></div>
                            <h4 className="title color-var-two">Premium</h4>
                            <p className="subtitle">For large guilds &amp; users.</p>
                            <div className="pricing">
                              <span className="price-text">$3</span>
                              <span className="text">/Per Month</span>
                            </div>
                          </div>
                          <div className="pricing-body">
                            <div className="features-section has-show-more">
                              <h6>Features</h6>
                              <ul className="list-style--1 has-show-more-inner-content">
                                <li><i className="fa-regular fa-circle-check"></i> Ability to create playlists and queue songs.</li>
                                <li><i className="fa-regular fa-circle-check"></i> Personalized recommendations based on listening history.</li>
                                <li><i className="fa-regular fa-circle-check"></i> Enhanced queue management with multiple playlists.</li>
                                <li><i className="fa-regular fa-circle-check"></i> Advanced audio effects and filters.</li>
                                <li><i className="fa-regular fa-circle-check"></i> Priority support for troubleshooting.</li>
                              </ul>
                              <div className="rbt-show-more-btn">Show More</div>
                            </div>
                          </div>
                        </div>
                        <div className="pricing-footer">
                          <a className="btn-default" href="https://www.patreon.com/checkout/wacebot?rid=23190205">Get Started</a>
                          <p className="bottom-text">Limited Offer</p>
                        </div>
                      </div>
                      <div className="feature-badge">Best Offer</div>
                    </div>
                  </div>
                  {/* {BOT_NAME} */}
                  <div className="col-xl-4 col-lg-6 col-md-6 col-12 mt--30">
                    <div className="rainbow-pricing style-wacebot">
                      <div className="pricing-table-inner">
                        <div className="pricing-top">
                          <div className="pricing-header">
                            <div className="icon"><i className="fa-sharp fa-regular fa-waveform-lines"></i></div>
                            <h4 className="title color-var-three">{BOT_NAME}</h4>
                            <p className="subtitle">For large guilds &amp; users.</p>
                            <div className="pricing">
                              <span className="price-text">$5</span>
                              <span className="text">/Per Month</span>
                            </div>
                          </div>
                          <div className="pricing-body">
                            <div className="features-section has-show-more">
                              <h6>Features</h6>
                              <ul className="list-style--1 has-show-more-inner-content">
                                <li><i className="fa-regular fa-circle-check"></i> Ability to create playlists and queue songs.</li>
                                <li><i className="fa-regular fa-circle-check"></i> Personalized recommendations based on listening history.</li>
                                <li><i className="fa-regular fa-circle-check"></i> Enhanced queue management with multiple playlists.</li>
                                <li><i className="fa-regular fa-circle-check"></i> Advanced audio effects and filters.</li>
                                <li><i className="fa-regular fa-circle-check"></i> Priority support for troubleshooting.</li>
                              </ul>
                              <div className="rbt-show-more-btn">Show More</div>
                            </div>
                          </div>
                        </div>
                        <div className="pricing-footer">
                          <a className="btn-default btn-border" href="https://www.patreon.com/checkout/wacebot?rid=23190215">Get Started</a>
                          <p className="bottom-text">Limited Offer</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Connect Discord CTA */}
            <div className="rainbow-rn-cta">
              <div className="container">
                <div className="row row--0 align-items-center content-wrapper">
                  <div className="col-lg-8">
                    <div className="inner">
                      <div className="content text-left">
                        <h4 className="title sal-animate" data-sal="slide-up" data-sal-duration="400" data-sal-delay="200">Connect Discord Account</h4>
                        <p className="sal-animate" data-sal="slide-up" data-sal-duration="400" data-sal-delay="300">You&apos;re required to link your Discord account with Patreon account in order to use the plan.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="rainbow-accordion-area rainbow-section-gap">
              <div className="container">
                <div className="row justify-content-between">
                  <div className="col-lg-12 col-xl-4 col-12">
                    <div className="split-inner">
                      <h2 className="title sal-animate" data-sal="slide-up" data-sal-duration="400" data-sal-delay="200">Any questions? we have answers!</h2>
                      <p className="description sal-animate" data-sal="slide-up" data-sal-duration="400" data-sal-delay="300">Don&apos;t find your answer here? just send us a message for any query.</p>
                      <div className="contact-button mt--35 sal-animate" data-sal="slide-up" data-sal-duration="400" data-sal-delay="400">
                        <a className="rainbow-gradient-btn without-shape" href="/contact"><span>Contact us</span></a>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12 col-xl-7 col-12">
                    <div className="rainbow-accordion-style rainbow-accordion-02">
                      {faqs.map(({ q, a }, i) => (
                        <div key={i} className="accordion-item card" style={{ marginBottom: 8 }}>
                          <h2 className="accordion-header card-header" style={{ margin: 0 }}>
                            <button
                              className={`accordion-button${openIndex === i ? '' : ' collapsed'}`}
                              type="button"
                              onClick={() => setOpenIndex(openIndex === i ? null : i)}
                              aria-expanded={openIndex === i}
                            >
                              {q}
                            </button>
                          </h2>
                          {openIndex === i && (
                            <div className="accordion-body card-body">{a}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <br /><br /><br /><br />
    </LandingLayout>
  )
}
