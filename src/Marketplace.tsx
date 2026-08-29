import { useEffect, useState } from "react";
import { supabase } from "./utils/supabase";
import ProblemCard from "./ProblemCard";
import Sidebar from "./Sidebar";
import { toast } from "react-hot-toast";

export default function Marketplace() {
    const [problems, setProblems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterContactType, setFilterContactType] = useState<"all" | "request" | "direct">("all");

    useEffect(() => {
        setLoading(true);
        const fetchProblems = async () => {
            const { data, error } = await supabase
                .from("problems")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                toast.error("Error fetching problems!");
            } else {
                setProblems(data || []);
            }
            setLoading(false);
        };
        fetchProblems();
    }, []);

    const filteredProblems = problems.filter((item) => {
        const matchesSearch =
            (item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.summary || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.solution || "").toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (filterContactType === "request") return item.contact_request === true;
        if (filterContactType === "direct") return item.contact_request === false;

        return true;
    });

    if (loading) {
        return (
            <div>
                <Sidebar />
                <div className="main" style={{ textAlign: "center", marginTop: "40px" }}>
                    <h3 style={{ color: "var(--accent-border)" }}>Loading marketplace problems...</h3>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Sidebar />
            <div className="main">
                <h1>Problems Marketplace</h1>
                
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
                    <input
                        type="text"
                        placeholder="🔍 Search problems by title, keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ flex: 1, minWidth: "240px", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--accent-border)", backgroundColor: "rgba(255,255,255,0.05)", color: "white" }}
                    />
                    <select
                        value={filterContactType}
                        onChange={(e) => setFilterContactType(e.target.value as any)}
                        style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--accent-border)", backgroundColor: "#1e293b", color: "white" }}
                    >
                        <option value="all">All Contact Methods</option>
                        <option value="request">Request Required</option>
                        <option value="direct">Direct Contact</option>
                    </select>
                </div>

                {filteredProblems.length === 0 ? (
                    <div style={{ textAlign: "center", marginTop: "40px", color: "#94a3b8" }}>
                        <h3>No problems match your search or filter.</h3>
                        <p>Try adjusting your search query or clear filters.</p>
                    </div>
                ) : (
                    <ul className="problems-list">
                        {filteredProblems.map((singleProblem) => (
                            <ProblemCard key={singleProblem.id} problem={singleProblem} />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}