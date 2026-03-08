import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../api/api';
import { Briefcase, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
    const [form, setForm]   = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate  = useNavigate();

    const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await loginApi(form);
            login(data);
            const path =
                data.role === 'jobseeker' ? '/jobseeker/dashboard' :
                data.role === 'employer'  ? '/employer/dashboard'  :
                                            '/admin/dashboard';
            navigate(path);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(160deg, var(--clr-primary-faint) 0%, var(--clr-bg) 100%)',
            padding: '2rem 1rem',
        }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', color: 'var(--clr-primary)', fontWeight: 800, fontSize: '1.2rem' }}>
                        <Briefcase size={24} /> NexusTalent Kenya
                    </Link>
                    <h2 style={{ marginTop: '.75rem', marginBottom: '.25rem' }}>Welcome back</h2>
                    <p className="fs-sm text-muted">Sign in to your account</p>
                </div>

                <div className="card card-body">
                    {error && <div className="alert alert-error">{error}</div>}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">
                                <Mail size={14} style={{ marginRight: '.3rem', verticalAlign: 'middle' }} />
                                Email Address
                            </label>
                            <input id="email" name="email" type="email" className="form-control"
                                placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="password">
                                <Lock size={14} style={{ marginRight: '.3rem', verticalAlign: 'middle' }} />
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input id="password" name="password" type={showPassword ? 'text' : 'password'} 
                                    className="form-control"
                                    style={{ 
                                        paddingRight: '2.5rem',
                                        borderColor: error && (error.toLowerCase().includes('password') || error.toLowerCase().includes('invalid')) ? 'var(--clr-danger)' : ''
                                    }}
                                    placeholder="••••••••" value={form.password} onChange={handleChange} required />
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
                                        transition: 'opacity 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '.5rem', justifyContent: 'center' }}>
                            {loading ? <span>Signing in...</span> : <><span>Sign In</span> <ArrowRight size={16} /></>}
                        </button>
                    </form>

                    <div className="divider" />
                    <p className="fs-sm text-center text-muted">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary fw-semibold">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
