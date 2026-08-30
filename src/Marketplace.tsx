import { useEffect, useState } from "react";
import { supabase } from "./utils/supabase";
import ProblemCard from "./ProblemCard";
import Sidebar from "./Sidebar";
import { SkeletonGrid } from "./SkeletonCard";
import { toast } from "react-hot-toast";
import { Search, Filter, Layers, RotateCcw, FileQuestion } from "lucide-react";

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
                toast.error("Error loading marketplace data.");
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

    return (
        <div>
            <Sidebar />
            <div className="main">
                <div className="page-header">
                    <div className="page-header-text">
                        <h1>Problems Marketplace</h1>
                        <p>Discover technical challenges posted by organizations and submit AI-driven solutions.</p>
                    </div>
                    {!loading && (
                        <div className="badge badge-indigo">
                            <Layers size={14} />
                            <span>{problems.length} {problems.length === 1 ? "Problem Listed" : "Problems Listed"}</span>
                        </div>
                    )}
                </div>

                <div className="controls-bar">
                    <div className="search-input-wrapper">
                        <div className="search-input-icon">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search problems by title, keywords, or technology stack..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Filter size={16} style={{ color: '#94a3b8' }} />
                        <select
                            className="form-select"
                            value={filterContactType}
                            onChange={(e) => setFilterContactType(e.target.value as any)}
                        >
                            <option value="all">All Contact Protocols</option>
                            <option value="request">Approval Required</option>
                            <option value="direct">Direct Contact Allowed</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <SkeletonGrid count={6} />
                ) : filteredProblems.length === 0 ? (
                    <div className="empty-state-card">
                        <div className="empty-state-icon">
                            <FileQuestion size={24} />
                        </div>
                        <h3 style={{ marginBottom: "8px" }}>No matching problems found</h3>
                        <p style={{ marginBottom: "20px" }}>
                            No problems match your query. Try broadening your keywords or clearing contact filters.
                        </p>
                        {(searchQuery || filterContactType !== "all") && (
                            <button
                                className="buttons buttons-secondary"
                                onClick={() => { setSearchQuery(""); setFilterContactType("all"); }}
                            >
                                <RotateCcw size={16} />
                                <span>Reset Filters</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="problems-grid">
                        {filteredProblems.map((singleProblem) => (
                            <ProblemCard key={singleProblem.id} problem={singleProblem} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}