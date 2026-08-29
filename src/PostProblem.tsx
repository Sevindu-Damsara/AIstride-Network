import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "./utils/supabase";
import { toast } from "react-hot-toast";
import Sidebar from "./Sidebar";

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
            toast.error("Title and Summary cannot be empty.");
            return;
        }

        if (!showEmail && !showPhone) {
            toast.error("Please select at least one contact method (Email or Phone) to share.");
            return;
        }

        setSubmitting(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error("You must be logged in to post");
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
            toast.error("An error occurred: " + error.message);
        } else {
            toast.success("Problem posted successfully!");
            navigate("/myproblems");
        }
    };

    if (!result) {
        return (
            <div>
                <Sidebar />
                <div className="main" style={{ textAlign: "center", marginTop: "40px" }}>
                    <h2>No Problem Selected for Review</h2>
                    <p style={{ color: "#94a3b8", marginBottom: "20px" }}>Please submit a problem description first to generate an AI solution.</p>
                    <button className="button" onClick={() => navigate("/submit")}>Go to Submit Problem</button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Sidebar />
            <div className="main">
                <h1>Review and Post</h1>
                <form className="reviewForm" onSubmit={handlePost}>
                    <div>
                        <label>Title:</label>
                        <textarea value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div>
                        <label>Summary:</label>
                        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} required />
                    </div>
                    <div>
                        <label>Solution:</label>
                        <textarea value={solution} onChange={(e) => setSolution(e.target.value)} />
                    </div>
                    <div>
                        <label>Explanation:</label>
                        <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} />
                    </div>
                    <div style={{ marginTop: '10px' }}>
                        <label>
                            <input type="checkbox" checked={showEmail} onChange={(e) => setShowEmail(e.target.checked)} />
                            Show Contact Email
                        </label>
                    </div>
                    <div>
                        <label>
                            <input type="checkbox" checked={showPhone} onChange={(e) => setShowPhone(e.target.checked)} />
                            Show Contact Phone
                        </label>
                    </div>
                    <div>
                        <label>
                            <input type="checkbox" checked={contactRequest} onChange={(e) => setContactRequest(e.target.checked)} />
                            Require Contact Request Before Sharing Details
                        </label>
                    </div>
                    <button className="button" type="submit" disabled={submitting} style={{ marginTop: '20px' }}>
                        {submitting ? "Posting..." : "Publish Problem"}
                    </button>
                </form>
            </div>
        </div>
    );
}
