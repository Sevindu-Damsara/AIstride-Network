import { useState } from "react";
import { supabase } from "./utils/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Sidebar from "./Sidebar";

export default function SubmitProblem() {
    const [problem, setProblem] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!problem.trim()) {
            toast.error("Please describe your problem before submitting.");
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const response = await supabase.functions.invoke("process-problem", { body: { problem } });
            if (response.error) {
                setError(response.error.message);
                toast.error("Failed to process problem: " + response.error.message);
                setLoading(false);
                return;
            }
            toast.success("Problem processed successfully!");
            setLoading(false);
            navigate('/post', { state: { result: response.data } });
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
            toast.error("An unexpected error occurred.");
            setLoading(false);
        }
    };
    return (
        <div>
            <Sidebar />
            <div className="main">
                <div style={{ textAlign: "center", justifyContent: "center" }}>
                    <h1>Submit Problem</h1>
                    <form className="form" onSubmit={handleSubmit}>
                        <textarea value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="Explain your problem roughly" rows={4} cols={50} maxLength={2000} required />
                        <p className="p">You don't have to make it perfect! Just explain in simple English and our AI will do the rest.</p>
                        <button type="submit" disabled={loading}>{loading ? "Processing..." : "Submit"}</button>
                    </form>
                    {loading && <p style={{ color: "var(--accent-border)" }}>Processing Your Problem with AI...</p>}
                    {error && <p style={{ color: "#f87171" }}>{"An Error Occured: " + error}</p>}
                </div>
            </div>
        </div>
    );
}