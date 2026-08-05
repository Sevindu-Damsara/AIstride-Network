import './App.css';
import Marketplace from './Marketplace';
import SubmitProblem from './SubmitProblem';
import PostProblem from './PostProblem';
import Auth from './Auth';
import Profile from './Profile';
import Requests from './Requests';
import NotFound from './NotFound';
import { useState, useEffect } from 'react';
import { supabase } from './utils/supabase';
import type { Session } from '@supabase/supabase-js';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const checkUserProfile = async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (error?.code === 'PGRST116') {
        setIsNewUser(true);
      } else {
        setIsNewUser(false);
      }
    };
    if (session?.user) {
      checkUserProfile(session.user.id);
    }
  }, [session]);

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={!session ? <Navigate to="/login" replace /> : <Marketplace />} />
          <Route path="/submit" element={isNewUser ? <Navigate to="/profile" replace /> : <SubmitProblem />} />
          <Route path="/post" element={isNewUser ? <Navigate to="/profile" replace /> : <PostProblem />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/profile" element={<Profile setIsNewUser={setIsNewUser} isNewUser={isNewUser} />} />
          <Route path="/requests" element={isNewUser ? <Navigate to="/profile" replace /> : <Requests />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}