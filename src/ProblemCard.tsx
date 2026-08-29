import { useState, useEffect } from 'react';
import { supabase } from './utils/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

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
    const navigate = useNavigate();

    const getRequestStatus = async (problemId: string, developerId: string) => {
        const { data, error } = await supabase.from("contact_requests").select("status").eq("problem_id", problemId).eq("developer_id", developerId).maybeSingle();
        if (!error) {
            setRequestStatus(data?.status ?? null);
        }
    }

    const getUserName = async (userId: string) => {
        const { data, error } = await supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle();
        if (!error && data) {
            return data.full_name;
        }
        return "Anonymous Client";
    }

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
        }
        getUser();
    }, [problem.id, problem.user_id]);

    const handleShowContact = async (userId: string) => {
        const { data, error } = await supabase.from("profiles").select("contact_email, phone").eq("id", userId).single();
        if (error) {
            toast.error("Error fetching contact details");
        } else {
            setContactInfo({ email: data.contact_email, phone: data.phone });
        }
    }

    const handleRequestContact = async (problemId: string, clientId: string) => {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            toast.error("Please login to contact.");
            return;
        }

        const { error } = await supabase.from("contact_requests").insert({
            problem_id: problemId,
            client_id: clientId,
            developer_id: user.id,
            status: "pending"
        });

        if (error) {
            toast.error("Error requesting contact: " + error.message);
        } else {
            toast.success("Contact request sent successfully!");
            setRequestStatus("pending");
        }
    }

    const isAuthor = currentUserId === problem.user_id;

    return (
        <div className="problem-card">
            <h3>{problem.title}</h3>
            <p className="problem-summary-preview">{problem.summary}</p>
            <button onClick={() => setIsExpanded(true)} className="buttons">Show details</button>

            {isExpanded && (
                <div className="modal-overlay" onClick={() => setIsExpanded(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setIsExpanded(false)} className="close-button">✖</button>
                        <div className="problem-details">
                            <h2>{problem.title}</h2>
                            <p><strong>Summary: </strong>{problem.summary}</p>
                            <p><strong>Explanation: </strong>{problem.explanation}</p>
                            <p><strong>Solution: </strong>{problem.solution}</p>
                        </div>
                        <p style={{ marginTop: '12px', fontSize: '0.9em', color: '#94a3b8' }}>
                            Posted by: <strong>{userName || "Client"}</strong> | Posted on: {new Date(problem.created_at).toLocaleDateString()}
                        </p>
                        
                        {isAuthor ? (
                            <p style={{ marginTop: '15px', color: '#38bdf8', fontStyle: 'italic' }}>
                                This is your submitted problem.
                            </p>
                        ) : !isClient && (
                            <div style={{ marginTop: '15px' }}>
                                {problem.contact_request ? (
                                    <div>
                                        {requestStatus === null && (
                                            <button className="button" onClick={() => handleRequestContact(problem.id, problem.user_id)}>
                                                Request Contact
                                            </button>
                                        )}
                                        {requestStatus === "pending" && (
                                            <div>
                                                <p>Request pending approval from client.</p>
                                                <button onClick={() => navigate("/requests")} className='buttons'>Visit Requests Page</button>
                                            </div>
                                        )}
                                        {requestStatus === "approved" && (
                                            <div>
                                                <p style={{ color: '#4ade80' }}>Contact Request Approved!</p>
                                                <button onClick={() => navigate("/requests")} className='buttons' style={{ marginRight: '8px' }}>
                                                    Visit Requests Page
                                                </button>
                                                <button onClick={() => contactInfo ? setContactInfo(null) : handleShowContact(problem.user_id)} className='buttons'>
                                                    {contactInfo ? "Hide" : "Show"} Contact
                                                </button>
                                            </div>
                                        )}
                                        {requestStatus === "declined" && (
                                            <div>
                                                <p style={{ color: '#f87171' }}>Contact Request Declined.</p>
                                                <button onClick={() => navigate("/requests")} className='buttons'>Visit Requests Page</button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <button onClick={() => contactInfo ? setContactInfo(null) : handleShowContact(problem.user_id)} className="buttons">
                                        {contactInfo ? "Hide" : "Show"} Contact
                                    </button>
                                )}

                                {contactInfo && (
                                    <div style={{ marginTop: '12px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                                        <p><strong>Client Name: </strong>{userName}</p>
                                        {problem.show_email && contactInfo.email ? (
                                            <p><strong>Email: </strong>{contactInfo.email}</p>
                                        ) : null}
                                        {problem.show_phone && contactInfo.phone ? (
                                            <p><strong>Phone: </strong>{contactInfo.phone}</p>
                                        ) : null}
                                        {!problem.show_email && !problem.show_phone && (
                                            <p style={{ color: '#94a3b8' }}>Client selected not to share public email/phone directly.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}