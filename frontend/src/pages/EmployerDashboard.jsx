import { useState, useEffect } from 'react';
import { searchTalent, requestAccess, getMyAccessRequests, getAvailableTitles, updateUser } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Search, Send, RefreshCw, CheckCircle, Clock, XCircle, MapPin, Star, Award, AlertCircle, Camera, FileText } from 'lucide-react';

const statusConfig = {
    pending:  { badge: 'badge-yellow', icon: <Clock size={11} />,       label: 'Pending' },
    approved: { badge: 'badge-green',  icon: <CheckCircle size={11} />, label: 'Approved' },
    rejected: { badge: 'badge-red',    icon: <XCircle size={11} />,     label: 'Rejected' },
};

const EmployerDashboard = () => {
    const { user, login: setLocalUser } = useAuth();
    const [tab, setTab]         = useState('search');
    const [results, setResults] = useState([]);
    const [myReqs, setMyReqs]   = useState([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg]         = useState('');
    const [filters, setFilters] = useState({ title: '', skills: '', location: '', minExperience: '' });
    const [availableTitles, setAvailableTitles] = useState([]);
    
    // Modal State
    const [requestModal, setRequestModal] = useState({ open: false, talentId: null, message: '' });
    const [uploadingPic, setUploadingPic] = useState(false);

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingPic(true);
        try {
            const formData = new FormData();
            formData.append('profilePicture', file);
            const r = await updateUser(formData);
            setLocalUser({ ...user, ...r.data }); // Preserve token
            setMsg('Profile photo updated successfully!');
        } catch (err) {
            setMsg('Failed to update profile photo.');
        } finally {
            setUploadingPic(false);
        }
    };

    useEffect(() => {
        loadRequests(); // Always load requests to keep the "My Requests" badge accurate
        if (tab === 'search') {
            loadTitles();
            handleSearch(new Event('submit'));
        }
    }, [tab]);


    const loadRequests = async () => {
        try { const r = await getMyAccessRequests(); setMyReqs(r.data); }
        catch { /* silent */ }
    };

    const loadTitles = async () => {
        try {
            const res = await getAvailableTitles();
            setAvailableTitles(res.data);
        } catch { /* silent */ }
    };

    const handleSearch = async (e, overrideParams = null) => {
        if (e) e.preventDefault();
        setLoading(true); setMsg('');
        try {
            // Use overrideParams if provided (e.g., when clearing), else use current filters state
            const activeFilters = overrideParams || filters;
            const params = Object.fromEntries(Object.entries(activeFilters).filter(([,v]) => v));
            const r = await searchTalent(params);
            setResults(r.data);
            if (r.data.length === 0) setMsg('No verified talent found matching your criteria.');
        } catch (err) {
            if (err.response?.status === 401) {
                setMsg('⚠️ Your session has expired. Please log out and log back in.');
            } else {
                setMsg('Search failed. Please try again.');
            }
        }
        finally { setLoading(false); }
    };

    const handleRequestClick = (jobSeekerId) => {
        setRequestModal({ open: true, talentId: jobSeekerId, message: '' });
    };

    const submitRequest = async (e) => {
        e.preventDefault();
        try {
            await requestAccess({ jobSeekerId: requestModal.talentId, message: requestModal.message });
            setMsg('Access request sent! The jobseeker will review it.');
            setRequestModal({ open: false, talentId: null, message: '' });
        } catch (err) {
            setMsg(err.response?.data?.message || 'Request failed.');
            setRequestModal({ open: false, talentId: null, message: '' });
        }
    };

    return (
        <div className="page">
            <div className="container" style={{ paddingBottom: '4rem' }}>
                {/* Header */}
                <div className="flex-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <label style={{
                                display: 'block', cursor: 'pointer', position: 'relative',
                                opacity: uploadingPic ? 0.6 : 1, transition: 'var(--trans)'
                            }} title="Click to change photo">
                            <div className="avatar avatar-lg" style={{ overflow: 'hidden', position: 'relative' }}>
                                {user.profilePicture ? (
                                    <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    user.name?.charAt(0).toUpperCase()
                                )}
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    background: 'rgba(0,0,0,0.35)', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    opacity: 0, transition: 'opacity .2s',
                                }} className="avatar-hover-overlay">
                                    <Camera size={18} />
                                </div>
                            </div>
                            <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} disabled={uploadingPic} />
                        </label>
                        <div>
                            <h2 style={{ marginBottom: '.15rem' }}>{user.name}</h2>
                            <span className="text-muted fs-sm">Employer · Find and connect with verified talent across Kenya</span>
                        </div>
                    </div>
                </div>

                {msg && (
                    <div className={`alert ${msg.includes('No verified talent') ? 'alert-error' : 'alert-info'}`}>
                        {msg}
                    </div>
                )}

                {/* Info Box about Verification */}
                <div className="alert alert-info" style={{ marginBottom: '2rem', display: 'flex', gap: '.75rem', alignItems: 'flex-start' }}>
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '.15rem' }} />
                    <div className="fs-sm">
                        <strong>Important:</strong> You are only seeing candidates who have been officially verified by NexusTalent admins. Unverified accounts (including new test accounts you just created) will not appear here yet.
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.75rem', borderBottom: '2px solid var(--clr-border)' }}>
                    {[
                        { id: 'search',   label: 'Search Talent',     icon: <Search size={15} /> },
                        { id: 'requests', label: `My Requests (${myReqs.length})`, icon: <Send size={15} /> },
                    ].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)} className="btn btn-ghost"
                            style={{
                                borderBottom: tab === t.id ? '2px solid var(--clr-primary)' : '2px solid transparent',
                                borderRadius: '0', color: tab === t.id ? 'var(--clr-primary)' : 'var(--clr-muted)',
                                fontWeight: tab === t.id ? 700 : 500, paddingBottom: '.75rem',
                            }}>
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* ---- Search Tab ---- */}
                {tab === 'search' && (
                    <>
                        <div className="card card-body" style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Find Talent (Anonymized)</h3>
                            <form onSubmit={handleSearch}>
                                <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Job Title / Role</label>
                                        <select className="form-control" value={filters.title} 
                                            onChange={e => setFilters(p => ({ ...p, title: e.target.value }))}>
                                            <option value="">All Available Roles</option>
                                            {availableTitles.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Skills</label>
                                        <input className="form-control" placeholder="e.g. React, Python"
                                            value={filters.skills} onChange={e => setFilters(p => ({ ...p, skills: e.target.value }))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Location</label>
                                        <input className="form-control" placeholder="e.g. Nairobi, Mombasa"
                                            value={filters.location} onChange={e => setFilters(p => ({ ...p, location: e.target.value }))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Min. Years Experience</label>
                                        <input type="number" min="0" className="form-control" placeholder="0"
                                            value={filters.minExperience} onChange={e => setFilters(p => ({ ...p, minExperience: e.target.value }))} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? <><RefreshCw size={15} className="spin" /> Searching…</> : <><Search size={15} /> Search Talent</>}
                                    </button>
                                    {(filters.title || filters.skills || filters.location || filters.minExperience) && (
                                        <button type="button" className="btn btn-ghost" onClick={() => {
                                            const empty = { title: '', skills: '', location: '', minExperience: '' };
                                            setFilters(empty);
                                            handleSearch(null, empty);
                                        }}>
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Results */}
                        {results.length > 0 && (
                            <div>
                                <h4 style={{ marginBottom: '1rem', color: 'var(--clr-muted)' }}>{results.length} verified talent found</h4>
                                <div className="grid-2">
                                    {results.map((talent) => (
                                        <div key={talent._id} className="card card-body card-hover">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                                <div className="avatar" style={{ background: 'var(--clr-primary-faint)', color: 'var(--clr-primary-dark)', fontWeight: 700, overflow: 'hidden' }}>
                                                    {talent.user?.profilePicture ? (
                                                        <img src={talent.user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        talent.title?.charAt(0).toUpperCase() || '?'
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 style={{ marginBottom: '.15rem' }}>{talent.title}</h4>
                                                    <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                                                        {talent.isVerified && <span className="badge badge-green"><Award size={10} /> Verified</span>}
                                                        {talent.location && <span className="text-muted fs-xs"><MapPin size={11} /> {talent.location}</span>}
                                                        <span className="text-muted fs-xs"><Star size={11} /> {talent.experience || 0} yrs exp.</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {talent.skills?.length > 0 && (
                                                <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                                    {talent.skills.slice(0, 5).map(s => <span key={s} className="skill-tag">{s}</span>)}
                                                    {talent.skills.length > 5 && <span className="skill it-tag">+{talent.skills.length - 5}</span>}
                                                </div>
                                            )}

                                            <button className="btn btn-primary btn-sm btn-full" onClick={() => handleRequestClick(talent._id)}>
                                                <Send size={14} /> Request Full Profile
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ---- My Requests Tab ---- */}
                {tab === 'requests' && (
                    <div>
                        {myReqs.length === 0 ? (
                            <div className="card card-body text-center text-muted">
                                <Send size={32} style={{ margin: '0 auto .75rem', opacity: .3 }} />
                                <p>You haven't sent any access requests yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {myReqs.map((r) => {
                                    const cfg = statusConfig[r.status] || statusConfig.pending;
                                    return (
                                        <div key={r._id} className="card card-body flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                                            <div>
                                                <h4 style={{ marginBottom: '.25rem' }}>{r.jobSeeker?.title || 'Candidate'}</h4>
                                                <p className="fs-sm text-muted">Skills: {(r.jobSeeker?.skills || []).join(', ') || 'N/A'}</p>
                                                {r.status === 'approved' ? (
                                                    <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--clr-bg-alt)', borderRadius: 'var(--radius)' }}>
                                                        <h5 style={{ marginBottom: '1rem', color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                                            <CheckCircle size={16} /> Full Profile Unlocked
                                                        </h5>
                                                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                            {/* Rounded Square Profile Picture */}
                                                            <div style={{ 
                                                                width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden',
                                                                background: 'var(--clr-border)', flexShrink: 0
                                                            }}>
                                                                {r.jobSeeker?.user?.profilePicture ? (
                                                                    <img src={r.jobSeeker.user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                ) : (
                                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--clr-text-muted)' }}>
                                                                        {r.jobSeeker?.user?.name?.charAt(0).toUpperCase() || '?'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '.25rem' }}>{r.jobSeeker?.user?.name || 'Name Hidden'}</p>
                                                                <p className="fs-sm text-muted" style={{ marginBottom: '.15rem' }}>Email: {r.jobSeeker?.user?.email || 'N/A'}</p>
                                                                <p className="fs-sm text-muted" style={{ marginBottom: '.75rem' }}>Phone: {r.jobSeeker?.phone || 'N/A'}</p>
                                                                
                                                                {r.jobSeeker?.documents?.find(d => d.type === 'cv') && (
                                                                    <a href={r.jobSeeker.documents.find(d => d.type === 'cv').fileUrl} 
                                                                       target="_blank" rel="noopener noreferrer"
                                                                       className="btn btn-sm btn-outline">
                                                                        <FileText size={13}/> View CV
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    r.status === 'approved' && r.fullProfileData && (
                                                        <div className="alert alert-success" style={{ marginTop: '.75rem' }}>
                                                            <strong>Full details unlocked:</strong><br />
                                                            Name: {r.fullProfileData.name}<br />
                                                            Email: {r.fullProfileData.email}<br />
                                                            Phone: {r.fullProfileData.phone}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                            <span className={`badge ${cfg.badge}`} style={{ alignSelf: 'flex-start' }}>{cfg.icon} {cfg.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Request Access Modal */}
            {requestModal.open && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }}>
                    <div className="card card-body" style={{ width: '100%', maxWidth: '400px', animation: 'fadeIn .2s ease' }}>
                        <div className="flex-between" style={{ marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.25rem' }}>Request Access</h3>
                            <button onClick={() => setRequestModal({ open: false, talentId: null, message: '' })} 
                                className="btn btn-ghost" style={{ padding: '.25rem' }}>
                                <XCircle size={20} className="text-muted" />
                            </button>
                        </div>
                        <p className="fs-sm text-muted" style={{ marginBottom: '1.25rem' }}>
                            Send a request to unlock this candidate's full profile, name, and contact details.
                        </p>
                        <form onSubmit={submitRequest}>
                            <div className="form-group">
                                <label className="form-label">Message (Optional)</label>
                                <textarea className="form-control" rows={3} autoFocus
                                    placeholder="e.g. We are hiring for a Senior Developer and your profile looks great..."
                                    value={requestModal.message} 
                                    onChange={e => setRequestModal(p => ({ ...p, message: e.target.value }))}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button type="button" className="btn btn-ghost" 
                                    onClick={() => setRequestModal({ open: false, talentId: null, message: '' })}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <Send size={14} /> Send Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployerDashboard;
