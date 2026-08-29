import { useEffect, useState } from "react";
import { supabase } from "./utils/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Sidebar from "./Sidebar";

export interface Problem {
    id: string;
    title: string;
    summary: string;
    solution: string;
    explanation: string;
    user_id: string;
    created_at: string;
    show_email: boolean;
    show_phone: boolean;
    contact_request: boolean;
}

export default function MyProblems() {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editSummary, setEditSummary] = useState("");
    const [editSolution, setEditSolution] = useState("");
    const [editExplanation, setEditExplanation] = useState("");
    const [editShowEmail, setEditShowEmail] = useState(false);
    const [editShowPhone, setEditShowPhone] = useState(false);
    const [editContactRequest, setEditContactRequest] = useState(false);
    const [saving, setSaving] = useState(false);

    const [deletingProblem, setDeletingProblem] = useState<Problem | null>(null);
    const [deleting, setDeleting] = useState(false);

    const navigate = useNavigate();

    const fetchMyProblems = async () => {
        setLoading(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            toast.error("Please login to view your problems.");
            navigate("/login");
            return;
        }

        setUserId(user.id);

        const { data, error } = await supabase
            .from("problems")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            toast.error("Error fetching your problems: " + error.message);
        } else {
            setProblems(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMyProblems();
    }, []);

    const handleOpenEdit = (problem: Problem) => {
        setEditingProblem(problem);
        setEditTitle(problem.title || "");
        setEditSummary(problem.summary || "");
        setEditSolution(problem.solution || "");
        setEditExplanation(problem.explanation || "");
        setEditShowEmail(problem.show_email ?? false);
        setEditShowPhone(problem.show_phone ?? false);
        setEditContactRequest(problem.contact_request ?? false);
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProblem || !userId) return;

        if (!editShowEmail && !editShowPhone) {
            toast.error("Please select at least one contact method (Email or Phone) to share.");
            return;
        }

        setSaving(true);
        const { error } = await supabase
            .from("problems")
            .update({
                title: editTitle,
                summary: editSummary,
                solution: editSolution,
                explanation: editExplanation,
                show_email: editShowEmail,
                show_phone: editShowPhone,
                contact_request: editContactRequest,
            })
            .eq("id", editingProblem.id)
            .eq("user_id", userId);

        setSaving(false);

        if (error) {
            toast.error("Error updating problem: " + error.message);
        } else {
            toast.success("Problem updated successfully!");
            setEditingProblem(null);
            fetchMyProblems();
        }
    };

    const handleDelete = async () => {
        if (!deletingProblem || !userId) return;

        setDeleting(true);
        const { error } = await supabase
            .from("problems")
            .delete()
            .eq("id", deletingProblem.id)
            .eq("user_id", userId);

        setDeleting(false);

        if (error) {
            toast.error("Error deleting problem: " + error.message);
        } else {
            toast.success("Problem deleted successfully!");
            setProblems((prev) => prev.filter((p) => p.id !== deletingProblem.id));
            setDeletingProblem(null);
        }
    };

    return (
        <div>
            <Sidebar />
            <div className="main">
                <div className="my-problems-header">
                    <h1>My Problems</h1>
                    <button
                        className="button submit-new-btn"
                        onClick={() => navigate("/submit")}
                    >
                        ➕ Submit New Problem
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", marginTop: "40px" }}>
                        <h3 style={{ color: "var(--accent-border)" }}>Loading your problems...</h3>
                    </div>
                ) : problems.length === 0 ? (
                    <div className="empty-problems-container">
                        <p className="empty-text">You haven't submitted any problems yet.</p>
                        <button className="button" onClick={() => navigate("/submit")}>
                            Submit Your First Problem
                        </button>
                    </div>
                ) : (
                    <ul className="problems-list">
                        {problems.map((problem) => (
                            <li key={problem.id} className="problem-card my-problem-card">
                                <h3>{problem.title}</h3>
                                <div className="problem-card-content">
                                    <p><strong>Summary:</strong> {problem.summary}</p>
                                    <p><strong>Solution:</strong> {problem.solution}</p>
                                    <p><strong>Explanation:</strong> {problem.explanation}</p>
                                    <p className="problem-meta">
                                        <strong>Posted on:</strong> {new Date(problem.created_at).toLocaleDateString()} |
                                        <strong> Email Shared:</strong> {problem.show_email ? "Yes" : "No"} |
                                        <strong> Phone Shared:</strong> {problem.show_phone ? "Yes" : "No"} |
                                        <strong> Direct Request Allowed:</strong> {problem.contact_request ? "Yes" : "No"}
                                    </p>
                                </div>
                                <div className="problem-actions">
                                    <button
                                        className="buttons edit-btn"
                                        onClick={() => handleOpenEdit(problem)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="buttons delete-btn"
                                        onClick={() => setDeletingProblem(problem)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {editingProblem && (
                    <div className="modal-overlay" onClick={() => setEditingProblem(null)}>
                        <div className="modal-content edit-modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="close-button" onClick={() => setEditingProblem(null)}>
                                ✖
                            </button>
                            <h2>Edit Problem</h2>
                            <form className="edit-problem-form" onSubmit={handleSaveEdit}>
                                <div>
                                    <label><strong>Title:</strong></label>
                                    <textarea
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        rows={2}
                                        required
                                    />
                                </div>
                                <div>
                                    <label><strong>Summary:</strong></label>
                                    <textarea
                                        value={editSummary}
                                        onChange={(e) => setEditSummary(e.target.value)}
                                        rows={3}
                                        required
                                    />
                                </div>
                                <div>
                                    <label><strong>Solution:</strong></label>
                                    <textarea
                                        value={editSolution}
                                        onChange={(e) => setEditSolution(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label><strong>Explanation:</strong></label>
                                    <textarea
                                        value={editExplanation}
                                        onChange={(e) => setEditExplanation(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                                <div className="checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={editShowEmail}
                                            onChange={(e) => setEditShowEmail(e.target.checked)}
                                        />
                                        Show Contact Email
                                    </label>
                                </div>
                                <div className="checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={editShowPhone}
                                            onChange={(e) => setEditShowPhone(e.target.checked)}
                                        />
                                        Show Contact Phone
                                    </label>
                                </div>
                                <div className="checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={editContactRequest}
                                            onChange={(e) => setEditContactRequest(e.target.checked)}
                                        />
                                        Allow Contact Requests
                                    </label>
                                </div>
                                <div className="modal-actions">
                                    <button type="submit" className="button" disabled={saving}>
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>
                                    <button
                                        type="button"
                                        className="buttons"
                                        onClick={() => setEditingProblem(null)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deletingProblem && (
                    <div className="modal-overlay" onClick={() => setDeletingProblem(null)}>
                        <div className="modal-content delete-modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>Confirm Deletion</h2>
                            <p>Are you sure you want to delete <strong>"{deletingProblem.title}"</strong>?</p>
                            <p className="warning-text">This action cannot be undone.</p>
                            <div className="modal-actions">
                                <button
                                    className="button danger-btn"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                >
                                    {deleting ? "Deleting..." : "Yes, Delete"}
                                </button>
                                <button
                                    className="buttons"
                                    onClick={() => setDeletingProblem(null)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
