import { useState, type FormEvent } from 'react'
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock3,
  Leaf,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react'

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [complaintId, setComplaintId] = useState('')
  const [trackingResult, setTrackingResult] = useState<boolean | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function handleTracking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const id = complaintId.trim().toUpperCase()

    setTrackingResult(id === 'CLN-2026-001')
  }

  function handleReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="app">
      {/* Navigation */}
      <header className="navbar">
        <a href="#home" className="brand">
          <span className="brand-icon">
            <Leaf size={23} />
          </span>

          <span>
            CleanMy<span>Street</span>
          </span>
        </a>

        <button
          className="mobile-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

        <nav className={`nav-links ${menuOpen ? 'nav-open' : ''}`}>
          <a href="#home" onClick={() => setMenuOpen(false)}>
            Home
          </a>

          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
            How it works
          </a>

          <a href="#map" onClick={() => setMenuOpen(false)}>
            Complaint map
          </a>

          <a
            href="#track"
            className="nav-track"
            onClick={() => setMenuOpen(false)}
          >
            Track complaint
          </a>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="hero section-container" id="home">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              A cleaner community starts here
            </div>

            <h1>
              Your street.
              <br />
              Your community.
              <br />
              <span>A cleaner future.</span>
            </h1>

            <p className="hero-description">
              Spot uncollected garbage? Report it with a photo and
              location. Help your community stay clean and keep track
              of the action taken.
            </p>

            <div className="hero-actions">
              <a href="#report" className="button button-primary">
                <Camera size={19} />
                Report garbage
                <ArrowRight size={18} />
              </a>

              <a href="#track" className="button button-secondary">
                Track a complaint
              </a>
            </div>

            <div className="hero-trust">
              <ShieldCheck size={18} />
              <span>Built for citizens and municipal authorities</span>
            </div>
          </div>

          {/* Illustrative map */}
          <div className="hero-visual">
            <div className="map-card">
              <div className="map-topbar">
                <div>
                  <span className="map-label">COMMUNITY OVERVIEW</span>
                  <h3>Reported locations</h3>
                </div>

                <span className="map-live-badge">
                  <span />
                  Demo
                </span>
              </div>

              <div className="map-illustration">
                <svg
                  className="map-roads"
                  viewBox="0 0 500 350"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M-30 90 L530 260" />
                  <path d="M100 -20 L340 380" />
                  <path d="M-20 300 L520 50" />
                  <path d="M250 -20 L180 380" />
                  <path d="M-20 180 L520 180" />
                  <path d="M400 -20 L430 380" />
                </svg>

                <div className="map-area area-one">Residential Area</div>
                <div className="map-area area-two">Main Road</div>
                <div className="map-area area-three">Community Park</div>

                <div className="map-marker marker-one">
                  <MapPin size={19} />
                </div>

                <div className="map-marker marker-two">
                  <MapPin size={19} />
                </div>

                <div className="map-marker marker-three">
                  <MapPin size={19} />
                </div>

                <div className="map-marker marker-four">
                  <MapPin size={19} />
                </div>

                <div className="map-legend">
                  <span className="legend-dot pending" />
                  Pending
                  <span className="legend-dot resolved" />
                  Resolved
                </div>
              </div>

              <div className="map-card-footer">
                <div className="map-footer-icon">
                  <MapPin size={19} />
                </div>

                <div>
                  <strong>Every report makes a difference</strong>
                  <span>Illustrative map preview</span>
                </div>

                <ArrowRight size={18} className="map-footer-arrow" />
              </div>
            </div>

            <div className="floating-card">
              <div className="floating-icon">
                <CheckCircle2 size={20} />
              </div>

              <div>
                <strong>Community action</strong>
                <span>Small steps, cleaner streets</span>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="stats-section">
          <div className="stats-container">
            <div className="stats-heading">
              <span className="section-kicker">OUR COMMUNITY</span>
              <h2>Every report counts.</h2>
              <p>Sample statistics for the project demonstration.</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon stat-icon-green">
                  <Trash2 size={21} />
                </div>
                <span>Total complaints</span>
                <strong>120</strong>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-icon-blue">
                  <Clock3 size={21} />
                </div>
                <span>In progress</span>
                <strong>25</strong>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-icon-orange">
                  <MapPin size={21} />
                </div>
                <span>Pending</span>
                <strong>10</strong>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-icon-green">
                  <CheckCircle2 size={21} />
                </div>
                <span>Resolved</span>
                <strong>85</strong>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="how-section section-container" id="how-it-works">
          <div className="section-heading">
            <span className="section-kicker">SIMPLE & EFFECTIVE</span>
            <h2>Making a difference is easy.</h2>
            <p>
              Three simple steps to help keep your neighbourhood clean.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon">
                <Camera size={25} />
              </div>
              <h3>Spot & report</h3>
              <p>
                Take a photo of uncollected garbage and report the
                location.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon">
                <MapPin size={25} />
              </div>
              <h3>Track progress</h3>
              <p>
                Follow your complaint as it moves through the
                resolution process.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon">
                <CheckCircle2 size={25} />
              </div>
              <h3>See the change</h3>
              <p>
                Stay informed when the reported garbage has been
                collected.
              </p>
            </div>
          </div>
        </section>

        {/* Complaint map */}
        <section className="map-section" id="map">
          <div className="map-section-inner section-container">
            <div className="map-section-text">
              <span className="section-kicker">GEOGRAPHIC MONITORING</span>
              <h2>
                See the problem.
                <br />
                Find the solution.
              </h2>
              <p>
                A geographic view of reported garbage locations can
                help municipal authorities identify problem areas and
                monitor sanitation services.
              </p>

              <div className="map-benefit">
                <CheckCircle2 size={19} />
                Location-based complaint monitoring
              </div>

              <div className="map-benefit">
                <CheckCircle2 size={19} />
                Identify recurring garbage hotspots
              </div>

              <a href="#report" className="button button-primary">
                Report an issue
                <ArrowRight size={18} />
              </a>
            </div>

            <div className="map-preview-box">
              <div className="map-preview-header">
                <div>
                  <strong>Complaint overview</strong>
                  <span>Illustrative demonstration</span>
                </div>

                <MapPin size={20} />
              </div>

              <div className="map-preview-graphic">
                <div className="preview-road road-a" />
                <div className="preview-road road-b" />
                <div className="preview-road road-c" />
                <div className="preview-road road-d" />

                <div className="preview-pin pin-a">
                  <MapPin size={20} />
                </div>

                <div className="preview-pin pin-b">
                  <MapPin size={20} />
                </div>

                <div className="preview-pin pin-c">
                  <MapPin size={20} />
                </div>

                <div className="preview-pin pin-d">
                  <MapPin size={20} />
                </div>

                <div className="preview-map-label">Community map</div>
              </div>
            </div>
          </div>
        </section>

        {/* Complaint tracking */}
        <section className="track-section section-container" id="track">
          <div className="track-card">
            <div className="track-content">
              <span className="section-kicker">COMPLAINT TRACKING</span>
              <h2>Have you already reported it?</h2>
              <p>
                Enter your complaint ID to check its current status.
              </p>

              <form className="tracking-form" onSubmit={handleTracking}>
                <div className="tracking-input">
                  <Search size={19} />

                  <input
                    type="text"
                    placeholder="e.g. CLN-2026-001"
                    value={complaintId}
                    onChange={(event) => {
                      setComplaintId(event.target.value)
                      setTrackingResult(null)
                    }}
                    required
                  />
                </div>

                <button type="submit" className="button button-primary">
                  Track
                  <ArrowRight size={18} />
                </button>
              </form>

              {trackingResult === true && (
                <div className="tracking-result result-success">
                  <CheckCircle2 size={19} />
                  <div>
                    <strong>Complaint found</strong>
                    <span>
                      CLN-2026-001 — Status: In Progress
                    </span>
                  </div>
                </div>
              )}

              {trackingResult === false && (
                <div className="tracking-result result-error">
                  <Search size={19} />
                  <div>
                    <strong>Complaint not found</strong>
                    <span>
                      Try the sample ID CLN-2026-001.
                    </span>
                  </div>
                </div>
              )}

              <span className="demo-note">
                This is a frontend demonstration using sample data.
              </span>
            </div>

            <div className="track-decoration">
              <div className="track-decoration-circle">
                <ClipboardIcon />
              </div>
              <div className="track-decoration-line" />
              <div className="track-decoration-check">
                <CheckCircle2 size={28} />
              </div>
            </div>
          </div>
        </section>

        {/* Report form */}
        <section className="report-section section-container" id="report">
          <div className="report-heading">
            <span className="section-kicker">TAKE ACTION</span>
            <h2>Report uncollected garbage.</h2>
            <p>
              Help make your neighbourhood cleaner by reporting
              sanitation issues.
            </p>
          </div>

          <div className="report-form-card">
            {submitted ? (
              <div className="report-success">
                <div className="success-icon">
                  <CheckCircle2 size={34} />
                </div>

                <h3>Thanks for taking action!</h3>
                <p>
                  Your demonstration report has been submitted
                  successfully.
                </p>

                <button
                  className="button button-secondary"
                  onClick={() => setSubmitted(false)}
                >
                  Submit another report
                </button>
              </div>
            ) : (
              <>
                <div className="demo-banner">
                  <span>DEMO</span>
                  This form is a frontend prototype. Reports are not
                  saved yet.
                </div>

                <form className="report-form" onSubmit={handleReport}>
                  <label>
                    Description
                    <textarea
                      placeholder="Describe the garbage or sanitation issue..."
                      rows={4}
                      required
                    />
                  </label>

                  <label>
                    Location
                    <div className="form-input-with-icon">
                      <MapPin size={18} />
                      <input
                        type="text"
                        placeholder="Enter the reported location"
                        required
                      />
                    </div>
                  </label>

                  <label>
                    Photo
                    <div className="photo-upload">
                      <Camera size={24} />
                      <span>Choose a photo of the issue</span>
                      <input
                        type="file"
                        accept="image/*"
                        aria-label="Choose a complaint photo"
                      />
                    </div>
                  </label>

                  <button type="submit" className="button button-primary">
                    Submit demonstration report
                    <ArrowRight size={18} />
                  </button>
                </form>
              </>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner section-container">
          <a href="#home" className="brand footer-brand">
            <span className="brand-icon">
              <Leaf size={21} />
            </span>

            <span>
              CleanMy<span>Street</span>
            </span>
          </a>

          <p>
            A community-driven approach to cleaner streets.
          </p>

          <span className="footer-copyright">
            Community Project · 2026
          </span>
        </div>
      </footer>
    </div>
  )
}

function ClipboardIcon() {
  return (
    <div className="clipboard-illustration">
      <div className="clipboard-top" />
      <div className="clipboard-line" />
      <div className="clipboard-line" />
      <div className="clipboard-line short" />
    </div>
  )
}

export default App