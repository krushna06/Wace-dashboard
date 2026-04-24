'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { signIn, useSession } from 'next-auth/react'

function LandingScripts() {
  useEffect(() => {
    const cssFiles = [
      '/landing/css/bootstrap.min.css',
      '/landing/css/fontawesome-all.min.css',
      '/landing/css/feature.css',
      '/landing/css/animation.css',
      '/landing/css/slick.css',
      '/landing/css/slick-theme.css',
      '/landing/css/bootstrap-select.min.css',
      '/landing/css/prism.css',
      '/landing/css/style.css',
    ]
    const links: HTMLLinkElement[] = cssFiles.map((href) => {
      const el = document.createElement('link')
      el.rel = 'stylesheet'
      el.href = href
      document.head.appendChild(el)
      return el
    })

    const scripts = [
      '/landing/js/modernizr.min.js',
      '/landing/js/jquery.min.js',
      '/landing/js/bootstrap.min.js',
      '/landing/js/waypoint.min.js',
      '/landing/js/wow.min.js',
      '/landing/js/counterup.min.js',
      '/landing/js/sal.min.js',
      '/landing/js/slick.min.js',
      '/landing/js/text-type.js',
      '/landing/js/prism.js',
      '/landing/js/jquery.style.swicher.js',
      '/landing/js/bootstrap-select.min.js',
      '/landing/js/backto-top.js',
      '/landing/js/js.cookie.js',
      '/landing/js/jquery-one-page-nav.js',
      '/landing/js/main.js',
    ]
    let chain = Promise.resolve()
    const loaded: HTMLScriptElement[] = []
    scripts.forEach((src) => {
      chain = chain.then(
        () =>
          new Promise((resolve) => {
            const s = document.createElement('script')
            s.src = src
            s.async = false
            s.onload = () => resolve()
            s.onerror = () => resolve()
            document.body.appendChild(s)
            loaded.push(s)
          })
      )
    })
    return () => {
      links.forEach((l) => l.parentNode?.removeChild(l))
      loaded.forEach((s) => s.parentNode?.removeChild(s))
    }
  }, [])
  return null
}

interface LandingLayoutProps {
  children: React.ReactNode
  title?: string
}

