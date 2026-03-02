import { Link } from 'react-router-dom';
import { Shield, Search, FileCheck, Users, ArrowRight, CheckCircle2, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import axios from 'axios';

const features = [
    {
        icon: <Shield size={28} />,
        title: 'Anonymized Profiles',
        desc: 'Names, gender, and tribal identifiers are hidden. Employers focus on skills and verified experience.',
    },
    {
        icon: <FileCheck size={28} />,
        title: 'Verified Credentials',
        desc: 'Our admin team independently verifies every certificate before it appears on your profile.',
    },
    {
        icon: <Search size={28} />,
        title: 'Merit-Based Search',
        desc: 'Powerful filters allow employers to find talent based on precise technical requirements, not background.',
    },
    {
        icon: <Users size={28} />,
        title: 'Consent-First Privacy',
        desc: 'You own your data. Employers must request access, and you approve with your personal PIN.',
    },
];

const LandingPage = () => {
    const { user } = useAuth();

    const dashboardPath =
        user?.role === 'jobseeker' ? '/jobseeker/dashboard' :
        user?.role === 'employer'  ? '/employer/dashboard'  :
        user?.role === 'admin'     ? '/admin/dashboard'     : null;

    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        axios.get(`${apiUrl}/api/health`).catch(() => { /* silent */ });
    }, []);

    return (
        <div className="animate-fade-in">
            {/* ---- Hero ---- */}
            <section style={{
                minHeight: '90vh',
                background: 'radial-gradient(circle at top right, #ECFDF5 0%, #FDFDFF 40%)',
                display: 'flex', alignItems: 'center', paddingTop: 'var(--nav-h)',
            }}>
                <div className="container">
                    <div className="hero-split">
                        <div className="animate-slide-up">
                            <div className="badge badge-green" style={{ marginBottom: '1.5rem', padding: '.4rem 1rem' }}>
                                <Star size={14} fill="currentColor" style={{ marginRight: '.5rem' }} /> 
                                Merit-Based Recruitment for Kenya
                            </div>
                            <h1 style={{ marginBottom: '1.5rem', lineHeight: 1.1 }}>
                                Where Your <span className="gradient-text">Skills</span> Define Your Future
                            </h1>
                            <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', maxWidth: '540px', color: 'var(--clr-muted)' }}>
                                NexusTalent Kenya is leveling the playing field. We connect top Kenyan talent with progressive employers through a bias-free, anonymized recruitment platform.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {dashboardPath ? (
                                    <Link to={dashboardPath} className="btn btn-primary btn-lg">
                                        Back to Dashboard <ArrowRight size={18} />
                                    </Link>
                                ) : (
                                    <>
                                        <Link to="/register" className="btn btn-primary btn-lg">
                                            Join the Network <ArrowRight size={18} />
                                        </Link>
                                        <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="hero-image-container animate-fade-in" style={{ animationDelay: '.3s' }}>
                            <img 
                                src="/assets/images/kenyan_office_hero_1772431676593.png" 
                                alt="Modern Office Nairobi" 
                                className="hero-img animate-float"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ---- Stats Bar ---- */}
            <div style={{ background: 'var(--clr-navy)', color: '#fff', padding: '3rem 0' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem' }}>
                    {[
                        ['100%', 'Anonymized Profiles'],
                        ['24/7', 'Admin Verification'],
                        ['Merit', 'Driven Success']
                    ].map(([val, label]) => (
                        <div key={label} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--clr-primary)' }}>{val}</div>
                            <div style={{ color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', fontSize: '.8rem', letterSpacing: '1px' }}>{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ---- Features Grid ---- */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="animate-slide-up">Engineered for Transparency</h2>
                        <p className="animate-slide-up" style={{ animationDelay: '.1s' }}>
                            Our platform removes the signals that trigger unconscious bias, ensuring every candidate is judged solely on their ability to do the job.
                        </p>
                    </div>
                    <div className="grid-2">
                        {features.map((f, i) => (
                            <div key={f.title} className="card-hover glass-card card-body flex-center gap-3 animate-slide-up" style={{ animationDelay: `${0.1 * i}s`, alignItems: 'flex-start' }}>
                                <div style={{
                                    width: 64, height: 64, borderRadius: 'var(--radius)',
                                    background: 'var(--clr-primary-faint)', color: 'var(--clr-primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    {f.icon}
                                </div>
                                <div style={{ paddingTop: '.5rem' }}>
                                    <h3 style={{ marginBottom: '.5rem', color: 'var(--clr-navy)' }}>{f.title}</h3>
                                    <p style={{ fontSize: '.95rem', lineHeight: 1.5 }}>{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---- Split Section: Trust ---- */}
            <section className="section" style={{ background: '#f8fafc' }}>
                <div className="container">
                    <div className="hero-split" style={{ gridTemplateColumns: '1fr 1.1fr' }}>
                        <div className="hero-image-container">
                            <img 
                                src="/assets/images/talent_verification_abstract_1772431719934.png" 
                                alt="Verification Process" 
                                className="img-float"
                            />
                        </div>
                        <div>
                            <h2 style={{ color: 'var(--clr-navy)', marginBottom: '1.5rem' }}>Build Trust with Verified Merit</h2>
                            <p style={{ marginBottom: '1.5rem' }}>
                                For Jobseekers, NexusTalent is a place to showcase your hard-earned credentials. Our verification process ensures that when an employer sees your profile, they see excellence.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {[
                                    'Secure document vault for certificates',
                                    'Multi-factor identity verification',
                                    'Skills assessment integration',
                                    'Professional experience validation'
                                ].map(item => (
                                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.8rem', fontWeight: 500 }}>
                                        <CheckCircle2 size={20} color="var(--clr-primary)" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---- Split Section: Collaboration ---- */}
            <section className="section">
                <div className="container">
                    <div className="hero-split">
                        <div>
                            <h2 style={{ color: 'var(--clr-navy)', marginBottom: '1.5rem' }}>For Employers: Find the Right Fit, Faster</h2>
                            <p style={{ marginBottom: '1.5rem' }}>
                                Stop filtering by names and start filtering by capability. Our platform provides high-signal data that helps you build a diverse, high-performing workforce based on actual talent metrics.
                            </p>
                            <div className="glass-card card-body" style={{ borderLeft: '4px solid var(--clr-primary)' }}>
                                <p style={{ fontStyle: 'italic', color: 'var(--clr-slate)' }}>
                                    "NexusTalent transformed our hiring. We've seen a 40% increase in placement quality since switching to merit-based filtering."
                                </p>
                                <div style={{ marginTop: '1rem', fontWeight: 700, fontSize: '.9rem' }}>— Lead Recruiter, Nairobi Tech Hub</div>
                            </div>
                        </div>
                        <div className="hero-image-container">
                            <img 
                                src="/assets/images/professional_collaboration_kenya_1772431743031.png" 
                                alt="Professional Collaboration" 
                                className="img-float"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ---- Final CTA ---- */}
            <section className="section" style={{ paddingBottom: '8rem' }}>
                <div className="container">
                    <div className="glass-card" style={{
                        background: 'linear-gradient(135deg, var(--clr-navy) 0%, #1e293b 100%)',
                        padding: '5rem 2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: '#fff'
                    }}>
                        <h2 style={{ color: '#fff', fontSize: '3rem', marginBottom: '1.5rem' }}>Ready to redefine your career?</h2>
                        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                            Join thousands of Kenyan professionals and forward-thinking employers today. Registration is free and takes less than 5 minutes.
                        </p>
                        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/register?role=jobseeker" className="btn btn-primary btn-lg" style={{ minWidth: '220px' }}>
                                Create Talent Profile
                            </Link>
                            <Link to="/register?role=employer" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: '#fff', minWidth: '220px' }}>
                                Hire Top Talent
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <footer style={{ background: '#f8fafc', padding: '4rem 0', borderTop: '1px solid var(--clr-border)' }}>
                <div className="container text-center">
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--clr-navy)', marginBottom: '1.5rem' }}>
                        NexusTalent <span style={{ color: 'var(--clr-primary)' }}>Kenya</span>
                    </div>
                    <p style={{ color: 'var(--clr-muted)', fontSize: '.9rem' }}>
                        © {new Date().getFullYear()} NexusTalent Kenya. Empowering merit, ending bias.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
