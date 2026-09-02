import { supabase } from "./utils/supabase";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Sidebar from "./Sidebar";
import { Save, UserCheck } from "lucide-react";

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
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: userProfile, error } = await supabase
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
                        ...userProfile,
                    }));
                }
            }
        };
        fetchUser();
    }, [setIsNewUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        const { error } = await supabase
            .from('profiles')
            .upsert(profile);

        setSaving(false);

        if (error) {
            toast.error("Error saving profile settings.");
        } else {
            setIsNewUser(false);
            toast.success("Profile updated successfully.");
        }
    };

    return (
        <div>
            <Sidebar />
            <div className="main">
                <div className="page-header" style={{ justifyContent: 'center', textAlign: 'center' }}>
                    <div className="page-header-text">
                        <h1 style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                            <UserCheck size={28} style={{ color: '#818cf8' }} />
                            <span>{isNewUser ? "Complete Account Profile" : "Account Settings"}</span>
                        </h1>
                        <p>Configure your contact information, account type, and public credentials.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="form-card">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="full_name"
                            className="form-input"
                            value={profile.full_name}
                            onChange={handleChange}
                            placeholder="Enter full name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Account Role</label>
                        <select
                            name="user_type"
                            className="form-select"
                            value={profile.user_type}
                            onChange={handleChange}
                        >
                            <option value="client">Client / Organization</option>
                            <option value="developer">Developer / Researcher</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Professional Bio</label>
                        <textarea
                            name="bio"
                            className="form-textarea"
                            value={profile.bio}
                            onChange={handleChange}
                            placeholder="Brief description of your expertise or organization"
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <label>Account Email (Primary Authentication)</label>
                        <input
                            type="text"
                            name="email"
                            className="form-input"
                            value={profile.email}
                            disabled
                            style={{ opacity: 0.65, cursor: 'not-allowed' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Public Contact Email</label>
                        <input
                            type="email"
                            name="contact_email"
                            className="form-input"
                            value={profile.contact_email}
                            onChange={handleChange}
                            placeholder="contact@organization.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Contact Phone Number</label>
                        <input
                            type="text"
                            name="phone"
                            className="form-input"
                            value={profile.phone}
                            onChange={handleChange}
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>

                    {profile.user_type === 'developer' && (
                        <>
                            <div className="form-group">
                                <label>Specialization / Profession</label>
                                <input
                                    type="text"
                                    name="profession"
                                    className="form-input"
                                    value={profile.profession || ''}
                                    onChange={handleChange}
                                    placeholder="e.g., Computer Vision Engineer, NLP Specialist"
                                />
                            </div>

                            <div className="form-group">
                                <label>GitHub Profile URL</label>
                                <input
                                    type="url"
                                    name="github_url"
                                    className="form-input"
                                    value={profile.github_url || ''}
                                    onChange={handleChange}
                                    placeholder="https://github.com/username"
                                />
                            </div>

                            <div className="form-group">
                                <label>LinkedIn Profile URL</label>
                                <input
                                    type="url"
                                    name="linkedin_url"
                                    className="form-input"
                                    value={profile.linkedin_url || ''}
                                    onChange={handleChange}
                                    placeholder="https://linkedin.com/in/username"
                                />
                            </div>

                            <div className="form-group">
                                <label>Portfolio / Website URL</label>
                                <input
                                    type="url"
                                    name="website_url"
                                    className="form-input"
                                    value={profile.website_url || ''}
                                    onChange={handleChange}
                                    placeholder="https://yourdomain.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>Qualifications & Certifications</label>
                                <input
                                    type="text"
                                    name="qualifications"
                                    className="form-input"
                                    value={profile.qualifications || ''}
                                    onChange={handleChange}
                                    placeholder="e.g., M.Sc. Computer Science, AWS Certified ML Specialist"
                                />
                            </div>
                        </>
                    )}

                    <button type="submit" className="buttons" disabled={saving} style={{ marginTop: '12px' }}>
                        <Save size={16} />
                        <span>{saving ? "Saving..." : "Save Profile Settings"}</span>
                    </button>
                </form>
            </div>
        </div>
    );
}