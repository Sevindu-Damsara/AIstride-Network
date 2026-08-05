import { useState, useEffect } from 'react'
import { supabase } from './utils/supabase'
import { useNavigate } from 'react-router-dom'

export default function Sidebar() {
    const [showMenu, setShowMenu] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                console.error("Error: " + error.message);
                setIsLoggedIn(false);
            } else {
                setIsLoggedIn(true);
            }
            if (user === null) {
                navigate("/login");
            }
        }
        getUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsLoggedIn(false);
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
                        {isLoggedIn && <li onClick={() => navigate("/requests")}>My Requests</li>}
                        {isLoggedIn && <li onClick={() => handleLogout()}>Logout</li>}
                        {!isLoggedIn && <li onClick={() => navigate("/login")}>Login</li>}
                    </ul>
                </div>
            </aside >
        </div>
    );
}