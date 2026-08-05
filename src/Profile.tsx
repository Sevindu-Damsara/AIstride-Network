import { supabase } from "./utils/supabase";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

export interface UserProfile {
    id: string;
    full_name: string;
    bio: string;
    user_type: 'developer' | 'client';
    email: string;
    contact_email: string;
    phone: string;
    profession?: string;
    github_url?: string;
    linkedin_url?: string;
    website_url?: string;
    qualifications?: string;
}

export default function Profile({ setIsNewUser, isNewUser }: { setIsNewUser: (value: boolean) => void, isNewUser: boolean }) {

    const [profile, setProfile] = useState<UserProfile>({
        id: '',
        full_name: '',
        bio: '',
        user_type: 'client',
        email: '',
        contact_email: '',
        phone: '',
        profession: '',
        github_url: '',
        linkedin_url: '',
        website_url: '',
        qualifications: '',
    });

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                setProfile((prev) => ({
                    ...prev,
                    id: user.id,
                    full_name: user.user_metadata.full_name || '',
                    email: user.email || '',
                }));

                if (error?.code === 'PGRST116') {
                    setIsNewUser(true);
                    setProfile((prev) => ({
                        ...prev,
                        contact_email: user.email || '',
                    }));
                } else {
                    setProfile((prev) => ({
                        ...prev,
                        ...profile,
                    }));
                }
            }
        }
        fetchUser();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { error } = await supabase
            .from('profiles')
            .upsert(profile);

        if (error) {
            console.error("Error: ", error.message);
        } else {
            setIsNewUser(false);
            alert("Profile Saved Successfully!");
        }
    };

    return (
        <div>
            <Sidebar />
            <div className="main">
                {isNewUser ? (<h1>Please Complete Your Profile!</h1>) : (<h1>Profile</h1>)}
                <form onSubmit={handleSubmit} className="profile-form">
                    <label>
                        <strong>Full Name:</strong> <br />
                        <input type="text" name="full_name" value={profile.full_name} onChange={handleChange} />
                    </label><br /><br />
                    <label>
                        <strong>Bio:</strong> <br />
                        <textarea name="bio" value={profile.bio} onChange={handleChange}></textarea>
                    </label><br /><br />
                    <label>
                        <strong>User Type:</strong> <br />
                        <select name="user_type" value={profile.user_type} onChange={handleChange}>
                            <option value="developer">Developer</option>
                            <option value="client">Client</option>
                        </select>
                    </label><br /><br />
                    <label>
                        <strong>Phone:</strong> <br />
                        <input type="text" name="phone" value={profile.phone} onChange={handleChange} />
                    </label><br /><br />
                    <label>
                        <strong>Email:</strong> <br />
                        <input type="text" name="email" value={profile.email} disabled />
                    </label><br /><br />
                    <label>
                        <strong>Contact Email:</strong> <br />
                        <input type="text" name="contact_email" value={profile.contact_email} onChange={handleChange} />
                    </label><br /><br />
                    {profile.user_type === 'developer' && (
                        <div>
                            <label>
                                <strong>Profession:</strong> <br />
                                <input type="text" name="profession" value={profile.profession} onChange={handleChange} />
                            </label><br /><br />
                            <label>
                                <strong>GitHub:</strong> <br />
                                <input type="text" name="github_url" value={profile.github_url} onChange={handleChange} />
                            </label><br /><br />
                            <label>
                                <strong>LinkedIn:</strong> <br />
                                <input type="text" name="linkedin_url" value={profile.linkedin_url} onChange={handleChange} />
                            </label><br /><br />
                            <label>
                                <strong>Website:</strong> <br />
                                <input type="text" name="website_url" value={profile.website_url} onChange={handleChange} />
                            </label><br /><br />
                            <label>
                                <strong>Qualifications:</strong> <br />
                                <input type="text" name="qualifications" value={profile.qualifications} onChange={handleChange} />
                            </label><br /><br />
                        </div>
                    )}

                    <button type="submit">Save Profile</button>
                </form>
            </div>
        </div>
    )
}