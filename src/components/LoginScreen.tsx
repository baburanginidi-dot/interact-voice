import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mic, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (name: string) => void;
}

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsLoading(true);
    // Simulate a brief loading period for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    onLogin(name.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mb-4">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            AI Voice Agent
          </h1>
          <p className="text-white/80 text-lg">
            Your intelligent onboarding assistant
          </p>
        </div>

        {/* Login Card */}
        <Card className="glass border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl gradient-text flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Get Started
            </CardTitle>
            <CardDescription>
              Enter your name to begin your personalized onboarding experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Your Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 text-lg"
                  disabled={isLoading}
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="w-full h-12 text-lg btn-gradient"
                disabled={!name.trim() || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Mic className="w-5 h-5" />
                    Start Onboarding
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="glass rounded-lg p-4 border-white/10">
            <div className="w-8 h-8 bg-primary/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
              <Mic className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm text-white/80">Voice Powered</p>
          </div>
          <div className="glass rounded-lg p-4 border-white/10">
            <div className="w-8 h-8 bg-secondary/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-secondary" />
            </div>
            <p className="text-sm text-white/80">AI Guided</p>
          </div>
          <div className="glass rounded-lg p-4 border-white/10">
            <div className="w-8 h-8 bg-accent/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
              <div className="w-4 h-4 bg-accent rounded-full" />
            </div>
            <p className="text-sm text-white/80">Real-time</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;