import LandingLayout from '@/components/landing/LandingLayout'

export default function PrivacyPolicyPage() {
  return (
    <LandingLayout title="Privacy Policy">
      <div className="main-content">
        <div className="rainbow-contact-area rainbow-section-gapTop-big">
          <div className="container">
            <div className="row mt--40 row--15">
              <div className="col-lg-8">
                <div className="contact-details-box">
                  <h3 className="title">Privacy Policy</h3>
                  <div className="profile-details-tab">
                    <div className="tab-content">
                      <div className="tab-pane fade active show" role="tabpanel">
                        <p>This Privacy Policy describes how we collect, use, and disclose information when you use our Discord music bot.</p>
                        <h4>Information We Collect</h4>
                        <ul>
                          <li>Discord User ID: Collected to provide personalized music playback features.</li>
                          <li>Server Information: Server ID and channel ID to improve performance.</li>
                          <li>Usage Data: Commands used, song requests, and interactions for analytics.</li>
                        </ul>
                        <h4>How We Use Your Information</h4>
                        <ul>
                          <li>To deliver, operate, and maintain the bot&apos;s functionalities.</li>
                          <li>To respond to inquiries and provide support.</li>
                        </ul>
                        <h4>Information Sharing</h4>
                        <ul>
                          <li>We use Lavalink for audio streaming. Your Discord User ID and server details may be shared with Lavalink for audio services.</li>
                        </ul>
                        <h4>Data Security</h4>
                        <p>We implement reasonable security measures to protect your information.</p>
                        <h4>Your Choices</h4>
                        <p>You can configure certain privacy settings through Discord&apos;s interface.</p>
                        <h4>Contact Us</h4>
                        <p>If you have any questions, contact us at <a href="mailto:support@wace.live">support@wace.live</a>.</p>
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
