import { useState, useEffect } from 'react';
import { supabase } from './utils/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    Home,
    User,
    PlusSquare,
    FolderKanban,
    Inbox,
    LogOut,
    LogIn,
    Menu,
    X,
} from 'lucide-react';

export default function Sidebar() {
    const [showMenu, setShowMenu] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

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
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <aside className="sidebar">
            {showMenu && <div className="sidebar-overlay" onClick={() => setShowMenu(false)}></div>}

            <button onClick={() => setShowMenu(!showMenu)} className="sidebar-button">
                {showMenu ? <X size={18} /> : <Menu size={18} />}
                <span>Menu</span>
            </button>

            <ul className={showMenu ? "sidebar-menu open" : "sidebar-menu"}>
                <div className="sidebar-header">
                    <div className="sidebar-header-icon">
                        <img src="/favicon.png" alt="AIstride Logo" width={35} height={35} />
                    </div>
                    <span>AIstride Network</span>
                </div>

                <div className="sidebar-nav-list">
                    <li
                        className={`sidebar-nav-item ${isActive("/") ? "active" : ""}`}
                        onClick={() => { navigate("/"); setShowMenu(false); }}
                    >
                        <Home size={18} />
                        <span>Marketplace</span>
                    </li>

                    {isLoggedIn && (
                        <li
                            className={`sidebar-nav-item ${isActive("/profile") ? "active" : ""}`}
                            onClick={() => { navigate("/profile"); setShowMenu(false); }}
                        >
                            <User size={18} />
                            <span>My Profile</span>
                        </li>
                    )}

                    {isLoggedIn && (
                        <li
                            className={`sidebar-nav-item ${isActive("/submit") ? "active" : ""}`}
                            onClick={() => { navigate("/submit"); setShowMenu(false); }}
                        >
                            <PlusSquare size={18} />
                            <span>Submit Problem</span>
                        </li>
                    )}

                    {isLoggedIn && (
                        <li
                            className={`sidebar-nav-item ${isActive("/myproblems") ? "active" : ""}`}
                            onClick={() => { navigate("/myproblems"); setShowMenu(false); }}
                        >
                            <FolderKanban size={18} />
                            <span>My Submissions</span>
                        </li>
                    )}

                    {isLoggedIn && (
                        <li
                            className={`sidebar-nav-item ${isActive("/requests") ? "active" : ""}`}
                            onClick={() => { navigate("/requests"); setShowMenu(false); }}
                        >
                            <Inbox size={18} />
                            <span>Contact Requests</span>
                        </li>
                    )}

                    {isLoggedIn ? (
                        <li className="sidebar-nav-item logout" onClick={handleLogout}>
                            <LogOut size={18} />
                            <span>Sign Out</span>
                        </li>
                    ) : (
                        <li
                            className={`sidebar-nav-item ${isActive("/login") ? "active" : ""}`}
                            onClick={() => { navigate("/login"); setShowMenu(false); }}
                        >
                            <LogIn size={18} />
                            <span>Sign In</span>
                        </li>
                    )}
                </div>
            </ul>
        </aside>
    );
}