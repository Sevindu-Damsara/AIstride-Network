import { supabase } from "./utils/supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Requests() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

    const handleUpdateStatus = async (requestId: string, status: "approved" | "declined") => {
        const { error } = await supabase.from("contact_requests").update({ status }).eq("id", requestId);
        if (error) {
            console.error("Error updating status:", error);
        } else {
            setData(data.map((request) => request.id === requestId ? { ...request, status } : request));
        }
    }

    useEffect(() => {
        setLoading(true);
        const fetchRequests = async () => {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) {
                alert("Please login to view requests.");
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
                console.error("Error fetching requests:", error);
            } else {
                setData(data || []);
            }
            setLoading(false);
        };
        fetchRequests();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Sidebar />
            <div className="main">
                <h1>Requests</h1>
                {data.length === 0 ? (
                    <p>No requests found!</p>
                ) : (
                    data.map((request) => {
                        const isClient = user === request.client_id;
                        return (
                            <div key={request.id} className="requests-container">
                                <div>
                                    <p>Problem: {request.problems.title}</p>
                                    <p>Status: {request.status}</p>
                                    <p>{isClient ? "Developer" : "Client"}: {isClient ? request.developer_id : request.client_id}</p>
                                    {request.status === "pending" && isClient && (
                                        <button onClick={() => handleUpdateStatus(request.id, "approved")} className="buttons">Accept</button>
                                    )}
                                    {request.status === "pending" && isClient && (
                                        <button onClick={() => handleUpdateStatus(request.id, "declined")} className="buttons">Decline</button>
                                    )}
                                </div>
                                {!isClient && request.status === 'approved' && (
                                    <div>
                                        <p><strong>Request Approved!</strong></p>
                                        <p><strong>Client Name: </strong>{request.client_profile?.full_name}</p>
                                        <p><strong>Client Email: </strong>{request.client_profile?.email}</p>
                                        <p><strong>Client Phone: </strong>{request.client_profile?.phone}</p>
                                    </div>
                                )}
                                {!isClient && request.status === 'declined' && (
                                    <div>
                                        <p>Your Request was declined by the client.</p>
                                    </div>
                                )}
                                {isClient && request.status === 'approved' && (
                                    <div>
                                        <p><strong>You Approved the Request! The Developer will contact you soon.</strong></p>
                                        <p><strong>Developer Name: </strong>{request.developer_profile?.full_name}</p>
                                        <p><strong>Developer Email: </strong>{request.developer_profile?.email}</p>
                                        <p><strong>Developer Phone: </strong>{request.developer_profile?.phone}</p>
                                    </div>
                                )}
                                {isClient && request.status === 'declined' && (
                                    <div>
                                        <p>You declined the request.</p>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    )
}