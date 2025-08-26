import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Mail, Lock, User, Eye, EyeOff, MessageCircle } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AuthService } from "@/services/auth.service";


export function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const { setUser } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);
        setError(null);

        try {
            await AuthService.login({ email, password });   // server set cookie
            const me = await AuthService.me();              // hydrate từ cookie
            setUser(me);
            
            navigate("/", { replace: true });
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Login failed";
            setError(msg);
            console.error("Login failed", err);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <MessageCircle className="w-12 h-12 text-primary" />
                        <div className="text-left">
                            <h1 className="text-4xl font-bold text-primary">
                                ChatApp
                            </h1>
                            <div className="text-muted-foreground text-sm">
                                Connect with friends instantly
                            </div>
                        </div>
                    </div>
                </div>

                <Card className="shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                        <CardDescription>
                            Sign in to your account to continue
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="login">Sign In</TabsTrigger>
                                <TabsTrigger value="register">Sign Up</TabsTrigger>
                            </TabsList>

                            <TabsContent value="login">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={email}
                                                placeholder="Enter your email"
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                value={password}
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter your password"
                                                onChange={e => setPassword(e.target.value)}
                                                className="pl-10 pr-10"
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Signing in..." : "Sign In"}
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="register">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Username</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="username"
                                                type="text"
                                                placeholder="Choose a username"
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reg-email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="reg-email"
                                                type="email"
                                                placeholder="Enter your email"
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reg-password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="reg-password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Create a password"
                                                className="pl-10 pr-10"
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Creating account..." : "Create Account"}
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>

                        <div className="mt-6 text-center">
                            <Button
                                variant="link"
                                className="text-sm text-muted-foreground hover:text-primary"
                            >
                                Forgot password?
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}