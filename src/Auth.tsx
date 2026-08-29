import { useState } from "react";
import { supabase } from "./utils/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

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
            toast.error("Passwords do not match!");
            return;
        }

        setLoading(true);

        if (isSignUp) {
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) {
                toast.error(error.message);
            } else {
                if (data.session) {
                    toast.success("Account created successfully!");
                    navigate("/", { replace: true });
                } else {
                    toast.success("Check your email for a confirmation link!");
                }
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) toast.error(error.message);
            else {
                toast.success("Logged in successfully!");
                navigate("/", { replace: true });
            }
        }
        setLoading(false);
    };

    return (
        <div style={{ textAlign: "center", justifyContent: "center" }}>
            <h1>{isSignUp ? "Sign Up" : "Log In"}</h1>
            <form className="form" onSubmit={handleAuth}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 characters)" required />
                {isSignUp && (
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" required />
                )}
                <button type="submit" disabled={loading}>{loading ? "Loading..." : isSignUp ? "Sign Up" : "Log In"}</button>
            </form>
            <button onClick={() => { setIsSignUp(!isSignUp); setConfirmPassword(""); }}>
                {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
            </button>
        </div>
    );
}