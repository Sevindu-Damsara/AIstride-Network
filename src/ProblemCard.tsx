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
    const navigate = useNavigate();

    const getRequestStatus = async (problemId: string, developerId: string) => {
        const { data, error } = await supabase.from("contact_requests").select("status").eq("problem_id", problemId).eq("developer_id", developerId).maybeSingle();
        if (error) {
            toast.error("Error: " + error.message);
        } else {
            setRequestStatus(data?.status ?? null);
        }
    }

    const getUserName = async (userId: string) => {
        const { data, error } = await supabase.from("profiles").select("full_name").eq("id", userId).single();
        if (error) {
            toast.error("Error: " + error.message);
        } else {
            return data.full_name;
        }
    }

    useEffect(() => {
        const getUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                toast.error("Error: " + error.message);
            } else {
                const { data, error } = await supabase.from("profiles").select("user_type").eq("id", user?.id).maybeSingle();
                if (error) {
                    toast.error("Error: " + error.message);
                } else {
                    if (data) {
                        setIsClient(data.user_type === "client");
                    }
                    if (user) {
                        getRequestStatus(problem.id, user.id);
                    }
                }
                getUserName(problem.user_id).then((name) => setUserName(name));
            }
        }
        getUser();
    }, []);


    const handleShowContact = async (userId: string) => {
        const { data, error } = await supabase.from("profiles").select("contact_email, phone").eq("id", userId).single();
        if (error) {
            toast.error("Error: " + error.message);
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
        })

        if (error) {
            toast.error("Error requesting contact: " + error.message);
        } else {
            toast.success("Contact request sent successfully!");
            setRequestStatus("pending");
        }
    }

    return (
        <div className="problem-card">
            <h3>{problem.title}</h3>
            <button onClick={() => setIsExpanded(true)} className="buttons">Show more</button>
            {isExpanded && (
                <div className="modal-overlay" onClick={() => setIsExpanded(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setIsExpanded(false)} className="close-button">✖</button>
                        <div className="problem-details">
                            <p><strong>{problem.title}</strong></p>
                            <p><strong>Summary: </strong>{problem.summary}</p>
                            <p><strong>Explanation: </strong>{problem.explanation}</p>
                            <p><strong>Solution: </strong>{problem.solution}</p>
                        </div>
                        <p>Posted by: {problem.user_id}</p>
                        <p>Posted at: {problem.created_at}</p>
                        {!isClient && (
                            <div>
                                {problem.contact_request && (
                                    <div>
                                        {requestStatus === null && <button onClick={() => handleRequestContact(problem.id, problem.user_id)}>Request Contact</button>}
                                        {requestStatus === "pending" && <div><p>Request already sent</p><button onClick={() => navigate("/requests")} className='buttons'>Visit Requests Page</button></div>}
                                        {requestStatus === "approved" && <div><p>Contact approved</p><button onClick={() => navigate("/requests")} className='buttons'>Visit Requests Page</button><button onClick={() => contactInfo ? setContactInfo(null) : handleShowContact(problem.user_id)} className='buttons'>{contactInfo ? "Hide" : "Show"} Contact</button></div>}
                                        {requestStatus === "declined" && <div><p>Contact declined</p><button onClick={() => navigate("/requests")} className='buttons'>Visit Requests Page</button></div>}
                                    </div>
                                )}

                                {problem.contact_request === false && (
                                    <button onClick={() => contactInfo ? setContactInfo(null) : handleShowContact(problem.user_id)} className="buttons">{contactInfo ? "Hide" : "Show"} Contact</button>
                                )}

                                {contactInfo && (
                                    <div>
                                        <p><strong>Client Name: </strong>{userName}</p>
                                        <p><strong>Email: </strong>{contactInfo.email}</p>
                                        <p><strong>Phone: </strong>{contactInfo.phone}</p>
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