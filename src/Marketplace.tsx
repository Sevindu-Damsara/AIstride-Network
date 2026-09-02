import { useEffect, useState } from "react";
import { supabase } from "./utils/supabase";
import ProblemCard from "./ProblemCard";
import Sidebar from "./Sidebar";
import { SkeletonGrid } from "./SkeletonCard";
import { toast } from "react-hot-toast";
import { Search, Filter, Layers, RotateCcw, FileQuestion, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 6;

export default function Marketplace() {
    const [problems, setProblems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterContactType, setFilterContactType] = useState<"all" | "request" | "direct">("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalCount, setTotalCount] = useState<number>(0);

    useEffect(() => {
        setLoading(true);
        const fetchProblems = async () => {
            let query = supabase
                .from("problems")
                .select("*", { count: "exact" })
                .order("created_at", { ascending: false });

            if (filterContactType === "request") {
                query = query.eq("contact_request", true);
            } else if (filterContactType === "direct") {
                query = query.eq("contact_request", false);
            }

            if (filterStatus !== "all") {
                query = query.eq("status", filterStatus);
            }

            const from = currentPage * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;
            query = query.range(from, to);

            const { data, count, error } = await query;

            if (error) {
                toast.error("Error loading marketplace data: " + error.message);
            } else {
                setProblems(data || []);
                setTotalCount(count || 0);
            }
            setLoading(false);
        };
        fetchProblems();
    }, [currentPage, filterContactType, filterStatus]);

    // Handle filter reset
    const handleResetFilters = () => {
        setSearchQuery("");
        setFilterContactType("all");
        setFilterStatus("all");
        setCurrentPage(0);
    };

    const filteredProblems = problems.filter((item) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            (item.title || "").toLowerCase().includes(q) ||
            (item.summary || "").toLowerCase().includes(q) ||
            (item.solution || "").toLowerCase().includes(q)
        );
    });

    const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

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
                            <span>{totalCount} {totalCount === 1 ? "Problem Listed" : "Problems Listed"}</span>
                        </div>
                    )}
                </div>

                <div className="controls-bar" style={{ flexWrap: 'wrap', gap: '12px' }}>
                    <div className="search-input-wrapper" style={{ flex: '1 1 300px' }}>
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Filter size={16} style={{ color: '#94a3b8' }} />
                            <select
                                className="form-select"
                                value={filterContactType}
                                onChange={(e) => {
                                    setFilterContactType(e.target.value as any);
                                    setCurrentPage(0);
                                }}
                            >
                                <option value="all">All Protocols</option>
                                <option value="request">Approval Required</option>
                                <option value="direct">Direct Contact Allowed</option>
                            </select>
                        </div>

                        <select
                            className="form-select"
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setCurrentPage(0);
                            }}
                        >
                            <option value="all">All Statuses</option>
                            <option value="open">Open</option>
                            <option value="in_review">In Review</option>
                            <option value="resolved">Resolved</option>
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
                            No problems match your query. Try broadening your keywords or clearing filters.
                        </p>
                        {(searchQuery || filterContactType !== "all" || filterStatus !== "all") && (
                            <button
                                className="buttons buttons-secondary"
                                onClick={handleResetFilters}
                            >
                                <RotateCcw size={16} />
                                <span>Reset Filters</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="problems-grid">
                            {filteredProblems.map((singleProblem) => (
                                <ProblemCard key={singleProblem.id} problem={singleProblem} />
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '32px', padding: '16px 0' }}>
                                <button
                                    className="buttons buttons-secondary"
                                    onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                                    disabled={currentPage === 0}
                                    style={{ padding: '8px 14px', opacity: currentPage === 0 ? 0.5 : 1 }}
                                >
                                    <ChevronLeft size={16} />
                                    <span>Previous</span>
                                </button>

                                <span style={{ color: '#94a3b8', fontSize: '0.88rem', fontWeight: 500 }}>
                                    Page <strong style={{ color: '#f1f5f9' }}>{currentPage + 1}</strong> of {totalPages}
                                </span>

                                <button
                                    className="buttons buttons-secondary"
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                                    disabled={currentPage >= totalPages - 1}
                                    style={{ padding: '8px 14px', opacity: currentPage >= totalPages - 1 ? 0.5 : 1 }}
                                >
                                    <span>Next</span>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}