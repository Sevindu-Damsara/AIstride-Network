import { supabase } from "./utils/supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Sidebar from "./Sidebar";
import { SkeletonGrid } from "./SkeletonCard";
import {
    Inbox,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Mail,
    Phone,
    Check,
    X
} from "lucide-react";

export default function Requests() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

    const handleUpdateStatus = async (requestId: string, status: "approved" | "declined") => {
        const { error } = await supabase.from("contact_requests").update({ status }).eq("id", requestId);
        if (error) {
            toast.error("Error updating request status.");
        } else {
            toast.success(`Request ${status} successfully.`);
            setData(data.map((request) => request.id === requestId ? { ...request, status } : request));
        }
    };

    useEffect(() => {
        setLoading(true);
        const fetchRequests = async () => {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                toast.error("Authentication required to view contact requests.");
                navigate('/login');
                return;
            }
            setUser(user.id);
            const { data, error } = await supabase
                .from("contact_requests")
                .select(`
                    *,
                    problems(title),
                    client_profile:profiles!contact_requests_client_id_fkey(full_name, contact_email, phone),
                    developer_profile:profiles!contact_requests_developer_id_fkey(full_name, contact_email, phone)
                `)
                .or(`client_id.eq.${user.id},developer_id.eq.${user.id}`)
                .order("created_at", { ascending: false });
            if (error) {
                toast.error("Error loading contact requests.");
            } else {
                setData(data || []);
            }
            setLoading(false);
        };
        fetchRequests();
    }, [navigate]);

    return (
        <div>
            <Sidebar />
            <div className="main">
                <div className="page-header">
                    <div className="page-header-text">
                        <h1>Contact Requests</h1>
                        <p>Review and authorize direct communications between organizations and technical partners.</p>
                    </div>
                </div>

                {loading ? (
                    <SkeletonGrid count={3} />
                ) : data.length === 0 ? (
                    <div className="empty-state-card">
                        <div className="empty-state-icon">
                            <Inbox size={24} />
                        </div>
                        <h3 style={{ marginBottom: "8px" }}>No Requests Recorded</h3>
                        <p>
                            Incoming and outgoing authorization requests will be listed here.
                        </p>
                    </div>
                ) : (
                    <div className="problems-grid">
                        {data.map((request) => {
                            const isClient = user === request.client_id;
                            const otherPartyName = isClient
                                ? (request.developer_profile?.full_name || "Developer Partner")
                                : (request.client_profile?.full_name || "Client Organization");
                            const otherPartyProfile = isClient ? request.developer_profile : request.client_profile;

                            return (
                                <div key={request.id} className="requests-container">
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <span className={`badge ${
                                                request.status === "approved" ? "badge-emerald" :
                                                request.status === "declined" ? "badge-rose" : "badge-amber"
                                            }`}>
                                                {request.status === "approved" ? <CheckCircle2 size={12} /> :
                                                 request.status === "declined" ? <XCircle size={12} /> : <Clock size={12} />}
                                                <span style={{ textTransform: 'capitalize' }}>{request.status}</span>
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                {isClient ? "Incoming Request" : "Outgoing Request"}
                                            </span>
                                        </div>

                                        <h3 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '8px' }}>
                                            {request.problems?.title || "Untitled Problem"}
                                        </h3>

                                        <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <User size={14} style={{ color: '#94a3b8' }} />
                                            <span><strong>{isClient ? "Developer:" : "Client:"}</strong> {otherPartyName}</span>
                                        </p>

                                        {request.status === "pending" && isClient && (
                                            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                                                <button
                                                    onClick={() => handleUpdateStatus(request.id, "approved")}
                                                    className="buttons"
                                                    style={{ flex: 1, padding: '7px 12px' }}
                                                >
                                                    <Check size={14} />
                                                    <span>Approve Request</span>
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(request.id, "declined")}
                                                    className="buttons danger-btn"
                                                    style={{ flex: 1, padding: '7px 12px' }}
                                                >
                                                    <X size={14} />
                                                    <span>Decline</span>
                                                </button>
                                            </div>
                                        )}

                                        {request.status === "approved" && (
                                            <div style={{ marginTop: "14px", padding: "12px", backgroundColor: "#0f172a", border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: "8px" }}>
                                                <p style={{ color: "#34d399", fontWeight: 600, marginBottom: "8px", fontSize: "0.85rem", display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <CheckCircle2 size={14} />
                                                    <span>{isClient ? "Authorization Granted" : "Authorization Granted"}</span>
                                                </p>
                                                <div style={{ fontSize: "0.85rem", color: "#f1f5f9", display: "flex", flexDirection: "column", gap: "4px" }}>
                                                    <span><strong>Contact:</strong> {otherPartyName}</span>
                                                    {otherPartyProfile?.contact_email && (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <Mail size={12} style={{ color: '#94a3b8' }} />
                                                            <span>{otherPartyProfile.contact_email}</span>
                                                        </span>
                                                    )}
                                                    {otherPartyProfile?.phone && (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <Phone size={12} style={{ color: '#94a3b8' }} />
                                                            <span>{otherPartyProfile.phone}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {request.status === "declined" && (
                                            <div style={{ marginTop: "14px", padding: "10px 12px", backgroundColor: "#0f172a", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px" }}>
                                                <p style={{ color: "#f87171", fontSize: "0.85rem" }}>
                                                    {isClient ? "You declined this request." : "Authorization request was declined."}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}