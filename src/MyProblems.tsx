import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./utils/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Sidebar from "./Sidebar";
import { SkeletonGrid } from "./SkeletonCard";
import {
    Plus,
    Edit3,
    Trash2,
    Calendar,
    Mail,
    Phone,
    Lock,
    Zap,
    X,
    AlertTriangle,
    FileText
} from "lucide-react";

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

    const fetchMyProblems = useCallback(async () => {
        setLoading(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            toast.error("Please log in to manage your problem submissions.");
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
            toast.error("Error fetching submissions: " + error.message);
        } else {
            setProblems(data || []);
        }
        setLoading(false);
    }, [navigate]);

    useEffect(() => {
        fetchMyProblems();
    }, [fetchMyProblems]);

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
            toast.error("Error updating submission: " + error.message);
        } else {
            toast.success("Submission updated successfully.");
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
            toast.error("Error deleting submission: " + error.message);
        } else {
            toast.success("Submission deleted successfully.");
            setProblems((prev) => prev.filter((p) => p.id !== deletingProblem.id));
            setDeletingProblem(null);
        }
    };

    return (
        <div>
            <Sidebar />
            <div className="main">
                <div className="page-header">
                    <div className="page-header-text">
                        <h1>My Submissions</h1>
                        <p>Manage, modify, or remove your submitted problem statements and track communication protocols.</p>
                    </div>
                    <button
                        className="buttons"
                        onClick={() => navigate("/submit")}
                    >
                        <Plus size={16} />
                        <span>Submit New Problem</span>
                    </button>
                </div>

                {loading ? (
                    <SkeletonGrid count={3} />
                ) : problems.length === 0 ? (
                    <div className="empty-state-card">
                        <div className="empty-state-icon">
                            <FileText size={24} />
                        </div>
                        <h3 style={{ marginBottom: "8px" }}>No Active Submissions</h3>
                        <p style={{ marginBottom: "20px" }}>
                            You have not submitted any technical challenges yet.
                        </p>
                        <button className="buttons" onClick={() => navigate("/submit")}>
                            <Plus size={16} />
                            <span>Create First Submission</span>
                        </button>
                    </div>
                ) : (
                    <div className="problems-grid">
                        {problems.map((problem) => (
                            <div key={problem.id} className="problem-card">
                                <div>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                        <span className={`badge ${problem.contact_request ? 'badge-amber' : 'badge-emerald'}`}>
                                            {problem.contact_request ? <Lock size={12} /> : <Zap size={12} />}
                                            <span>{problem.contact_request ? 'Approval Required' : 'Direct Contact'}</span>
                                        </span>
                                        {problem.show_email && (
                                            <span className="badge badge-indigo">
                                                <Mail size={12} />
                                                <span>Email</span>
                                            </span>
                                        )}
                                        {problem.show_phone && (
                                            <span className="badge badge-indigo">
                                                <Phone size={12} />
                                                <span>Phone</span>
                                            </span>
                                        )}
                                    </div>
                                    <h3>{problem.title}</h3>
                                    <p className="problem-summary-preview">{problem.summary}</p>
                                </div>

                                <div>
                                    <div className="problem-card-footer" style={{ marginBottom: '12px', marginTop: '10px' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={12} />
                                            <span>{new Date(problem.created_at).toLocaleDateString()}</span>
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                        <button
                                            className="buttons buttons-secondary"
                                            onClick={() => handleOpenEdit(problem)}
                                            style={{ padding: '7px 12px', fontSize: '0.84rem' }}
                                        >
                                            <Edit3 size={14} />
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            className="buttons danger-btn"
                                            onClick={() => setDeletingProblem(problem)}
                                            style={{ padding: '7px 12px', fontSize: '0.84rem' }}
                                        >
                                            <Trash2 size={14} />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Edit Modal */}
                {editingProblem && createPortal(
                    <div className="modal-overlay" onClick={() => setEditingProblem(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="close-button" onClick={() => setEditingProblem(null)}>
                                <X size={18} />
                            </button>
                            <h2 style={{ marginBottom: '16px' }}>Edit Submission</h2>
                            
                            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div className="form-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Executive Summary</label>
                                    <textarea
                                        className="form-textarea"
                                        value={editSummary}
                                        onChange={(e) => setEditSummary(e.target.value)}
                                        rows={3}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Target Solution & Outcome</label>
                                    <textarea
                                        className="form-textarea"
                                        value={editSolution}
                                        onChange={(e) => setEditSolution(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Detailed Explanation</label>
                                    <textarea
                                        className="form-textarea"
                                        value={editExplanation}
                                        onChange={(e) => setEditExplanation(e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '8px 0' }}>
                                    <label className="checkbox-group">
                                        <input
                                            type="checkbox"
                                            checked={editShowEmail}
                                            onChange={(e) => setEditShowEmail(e.target.checked)}
                                        />
                                        <span>Display contact email to authorized developers</span>
                                    </label>
                                    <label className="checkbox-group">
                                        <input
                                            type="checkbox"
                                            checked={editShowPhone}
                                            onChange={(e) => setEditShowPhone(e.target.checked)}
                                        />
                                        <span>Display contact phone number to authorized developers</span>
                                    </label>
                                    <label className="checkbox-group">
                                        <input
                                            type="checkbox"
                                            checked={editContactRequest}
                                            onChange={(e) => setEditContactRequest(e.target.checked)}
                                        />
                                        <span>Require authorization approval before releasing contact details</span>
                                    </label>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                                    <button type="submit" className="buttons" disabled={saving}>
                                        <span>{saving ? "Saving..." : "Save Changes"}</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="buttons buttons-secondary"
                                        onClick={() => setEditingProblem(null)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>,
                    document.body
                )}

                {/* Delete Confirmation Modal */}
                {deletingProblem && createPortal(
                    <div className="modal-overlay" onClick={() => setDeletingProblem(null)}>
                        <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f87171', marginBottom: '12px' }}>
                                <AlertTriangle size={22} />
                                <h2>Confirm Deletion</h2>
                            </div>
                            <p style={{ marginBottom: '12px', color: '#cbd5e1' }}>
                                Are you sure you want to delete <strong>"{deletingProblem.title}"</strong>?
                            </p>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '24px' }}>
                                This action will remove the submission permanently from the marketplace.
                            </p>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    className="buttons danger-btn"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                >
                                    <span>{deleting ? "Deleting..." : "Confirm Delete"}</span>
                                </button>
                                <button
                                    className="buttons buttons-secondary"
                                    onClick={() => setDeletingProblem(null)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </div>
    );
}
