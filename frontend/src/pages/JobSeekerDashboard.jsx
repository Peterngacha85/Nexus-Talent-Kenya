import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    getJobSeekerProfile, updateJobSeekerProfile,
    uploadDocument, getPendingRequests, approveAccessRequest, rejectAccessRequest, updateUser, getMyProfile
} from '../api/api';
import { User, Upload, Bell, CheckCircle, XCircle, FileText, Award, MapPin, Briefcase, Eye, EyeOff, Camera } from 'lucide-react';

const JobSeekerDashboard = () => {
    const { user, login: setLocalUser } = useAuth();
    const [profile, setProfile]   = useState(null);
    const [requests, setRequests] = useState([]);
    const [tab, setTab]           = useState('profile');
    const [loading, setLoading]   = useState(true);
    const [msg, setMsg]           = useState('');
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadType, setUploadType] = useState('cv');
    const [showPin, setShowPin] = useState(false);
    
    // Modal State
    const [pinModal, setPinModal] = useState({ open: false, requestId: null, pin: '' });

    const [editForm, setEditForm] = useState({
        title: '', skills: '', location: '', summary: '', experience: 0,
    });
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

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [pRes, rRes] = await Promise.all([getJobSeekerProfile(), getPendingRequests()]);
            setProfile(pRes.data);
            setRequests(rRes.data);
            setEditForm({
                title: pRes.data.title || '',
                skills: (pRes.data.skills || []).join(', '),
                location: pRes.data.location || '',
                summary: pRes.data.summary || '',
                experience: pRes.data.experience || 0,
            });
        } catch { /* handled gracefully */ }
        finally { setLoading(false); }
    };

    const saveProfile = async (e) => {
        e.preventDefault();
        setMsg('');
        try {
            await updateJobSeekerProfile({
                ...editForm,
                skills: editForm.skills.split(',').map(s => s.trim()).filter(Boolean),
            });
            setMsg('Profile updated successfully!');
            loadData();
        } catch { setMsg('Failed to update profile.'); }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile) return;
        const fd = new FormData();
        fd.append('file', uploadFile);
        fd.append('type', uploadType);
        fd.append('fileName', uploadFile.name);
        try {
            await uploadDocument(fd);
            setMsg('Document uploaded! Awaiting admin verification.');
            setUploadFile(null);
        } catch { setMsg('Upload failed.'); }
    };

    const handleApproveClick = (id) => {
        setPinModal({ open: true, requestId: id, pin: '' });
    };

    const submitPin = async (e) => {
        e.preventDefault();
        try {
            await approveAccessRequest({ requestId: pinModal.requestId, pin: pinModal.pin });
            setMsg('Access approved!');
            setPinModal({ open: false, requestId: null, pin: '' });
            loadData();
        } catch (err) { 
            setMsg(err.response?.data?.message || 'Approval failed.'); 
            setPinModal({ open: false, requestId: null, pin: '' });
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectAccessRequest({ requestId: id });
            setMsg('Request rejected.');
            loadData();
        } catch { setMsg('Rejection failed.'); }
    };

    if (loading) return (
        <div className="page flex-center">
            <div className="spinner-container">
                <div className="spinner spinner-lg"></div>
                <div style={{ 
                    fontWeight: 600, 
                    color: 'var(--clr-navy)', 
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    fontSize: '.85rem'
                }}>
                    Loading your profile...
                </div>
            </div>
        </div>
    );

    const tabs = [
        { id: 'profile',   label: 'My Profile',  icon: <User size={16} /> },
        { id: 'documents', label: 'Documents',   icon: <FileText size={16} /> },
        { id: 'requests',  label: `Requests (${requests.length})`, icon: <Bell size={16} /> },
    ];

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
                            <p className="text-muted fs-sm" style={{ marginBottom: '.5rem' }}>{profile?.title || 'Job Seeker'} · {profile.location || 'Location Not Set'}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
                                <span className={`badge ${profile?.isVerified ? 'badge-green' : 'badge-yellow'}`}><Award size={11} /> {profile?.isVerified ? 'Verified Profile' : 'Pending Verification'}</span>
                                {profile?.consentPin && (
                                    <div style={{ 
                                        display: 'inline-flex', alignItems: 'center', gap: '.5rem', 
                                        background: 'var(--clr-bg-alt)', padding: '.15rem .5rem', 
                                        borderRadius: 'var(--radius)', border: '1px solid var(--clr-border)',
                                        fontSize: '.75rem', marginLeft: '.5rem'
                                    }}>
                                        <span className="text-muted">Your PIN:</span>
                                        <strong style={{ letterSpacing: '2px' }}>{showPin ? profile.consentPin : '••••'}</strong>
                                        <button onClick={() => setShowPin(!showPin)} className="btn btn-ghost" style={{ padding: '0', height: 'auto', marginLeft: '.25rem' }}>
                                            {showPin ? <EyeOff size={13} className="text-muted" /> : <Eye size={13} className="text-muted" />}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {requests.length > 0 && (
                        <div className="badge badge-yellow" style={{ fontSize: '.85rem', padding: '.4rem .9rem' }}>
                            <Bell size={13} /> {requests.length} pending request{requests.length > 1 ? 's' : ''}
                        </div>
                    )}
                </div>

                {msg && <div className={`alert ${msg.includes('fail') || msg.includes('Failed') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.75rem', borderBottom: '2px solid var(--clr-border)', paddingBottom: '0' }}>
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className="btn btn-ghost"
                            style={{
                                borderBottom: tab === t.id ? '2px solid var(--clr-primary)' : '2px solid transparent',
                                borderRadius: '0', color: tab === t.id ? 'var(--clr-primary)' : 'var(--clr-muted)',
                                fontWeight: tab === t.id ? 700 : 500, paddingBottom: '.75rem',
                            }}>
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* ---- Profile Tab ---- */}
                {tab === 'profile' && (
                    <div className="card card-body" style={{ maxWidth: '620px' }}>
                        <h3 style={{ marginBottom: '1.25rem' }}>Edit Professional Profile</h3>
                        <p className="fs-sm alert alert-info" style={{ marginBottom: '1rem' }}>
                            Only merit-based information is shown to employers. Your name is hidden until you approve access.
                        </p>
                        <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label"><Briefcase size={13} /> Professional Title</label>
                                <input className="form-control" value={editForm.title}
                                    onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                                    placeholder="e.g. Full Stack Developer" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Skills (comma-separated)</label>
                                <input className="form-control" value={editForm.skills}
                                    onChange={e => setEditForm(p => ({ ...p, skills: e.target.value }))}
                                    placeholder="React, Node.js, Python..." />
                            </div>
                            <div className="grid-2" style={{ gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label"><MapPin size={13} /> Location</label>
                                    <input className="form-control" value={editForm.location}
                                        onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))}
                                        placeholder="Nairobi, Mombasa..." />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Years of Experience</label>
                                    <input type="number" className="form-control" min="0" value={editForm.experience}
                                        onChange={e => setEditForm(p => ({ ...p, experience: e.target.value }))} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Professional Summary</label>
                                <textarea className="form-control" rows={4} value={editForm.summary}
                                    onChange={e => setEditForm(p => ({ ...p, summary: e.target.value }))}
                                    placeholder="Brief description of your experience and goals..." />
                            </div>
                            <button type="submit" className="btn btn-primary">Save Profile</button>
                        </form>
                    </div>
                )}

                {/* ---- Documents Tab ---- */}
                {tab === 'documents' && (
                    <div style={{ maxWidth: '560px' }}>
                        <div className="card card-body">
                            <h3 style={{ marginBottom: '1rem' }}>Upload Documents</h3>
                            <p className="fs-sm text-muted" style={{ marginBottom: '1.25rem' }}>
                                Upload your ID, academic certificates or CV. Admin will verify them before they appear to employers.
                            </p>
                            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Document Type</label>
                                    <select className="form-control" value={uploadType}
                                        onChange={e => setUploadType(e.target.value)}>
                                        <option value="cv">CV / Resume</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Choose File (PDF / JPG / PNG)</label>
                                    <input type="file" className="form-control" accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={e => setUploadFile(e.target.files[0])} />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={!uploadFile}>
                                    <Upload size={16} /> Upload Document
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ---- Requests Tab ---- */}
                {tab === 'requests' && (
                    <div>
                        {requests.length === 0 ? (
                            <div className="card card-body text-center text-muted">
                                <Bell size={32} style={{ margin: '0 auto .75rem', opacity: .3 }} />
                                <p>No pending access requests at the moment.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {requests.map((r) => (
                                    <div key={r._id} className="card card-body flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                                        <div>
                                            <h4 style={{ marginBottom: '.2rem' }}>{r.employer?.companyName || 'An Employer'}</h4>
                                            {r.message && <p className="fs-sm text-muted">"{r.message}"</p>}
                                        </div>
                                        <div style={{ display: 'flex', gap: '.5rem' }}>
                                            <button className="btn btn-primary btn-sm" onClick={() => handleApproveClick(r._id)}>
                                                <CheckCircle size={14} /> Approve
                                            </button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleReject(r._id)}>
                                                <XCircle size={14} /> Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* PIN Approval Modal */}
            {pinModal.open && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }}>
                    <div className="card card-body" style={{ width: '100%', maxWidth: '380px', animation: 'fadeIn .2s ease' }}>
                        <div className="flex-between" style={{ marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.25rem' }}>Approve Access</h3>
                            <button onClick={() => setPinModal({ open: false, requestId: null, pin: '' })} 
                                className="btn btn-ghost" style={{ padding: '.25rem' }}>
                                <XCircle size={20} className="text-muted" />
                            </button>
                        </div>
                        <p className="fs-sm text-muted" style={{ marginBottom: '1.25rem' }}>
                            Enter your 4-digit consent PIN to authorize this employer to view your full profile and contact details.
                        </p>
                        <form onSubmit={submitPin}>
                            <div className="form-group">
                                <label className="form-label">Consent PIN</label>
                                <input className="form-control" type="password" maxLength={4} autoFocus
                                    placeholder="e.g. 1234"
                                    value={pinModal.pin} 
                                    onChange={e => setPinModal(p => ({ ...p, pin: e.target.value }))}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button type="button" className="btn btn-ghost" 
                                    onClick={() => setPinModal({ open: false, requestId: null, pin: '' })}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <CheckCircle size={14} /> Confirm Approval
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobSeekerDashboard;
