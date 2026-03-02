import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Briefcase, ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropOpen, setDropOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setDropOpen(false);
    };

    const dashboardPath =
        user?.role === 'jobseeker' ? '/jobseeker/dashboard' :
        user?.role === 'employer'  ? '/employer/dashboard'  :
        user?.role === 'admin'     ? '/admin/dashboard'     : '/';

    return (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
            height: 'var(--nav-h)',
            background: 'rgba(255,255,255,.92)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--clr-border)',
            display: 'flex', alignItems: 'center',
        }}>
            <div className="container flex-between" style={{ width: '100%' }}>
                {/* Logo */}
                <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontWeight: 800, fontSize: '1.15rem', color: 'var(--clr-primary)', textDecoration: 'none' }}>
                    <Briefcase size={22} />
                    <span>Nexus<span style={{ color: 'var(--clr-text)' }}>Talent</span></span>
                </a>

                {/* Desktop Nav */}
                <div className="hide-mobile flex-center gap-2">
                    <a href="/#how-it-works" className="btn btn-ghost">How It Works</a>
                    <a href="/#about"         className="btn btn-ghost">About</a>
                    {user?.role === 'employer' && (
                        <Link to="/employer/search" className="btn btn-ghost">Find Talent</Link>
                    )}

                    {user ? (
                        <div style={{ position: 'relative' }}>
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={() => setDropOpen(p => !p)}
                                style={{ gap: '.4rem', padding: '.4rem .8rem' }}
                            >
                                {user.profilePicture ? (
                                    <img 
                                        src={user.profilePicture} 
                                        alt="Profile" 
                                        style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} 
                                    />
                                ) : (
                                    <User size={15} />
                                )}
                                {user.name?.split(' ')[0]}
                                <ChevronDown size={14} style={{ transition: 'transform .2s', transform: dropOpen ? 'rotate(180deg)' : 'none' }} />
                            </button>
                            {dropOpen && (
                                <div style={{
                                    position: 'absolute', top: 'calc(100% + .5rem)', right: 0,
                                    background: '#fff', border: '1px solid var(--clr-border)',
                                    borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)',
                                    minWidth: '190px', overflow: 'hidden', zIndex: 100,
                                }}>
                                    <Link to={dashboardPath} className="btn btn-ghost" onClick={() => setDropOpen(false)}
                                        style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 0, padding: '.75rem 1rem' }}>
                                        <LayoutDashboard size={15} /> Dashboard
                                    </Link>
                                    <hr style={{ border: 'none', borderTop: '1px solid var(--clr-border)' }} />
                                    <button className="btn btn-ghost" onClick={handleLogout}
                                        style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 0, padding: '.75rem 1rem', color: 'var(--clr-danger)' }}>
                                        <LogOut size={15} /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login"    className="btn btn-ghost">Sign In</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
                        </>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button className="btn btn-ghost hide-desktop" onClick={() => setMobileOpen(p => !p)}
                    style={{ display: 'none' }}>
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div style={{
                    position: 'absolute', top: 'var(--nav-h)', left: 0, right: 0,
                    background: '#fff', borderBottom: '1px solid var(--clr-border)',
                    padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '.5rem',
                }}>
                    {user ? (
                        <>
                            <Link to={dashboardPath} className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}
                                onClick={() => setMobileOpen(false)}>Dashboard</Link>
                            <button className="btn btn-danger btn-sm" onClick={handleLogout}>Sign Out</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login"    className="btn btn-outline" onClick={() => setMobileOpen(false)}>Sign In</Link>
                            <Link to="/register" className="btn btn-primary"  onClick={() => setMobileOpen(false)}>Get Started</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
