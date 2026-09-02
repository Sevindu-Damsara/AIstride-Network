import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from './utils/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import {
    Lock,
    Zap,
    Calendar,
    ArrowRight,
    X,
    Send,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Mail,
    Phone,
    Info,
    MessageSquare
} from 'lucide-react';

interface Problems {
    id: string;
    title: string;
    summary: string;
    solution: string;
    explanation: string;
    user_id: string;
    created_at: string;
    show_email: boolean;
    show_phone: boolean;
    contact_request: boolean;
    status?: "open" | "in_review" | "resolved" | string;
}

interface ProblemCardProps {
    problem: Problems;
}

export default function ProblemCard({ problem }: ProblemCardProps) {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [contactInfo, setContactInfo] = useState<{ email?: string; phone?: string } | null>(null);
    const [isClient, setIsClient] = useState<boolean>(false);
    const [requestStatus, setRequestStatus] = useState<"pending" | "approved" | "declined" | null>(null);
    const [userName, setUserName] = useState<string>("");
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Pitch proposal states
    const [showPitchInput, setShowPitchInput] = useState<boolean>(false);
    const [pitchMessage, setPitchMessage] = useState<string>("");
    const [submittingPitch, setSubmittingPitch] = useState<boolean>(false);

    const navigate = useNavigate();

    const getRequestStatus = async (problemId: string, developerId: string) => {
        const { data, error } = await supabase
            .from("contact_requests")
            .select("status")
            .eq("problem_id", problemId)
            .eq("developer_id", developerId)
            .maybeSingle();
        if (!error) {
            setRequestStatus(data?.status ?? null);
        }
    };

    const getUserName = async (userId: string) => {
        const { data, error } = await supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle();
        if (!error && data) {
            return data.full_name;
        }
        return "Client";
    };

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
                const { data } = await supabase.from("profiles").select("user_type").eq("id", user.id).maybeSingle();
                if (data) {
                    setIsClient(data.user_type === "client");
                }
                getRequestStatus(problem.id, user.id);
            }
            getUserName(problem.user_id).then((name) => setUserName(name));
        };
        getUser();
    }, [problem.id, problem.user_id]);

    const handleShowContact = async (userId: string) => {
        const { data, error } = await supabase.from("profiles").select("contact_email, phone").eq("id", userId).single();
        if (error) {
            toast.error("Error fetching contact authorization.");
        } else {
            setContactInfo({ email: data.contact_email, phone: data.phone });
        }
    };

    const handleRequestContact = async (problemId: string, clientId: string) => {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            toast.error("Authentication required to submit contact authorization requests.");
            return;
        }

        setSubmittingPitch(true);
        const { error } = await supabase.from("contact_requests").insert({
            problem_id: problemId,
            client_id: clientId,
            developer_id: user.id,
            status: "pending",
            message: pitchMessage.trim() || null
        });
        setSubmittingPitch(false);

        if (error) {
            toast.error("Request submission failed: " + error.message);
        } else {
            toast.success("Contact authorization request & pitch proposal submitted successfully.");
            setRequestStatus("pending");
            setShowPitchInput(false);
            setPitchMessage("");
        }
    };

    const isAuthor = currentUserId === problem.user_id;
    const formattedDate = new Date(problem.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const currentStatus = problem.status || "open";

    const getStatusBadge = (statusStr: string) => {
        if (statusStr === "resolved") {
            return (
                <span className="badge badge-emerald">
                    <CheckCircle2 size={12} />
                    <span>Resolved</span>
                </span>
            );
        }
        if (statusStr === "in_review") {
            return (
                <span className="badge badge-amber">
                    <Clock size={12} />
                    <span>In Review</span>
                </span>
            );
        }
        return (
            <span className="badge badge-indigo">
                <Zap size={12} />
                <span>Open</span>
            </span>
        );
    };

    return (
        <div className="problem-card">
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span className={`badge ${problem.contact_request ? 'badge-amber' : 'badge-emerald'}`}>
                            {problem.contact_request ? <Lock size={12} /> : <Zap size={12} />}
                            <span>{problem.contact_request ? 'Approval Required' : 'Direct Contact'}</span>
                        </span>
                        {getStatusBadge(currentStatus)}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} />
                        <span>{formattedDate}</span>
                    </span>
                </div>
                <h3>{problem.title}</h3>
                <p className="problem-summary-preview">{problem.summary}</p>
            </div>

            <div className="problem-card-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        background: '#1e293b',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#818cf8'
                    }}>
                        <User size={14} />
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 500 }}>
                        {userName || 'Client Organization'}
                    </span>
                </div>

                <button onClick={() => setIsExpanded(true)} className="buttons buttons-secondary" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
                    <span>View Specifications</span>
                    <ArrowRight size={14} />
                </button>
            </div>

            {isExpanded && createPortal(
                <div className="modal-overlay" onClick={() => setIsExpanded(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setIsExpanded(false)} className="close-button">
                            <X size={18} />
                        </button>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                                <span className={`badge ${problem.contact_request ? 'badge-amber' : 'badge-emerald'}`}>
                                    {problem.contact_request ? <Lock size={12} /> : <Zap size={12} />}
                                    <span>{problem.contact_request ? 'Approval Required Protocol' : 'Direct Contact Permitted'}</span>
                                </span>
                                {getStatusBadge(currentStatus)}
                            </div>
                            <h2 style={{ margin: '8px 0 6px' }}>{problem.title}</h2>
                            <p style={{ margin: 0, padding: 0, background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.88rem' }}>
                                Submitted by <strong>{userName || "Client Organization"}</strong> on {formattedDate}
                            </p>
                        </div>

                        <div className="problem-details" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <h4 style={{ margin: '0 0 6px', color: '#38bdf8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Executive Summary</h4>
                                <p style={{ margin: 0, color: '#e2e8f0', lineHeight: 1.6 }}>{problem.summary}</p>
                            </div>

                            {problem.explanation && (
                                <div>
                                    <h4 style={{ margin: '0 0 6px', color: '#38bdf8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Detailed Problem Statement</h4>
                                    <div style={{ color: '#cbd5e1', lineHeight: 1.6, background: '#0f172a', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                        <ReactMarkdown>{problem.explanation}</ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            {problem.solution && (
                                <div>
                                    <h4 style={{ margin: '0 0 6px', color: '#38bdf8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Solution & Outcome</h4>
                                    <div style={{ color: '#cbd5e1', lineHeight: 1.6, background: '#0f172a', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                        <ReactMarkdown>{problem.solution}</ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                            {isAuthor ? (
                                <p style={{ color: '#38bdf8', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Info size={16} />
                                    <span>You are the author of this problem submission.</span>
                                </p>
                            ) : !isClient ? (
                                <div>
                                    {problem.contact_request ? (
                                        <div>
                                            {requestStatus === null && (
                                                <div>
                                                    {!showPitchInput ? (
                                                        <button className="buttons" onClick={() => setShowPitchInput(true)}>
                                                            <Send size={16} />
                                                            <span>Request Contact Authorization</span>
                                                        </button>
                                                    ) : (
                                                        <div style={{ background: '#0f172a', padding: '16px', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#818cf8', fontWeight: 600 }}>
                                                                <MessageSquare size={16} />
                                                                <span>Include Developer Pitch / Proposal (Optional)</span>
                                                            </div>
                                                            <textarea
                                                                className="form-textarea"
                                                                rows={3}
                                                                placeholder="Introduce yourself, your technical skills, or proposed approach to help the client evaluate your request..."
                                                                value={pitchMessage}
                                                                onChange={(e) => setPitchMessage(e.target.value)}
                                                                style={{ marginBottom: '12px' }}
                                                            />
                                                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                                <button
                                                                    className="buttons buttons-secondary"
                                                                    onClick={() => setShowPitchInput(false)}
                                                                    disabled={submittingPitch}
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    className="buttons"
                                                                    onClick={() => handleRequestContact(problem.id, problem.user_id)}
                                                                    disabled={submittingPitch}
                                                                >
                                                                    <Send size={14} />
                                                                    <span>{submittingPitch ? "Submitting..." : "Submit Authorization Request"}</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {requestStatus === "pending" && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                                    <span className="badge badge-amber" style={{ padding: '6px 12px' }}>
                                                        <Clock size={14} />
                                                        <span>Authorization Pending Client Review</span>
                                                    </span>
                                                    <button onClick={() => { setIsExpanded(false); navigate("/requests"); }} className='buttons buttons-secondary'>
                                                        <span>Manage Requests</span>
                                                        <ArrowRight size={14} />
                                                    </button>
                                                </div>
                                            )}
                                            {requestStatus === "approved" && (
                                                <div>
                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                                                        <span className="badge badge-emerald" style={{ padding: '6px 12px' }}>
                                                            <CheckCircle2 size={14} />
                                                            <span>Authorization Approved</span>
                                                        </span>
                                                        <button onClick={() => contactInfo ? setContactInfo(null) : handleShowContact(problem.user_id)} className='buttons'>
                                                            {contactInfo ? "Hide Contact Details" : "View Contact Details"}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {requestStatus === "declined" && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                                    <span className="badge badge-rose" style={{ padding: '6px 12px' }}>
                                                        <XCircle size={14} />
                                                        <span>Authorization Declined</span>
                                                    </span>
                                                    <button onClick={() => { setIsExpanded(false); navigate("/requests"); }} className='buttons buttons-secondary'>
                                                        <span>View Requests</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <button onClick={() => contactInfo ? setContactInfo(null) : handleShowContact(problem.user_id)} className="buttons">
                                            {contactInfo ? "Hide Contact Info" : "View Direct Contact Info"}
                                        </button>
                                    )}

                                    {contactInfo && (
                                        <div style={{ marginTop: '16px', padding: '14px', backgroundColor: '#0f172a', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '10px' }}>
                                            <h4 style={{ margin: '0 0 10px', color: '#818cf8', fontSize: '0.95rem' }}>Authorized Client Contact</h4>
                                            <p style={{ margin: '4px 0', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <User size={14} style={{ color: '#94a3b8' }} />
                                                <span><strong>Name: </strong>{userName}</span>
                                            </p>
                                            {problem.show_email && contactInfo.email ? (
                                                <p style={{ margin: '4px 0', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Mail size={14} style={{ color: '#94a3b8' }} />
                                                    <span><strong>Email: </strong>{contactInfo.email}</span>
                                                </p>
                                            ) : null}
                                            {problem.show_phone && contactInfo.phone ? (
                                                <p style={{ margin: '4px 0', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Phone size={14} style={{ color: '#94a3b8' }} />
                                                    <span><strong>Phone: </strong>{contactInfo.phone}</span>
                                                </p>
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                                    Developer account required to initiate communication requests with this organization.
                                </p>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}