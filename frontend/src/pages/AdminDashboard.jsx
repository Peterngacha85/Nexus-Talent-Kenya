import { useState, useEffect, useRef } from 'react';
import {
    getAdminStats, getPendingDocuments, verifyDocument, updateUser,
    getAllJobSeekers, toggleJobSeekerVerification,
    getAllEmployers, getAllUsers, updateAnyUser, deleteUser,
} from '../api/api';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, FileCheck, Users, Briefcase, Award, UserCog,
    CheckCircle, XCircle, ExternalLink, Shield, Edit3, Save, Camera,
    Trash2, ChevronRight, LogOut, X, Menu, TrendingUp, TrendingDown,
    Clock, MapPin, UserPlus, Upload, MessageSquare, FileText
} from 'lucide-react';

/* ─── helpers ────────────────────────────────────────── */
const roleColor = { admin: 'badge-blue', jobseeker: 'badge-green', employer: 'badge-yellow' };
const typeLabel = { id: 'National ID', certificate: 'Certificate', cv: 'CV / Resume', other: 'Other' };

export default function AdminDashboard() {
    const { user, login: setLocalUser, logout } = useAuth();

    /* nav */
    const [section, setSection] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    /* data */
    const [stats,      setStats]      = useState(null);
    const [documents,  setDocuments]  = useState([]);
    const [jobSeekers, setJobSeekers] = useState([]);
    const [employers,  setEmployers]  = useState([]);
    const [allUsers,   setAllUsers]   = useState([]);
    const [loading,    setLoading]    = useState(true);

    /* profile */
    const [uploadingPic, setUploadingPic] = useState(false);
    const [editMode,  setEditMode]  = useState(false);
    const [editName,  setEditName]  = useState(user?.name || '');
    const [uploadFile,setUploadFile]= useState(null);
    const [saving,    setSaving]    = useState(false);

    /* user edit modal */
    const [userEditModal, setUserEditModal] = useState(null); // { user }
    const [ueRole, setUeRole] = useState('');
    const [ueName, setUeName] = useState('');

    /* messages */
    const [msg, setMsg] = useState('');
    useEffect(() => { if (msg) { const t = setTimeout(() => setMsg(''), 4000); return () => clearTimeout(t); } }, [msg]);

    /* initial load */
    useEffect(() => { loadAll(); }, []);

    async function loadAll() {
        try {
            const [sR, dR, jsR, eR, uR] = await Promise.all([
                getAdminStats(), getPendingDocuments(), getAllJobSeekers(),
                getAllEmployers(), getAllUsers(),
            ]);
            setStats(sR.data);
            setDocuments(dR.data);
            setJobSeekers(jsR.data);
            setEmployers(eR.data);
            setAllUsers(uR.data);
        } catch { setMsg('Failed to load data.'); }
        finally { setLoading(false); }
    }

    /* ── handlers ── */
    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingPic(true);
        try {
            const fd = new FormData();
            fd.append('profilePicture', file);
            const r = await updateUser(fd);
            setLocalUser({ ...user, ...r.data });
            setMsg('Profile photo updated!');
        } catch (err) {
            setMsg(err.response?.data?.message || 'Failed to update photo.');
        } finally { setUploadingPic(false); }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault(); setSaving(true); setMsg('');
        try {
            const fd = new FormData();
            fd.append('name', editName);
            if (uploadFile) fd.append('profilePicture', uploadFile);
            const r = await updateUser(fd);
            setLocalUser({ ...user, ...r.data });
            setMsg('Profile updated!');
            setEditMode(false); setUploadFile(null);
        } catch (err) {
            setMsg(err.response?.data?.message || 'Update failed.');
        } finally { setSaving(false); }
    };

    const handleVerifyDoc = async (id, status) => {
        try { await verifyDocument(id, { status }); setMsg(`Document ${status}.`); loadAll(); }
        catch { setMsg('Action failed.'); }
    };

    const handleToggleVerify = async (jsId) => {
        try {
            const r = await toggleJobSeekerVerification(jsId);
            setJobSeekers(p => p.map(js => js._id === jsId ? { ...js, isVerified: r.data.isVerified } : js));
            setMsg(r.data.isVerified ? 'Jobseeker verified ✓' : 'Jobseeker unverified');
        } catch { setMsg('Failed.'); }
    };

    const openUserEdit = (u) => { setUserEditModal(u); setUeName(u.name); setUeRole(u.role); };

    const handleUserEdit = async (e) => {
        e.preventDefault();
        try {
            await updateAnyUser(userEditModal._id, { name: ueName, role: ueRole });
            setAllUsers(p => p.map(u => u._id === userEditModal._id ? { ...u, name: ueName, role: ueRole } : u));
            setMsg('User updated.'); setUserEditModal(null);
        } catch (err) { setMsg(err.response?.data?.message || 'Update failed.'); }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Delete this user permanently?')) return;
        try {
            await deleteUser(id);
            setAllUsers(p => p.filter(u => u._id !== id));
            setMsg('User deleted.');
        } catch (err) { setMsg(err.response?.data?.message || 'Delete failed.'); }
    };



    /* ── sidebar nav items ── */
    const navItems = [
        { id: 'dashboard',  label: 'Analytics',         icon: <LayoutDashboard size={18} /> },
        { id: 'jobseekers', label: 'Jobseekers',         icon: <Award size={18} />,  badge: jobSeekers.length },
        { id: 'employers',  label: 'Employers',          icon: <Briefcase size={18} />, badge: employers.length },
        { id: 'users',      label: 'All Users',          icon: <Users size={18} />,  badge: allUsers.length },
        { id: 'documents',  label: 'Doc Verification',   icon: <FileCheck size={18} />, badge: documents.length, badgeWarn: true },
        { id: 'profile',    label: 'My Profile',         icon: <UserCog size={18} /> },
    ];

    const go = (id) => { setSection(id); setSidebarOpen(false); };

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
                    Initialising Admin Panel...
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', paddingTop: 'var(--nav-h)' }}>

            {/* ── Overlay for mobile ── */}
            {sidebarOpen && (
                <div onClick={() => setSidebarOpen(false)}
                    style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.4)', zIndex:199, top:'var(--nav-h)' }} />
            )}

            {/* ── Sidebar ── */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                {/* Admin badge */}
                <div style={{ padding: '1.25rem 1rem .75rem', borderBottom: '1px solid var(--clr-border)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '.75rem', cursor: 'pointer' }}
                        title="Click to change photo">
                        <div className="avatar" style={{ overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                            {user.profilePicture
                                ? <img src={user.profilePicture} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                                : user.name?.charAt(0).toUpperCase()
                            }
                            <div className="avatar-hover-overlay" style={{
                                position:'absolute', inset:0, background:'rgba(0,0,0,.4)', color:'#fff',
                                display:'flex', alignItems:'center', justifyContent:'center',
                                opacity:0, transition:'opacity .2s',
                            }}><Camera size={13} /></div>
                        </div>
                        <div style={{ overflow:'hidden' }}>
                            <div style={{ fontWeight:700, fontSize:'.85rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', color: 'var(--clr-text)' }}>{user.name}</div>
                            <div style={{ fontSize:'.7rem', color:'var(--clr-primary)' }}>Administrator</div>
                        </div>
                        <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} disabled={uploadingPic} />
                    </label>
                </div>

                {/* Nav */}
                <nav style={{ padding: '.5rem 0', flex: 1 }}>
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => go(item.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '.75rem',
                                width: '100%', padding: '.7rem 1rem', textAlign: 'left',
                                background: section === item.id ? 'var(--clr-primary-faint)' : 'transparent',
                                color: section === item.id ? 'var(--clr-primary-dark)' : 'var(--clr-text)',
                                fontWeight: section === item.id ? 700 : 400,
                                borderLeft: section === item.id ? '3px solid var(--clr-primary)' : '3px solid transparent',
                                borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                                fontSize: '.9rem',
                                transition: 'var(--trans)',
                            }}>
                            {item.icon}
                            <span style={{ flex: 1 }}>{item.label}</span>
                            {item.badge !== undefined && (
                                <span style={{
                                    background: item.badgeWarn && item.badge > 0 ? 'var(--clr-warning)' : 'var(--clr-border)',
                                    color: item.badgeWarn && item.badge > 0 ? '#fff' : 'var(--clr-muted)',
                                    borderRadius: 999, fontSize: '.7rem', padding: '1px 7px', fontWeight: 700,
                                }}>{item.badge}</span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Logout */}
                <div style={{ padding: '.75rem', borderTop: '1px solid var(--clr-border)' }}>
                    <button className="btn btn-ghost btn-sm" style={{ width:'100%', color:'var(--clr-danger)' }}
                        onClick={logout}>
                        <LogOut size={15}/> Logout
                    </button>
                </div>
            </aside>

            {/* ── Main content ── */}
            <main style={{ flex: 1, padding: '2rem 1.5rem', overflowX: 'hidden' }}>
                {/* Mobile menu button */}
                <button className="btn btn-outline btn-sm hide-desktop" style={{ marginBottom:'1rem' }}
                    onClick={() => setSidebarOpen(o => !o)}>
                    <Menu size={16}/> Menu
                </button>

                {msg && (
                    <div className={`alert ${msg.toLowerCase().includes('fail') || msg.toLowerCase().includes('error') ? 'alert-error' : 'alert-success'}`}
                        style={{ marginBottom:'1rem' }}>{msg}</div>
                )}

                {/* ═══ DASHBOARD / ANALYTICS ═══ */}
                {section === 'dashboard' && stats && (
                    <div>
                        <div className="flex-between" style={{ marginBottom:'1.5rem', alignItems:'flex-end' }}>
                            <div>
                                <h2 style={{ marginBottom:'.25rem', color: 'var(--clr-text)' }}>Insights Explorer</h2>
                                <p className="text-muted fs-sm">Real-time platform performance and demographics.</p>
                            </div>
                            <div className="card card-body" style={{ padding:'.5rem .75rem', fontSize:'.8rem', display:'flex', alignItems:'center', gap:'.5rem' }}>
                                <Clock size={14} className="text-primary"/>
                                Last updated: {new Date().toLocaleTimeString()}
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid-4" style={{ marginBottom:'2rem' }}>
                            <StatCard label="Total Users" val={stats.summary.totalUsers} icon={<Users size={20}/>} color="var(--clr-info)"
                                growth={stats.summary.growth.percentage} onClick={() => go('users')} />
                            <StatCard label="Job Seekers" val={stats.summary.totalJobSeekers} icon={<Award size={20}/>} color="var(--clr-primary)" onClick={() => go('jobseekers')} />
                            <StatCard label="Employers" val={stats.summary.totalEmployers} icon={<Briefcase size={20}/>} color="var(--clr-warning)" onClick={() => go('employers')} />
                            <StatCard label="Pending Review" val={stats.distributions.docs.pending} icon={<FileCheck size={20}/>} color="var(--clr-danger)" onClick={() => go('documents')} />
                        </div>

                        <div className="grid-2" style={{ gap:'1.5rem', marginBottom:'2rem' }}>
                            {/* Distribution Charts */}
                            <div className="card card-body">
                                <h4 style={{ marginBottom:'1.25rem', borderBottom:'1px solid var(--clr-border)', paddingBottom:'.75rem' }}>Verification Pipeline</h4>
                                <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                                    {(() => {
                                        const d = stats.distributions.docs;
                                        const dTotal = d.verified + d.pending + d.rejected;
                                        const r = stats.distributions.requests;
                                        const rTotal = r.approved + r.pending + r.rejected;
                                        return (
                                            <>
                                                <DistributionBar label="Verified Documents" count={d.verified} total={dTotal} color="var(--clr-success)" />
                                                <DistributionBar label="Pending Documents" count={d.pending} total={dTotal} color="var(--clr-warning)" />
                                                <DistributionBar label="Approved Access" count={r.approved} total={rTotal} color="var(--clr-primary)" />
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Top Metrics */}
                            <div className="card card-body">
                                <h4 style={{ marginBottom:'1.25rem', borderBottom:'1px solid var(--clr-border)', paddingBottom:'.75rem' }}>Market Demographics</h4>
                                <div className="grid-2" style={{ gap:'1rem' }}>
                                    <div>
                                        <p className="fs-xs text-muted mb-2 font-bold uppercase tracking-wider">Top Titles</p>
                                        <ul style={{ listStyle:'none', padding:0, fontSize:'.85rem' }}>
                                            {stats.topMetrics.titles.map(t => (
                                                <li key={t._id} style={{ marginBottom:'.4rem', display:'flex', justifyContent:'space-between' }}>
                                                    <span className="text-truncate" style={{ maxWidth:'120px' }}>{t._id}</span>
                                                    <b className="text-primary">{t.count}</b>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="fs-xs text-muted mb-2 font-bold uppercase tracking-wider">Top Locations</p>
                                        <ul style={{ listStyle:'none', padding:0, fontSize:'.85rem' }}>
                                            {stats.topMetrics.locations.map(l => (
                                                <li key={l._id} style={{ marginBottom:'.4rem', display:'flex', justifyContent:'space-between' }}>
                                                    <span className="text-truncate" style={{ maxWidth:'120px', color: 'var(--clr-text)' }}><MapPin size={12} style={{verticalAlign:'middle'}}/> {l._id}</span>
                                                    <b className="text-primary">{l.count}</b>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Log */}
                        <div className="card card-body">
                            <h4 style={{ marginBottom:'1.25rem', borderBottom:'1px solid var(--clr-border)', paddingBottom:'.75rem' }}>Live Activity Stream</h4>
                            <div className="grid-3" style={{ gap:'1.5rem' }}>
                                <ActivitySection title="New Signups" icon={<UserPlus size={16}/>}>
                                    {stats.recentActivity.users.map(u => (
                                        <ActivityItem key={u._id} title={u.name} sub={new Date(u.createdAt).toLocaleDateString()}
                                            pic={u.profilePicture} role={u.role} />
                                    ))}
                                </ActivitySection>
                                <ActivitySection title="Doc Uploads" icon={<Upload size={16}/>}>
                                    {stats.recentActivity.docs.map(d => (
                                        <ActivityItem key={d._id} title={d.fileName} sub={`By ${d.user?.name}`}
                                            type={d.type} />
                                    ))}
                                </ActivitySection>
                                <ActivitySection title="Access Requests" icon={<MessageSquare size={16}/>}>
                                    {stats.recentActivity.requests.map(r => (
                                        <ActivityItem key={r._id} title={r.employer?.name} sub={`For: ${r.jobSeeker?.title || 'Profile'}`}
                                            status={r.status} />
                                    ))}
                                </ActivitySection>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ JOBSEEKERS ═══ */}
                {section === 'jobseekers' && (
                    <div>
                        <h2 style={{ marginBottom:'.25rem' }}>Manage Jobseekers</h2>
                        <p className="text-muted fs-sm" style={{ marginBottom:'1.5rem' }}>Toggle verification to make a jobseeker visible to employers.</p>
                        {jobSeekers.length === 0
                            ? <EmptyState icon={<Award size={40}/>} msg="No jobseekers yet." />
                            : <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
                                {jobSeekers.map(js => (
                                    <div key={js._id} className="card card-body flex-between" style={{ flexWrap:'wrap', gap:'.75rem' }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
                                            <AvatarCell pic={js.user?.profilePicture} name={js.user?.name}/>
                                            <div>
                                                <div style={{ fontWeight:600 }}>{js.user?.name || 'Unknown'}</div>
                                                <div className="fs-xs text-muted">{js.user?.email}</div>
                                                <div style={{ display:'flex', gap:'.4rem', marginTop:'.25rem', flexWrap:'wrap' }}>
                                                    {js.title && <span className="badge badge-blue">{js.title}</span>}
                                                    {js.location && <span className="fs-xs text-muted">{js.location}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display:'flex', gap:'.5rem', alignItems:'center' }}>
                                            {js.documents?.find(d => d.type === 'cv') && (
                                                <a href={js.documents.find(d => d.type === 'cv').fileUrl} 
                                                   target="_blank" rel="noopener noreferrer"
                                                   className="btn btn-sm btn-outline">
                                                    <FileText size={13}/> View CV
                                                </a>
                                            )}
                                            <span className={`badge ${js.isVerified ? 'badge-green' : 'badge-gray'}`}>
                                                {js.isVerified ? '✓ Verified' : 'Unverified'}
                                            </span>
                                            <button
                                                className={`btn btn-sm ${js.isVerified ? 'btn-danger' : 'btn-primary'}`}
                                                onClick={() => handleToggleVerify(js._id)}>
                                                {js.isVerified ? <><XCircle size={13}/> Unverify</> : <><CheckCircle size={13}/> Verify</>}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                )}

                {/* ═══ EMPLOYERS ═══ */}
                {section === 'employers' && (
                    <div>
                        <h2 style={{ marginBottom:'.25rem' }}>Manage Employers</h2>
                        <p className="text-muted fs-sm" style={{ marginBottom:'1.5rem' }}>All registered employers on the platform.</p>
                        {employers.length === 0
                            ? <EmptyState icon={<Briefcase size={40}/>} msg="No employers yet." />
                            : <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
                                {employers.map(em => (
                                    <div key={em._id} className="card card-body flex-between" style={{ flexWrap:'wrap', gap:'.75rem' }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
                                            <AvatarCell pic={em.user?.profilePicture} name={em.user?.name}/>
                                            <div>
                                                <div style={{ fontWeight:600 }}>{em.user?.name || 'Unknown'}</div>
                                                <div className="fs-xs text-muted">{em.user?.email}</div>
                                                {em.company && <div className="fs-xs text-muted">{em.company}</div>}
                                            </div>
                                        </div>
                                        <span className="badge badge-yellow">Employer</span>
                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                )}

                {/* ═══ ALL USERS ═══ */}
                {section === 'users' && (
                    <div>
                        <h2 style={{ marginBottom:'.25rem' }}>All Users</h2>
                        <p className="text-muted fs-sm" style={{ marginBottom:'1.5rem' }}>Edit roles or remove user accounts.</p>
                        {allUsers.length === 0
                            ? <EmptyState icon={<Users size={40}/>} msg="No users yet." />
                            : <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
                                {allUsers.map(u => (
                                    <div key={u._id} className="card card-body flex-between" style={{ flexWrap:'wrap', gap:'.75rem' }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
                                            <AvatarCell pic={u.profilePicture} name={u.name}/>
                                            <div>
                                                <div style={{ fontWeight:600 }}>{u.name}</div>
                                                <div className="fs-xs text-muted">{u.email}</div>
                                                <div style={{ display:'flex', gap:'.4rem', marginTop:'.25rem' }}>
                                                    <span className={`badge ${roleColor[u.role]}`}>{u.role}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display:'flex', gap:'.5rem', alignItems:'center' }}>
                                            {u._id !== user._id && (
                                                <>
                                                    <button className="btn btn-sm btn-outline" onClick={() => openUserEdit(u)}><Edit3 size={13}/></button>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteUser(u._id)}><Trash2 size={13}/></button>
                                                </>
                                            )}
                                            {u._id === user._id && <span className="fs-xs text-muted">(you)</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                )}

                {/* ═══ DOCUMENTS ═══ */}
                {section === 'documents' && (
                    <div>
                        <h2 style={{ marginBottom:'.25rem' }}>Document Verification</h2>
                        <p className="text-muted fs-sm" style={{ marginBottom:'1.5rem' }}>Review and verify uploaded documents.</p>
                        {documents.length === 0
                            ? <EmptyState icon={<FileCheck size={40}/>} msg="No pending documents — all clear!" />
                            : <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
                                {documents.map(doc => (
                                    <div key={doc._id} className="card card-body flex-between" style={{ flexWrap:'wrap', gap:'.75rem' }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
                                            <div style={{
                                                width:42, height:42, borderRadius:'var(--radius-sm)',
                                                background:'var(--clr-primary-faint)', color:'var(--clr-primary)',
                                                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                                            }}><FileCheck size={20}/></div>
                                            <div>
                                                <div style={{ fontWeight:600 }}>{doc.fileName}</div>
                                                <div style={{ display:'flex', gap:'.5rem', marginTop:'.2rem', flexWrap:'wrap' }}>
                                                    <span className="badge badge-blue">{typeLabel[doc.type] || doc.type}</span>
                                                    <span className="fs-xs text-muted">{doc.user?.name}</span>
                                                    <span className="fs-xs text-muted">{doc.user?.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display:'flex', gap:'.5rem' }}>
                                            <a href={doc.fileUrl} target="_blank" rel="noreferrer"
                                                className="btn btn-ghost btn-sm"><ExternalLink size={13}/> View</a>
                                            <button className="btn btn-primary btn-sm" onClick={() => handleVerifyDoc(doc._id, 'verified')}>
                                                <CheckCircle size={13}/> Verify
                                            </button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleVerifyDoc(doc._id, 'rejected')}>
                                                <XCircle size={13}/> Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                )}

                {/* ═══ PROFILE ═══ */}
                {section === 'profile' && (
                    <div style={{ maxWidth: 480 }}>
                        <h2 style={{ marginBottom:'1.5rem' }}>My Profile</h2>
                        <div className="card card-body">
                            {/* Avatar */}
                            <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
                                <label style={{ display:'inline-block', cursor:'pointer', position:'relative', opacity: uploadingPic ? .6 : 1 }}
                                    title="Click to change photo">
                                    <div className="avatar avatar-lg" style={{ overflow:'hidden', width:80, height:80, fontSize:'2rem', margin:'0 auto', position:'relative' }}>
                                        {user.profilePicture
                                            ? <img src={user.profilePicture} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                                            : user.name?.charAt(0).toUpperCase()
                                        }
                                        <div className="avatar-hover-overlay" style={{
                                            position:'absolute', inset:0, background:'rgba(0,0,0,.35)', color:'#fff',
                                            display:'flex', alignItems:'center', justifyContent:'center',
                                            opacity:0, transition:'opacity .2s',
                                        }}><Camera size={20}/></div>
                                    </div>
                                    <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} disabled={uploadingPic}/>
                                </label>
                                <p className="fs-xs text-muted" style={{ marginTop:'.5rem' }}>
                                    {uploadingPic ? 'Uploading…' : 'Click photo to change'}
                                </p>
                            </div>

                            {editMode ? (
                                <form onSubmit={handleSaveProfile}>
                                    <div className="form-group" style={{ marginBottom:'1rem' }}>
                                        <label className="form-label">Display Name</label>
                                        <input className="form-control" value={editName}
                                            onChange={e => setEditName(e.target.value)} required />
                                    </div>
                                    <div style={{ display:'flex', gap:'.5rem', justifyContent:'flex-end' }}>
                                        <button type="button" className="btn btn-ghost" onClick={() => setEditMode(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary" disabled={saving}>
                                            <Save size={14}/> {saving ? 'Saving…' : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div>
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.5rem' }}>
                                        <span className="fs-sm text-muted">Name</span>
                                        <button className="btn btn-ghost btn-sm" onClick={() => setEditMode(true)}>
                                            <Edit3 size={13}/> Edit
                                        </button>
                                    </div>
                                    <p style={{ fontWeight:600, marginBottom:'1rem' }}>{user.name}</p>
                                    <div className="divider" />
                                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                                        <span className="fs-sm text-muted">Email</span>
                                        <span className="fs-sm">{user.email}</span>
                                    </div>
                                    <div className="divider" />
                                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                                        <span className="fs-sm text-muted">Role</span>
                                        <span className="badge badge-blue">Administrator</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* ── User Edit Modal ── */}
            {userEditModal && (
                <div style={{
                    position:'fixed', inset:0, background:'rgba(0,0,0,.5)',
                    backdropFilter:'blur(4px)', display:'flex', alignItems:'center',
                    justifyContent:'center', zIndex:9999,
                }}>
                    <div className="card card-body" style={{ width:'100%', maxWidth:380 }}>
                        <div className="flex-between" style={{ marginBottom:'1.25rem' }}>
                            <h3>Edit User</h3>
                            <button className="btn btn-ghost" onClick={() => setUserEditModal(null)}><X size={18}/></button>
                        </div>
                        <form onSubmit={handleUserEdit}>
                            <div className="form-group" style={{ marginBottom:'.75rem' }}>
                                <label className="form-label">Name</label>
                                <input className="form-control" value={ueName} onChange={e => setUeName(e.target.value)} required />
                            </div>
                            <div className="form-group" style={{ marginBottom:'1.25rem' }}>
                                <label className="form-label">Role</label>
                                <select className="form-control" value={ueRole} onChange={e => setUeRole(e.target.value)}>
                                    <option value="jobseeker">Jobseeker</option>
                                    <option value="employer">Employer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div style={{ display:'flex', gap:'.5rem', justifyContent:'flex-end' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setUserEditModal(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary"><Save size={14}/> Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Components ── */
function StatCard({ label, val, icon, color, growth, onClick }) {
    return (
        <div className={`card card-body ${onClick ? 'card-clickable' : ''}`} 
             style={{ position:'relative', overflow:'hidden' }}
             onClick={onClick}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1rem' }}>
                <div style={{ background:color+'15', color:color, padding:'.5rem', borderRadius:'var(--radius-sm)' }}>
                    {icon}
                </div>
                {growth !== undefined && (
                    <div style={{ display:'flex', alignItems:'center', gap:'.2rem', fontSize:'.75rem', color: growth >= 0 ? 'var(--clr-success)' : 'var(--clr-danger)', fontWeight:700 }}>
                        {growth >= 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                        {Math.abs(growth)}%
                    </div>
                )}
            </div>
            <div style={{ fontSize:'1.75rem', fontWeight:800, marginBottom:'.2rem' }}>{val ?? '0'}</div>
            <div className="fs-xs text-muted font-bold uppercase tracking-wide">{label}</div>
        </div>
    );
}

function DistributionBar({ label, count, total, color }) {
    const pc = total === 0 ? 0 : Math.round((count / total) * 100);
    return (
        <div>
            <div className="flex-between" style={{ fontSize:'.8rem', marginBottom:'.35rem' }}>
                <span className="text-muted">{label}</span>
                <span style={{ fontWeight:700 }}>{count} <small className="text-muted">({pc}%)</small></span>
            </div>
            <div style={{ height:6, background:'var(--clr-border)', borderRadius:10, overflow:'hidden' }}>
                <div style={{ height:'100%', width: pc+'%', background:color, transition:'width .5s ease' }} />
            </div>
        </div>
    );
}

function ActivitySection({ title, icon, children }) {
    return (
        <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'.5rem', marginBottom:'.25rem' }}>
                <div style={{ color:'var(--clr-primary)' }}>{icon}</div>
                <h5 style={{ margin:0, fontSize:'.9rem' }}>{title}</h5>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'.5rem' }}>
                {children.length === 0 ? <p className="fs-xs text-muted italic">No recent activity.</p> : children}
            </div>
        </div>
    );
}

function ActivityItem({ title, sub, pic, role, type, status }) {
    return (
        <div style={{ display:'flex', alignItems:'center', gap:'.6rem', padding:'.5rem', background:'var(--clr-surface-light)', borderRadius:'var(--radius-sm)', border:'1px solid var(--clr-border-faint)' }}>
            {pic !== undefined ? (
                <div className="avatar" style={{ width:28, height:28, fontSize:'.7rem' }}>
                    {pic ? <img src={pic} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : title.charAt(0)}
                </div>
            ) : type ? (
                <div style={{ width:28, height:28, background:'var(--clr-primary-faint)', color:'var(--clr-primary)', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%' }}>
                     <FileCheck size={14}/>
                </div>
            ) : (
                <div style={{ width:28, height:28, background:'var(--clr-success-faint)', color:'var(--clr-success)', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%' }}>
                     <MessageSquare size={14}/>
                </div>
            )}
            <div style={{ overflow:'hidden', flex:1 }}>
                <div className="fs-xs font-bold text-truncate" style={{ marginBottom:'2px' }}>{title}</div>
                <div className="fs-xs text-muted text-truncate" style={{ fontSize:'.65rem' }}>{sub}</div>
            </div>
            {role && <span className={`badge ${roleColor[role]}`} style={{ fontSize:'.55rem', padding:'1px 4px' }}>{role}</span>}
            {status && <span className={`badge ${status === 'approved' ? 'badge-green' : status === 'rejected' ? 'badge-error' : 'badge-yellow'}`} style={{ fontSize:'.55rem', padding:'1px 4px' }}>{status}</span>}
        </div>
    );
}

function AvatarCell({ pic, name }) {
    return (
        <div className="avatar" style={{ overflow:'hidden', flexShrink:0 }}>
            {pic
                ? <img src={pic} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                : name?.charAt(0).toUpperCase() || '?'
            }
        </div>
    );
}

function EmptyState({ icon, msg }) {
    return (
        <div className="card card-body text-center" style={{ padding:'3rem' }}>
            <div style={{ margin:'0 auto 1rem', opacity:.3 }}>{icon}</div>
            <p className="text-muted">{msg}</p>
        </div>
    );
}
