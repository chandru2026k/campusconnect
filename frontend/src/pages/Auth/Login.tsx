import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function Login() {
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    
    const message = location.state?.message;

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            setError('');
            const res = await api.post('/auth/google', {
                credential: credentialResponse.credential
            });
            
            const { token, userId, role } = res.data;
            
            // Standard login success, store the JWT securely in context/localStorage
            login({ id: userId, email: res.data.email || 'user', role }, token);
            
            // If the role is UNASSIGNED, this is their first login. Redirect them to complete their profile.
            if (role === 'UNASSIGNED') {
                navigate('/complete-profile');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            console.error('Google Auth Error:', err);
            setError(err.response?.data?.message || 'Authentication failed. Make sure you are using an allowed domain.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 font-sans">
            <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-8 text-center">
                <h1 className="text-2xl font-bold mb-2">CampusConnect</h1>
                <p className="text-gray-500 text-sm mb-8">Sign in using your college Google account.</p>
                
                {message && <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">{message}</div>}
                {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google sign-in popup failed or was closed.')}
                        useOneTap
                        shape="pill"
                        text="signin_with"
                    />
                </div>

                <div className="mt-8 text-xs text-gray-400">
                    Allowed domains: @citchennai.net, @college.edu (and @gmail.com for local testing).
                </div>
            </div>
        </div>
    );
}
