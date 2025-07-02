// src/components/auth/login-form.tsx
"use client";

import type { FC } from 'react';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { LogIn, UserPlus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const GoogleIcon: FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 48 48" {...props}>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.657-3.467-11.283-8.163l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,35.596,44,30.168,44,24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );

const LoginForm: FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { login, signup, googleLogin } = useAuth();
    const { toast } = useToast();

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            toast({ variant: 'destructive', title: 'Validation Error', description: 'Email and Password cannot be empty.' });
            return;
        }
        setIsLoading(true);

        try {
            if (isLoginMode) {
                await login(email, password);
            } else {
                await signup(email, password);
            }
            // No navigation needed here, context handles it
        } catch (error: any) {
            let description = 'An unexpected error occurred.';
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    description = 'Invalid email or password. Please try again.';
                    break;
                case 'auth/email-already-in-use':
                    description = 'This email is already registered. Please login or use a different email.';
                    break;
                case 'auth/weak-password':
                    description = 'The password is too weak. It should be at least 6 characters long.';
                    break;
                default:
                    description = error.message;
            }
            toast({ variant: 'destructive', title: 'Authentication Failed', description });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await googleLogin();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Google Sign-In Failed', description: error.message || 'Could not sign in with Google.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-primary">{isLoginMode ? 'Figmatic Login' : 'Create an Account'}</CardTitle>
                <CardDescription>{isLoginMode ? 'Enter your credentials to access your diagrams.' : 'Create an account to start diagramming.'}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAuthAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                            disabled={isLoading}
                            className="bg-input"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                            className="bg-input"
                        />
                    </div>
                    <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Please wait...
                            </>
                        ) : isLoginMode ? (
                            <>
                                <LogIn className="mr-2 h-5 w-5" /> Login
                            </>
                        ) : (
                            <>
                                <UserPlus className="mr-2 h-5 w-5" /> Sign Up
                            </>
                        )}
                    </Button>
                </form>

                <div className="relative my-6">
                    <Separator />
                    <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card px-2 text-sm text-muted-foreground">
                        OR
                    </span>
                </div>
                
                <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
                    <GoogleIcon className="mr-2 h-5 w-5" />
                    Sign in with Google
                </Button>

            </CardContent>
            <CardFooter className="flex justify-center p-4">
                <Button variant="link" onClick={() => setIsLoginMode(!isLoginMode)} className="text-sm">
                    {isLoginMode ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default LoginForm;
