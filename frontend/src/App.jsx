import { useState } from 'react'
import Auth from './Auth.jsx'
import Dashboard from './Dashboard.jsx'
import './App.css'

const features = [
  ['*', 'AI Summarization', 'Turn long notes into clear, focused takeaways in seconds.', 'coral'],
  ['=', 'Smart Flashcards', 'Remember more with cards made from the material you need to know.', 'mint'],
  ['?', 'AI Quiz Generator', 'Test your understanding with questions that match your notes.', 'yellow'],
  ['o', 'AI Study Planner', 'Build a realistic study rhythm around your goals and schedule.', 'blue'],
  ['~', 'AI Chatbot', 'Ask follow-up questions and get explanations that make sense.', 'purple'],
  ['/', 'Progress Tracking', 'See your momentum grow and know exactly where to focus next.', 'orange'],
]

function Logo() {
  return <a className="logo" href="#top" aria-label="LearnMate AI home"><span className="logo-mark">L</span><span>LearnMate <b>AI</b></span></a>
}

function Arrow() { return <span aria-hidden="true">↗</span> }

function FeatureCard({ icon, title, text, tone }) {
  return <article className="feature-card"><div className={`feature-icon ${tone}`}>{icon}</div><h3>{title}</h3><p>{text}</p><a className="card-link" href="#how-it-works">Explore <Arrow /></a></article>
}

function App() {
  const [view, setView] = useState('landing')

  if (view === 'dashboard') return <Dashboard onHome={() => setView('landing')} onLogout={() => setView('landing')} />
  if (view === 'login' || view === 'signup') return <Auth mode={view} onSwitch={setView} onSuccess={() => setView('dashboard')} onHome={() => setView('landing')} />

  return <main id="top">
    <nav className="navbar page-shell" aria-label="Main navigation">
      <Logo />
      <div className="nav-links"><a className="active" href="#top">Home</a><a href="#features">Features</a><a href="#how-it-works">How It Works</a><a href="#about">About</a></div>
      <div className="nav-actions"><button className="login-link" onClick={() => setView('login')}>Log in</button><button className="button button-small" onClick={() => setView('signup')}>Get started <Arrow /></button></div>
      <button className="menu-button" type="button" aria-label="Open navigation">☰</button>
    </nav>

    <section className="hero page-shell">
      <div className="hero-copy"><p className="eyebrow"><span className="eyebrow-dot" /> Your smarter study companion</p><h1>Learn smarter.<br /><em>Go further.</em></h1><p className="hero-text">Your notes have more to say. LearnMate AI turns your study material into clear summaries, smart flashcards, and practice that sticks.</p><div className="hero-buttons"><button className="button" onClick={() => setView('signup')}>Start learning free <Arrow /></button><a className="text-button" href="#how-it-works">See how it works <span>{'->'}</span></a></div><div className="social-proof"><div className="avatar-stack"><span>JM</span><span>AK</span><span>RS</span><span>+</span></div><span>Join <strong>12,000+</strong> students learning better</span></div></div>
      <div className="hero-visual" aria-label="LearnMate study dashboard preview"><div className="sun-shape" /><div className="dashboard-card"><div className="dash-top"><span className="mini-logo">L</span><span>My study space</span><span className="dots">...</span></div><div className="welcome-row"><div><p className="muted-label">TUESDAY, OCTOBER 15</p><h2>Good morning, Maya <span>*</span></h2><p>Ready to make progress?</p></div><div className="streak"><span>^</span><strong>7</strong><small>day streak</small></div></div><div className="dash-grid"><div className="summary-panel"><div className="panel-heading"><span className="panel-icon coral">*</span><span>Quick summary</span><span className="more">...</span></div><div className="summary-lines"><i /><i /><i /><i className="short" /></div><div className="summary-tag">Biology - Cell structure</div></div><div className="progress-panel"><div className="panel-heading"><span className="panel-icon mint">/</span><span>Weekly progress</span></div><div className="chart"><i /><i /><i /><i /><i /><i /><i /></div><div className="chart-labels"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div></div></div><div className="focus-row"><div className="focus-icon">o</div><div><strong>Next up: Cell division quiz</strong><p>10 questions - 8 min</p></div><button type="button" aria-label="Start quiz">-&gt;</button></div></div><div className="floating-note note-left"><span>*</span><div><strong>AI generated</strong><small>Flashcards ready</small></div></div><div className="floating-note note-right"><span className="check">✓</span><div><strong>Nice work!</strong><small>3 topics mastered</small></div></div></div>
    </section>

    <section className="feature-section page-shell" id="features"><div className="section-heading"><div><p className="eyebrow">Everything you need to thrive</p><h2>Study time, <em>well spent.</em></h2></div><p>Less time organizing. More time understanding. LearnMate brings your entire study workflow into one calm, focused place.</p></div><div className="feature-grid">{features.map(([icon, title, text, tone]) => <FeatureCard key={title} icon={icon} title={title} text={text} tone={tone} />)}</div></section>

    <section className="steps-section" id="how-it-works"><div className="page-shell"><div className="steps-heading"><p className="eyebrow">A better way to study</p><h2>From scattered notes<br />to <em>solid knowledge.</em></h2></div><div className="steps-grid"><div className="step"><span className="step-number">01</span><div className="step-icon upload">u</div><h3>Upload your notes</h3><p>Drop in your PDFs, lecture notes, or study guides. We will take it from here.</p></div><div className="step"><span className="step-number">02</span><div className="step-icon process">*</div><h3>Let AI process them</h3><p>LearnMate finds the key ideas and turns them into useful study tools.</p></div><div className="step"><span className="step-number">03</span><div className="step-icon learn">✓</div><h3>Learn &amp; practice</h3><p>Review, quiz yourself, and build the confidence to ace your next exam.</p></div></div></div></section>

    <section className="about-section page-shell" id="about"><div className="about-mark">L<span>*</span></div><div><p className="eyebrow">Built for curious minds</p><h2>Make learning feel<br /><em>like yours.</em></h2></div><p className="about-copy">Whether you are cramming for finals or building a daily habit, LearnMate adapts to how you learn best. Your progress, your pace, your next breakthrough.</p></section>

    <footer className="footer page-shell" id="footer"><div><Logo /><p>Your study material, made useful.</p></div><div className="footer-links"><a href="#features">Features</a><a href="#how-it-works">How it works</a><a href="#about">About</a><a href="#footer">Contact</a></div><p className="copyright">(c) 2024 LearnMate AI. Learn something wonderful.</p></footer>
  </main>
}

export default App
