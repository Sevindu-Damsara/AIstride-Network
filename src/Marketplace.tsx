import { useEffect, useState } from "react";
import { supabase } from "./utils/supabase";
import ProblemCard from "./ProblemCard";
import Sidebar from "./Sidebar";
import { toast } from "react-hot-toast";

export default function Marketplace() {
    const [problems, setProblems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const fetchProblems = async () => {
            const { data, error } = await supabase.from("problems").select("*");
            if (error) {
                toast.error("Error fetching problems!");
            } else {
                setProblems(data || []);
            }
            setLoading(false);
        };
        fetchProblems();
    }, []);

    if (loading) {
        return <div style={{ textAlign: "center", justifyContent: "center" }}>
            <h3 style={{ color: "var(--accent-border)" }}>Loading...</h3>
        </div>;
    }

    return (
        <div>
            <Sidebar />
            <div className="main">
                <h1>Problems Marketplace</h1>
                <ul className="problems-list">
                    {problems.map((singleProblem) => (
                        <ProblemCard key={singleProblem.id} problem={singleProblem} />
                    ))}
                </ul>
            </div>
        </div>
    );
}