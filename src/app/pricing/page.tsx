import LandingLayout from '@/components/landing/LandingLayout'

export default function PricingPage() {
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
                      <h2 className="title w-600 mb--20">Commence Journey With Wace Premium</h2>
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
                  {/* Wace */}
                  <div className="col-xl-4 col-lg-6 col-md-6 col-12 mt--30">
                    <div className="rainbow-pricing style-wacebot">
                      <div className="pricing-table-inner">
                        <div className="pricing-top">
                          <div className="pricing-header">
                            <div className="icon"><i className="fa-sharp fa-regular fa-waveform-lines"></i></div>
                            <h4 className="title color-var-three">Wace</h4>
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
                    <div className="rainbow-accordion-style rainbow-accordion-02 accordion">
                      <div className="accordion" id="accordionExampleb">
                        {[
                          { id: 'Five', q: 'What is the price for the Premium plan?', a: 'The Premium plan costs $3 Per Month.', open: true },
                          { id: 'Six', q: 'What features are included in the Premium plan?', a: 'Playlists, personalized recommendations, enhanced queue management, audio effects, and priority support.' },
                          { id: 'Seven', q: 'What is the price for the Wace plan?', a: 'The Wace plan costs $5 Per Month.' },
                          { id: 'Eight', q: 'Is there a limited offer available?', a: 'Yes, both the Premium and Wace plans have a limited offer available.' },
                          { id: 'Nine', q: 'How can I get started with a plan?', a: 'Click the "Get Started" button on the respective plan.' },
                          { id: 'Ten', q: 'What is the difference between the Premium and Wace plans?', a: 'The main difference is the price. Premium is $3/month and Wace is $5/month.' },
                        ].map(({ id, q, a, open }) => (
                          <div key={id} className="accordion-item card">
                            <h2 className="accordion-header card-header" id={`heading${id}`}>
                              <button className={`accordion-button${open ? '' : ' collapsed'}`} type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${id}`} aria-expanded={open ? 'true' : 'false'} aria-controls={`collapse${id}`}>
                                {q}
                              </button>
                            </h2>
                            <div id={`collapse${id}`} className={`accordion-collapse collapse${open ? ' show' : ''}`} aria-labelledby={`heading${id}`} data-bs-parent="#accordionExampleb">
                              <div className="accordion-body card-body">{a}</div>
                            </div>
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
      </div>
      <br /><br /><br /><br />
    </LandingLayout>
  )
}
