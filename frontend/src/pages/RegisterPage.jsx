import { useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerApi } from '../api/api';
import { Briefcase, Camera, User, Eye, EyeOff, Lock } from 'lucide-react';

const RegisterPage = () => {
    const [searchParams] = useSearchParams();
    const [form, setForm] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        role: searchParams.get('role') || 'jobseeker',
        companyName: '', phone: '', title: '',
    });
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { login } = useAuth();
    const navigate  = useNavigate();

    const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            const { data } = await registerApi(form);
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
                        <Briefcase size={24} /> Nexus Jobseek Kenya
                    </a>
                    <h2 style={{ marginTop: '.75rem', marginBottom: '.25rem' }}>Registration</h2>
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
                            <label className="form-label">
                                <Lock size={14} style={{ marginRight: '.3rem', verticalAlign: 'middle' }} />
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input name="password" type={showPassword ? 'text' : 'password'} className="form-control"
                                    style={{ 
                                        paddingRight: '2.5rem',
                                        borderColor: error && (error.toLowerCase().includes('password')) ? 'var(--clr-danger)' : ''
                                    }}
                                    placeholder="Min 8 characters" value={form.password} onChange={handleChange} required minLength={8} />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--clr-muted)',
                                        opacity: 0.7,
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Lock size={14} style={{ marginRight: '.3rem', verticalAlign: 'middle' }} />
                                Confirm Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} className="form-control"
                                    style={{ 
                                        paddingRight: '2.5rem',
                                        borderColor: error && (error.toLowerCase().includes('match')) ? 'var(--clr-danger)' : ''
                                    }}
                                    placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} required />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--clr-muted)',
                                        opacity: 0.7,
                                    }}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '.5rem', justifyContent: 'center' }}>
                            {loading ? <span>Creating account...</span> : 'Create Account'}
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
