import { supabase } from "./utils/supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Sidebar from "./Sidebar";

export default function Requests() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

    const handleUpdateStatus = async (requestId: string, status: "approved" | "declined") => {
        const { error } = await supabase.from("contact_requests").update({ status }).eq("id", requestId);
        if (error) {
            toast.error("An Error Occured while updating status");
        } else {
            setData(data.map((request) => request.id === requestId ? { ...request, status } : request));
        }
    }

    useEffect(() => {
        setLoading(true);
        const fetchRequests = async () => {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) {
                toast.error("Please login to view requests.");
                navigate('/login');
            }
            setUser(user?.id);
            const { data, error } = await supabase
                .from("contact_requests")
                .select(`
                    *,
                    problems(title),
                    client_profile:profiles!contact_requests_client_id_fkey(full_name, email, phone),
                    developer_profile:profiles!contact_requests_developer_id_fkey(full_name, email, phone)
                `)
                .or(`client_id.eq.${user?.id},developer_id.eq.${user?.id}`);
            if (error) {
                toast.error("An Error Occured while fetching requests");
            } else {
                setData(data || []);
            }
            setLoading(false);
        };
        fetchRequests();
    }, []);

    if (loading) {
        return (
            <div>
                <Sidebar />
                <div className="main" style={{ textAlign: "center", marginTop: "40px" }}>
                    <h3 style={{ color: "var(--accent-border)" }}>Loading contact requests...</h3>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Sidebar />
            <div className="main">
                <h1>Contact Requests</h1>
                {data.length === 0 ? (
                    <div style={{ textAlign: "center", marginTop: "40px" }}>
                        <p style={{ color: "#94a3b8" }}>No contact requests found.</p>
                    </div>
                ) : (
                    data.map((request) => {
                        const isClient = user === request.client_id;
                        const otherPartyName = isClient
                            ? (request.developer_profile?.full_name || "Developer")
                            : (request.client_profile?.full_name || "Client");

                        return (
                            <div key={request.id} className="requests-container" style={{ marginBottom: "20px", padding: "16px", borderRadius: "8px", backgroundColor: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--accent-border)" }}>
                                <div>
                                    <h3>Problem: {request.problems?.title || "Untitled Problem"}</h3>
                                    <p><strong>Status:</strong> <span style={{
                                        color: request.status === "approved" ? "#4ade80" : request.status === "declined" ? "#f87171" : "#facc15",
                                        textTransform: "capitalize",
                                        fontWeight: "bold"
                                    }}>{request.status}</span></p>
                                    <p><strong>{isClient ? "Developer" : "Client"}:</strong> {otherPartyName}</p>
                                    {request.status === "pending" && isClient && (
                                        <div style={{ marginTop: "10px" }}>
                                            <button onClick={() => handleUpdateStatus(request.id, "approved")} className="buttons" style={{ backgroundColor: "#16a34a", color: "white", marginRight: "8px" }}>Accept</button>
                                            <button onClick={() => handleUpdateStatus(request.id, "declined")} className="buttons" style={{ backgroundColor: "#dc2626", color: "white" }}>Decline</button>
                                        </div>
                                    )}
                                </div>
                                {!isClient && request.status === 'approved' && (
                                    <div style={{ marginTop: "12px", padding: "10px", backgroundColor: "rgba(74, 222, 128, 0.1)", borderRadius: "6px" }}>
                                        <p style={{ color: "#4ade80" }}><strong>Request Approved!</strong></p>
                                        <p><strong>Client Name: </strong>{request.client_profile?.full_name}</p>
                                        <p><strong>Client Email: </strong>{request.client_profile?.email}</p>
                                        <p><strong>Client Phone: </strong>{request.client_profile?.phone}</p>
                                    </div>
                                )}
                                {!isClient && request.status === 'declined' && (
                                    <div style={{ marginTop: "12px", color: "#f87171" }}>
                                        <p>Your request was declined by the client.</p>
                                    </div>
                                )}
                                {isClient && request.status === 'approved' && (
                                    <div style={{ marginTop: "12px", padding: "10px", backgroundColor: "rgba(74, 222, 128, 0.1)", borderRadius: "6px" }}>
                                        <p style={{ color: "#4ade80" }}><strong>You Approved the Request! The Developer will contact you soon.</strong></p>
                                        <p><strong>Developer Name: </strong>{request.developer_profile?.full_name}</p>
                                        <p><strong>Developer Email: </strong>{request.developer_profile?.email}</p>
                                        <p><strong>Developer Phone: </strong>{request.developer_profile?.phone}</p>
                                    </div>
                                )}
                                {isClient && request.status === 'declined' && (
                                    <div style={{ marginTop: "12px", color: "#94a3b8" }}>
                                        <p>You declined this contact request.</p>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}