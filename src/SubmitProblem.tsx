import { useState } from "react";
import { supabase } from "./utils/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Sidebar from "./Sidebar";
import { Cpu, Send } from "lucide-react";

export default function SubmitProblem() {
    const [problem, setProblem] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!problem.trim()) {
            toast.error("Please describe the technical problem statement before submitting.");
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
            toast.success("Problem statement processed successfully.");
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
                <div className="page-header" style={{ justifyContent: 'center', textAlign: 'center' }}>
                    <div className="page-header-text">
                        <h1>Submit Problem Statement</h1>
                        <p>Describe your challenge in plain text. Our AI engine will structure it into an executive specification.</p>
                    </div>
                </div>

                <form className="form-card" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Technical Challenge Description</label>
                        <textarea
                            className="form-textarea"
                            value={problem}
                            onChange={(e) => setProblem(e.target.value)}
                            placeholder="Describe your operational bottleneck, data requirements, or technology objective..."
                            rows={6}
                            maxLength={2000}
                            required
                        />
                    </div>

                    <p style={{ color: "#94a3b8", fontSize: "0.88rem" }}>
                        Our natural language processing pipeline will synthesize your input into a formal title, summary, solution framework, and technical explanation.
                    </p>

                    <button type="submit" className="buttons" disabled={loading} style={{ marginTop: '8px' }}>
                        {loading ? <Cpu size={16} className="animate-spin" /> : <Send size={16} />}
                        <span>{loading ? "Synthesizing Specifications..." : "Submit for AI Processing"}</span>
                    </button>

                    {error && (
                        <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#f87171', fontSize: '0.88rem' }}>
                            Processing error: {error}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}