export default function LandingLayout({ children }: LandingLayoutProps) {
  const { data: session } = useSession()

  return (
    <main className="page-wrapper">
      <div className="header-top-news bg-image1">
        <div className="wrapper">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="inner">
                  <div className="content">
                    <span className="rainbow-badge">Limited Time Offer</span>
                    <span className="news-text">Intro price. Get Wace Premium for Big Sale -10% off.</span>
                  </div>
                  <div className="right-button">
                    <Link className="btn-read-more" href="/pricing">
                      <span>Purchase Now <i className="fa-sharp fa-regular fa-arrow-right"></i></span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="icon-close">
          <button className="close-button bgsection-activation">
            <i className="fa-sharp fa-regular fa-x"></i>
          </button>
        </div>
      </div>

      <header className="rainbow-header header-default header-transparent header-sticky">
        <div className="container position-relative">
          <div className="row align-items-center row--0">
            <div className="col-lg-2 col-md-6 col-6">
              <Link href="/">
                <img className="logo" src="/landing/images/wace.jpg" alt="Wace Logo" style={{ width: 70, height: 'auto', borderRadius: 100 }} />
              </Link>
            </div>
            <div className="col-lg-8 d-none d-lg-block">
              <nav className="mainmenu-nav d-none d-lg-flex justify-content-center">
                <ul className="mainmenu">
                  <li><Link href="/">Home</Link></li>
                  <li><Link href="/pricing">Pricing</Link></li>
                  <li><Link href="/contact">Contact</Link></li>
                </ul>
              </nav>
            </div>
            <div className="col-lg-2 col-md-6 col-6 position-static">
              <div className="header-right">
                <div className="header-btn" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <a className="rainbow-gradient-btn" target="_blank" rel="noreferrer" href="https://discord.com/oauth2/authorize?client_id=1221392528566386768">
                    <span>Invite</span>
                  </a>
                  {session ? (
                    <Link className="btn-default" href="/guilds" style={{ padding: '8px 16px', fontSize: 14 }}>
                      Dashboard
                    </Link>
                  ) : (
                    <button
                      className="btn-default"
                      onClick={() => signIn('discord', { callbackUrl: '/guilds' })}
                      style={{ padding: '8px 16px', fontSize: 14, cursor: 'pointer', border: 'none' }}
                    >
                      Login
                    </button>
                  )}
                </div>
                <div className="mobile-menu-bar ml--5 d-flex justify-content-end d-lg-none">
                  <div className="hamberger">
                    <button className="hamberger-button">
                      <i className="fa-sharp fa-regular fa-bars"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="popup-mobile-menu">
        <div className="inner-popup">
          <div className="header-top">
            <Link href="/">
              <img className="logo-light" src="/landing/images/wace.jpg" alt="Wace Logo" style={{ width: 70, height: 'auto', borderRadius: 30 }} />
            </Link>
            <div className="close-menu">
              <button className="close-button">
                <i className="fa-sharp fa-regular fa-x"></i>
              </button>
            </div>
          </div>
          <div className="content">
            <ul className="mainmenu">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
            <div className="rbt-sm-separator"></div>
          </div>
          <div className="header-btn d-block d-md-none">
            <a className="btn-default" target="_blank" rel="noreferrer" href="https://discord.com/oauth2/authorize?client_id=1221392528566386768">Invite</a>
          </div>
        </div>
      </div>

      {children}

      <footer className="rainbow-footer footer-style-default footer-style-3 position-relative">
        <div className="footer-top">
          <div className="container">
            <div className="row justify-content-between">
              <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                <div className="rainbow-footer-widget">
                  <Link href="/">
                    <img className="logo-light" src="/landing/images/wace.jpg" alt="Wace Logo" style={{ width: 100, height: 'auto', borderRadius: '50%' }} />
                  </Link>
                  <p className="b1 desc-text">Your Discord server dynamic music bot!<br /> I know you want to invite me.</p>
                  <h6 className="subtitle">Join a Newsletter</h6>
                  <form className="newsletter-form" action="#">
                    <div className="form-group">
                      <input type="email" placeholder="Doesn't work btw" />
                      <button className="btn-default bg-solid-primary" type="submit">
                        <i className="fa-sharp fa-regular fa-arrow-right"></i>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="col-lg-2 col-md-6 col-sm-6 col-12">
                <div className="rainbow-footer-widget">
                  <div className="widget-menu-bottom">
                    <h4 className="title">Quick Links</h4>
                    <div className="inner">
                      <ul className="footer-link link-hover">
                        <li><Link href="/pricing">Pricing</Link></li>
                        <li><Link href="/contact">Contact</Link></li>
                        <li><a href="https://discord.gg/wacebot">Discord</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                <div className="rainbow-footer-widget">
                  <div className="widget-menu-top">
                    <h4 className="title">Contact</h4>
                    <div className="inner">
                      <ul className="footer-link contact-link">
                        <li>
                          <i className="contact-icon fa-sharp fa-regular fa-envelope"></i>
                          <a href="mailto:support@wace.live">support@wace.live</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <div className="copyright-area copyright-style-one">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-8 col-sm-12 col-12">
              <div className="copyright-left">
                <ul className="ft-menu link-hover">
                  <li><Link href="/privacy-policy">Privacy Policy</Link></li>
                  <li><Link href="/terms-policy">Terms And Condition</Link></li>
                  <li><Link href="/contact">Contact Us</Link></li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6 col-md-4 col-sm-12 col-12">
              <div className="copyright-right text-center text-lg-end">
                <p className="copyright-text">
                  Copyright 2024 <Link href="/" className="btn-read-more"><span>Wace</span></Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rbt-progress-parent">
        <svg className="rbt-back-circle svg-inner" width="100%" height="100%" viewBox="-1 -1 102 102">
          <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"></path>
        </svg>
      </div>

      <LandingScripts />
    </main>
  )
}