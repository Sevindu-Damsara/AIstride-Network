import { useEffect, useState } from "react";
import { supabase } from "./utils/supabase";
import ProblemCard from "./ProblemCard";
import Sidebar from "./Sidebar";

export default function Marketplace() {
    const [problems, setProblems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const fetchProblems = async () => {
            const { data, error } = await supabase.from("problems").select("*");
            if (error) {
                console.error("Error fetching problems:", error);
            } else {
                setProblems(data || []);
            }
            setLoading(false);
        };
        fetchProblems();
    }, []);

    if (loading) {
        return <div style={{ textAlign: "center", justifyContent: "center", color: "red" }}><h3>Loading...</h3></div>;
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