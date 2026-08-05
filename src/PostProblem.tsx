import { useState } from "react";
import { useLocation } from "react-router-dom";
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
    const result = location.state?.result;
    const [title, setTitle] = useState(toText(result?.title));
    const [summary, setSummary] = useState(toText(result?.summary));
    const [solution, setSolution] = useState(toText(result?.solution));
    const [explanation, setExplanation] = useState(toText(result?.explanation));
    const [showEmail, setShowEmail] = useState(false);
    const [showPhone, setShowPhone] = useState(false);
    const [contactRequest, setContactRequest] = useState(false);

    const handlePost = async () => {
        console.log("Title: ", title);
        console.log("Summary: ", summary);
        console.log("Solution: ", solution);
        console.log("Explanation: ", explanation);

        if (!showEmail && !showPhone) {
            toast.error("Please select at least one contact method (Email or Phone) to share.");
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error("You must be logged in to post");
            return;
        }
        const { error } = await supabase.from("problems").insert({ title, summary, solution, explanation, user_id: user.id, show_email: showEmail, show_phone: showPhone, contact_request: contactRequest });
        if (error) {
            toast.error("An error occurred: " + error.message);
        } else {
            toast.success("Problem posted successfully!");
        }
    };
    return (

        <div>
            <Sidebar />
            <div className="main">
                <h1>Review and Post</h1>
                <form className="reviewForm" onSubmit={handlePost}>
                    <div>
                        <label>Title:</label>
                        <textarea value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div>
                        <label>Summary:</label>
                        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} />
                    </div>
                    <div>
                        <label>Solution:</label>
                        <textarea value={solution} onChange={(e) => setSolution(e.target.value)} />
                    </div>
                    <div>
                        <label>Explanation:</label>
                        <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} />
                    </div>
                    <div>
                        <label>Show Contact Email</label>
                        <input type="checkbox" checked={showEmail} onChange={(e) => setShowEmail(e.target.checked)} />
                    </div>
                    <div>
                        <label>Show Contact Phone</label>
                        <input type="checkbox" checked={showPhone} onChange={(e) => setShowPhone(e.target.checked)} />
                    </div>
                    <div>
                        <label>Contact Request</label>
                        <input type="checkbox" checked={contactRequest} onChange={(e) => setContactRequest(e.target.checked)} />
                    </div>
                </form>
                <button className="button" onClick={handlePost}>Post</button>
            </div>
        </div>
    )
}
