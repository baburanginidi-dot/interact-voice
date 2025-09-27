import { useState } from 'react';
import LoginScreen from '@/components/LoginScreen';
import AgentInterface from '@/components/AgentInterface';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  const handleLogin = (name: string) => {
    setUserName(name);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen">
        {!isLoggedIn ? (
          <LoginScreen onLogin={handleLogin} />
        ) : (
          <AgentInterface userName={userName} onLogout={handleLogout} />
        )}
      </div>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  );
};

export default App;