'use client'

import { useEffect, useState } from 'react'

const words = ['Soundcloud', 'Deezer', 'Spotify']

export default function RotatingText() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % words.length)
        setVisible(true)
      }, 400)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  return (
    <span
      className="theme-gradient"
      style={{
        display: 'inline-block',
        opacity: visible ? 1 : 0,
        transform: visible ? 'rotateX(0deg)' : 'rotateX(180deg)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        minWidth: '240px',
      }}
    >
      {words[index]}
    </span>
  )
}
