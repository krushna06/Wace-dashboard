import LandingLayout from '@/components/landing/LandingLayout'

export default function TermsPolicyPage() {
  return (
    <LandingLayout title="Terms and Conditions">
      <div className="main-content">
        <div className="rainbow-contact-area rainbow-section-gapTop-big">
          <div className="container">
            <div className="row mt--40 row--15">
              <div className="col-lg-8">
                <div className="contact-details-box">
                  <h3 className="title">Terms and Conditions</h3>
                  <div className="profile-details-tab">
                    <div className="tab-content">
                      <div className="tab-pane fade active show" role="tabpanel">
                        <p>By using our Discord music bot, you agree to comply with and be bound by the following terms and conditions.</p>
                        <h4>Use of the Bot</h4>
                        <ul>
                          <li>The content of the pages is for your general information and use only. It is subject to change without notice.</li>
                          <li>Neither we nor any third parties provide any warranty as to the accuracy, timeliness, or completeness of the information.</li>
                          <li>Your use of any information on this bot is entirely at your own risk.</li>
                          <li>This bot contains material which is owned by or licensed to us. Reproduction is prohibited other than in accordance with the copyright notice.</li>
                          <li>Unauthorized use of this bot may give rise to a claim for damages and/or be a criminal offence.</li>
                          <li>Your use of this bot and any dispute arising out of such use is subject to the laws of England, Northern Ireland, Scotland and Wales.</li>
                        </ul>
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
