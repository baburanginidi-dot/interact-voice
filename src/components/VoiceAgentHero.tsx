import { Badge } from '@/components/ui/badge';
import { Mic } from 'lucide-react';
import LiquidLoading from '@/components/ui/liquid-loader';

interface VoiceAgentHeroProps {
  isConnected: boolean;
  isConnecting: boolean;
  isAgentSpeaking: boolean;
}

const VoiceAgentHero = ({ isConnected, isConnecting, isAgentSpeaking }: VoiceAgentHeroProps) => {
  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-background to-background border-b">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left: Text Content */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full">
              <Mic className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered Voice Assistant</span>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                Welcome to Your
                <span className="block text-primary mt-2">Voice Onboarding Journey</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Experience seamless onboarding with our intelligent voice agent. Just speak naturally, and we'll guide you through every step.
              </p>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-center lg:justify-start gap-3">
              {isConnecting ? (
                <Badge variant="outline" className="gap-2 px-4 py-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  Connecting to agent...
                </Badge>
              ) : isConnected ? (
                <>
                  <Badge variant="default" className="bg-success gap-2 px-4 py-2">
                    <div className="w-2 h-2 bg-success-foreground rounded-full animate-pulse" />
                    Agent Ready
                  </Badge>
                  {isAgentSpeaking && (
                    <Badge variant="outline" className="gap-2 px-4 py-2 animate-pulse">
                      <Mic className="w-3 h-3" />
                      Speaking...
                    </Badge>
                  )}
                </>
              ) : (
                <Badge variant="destructive" className="gap-2 px-4 py-2">
                  <div className="w-2 h-2 bg-destructive-foreground rounded-full" />
                  Disconnected
                </Badge>
              )}
            </div>
          </div>

          {/* Right: Visual Element */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-full blur-3xl" />
              <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl border shadow-xl p-8">
                <LiquidLoading />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VoiceAgentHero;
