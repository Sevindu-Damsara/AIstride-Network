import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "./utils/supabase";
import { toast } from "react-hot-toast";
import Sidebar from "./Sidebar";
import { CheckCircle2, ArrowLeft, Send } from "lucide-react";

function toText(value: any): string {
    if (typeof value === "string") return value;
    if (value == null) return "";
    return JSON.stringify(value, null, 2);
}

export default function PostProblem() {
    const location = useLocation();
    const navigate = useNavigate();
    const result = location.state?.result;

    const [title, setTitle] = useState(toText(result?.title));
    const [summary, setSummary] = useState(toText(result?.summary));
    const [solution, setSolution] = useState(toText(result?.solution));
    const [explanation, setExplanation] = useState(toText(result?.explanation));
    const [showEmail, setShowEmail] = useState(true);
    const [showPhone, setShowPhone] = useState(false);
    const [contactRequest, setContactRequest] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const handlePost = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!title.trim() || !summary.trim()) {
            toast.error("Title and Executive Summary are required.");
            return;
        }

        if (!showEmail && !showPhone) {
            toast.error("Please select at least one contact method (Email or Phone) to share.");
            return;
        }

        setSubmitting(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error("Authentication required to publish submission.");
            setSubmitting(false);
            return;
        }
        const { error } = await supabase.from("problems").insert({
            title,
            summary,
            solution,
            explanation,
            user_id: user.id,
            show_email: showEmail,
            show_phone: showPhone,
            contact_request: contactRequest
        });

        setSubmitting(false);

        if (error) {
            toast.error("Error publishing submission: " + error.message);
        } else {
            toast.success("Problem published to marketplace successfully.");
            navigate("/myproblems");
        }
    };

    if (!result) {
        return (
            <div>
                <Sidebar />
                <div className="main">
                    <div className="empty-state-card">
                        <h3>No Synthesized Specification Selected</h3>
                        <p style={{ marginBottom: "20px" }}>
                            Please submit a problem description first to generate an AI specification.
                        </p>
                        <button className="buttons" onClick={() => navigate("/submit")}>
                            <ArrowLeft size={16} />
                            <span>Go to Submit Problem</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Sidebar />
            <div className="main">
                <div className="page-header">
                    <div className="page-header-text">
                        <h1>Review & Publish Specification</h1>
                        <p>Verify and refine the AI-synthesized challenge specification before publishing to the marketplace.</p>
                    </div>
                </div>

                <form className="form-card" onSubmit={handlePost} style={{ maxWidth: '720px' }}>
                    <div className="form-group">
                        <label>Challenge Title</label>
                        <input
                            type="text"
                            className="form-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Executive Summary</label>
                        <textarea
                            className="form-textarea"
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            rows={3}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Target Solution & Deliverable Expectations</label>
                        <textarea
                            className="form-textarea"
                            value={solution}
                            onChange={(e) => setSolution(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <label>Detailed Technical Explanation</label>
                        <textarea
                            className="form-textarea"
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            rows={4}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '8px 0', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
                        <label className="checkbox-group">
                            <input
                                type="checkbox"
                                checked={showEmail}
                                onChange={(e) => setShowEmail(e.target.checked)}
                            />
                            <span>Display contact email to authorized developers</span>
                        </label>

                        <label className="checkbox-group">
                            <input
                                type="checkbox"
                                checked={showPhone}
                                onChange={(e) => setShowPhone(e.target.checked)}
                            />
                            <span>Display contact phone number to authorized developers</span>
                        </label>

                        <label className="checkbox-group">
                            <input
                                type="checkbox"
                                checked={contactRequest}
                                onChange={(e) => setContactRequest(e.target.checked)}
                            />
                            <span>Require authorization approval before releasing contact details</span>
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <button className="buttons" type="submit" disabled={submitting}>
                            {submitting ? <CheckCircle2 size={16} /> : <Send size={16} />}
                            <span>{submitting ? "Publishing..." : "Publish Problem to Marketplace"}</span>
                        </button>
                        <button className="buttons buttons-secondary" type="button" onClick={() => navigate("/submit")}>
                            <span>Back</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
