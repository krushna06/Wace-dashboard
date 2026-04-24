export default function LandingGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="stylesheet" href="/landing/css/bootstrap.min.css" />
      <link rel="stylesheet" href="/landing/css/fontawesome-all.min.css" />
      <link rel="stylesheet" href="/landing/css/feature.css" />
      <link rel="stylesheet" href="/landing/css/animation.css" />
      <link rel="stylesheet" href="/landing/css/slick.css" />
      <link rel="stylesheet" href="/landing/css/slick-theme.css" />
      <link rel="stylesheet" href="/landing/css/bootstrap-select.min.css" />
      <link rel="stylesheet" href="/landing/css/prism.css" />
      <link rel="stylesheet" href="/landing/css/style.css" />
      {children}
    </>
  )
}
