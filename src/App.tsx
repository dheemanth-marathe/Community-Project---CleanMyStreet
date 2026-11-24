import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import AuthPanel from './components/AuthPanel'
import { supabase } from './lib/supabase'
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
  const [session, setSession] = useState<Session | null>(null)

  const [reportTitle, setReportTitle] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [reportLocation, setReportLocation] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState('')
  const [submittedCode, setSubmittedCode] = useState('')

  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')

  const [coordinates, setCoordinates] = useState<{
    latitude: number
    longitude: number
  } | null>(null)

  const [gettingLocation, setGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState('')

  // Authentication session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Generate and clean up the photo preview URL
  useEffect(() => {
    if (!photo) {
      setPhotoPreview('')
      return
    }

    const previewUrl = URL.createObjectURL(photo)
    setPhotoPreview(previewUrl)

    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [photo])

  // Demo complaint tracking
  function handleTracking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const id = complaintId.trim().toUpperCase()

    setTrackingResult(id === 'CLN-2026-001')
  }

  // Handle photo selection or camera capture
  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) return

    setSubmissionError('')

    if (!selectedFile.type.startsWith('image/')) {
      setSubmissionError('Please select an image file.')
      event.target.value = ''
      return
    }

    const maxFileSize = 2 * 1024 * 1024

    if (selectedFile.size > maxFileSize) {
      setSubmissionError('The photo must be 2 MB or smaller.')
      event.target.value = ''
      return
    }

    setPhoto(selectedFile)
  }

  // Obtain GPS coordinates from the browser
  function handleGetLocation() {
    setLocationError('')
    setSubmissionError('')

    if (!navigator.geolocation) {
      setLocationError(
        'Geolocation is not supported by this browser.',
      )
      return
    }

    setGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })

        setGettingLocation(false)
      },
      (error) => {
        setGettingLocation(false)

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              'Location permission was denied. Please allow location access and try again.',
            )
            break

          case error.POSITION_UNAVAILABLE:
            setLocationError(
              'Your current location could not be determined.',
            )
            break

          case error.TIMEOUT:
            setLocationError(
              'Location request timed out. Please try again.',
            )
            break

          default:
            setLocationError(
              'Unable to obtain your location.',
            )
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    )
  }

  // Submit a real complaint
  async function handleReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setSubmissionError('')

    if (!session) {
      setSubmissionError(
        'Please sign in using the navigation bar before submitting a complaint.',
      )
      return
    }

    const title = reportTitle.trim()
    const description = reportDescription.trim()
    const location = reportLocation.trim()

    if (title.length < 3 || title.length > 120) {
      setSubmissionError(
        'The title must be between 3 and 120 characters.',
      )
      return
    }

    if (description.length < 10 || description.length > 2000) {
      setSubmissionError(
        'The description must be between 10 and 2000 characters.',
      )
      return
    }

    if (!location) {
      setSubmissionError('Please enter the reported location.')
      return
    }

    if (!photo) {
      setSubmissionError('Please attach a photo of the issue.')
      return
    }

    if (!coordinates) {
      setSubmissionError(
        'Please obtain your GPS location before submitting.',
      )
      return
    }

    if (photo.size > 2 * 1024 * 1024) {
      setSubmissionError('The photo must be 2 MB or smaller.')
      return
    }

    setSubmitting(true)

    let uploadedPhotoPath = ''

    try {
      const fileExtension =
        photo.type === 'image/png'
          ? 'png'
          : photo.type === 'image/webp'
            ? 'webp'
            : 'jpg'

      const fileName = `${crypto.randomUUID()}.${fileExtension}`
      const photoPath = `${session.user.id}/${fileName}`

      // Upload photo to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('complaint-photos')
        .upload(photoPath, photo, {
          contentType: photo.type,
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      uploadedPhotoPath = photoPath

      // Insert complaint record into the database
      const { data, error: insertError } = await supabase
        .from('complaints')
        .insert({
          user_id: session.user.id,
          title,
          description,
          location_text: location,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          photo_path: uploadedPhotoPath,
        })
        .select('complaint_code')
        .single()

      if (insertError) {
        throw insertError
      }

      // Display the generated complaint code
      setSubmittedCode(data.complaint_code)
      setSubmitted(true)

      // Reset the form
      setReportTitle('')
      setReportDescription('')
      setReportLocation('')
      setPhoto(null)
      setCoordinates(null)
      setLocationError('')
    } catch (error) {
      console.error('Complaint submission failed:', error)

      // Remove uploaded photo if database insertion failed
      if (uploadedPhotoPath) {
        const { error: cleanupError } = await supabase.storage
          .from('complaint-photos')
          .remove([uploadedPhotoPath])

        if (cleanupError) {
          console.error(
            'Failed to remove orphaned photo:',
            cleanupError,
          )
        }
      }

      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error
          ? String(error.message)
          : 'An unknown error occurred.'

      setSubmissionError(message)
    } finally {
      setSubmitting(false)
    }
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

          <AuthPanel session={session} />
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

        {/* Complaint tracking - still demonstration data */}
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

                <h3>Complaint submitted successfully!</h3>

                <p>
                  Your complaint has been saved. Keep this complaint
                  code to track its progress.
                </p>

                <div className="tracking-result result-success">
                  <CheckCircle2 size={19} />
                  <div>
                    <strong>Your complaint code</strong>
                    <span>{submittedCode}</span>
                  </div>
                </div>

                <button
                  className="button button-secondary"
                  onClick={() => {
                    setSubmitted(false)
                    setSubmissionError('')
                  }}
                >
                  Submit another report
                </button>
              </div>
            ) : (
              <>
                <div className="demo-banner">
                  <span>LIVE</span>
                  Complaints are saved to the database.
                </div>

                {!session && (
                  <div className="tracking-result result-error">
                    <ShieldCheck size={19} />
                    <div>
                      <strong>Sign in required</strong>
                      <span>
                        Please sign in using the navigation bar before
                        submitting a complaint.
                      </span>
                    </div>
                  </div>
                )}

                <form className="report-form" onSubmit={handleReport}>
                  <label>
                    Complaint title
                    <input
                      type="text"
                      placeholder="e.g. Garbage dumped beside the road"
                      value={reportTitle}
                      onChange={(event) =>
                        setReportTitle(event.target.value)
                      }
                      minLength={3}
                      maxLength={120}
                      required
                    />
                  </label>

                  <label>
                    Description
                    <textarea
                      placeholder="Describe the garbage or sanitation issue..."
                      rows={4}
                      value={reportDescription}
                      onChange={(event) =>
                        setReportDescription(event.target.value)
                      }
                      minLength={10}
                      maxLength={2000}
                      required
                    />
                  </label>

                  <label>
                    Location
                    <div className="form-input-with-icon">
                      <MapPin size={18} />
                      <input
                        type="text"
                        placeholder="e.g. Near the bus stop, Main Road"
                        value={reportLocation}
                        onChange={(event) =>
                          setReportLocation(event.target.value)
                        }
                        required
                      />
                    </div>
                  </label>

                  {/* GPS location */}
                  <div className="location-capture">
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={handleGetLocation}
                      disabled={gettingLocation}
                    >
                      <MapPin size={18} />
                      {gettingLocation
                        ? 'Getting location...'
                        : coordinates
                          ? 'Refresh GPS location'
                          : 'Attach GPS location'}
                    </button>

                    {coordinates && (
                      <p className="location-coordinates">
                        GPS attached:
                        <br />
                        Latitude: {coordinates.latitude.toFixed(6)}
                        <br />
                        Longitude: {coordinates.longitude.toFixed(6)}
                      </p>
                    )}

                    {locationError && (
                      <p className="form-error">{locationError}</p>
                    )}
                  </div>

                  {/* Photo selection / camera */}
                  <label>
                    Photo
                    <div className="photo-upload">
                      <Camera size={24} />
                      <span>
                        {photo
                          ? photo.name
                          : 'Take a photo or choose an image'}
                      </span>

                      <input
                        key={photo ? 'photo-selected' : 'no-photo'}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        capture="environment"
                        aria-label="Take or choose a complaint photo"
                        onChange={handlePhotoChange}
                      />
                    </div>
                  </label>

                  {/* Photo preview */}
                  {photoPreview && (
                    <div className="photo-preview">
                      <img
                        src={photoPreview}
                        alt="Preview of the complaint"
                      />

                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => setPhoto(null)}
                      >
                        Remove photo
                      </button>
                    </div>
                  )}

                  {submissionError && (
                    <div className="tracking-result result-error">
                      <X size={19} />
                      <div>
                        <strong>Submission failed</strong>
                        <span>{submissionError}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="button button-primary"
                    disabled={submitting}
                  >
                    {submitting
                      ? 'Submitting complaint...'
                      : 'Submit complaint'}

                    {!submitting && <ArrowRight size={18} />}
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