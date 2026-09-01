import { useState } from "react";
import { supabase } from "./utils/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { LogIn, UserPlus, Zap } from "lucide-react";

export default function Auth() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }

        if (isSignUp && password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setLoading(true);

        if (isSignUp) {
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) {
                toast.error(error.message);
            } else {
                toast.success("Account registered successfully.");
                navigate("/", { replace: true });
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) toast.error(error.message);
            else {
                toast.success("Authentication successful.");
                navigate("/", { replace: true });
            }
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px" }}>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #6366f1, #4338ca)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    marginBottom: "12px",
                    boxShadow: "0 4px 16px rgba(99, 102, 241, 0.4)"
                }}>
                    <Zap size={24} />
                </div>
                <h1 style={{ marginBottom: "6px" }}>AIstride Network</h1>
                <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
                    {isSignUp ? "Create an account to submit or solve technical challenges" : "Sign in to access your dashboard and submissions"}
                </p>
            </div>

            <form className="form-card" onSubmit={handleAuth} style={{ maxWidth: "420px" }}>
                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        className="form-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@organization.com"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        className="form-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        required
                    />
                </div>

                {isSignUp && (
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                            required
                        />
                    </div>
                )}

                <button type="submit" className="buttons" disabled={loading} style={{ marginTop: "8px" }}>
                    {isSignUp ? <UserPlus size={16} /> : <LogIn size={16} />}
                    <span>{loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}</span>
                </button>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px", marginTop: "8px", textAlign: "center" }}>
                    <button
                        type="button"
                        className="buttons buttons-secondary"
                        onClick={() => { setIsSignUp(!isSignUp); setConfirmPassword(""); }}
                        style={{ width: "100%" }}
                    >
                        <span>{isSignUp ? "Already registered? Sign In" : "Need an account? Register"}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}