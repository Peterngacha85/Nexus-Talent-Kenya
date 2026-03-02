import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import axios from 'axios';

const features = [
    {
        icon: <Shield size={26} />,
        title: 'Anonymized Profiles',
        desc: 'Names and tribal identifiers are hidden. Employers see skills, experience and verified credentials only.',
    },
    {
        icon: <FileCheck size={26} />,
        title: 'Verified Credentials',
        desc: 'Every certificate is reviewed by our admin team before being shown to employers.',
    },
    {
        icon: <Search size={26} />,
        title: 'Merit-Based Search',
        desc: 'Filter talent by title, skills, experience level and location. Not ethnicity.',
    },
    {
        icon: <Users size={26} />,
        title: 'Consent-First Privacy',
        desc: 'Jobseekers approve each access request with a personal PIN before any data is shared.',
    },
];

const steps = [
    { n: '01', title: 'Register & Build Profile', desc: 'Sign up as a Jobseeker or Employer and complete your merit-based profile.' },
    { n: '02', title: 'Upload & Verify Docs',    desc: 'Jobseekers upload certificates; our admin verifies them independently.' },
    { n: '03', title: 'Search Anonymously',       desc: 'Employers browse talent by skills. No names, no ethnic signals.' },
    { n: '04', title: 'Request & Approve',        desc: 'Employer requests full profile access. Jobseeker approves with their PIN.' },
];

const LandingPage = () => {
    const { user } = useAuth();

    const dashboardPath =
        user?.role === 'jobseeker' ? '/jobseeker/dashboard' :
        user?.role === 'employer'  ? '/employer/dashboard'  :
        user?.role === 'admin'     ? '/admin/dashboard'     : null;

    // Wake up the free-tier server on mount
    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        axios.get(`${apiUrl}/api/health`).catch(() => { /* silent */ });
    }, []);

    return (
        <div>
            {/* ---- Hero ---- */}
            <section style={{
                minHeight: '100vh',
                background: 'linear-gradient(160deg, #ECFDF5 0%, #F8FAFB 55%, #EFF6FF 100%)',
                display: 'flex', alignItems: 'center', paddingTop: 'var(--nav-h)',
            }}>
                <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                        background: 'var(--clr-primary-faint)', color: 'var(--clr-primary-dark)',
                        borderRadius: 'var(--radius-pill)', padding: '.35rem 1rem',
                        fontSize: '.8rem', fontWeight: 600, marginBottom: '1.75rem',
                        border: '1px solid rgba(16,185,129,.2)',
                    }}>
                        <Star size={13} fill="currentColor" /> Fighting Tribalism in Kenyan Employment
                    </div>

                    <h1 style={{ maxWidth: '780px', margin: '0 auto .5rem' }}>
                        Where Your <span className="gradient-text">Skills</span> Speak{' '}
                        Louder Than Your Name
                    </h1>

                    <p style={{ fontSize: '1.15rem', maxWidth: '560px', margin: '1.25rem auto 2.5rem', color: 'var(--clr-muted)' }}>
                        NexusTalent Kenya connects employers with verified talent through
                        anonymized, merit-based profiles, ending ethnic bias in recruitment.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {dashboardPath ? (
                            <Link to={dashboardPath} className="btn btn-primary btn-lg">
                                Go to Dashboard <ArrowRight size={18} />
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn btn-primary btn-lg">
                                    Get Started Free <ArrowRight size={18} />
                                </Link>
                                <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
                            </>
                        )}
                    </div>

                    {/* Stats */}
                    <div style={{
                        display: 'flex', gap: '3rem', justifyContent: 'center', flexWrap: 'wrap',
                        marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid var(--clr-border)',
                    }}>
                        {[['100%', 'Bias-Free Search'], ['256-bit', 'Encrypted Data'], ['3 Roles', 'Jobseeker · Employer · Admin']].map(([v, l]) => (
                            <div key={l} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--clr-primary)' }}>{v}</div>
                                <div style={{ fontSize: '.85rem', color: 'var(--clr-muted)', marginTop: '.2rem' }}>{l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---- Features ---- */}
            <section className="section" id="about">
                <div className="container">
                    <div className="section-header">
                        <h2>Built for Fairness</h2>
                        <p>Every feature is designed with one goal: make your qualifications count more than your ethnic background.</p>
                    </div>
                    <div className="grid-2">
                        {features.map((f) => (
                            <div key={f.title} className="card card-hover card-body flex-center gap-2" style={{ alignItems: 'flex-start' }}>
                                <div style={{
                                    width: 52, height: 52, borderRadius: 'var(--radius-sm)',
                                    background: 'var(--clr-primary-faint)', color: 'var(--clr-primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    {f.icon}
                                </div>
                                <div>
                                    <h3 style={{ marginBottom: '.3rem' }}>{f.title}</h3>
                                    <p className="fs-sm">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---- How it works ---- */}
            <section className="section" id="how-it-works" style={{ background: 'var(--clr-primary-faint)' }}>
                <div className="container">
                    <div className="section-header">
                        <h2>How NexusTalent Works</h2>
                        <p>Four simple steps from registration to a fair job connection.</p>
                    </div>
                    <div className="grid-2">
                        {steps.map((s) => (
                            <div key={s.n} className="card card-body" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{
                                    fontSize: '1.5rem', fontWeight: 800, color: 'var(--clr-primary)',
                                    opacity: .4, lineHeight: 1, minWidth: '2rem',
                                }}>{s.n}</div>
                                <div>
                                    <h4 style={{ marginBottom: '.3rem' }}>{s.title}</h4>
                                    <p className="fs-sm">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---- CTA ---- */}
            <section className="section">
                <div className="container" style={{ textAlign: 'center' }}>
                    <div className="card card-body" style={{
                        background: 'linear-gradient(135deg, var(--clr-primary) 0%, var(--clr-primary-dark) 100%)',
                        color: '#fff', padding: '4rem 2rem', maxWidth: '700px', margin: '0 auto',
                    }}>
                        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Ready for Fair Recruitment?</h2>
                        <p style={{ color: 'rgba(255,255,255,.85)', marginBottom: '2rem', fontSize: '1.05rem' }}>
                            Join NexusTalent Kenya today, where merit moves you forward.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/register?role=jobseeker" style={{
                                background: '#fff', color: 'var(--clr-primary)', padding: '.75rem 1.75rem',
                                borderRadius: 'var(--radius-pill)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '.5rem',
                            }}>
                                <CheckCircle2 size={17} /> I'm a Jobseeker
                            </Link>
                            <Link to="/register?role=employer" style={{
                                border: '2px solid rgba(255,255,255,.6)', color: '#fff', padding: '.75rem 1.75rem',
                                borderRadius: 'var(--radius-pill)', fontWeight: 700,
                            }}>
                                I'm an Employer
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---- Footer ---- */}
            <footer style={{
                borderTop: '1px solid var(--clr-border)', padding: '2rem 0',
                background: 'var(--clr-surface)', textAlign: 'center',
            }}>
                <div className="container">
                    <p className="fs-sm text-muted">© {new Date().getFullYear()} NexusTalent Kenya. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
