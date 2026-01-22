'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { motion } from 'motion/react';
import { HiOutlinePencilSquare, HiOutlineCheck, HiOutlineXMark, HiOutlineGlobeAlt, HiOutlineEnvelope, HiOutlinePhone, HiOutlineUser } from 'react-icons/hi2';

export default function ProfileView({ user, role }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        bio: '',
        phone: '',
        extra_data: {}
    });
    const [newLink, setNewLink] = useState({ key: '', value: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await api.get('/accounts/profiles/me/');
                setProfile(data);
                setFormData({
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    bio: data.bio || '',
                    phone: data.phone || '',
                    extra_data: data.extra_data || {}
                });
            } catch (err) {
                console.error('Failed to fetch profile', err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchProfile();
    }, [user]);

    const handleSave = async () => {
        try {
            const data = await api.put('/accounts/profiles/me/', formData);
            setProfile(data);
            setIsEditing(false);
        } catch (err) {
            alert('Failed to save profile');
        }
    };

    const addLink = () => {
        if (newLink.key && newLink.value) {
            setFormData({
                ...formData,
                extra_data: {
                    ...formData.extra_data,
                    [newLink.key]: newLink.value
                }
            });
            setNewLink({ key: '', value: '' });
        }
    };

    const removeLink = (key) => {
        const updated = { ...formData.extra_data };
        delete updated[key];
        setFormData({ ...formData, extra_data: updated });
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass bg-amber-50 rounded-[2.5rem] overflow-hidden border border-emerald-500/10 shadow-2xl"
        >
            <div className="h-48 bg-gradient-to-r from-emerald-600 to-teal-600 relative">
                <div className="absolute inset-0 bg-black/10"></div>
            </div>
            
            <div className="px-8 pb-10">
                <div className="relative -mt-20 mb-8 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="w-40 h-40 rounded-[2.5rem] bg-card border-8 border-background shadow-2xl overflow-hidden relative group">
                        {user?.google_picture ? (
                            <img src={user.google_picture} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-5xl font-black text-emerald-500 bg-emerald-500/5">
                                {user?.email[0].toUpperCase()}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex gap-3">
                        {isEditing ? (
                            <>
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-3 rounded-2xl bg-secondary hover:bg-secondary/80 font-bold transition-all border border-border flex items-center gap-2"
                                >
                                    <HiOutlineXMark className="w-5 h-5" /> Cancel
                                </button>
                                <button 
                                    onClick={handleSave}
                                    className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                                >
                                    <HiOutlineCheck className="w-5 h-5" /> Save Changes
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                            >
                                <HiOutlinePencilSquare className="w-5 h-5" /> Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-10">
                        {/* Basic Info */}
                        <section>
                            {isEditing ? (
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <input 
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                        className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none"
                                        placeholder="First Name"
                                    />
                                    <input 
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                        className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none"
                                        placeholder="Last Name"
                                    />
                                </div>
                            ) : (
                                <h1 className="text-4xl font-black tracking-tight">
                                    {profile?.first_name} {profile?.last_name || <span className="opacity-30">Add Name</span>}
                                </h1>
                            )}
                            
                            <div className="flex items-center gap-4 mt-2 text-muted-foreground font-medium">
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-black uppercase tracking-widest">
                                    {role}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1.5"><HiOutlineEnvelope className="w-4 h-4" /> {user?.email}</span>
                            </div>

                            <div className="mt-8">
                                <label className="text-sm font-bold uppercase tracking-widest opacity-50 mb-2 block">About Me</label>
                                {isEditing ? (
                                    <textarea 
                                        value={formData.bio}
                                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                        className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border focus:border-emerald-500 outline-none min-h-[150px] resize-none"
                                        placeholder="Tell us about yourself..."
                                    />
                                ) : (
                                    <p className="text-lg text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                        {profile?.bio || 'No bio provided yet.'}
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Extra Data / Links */}
                        <section>
                            <label className="text-sm font-bold uppercase tracking-widest opacity-50 mb-4 block">Links & Portfolio</label>
                            <div className="flex flex-wrap gap-3">
                                {Object.entries(isEditing ? formData.extra_data : (profile?.extra_data || {})).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 text-sm font-bold group">
                                        <HiOutlineGlobeAlt className="w-4 h-4" />
                                        <span className="capitalize">{key}:</span>
                                        <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" className="hover:underline">{value}</a>
                                        {isEditing && (
                                            <button onClick={() => removeLink(key)} className="ml-2 hover:text-red-500">
                                                <HiOutlineXMark className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                
                                {isEditing && (
                                    <div className="flex gap-2 items-center w-full mt-4">
                                        <input 
                                            placeholder="Label (e.g. LinkedIn)" 
                                            value={newLink.key}
                                            onChange={(e) => setNewLink({...newLink, key: e.target.value})}
                                            className="w-1/3 px-4 py-2 rounded-xl bg-secondary/50 border border-border outline-none text-sm"
                                        />
                                        <input 
                                            placeholder="URL" 
                                            value={newLink.value}
                                            onChange={(e) => setNewLink({...newLink, value: e.target.value})}
                                            className="flex-1 px-4 py-2 rounded-xl bg-secondary/50 border border-border outline-none text-sm"
                                        />
                                        <button 
                                            onClick={addLink}
                                            className="p-2 rounded-xl bg-emerald-600 text-white"
                                        >
                                            <HiOutlineCheck className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-8">
                        <div className="p-8 rounded-[2rem] bg-secondary/20 border border-border">
                            <h3 className="font-black text-xl mb-6">Contact Info</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold uppercase opacity-50 block mb-1">Phone Number</label>
                                    {isEditing ? (
                                        <input 
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border outline-none"
                                            placeholder="+1 234 567 890"
                                        />
                                    ) : (
                                        <p className="font-bold flex items-center gap-2"><HiOutlinePhone className="w-4 h-4 text-emerald-500" /> {profile?.phone || 'Not provided'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase opacity-50 block mb-1">Email Address</label>
                                    <p className="font-bold flex items-center gap-2"><HiOutlineEnvelope className="w-4 h-4 text-emerald-500" /> {user?.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 rounded-[2rem] bg-emerald-600/5 border border-emerald-600/10">
                            <h3 className="font-black text-xl mb-4">Activity</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="opacity-60">Last Updated</span>
                                    <span className="font-bold">{profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="opacity-60">Account Created</span>
                                    <span className="font-bold">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
