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
        toast.success("Problem Submitted Successfully!");
        setLoading(true);
        setError(null);
        const response = await supabase.functions.invoke("process-problem", { body: { problem } });
        if (response.error) {
            setError(response.error.message);
            setLoading(false);
            return;
        }
        setLoading(false);
        navigate('/post', { state: { result: response.data } });
    };
    return (
        <div>
            <Sidebar />
            <div className="main">
                <div style={{ textAlign: "center", justifyContent: "center" }}>
                    <h1>Submit Problem</h1>
                    <form className="form" onSubmit={handleSubmit}>
                        <textarea value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="Explain your problem roughly" rows={4} cols={50} maxLength={2000} />
                        <p className="p">You don't have to make it perfect! just explain in simple English and our AI will do the rest.</p>
                        <button type="submit">Submit</button>
                    </form>
                    {loading && <p style={{ color: "var(--text)" }}>Processing Your Problem...</p>}
                    {error && <p style={{ color: "red" }}>{"An Error Occured: " + error}</p>}
                </div>
            </div>
        </div>
    );
}