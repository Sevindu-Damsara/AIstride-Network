import { useState, useEffect } from 'react'
import { supabase } from './utils/supabase'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

export default function Sidebar() {
    const [showMenu, setShowMenu] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsLoggedIn(!!session);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session);
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsLoggedIn(false);
        toast.success("Logged out successfully");
        navigate("/login");
    }
    return (
        <div>
            {showMenu && <div className="sidebar-overlay" onClick={() => setShowMenu(false)}></div>}
            <aside className="sidebar" >
                <div>
                    <button onClick={() => setShowMenu(!showMenu)} className="sidebar-button">{showMenu ? "✕ Menu" : "☰ Menu"}</button>
                    <ul className={showMenu ? "sidebar-menu open" : "sidebar-menu"}>
                        <li onClick={() => navigate("/")}>Home</li>
                        {isLoggedIn && <li onClick={() => navigate("/profile")}>My Profile</li>}
                        {isLoggedIn && <li onClick={() => navigate("/submit")}>Submit a Problem</li>}
                        {isLoggedIn && <li onClick={() => navigate("/myproblems")}>My Problems</li>}
                        {isLoggedIn && <li onClick={() => navigate("/requests")}>My Requests</li>}
                        {isLoggedIn && <li onClick={() => handleLogout()}>Logout</li>}
                        {!isLoggedIn && <li onClick={() => navigate("/login")}>Login</li>}
                    </ul>
                </div>
            </aside >
        </div>
    );
}