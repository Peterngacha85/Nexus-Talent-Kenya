import { useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerApi } from '../api/api';
import { Briefcase, Camera, User } from 'lucide-react';

const RegisterPage = () => {
    const [searchParams] = useSearchParams();
    const [form, setForm] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        role: searchParams.get('role') || 'jobseeker',
        companyName: '', phone: '', title: '',
    });
    const [profilePic, setProfilePic]     = useState(null);
    const [profilePreview, setProfilePreview] = useState(null);
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate  = useNavigate();
    const fileRef   = useRef();

    const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handlePicChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setProfilePic(file);
        setProfilePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            // Must use FormData so the profile picture file is sent correctly
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            if (profilePic) fd.append('profilePicture', profilePic);

            const { data } = await registerApi(fd);
            login(data);
            navigate(data.role === 'employer' ? '/employer/dashboard' : '/jobseeker/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(160deg, var(--clr-primary-faint) 0%, var(--clr-bg) 100%)',
            padding: '5rem 1rem 2rem',
        }}>
            <div style={{ width: '100%', maxWidth: '490px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', color: 'var(--clr-primary)', fontWeight: 800, fontSize: '1.2rem', textDecoration: 'none' }}>
                        <Briefcase size={24} /> NexusTalent Kenya
                    </a>
                    <h2 style={{ marginTop: '.75rem', marginBottom: '.25rem' }}>Create your account</h2>
                    <p className="fs-sm text-muted">Join Kenya's fair recruitment platform</p>
                </div>

                <div className="card card-body">
                    {/* Role Toggle */}
                    <div style={{ display: 'flex', background: 'var(--clr-bg)', borderRadius: 'var(--radius-sm)', padding: '.25rem', marginBottom: '1.25rem' }}>
                        {['jobseeker', 'employer'].map((r) => (
                            <button key={r} type="button"
                                onClick={() => setForm(p => ({ ...p, role: r }))}
                                style={{
                                    flex: 1, padding: '.55rem', borderRadius: 'var(--radius-sm)',
                                    fontWeight: 600, fontSize: '.875rem', transition: 'var(--trans)',
                                    background: form.role === r ? '#fff' : 'transparent',
                                    color: form.role === r ? 'var(--clr-primary)' : 'var(--clr-muted)',
                                    boxShadow: form.role === r ? 'var(--shadow-sm)' : 'none',
                                    cursor: 'pointer', border: 'none',
                                }}>
                                {r === 'jobseeker' ? '👤 Jobseeker' : '🏢 Employer'}
                            </button>
                        ))}
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* Profile Picture Upload */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.75rem' }}>
                            <div
                                onClick={() => fileRef.current.click()}
                                style={{
                                    width: 80, height: 80, borderRadius: '50%',
                                    background: profilePreview ? 'transparent' : 'var(--clr-primary-faint)',
                                    border: '2px dashed var(--clr-primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', overflow: 'hidden', position: 'relative',
                                    transition: 'var(--trans)',
                                }}
                                title="Click to upload profile picture"
                            >
                                {profilePreview ? (
                                    <img src={profilePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ textAlign: 'center', color: 'var(--clr-primary)' }}>
                                        <Camera size={22} />
                                        <div style={{ fontSize: '.65rem', marginTop: '.2rem', fontWeight: 600 }}>Add Photo</div>
                                    </div>
                                )}
                            </div>
                            <span className="fs-xs text-muted">Profile picture (optional)</span>
                            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePicChange} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input name="name" type="text" className="form-control"
                                placeholder={form.role === 'employer' ? 'Contact person name' : 'Your full name'}
                                value={form.name} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input name="email" type="email" className="form-control"
                                placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                        </div>

                        {form.role === 'jobseeker' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input name="phone" type="tel" className="form-control"
                                        placeholder="+254..." value={form.phone} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Your Title</label>
                                    <input name="title" type="text" className="form-control"
                                        placeholder="e.g. Developer" value={form.title} onChange={handleChange} />
                                </div>
                            </div>
                        )}

                        {form.role === 'employer' && (
                            <div className="form-group">
                                <label className="form-label">Company Name</label>
                                <input name="companyName" type="text" className="form-control"
                                    placeholder="Your company name" value={form.companyName} onChange={handleChange} required />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input name="password" type="password" className="form-control"
                                placeholder="Min 8 characters" value={form.password} onChange={handleChange} required minLength={8} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input name="confirmPassword" type="password" className="form-control"
                                placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} required />
                        </div>

                        <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '.5rem' }}>
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="divider" />
                    <p className="fs-sm text-center text-muted">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary fw-semibold">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
