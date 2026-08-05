import { useState } from "react";
import { supabase } from "./utils/supabase";
import { useNavigate } from "react-router-dom";

export default function Auth() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) setError(error.message);
            else {
                alert("Check your email for a confirmation link!");
            }
        }
        else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) setError(error.message);
            else {
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
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
                <button type="submit" disabled={loading}>{loading ? "Loading..." : isSignUp ? "Sign Up" : "Log In"}</button>
            </form>
            {error && <p style={{ color: "red" }}>{"An Error Occured: " + error}</p>}
            <button onClick={() => setIsSignUp(!isSignUp)}>{isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}</button>
        </div>
    );
}