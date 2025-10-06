import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLiveKit, LiveKitMessage } from '@/hooks/useLiveKit';
import Stepper from './Stepper';
import Transcript from './Transcript';
import PaymentOptions from './PaymentOptions';
import Checklist from './Checklist';
import VoiceAgentHero from './VoiceAgentHero';
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Volume2,
  VolumeX,
  Settings,
  User,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface TranscriptMessage {
  id: string;
  text: string;
  speaker: 'user' | 'agent' | 'system';
  timestamp: Date;
  isPartial?: boolean;
}

interface AgentInterfaceProps {
  userName: string;
  onLogout: () => void;
}

const STAGES = ['GREETING', 'PAYMENT_SELECTION', 'NBFC_PROCESS', 'RCA_DOCS'];

const AgentInterface = ({ userName, onLogout }: AgentInterfaceProps) => {
  const { toast } = useToast();
  const [currentStage, setCurrentStage] = useState<string>('GREETING');
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  // Initialize LiveKit
  const {
    isConnected,
    isConnecting,
    messages,
    error,
    sendData,
    connect,
    disconnect
  } = useLiveKit({ userName });

  // Handle LiveKit messages
  useEffect(() => {
    messages.forEach((message: LiveKitMessage) => {
      handleLiveKitMessage(message);
    });
  }, [messages]);

  // Auto-connect when component mounts
  useEffect(() => {
    if (!isConnected && !isConnecting) {
      connect();
    }
  }, [isConnected, isConnecting, connect]);

  // Handle LiveKit messages
  const handleLiveKitMessage = useCallback((message: LiveKitMessage) => {
    console.log('Processing message:', message);

    switch (message.type) {
      case 'state_update':
        if (message.stage) {
          setCurrentStage(message.stage);
          
          // Add system message for stage changes
          const systemMessage: TranscriptMessage = {
            id: `system-${Date.now()}`,
            text: `Stage updated: ${message.stage.replace('_', ' ').toLowerCase()}`,
            speaker: 'system',
            timestamp: new Date(),
          };
          setTranscript(prev => [...prev, systemMessage]);
        }
        break;

      case 'transcript_update':
        if (message.transcript) {
          const transcriptMessage: TranscriptMessage = {
            id: `transcript-${Date.now()}`,
            text: message.transcript,
            speaker: 'agent',
            timestamp: new Date(),
            isPartial: message.data?.isPartial || false,
          };
          
          setTranscript(prev => {
            // Replace last partial message if this is an update
            if (message.data?.isPartial && prev.length > 0 && prev[prev.length - 1].isPartial) {
              return [...prev.slice(0, -1), transcriptMessage];
            }
            return [...prev, transcriptMessage];
          });

          // Update speaking status
          setIsAgentSpeaking(message.data?.isSpeaking || false);
        }
        break;

      case 'connection_status':
        if (message.status === 'connected') {
          toast({
            title: "Connected",
            description: "Voice agent is ready to assist you",
          });
        } else if (message.status === 'disconnected') {
          toast({
            title: "Disconnected",
            description: "Connection to voice agent lost",
            variant: "destructive",
          });
        }
        break;

      case 'error':
        if (message.error) {
          toast({
            title: "Error",
            description: message.error,
            variant: "destructive",
          });
        }
        break;
    }
  }, [toast]);

  // Handle payment selection
  const handlePaymentSelect = useCallback(async (selection: string) => {
    setIsPaymentProcessing(true);
    
    try {
      await sendData({
        type: 'payment_choice',
        selection: selection,
      });

      // Add user message to transcript
      const userMessage: TranscriptMessage = {
        id: `user-${Date.now()}`,
        text: `Selected payment method: ${selection.replace('_', ' ')}`,
        speaker: 'user',
        timestamp: new Date(),
      };
      setTranscript(prev => [...prev, userMessage]);

      toast({
        title: "Payment Selection Sent",
        description: `Selected: ${selection.replace('_', ' ')}`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send payment selection",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setIsPaymentProcessing(false), 1500);
    }
  }, [sendData, toast]);

  // Handle microphone toggle
  const toggleMicrophone = useCallback(() => {
    setIsMuted(!isMuted);
    // In a real implementation, this would mute/unmute the microphone
    toast({
      title: isMuted ? "Microphone On" : "Microphone Muted",
      description: isMuted ? "You can now speak" : "Your microphone is muted",
    });
  }, [isMuted, toast]);

  // Handle audio toggle
  const toggleAudio = useCallback(() => {
    setAudioEnabled(!audioEnabled);
    toast({
      title: audioEnabled ? "Audio Disabled" : "Audio Enabled",
      description: audioEnabled ? "You won't hear the agent" : "You can now hear the agent",
    });
  }, [audioEnabled, toast]);

  // Handle disconnect
  const handleDisconnect = useCallback(() => {
    disconnect();
    onLogout();
  }, [disconnect, onLogout]);

  // Handle stage navigation
  const goToNextStage = useCallback(() => {
    const currentIndex = STAGES.indexOf(currentStage);
    if (currentIndex < STAGES.length - 1) {
      const nextStage = STAGES[currentIndex + 1];
      setCurrentStage(nextStage);
      
      // Add system message for manual stage change
      const systemMessage: TranscriptMessage = {
        id: `system-${Date.now()}`,
        text: `Moved to: ${nextStage.replace('_', ' ').toLowerCase()}`,
        speaker: 'system',
        timestamp: new Date(),
      };
      setTranscript(prev => [...prev, systemMessage]);

      // Notify backend about stage change
      sendData({
        type: 'manual_stage_change',
        stage: nextStage,
      });

      toast({
        title: "Next Stage",
        description: `Moved to ${nextStage.replace('_', ' ')}`,
      });
    }
  }, [currentStage, sendData, toast]);

  const goToPreviousStage = useCallback(() => {
    const currentIndex = STAGES.indexOf(currentStage);
    if (currentIndex > 0) {
      const previousStage = STAGES[currentIndex - 1];
      setCurrentStage(previousStage);
      
      // Add system message for manual stage change
      const systemMessage: TranscriptMessage = {
        id: `system-${Date.now()}`,
        text: `Moved back to: ${previousStage.replace('_', ' ').toLowerCase()}`,
        speaker: 'system',
        timestamp: new Date(),
      };
      setTranscript(prev => [...prev, systemMessage]);

      // Notify backend about stage change
      sendData({
        type: 'manual_stage_change',
        stage: previousStage,
      });

      toast({
        title: "Previous Stage",
        description: `Moved to ${previousStage.replace('_', ' ')}`,
      });
    }
  }, [currentStage, sendData, toast]);

  const canGoBack = STAGES.indexOf(currentStage) > 0;
  const canGoForward = STAGES.indexOf(currentStage) < STAGES.length - 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Mic className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">AI Voice Agent</h1>
                  <p className="text-sm text-muted-foreground">Onboarding Assistant</p>
                </div>
              </div>

              {/* Connection Status */}
              <div className="flex items-center gap-2">
                {isConnecting ? (
                  <Badge variant="outline" className="gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Connecting...
                  </Badge>
                ) : isConnected ? (
                  <Badge variant="default" className="bg-success gap-2">
                    <div className="w-2 h-2 bg-success-foreground rounded-full animate-pulse" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-2">
                    <div className="w-2 h-2 bg-destructive-foreground rounded-full" />
                    Disconnected
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* User Info */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{userName}</span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleMicrophone}
                  className={cn({
                    "bg-destructive text-destructive-foreground": isMuted,
                  })}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAudio}
                  className={cn({
                    "bg-destructive text-destructive-foreground": !audioEnabled,
                  })}
                >
                  {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <PhoneOff className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <VoiceAgentHero 
        isConnected={isConnected}
        isConnecting={isConnecting}
        isAgentSpeaking={isAgentSpeaking}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Progress Stepper */}
        <section className="space-y-6">
          <Stepper currentStage={currentStage} />
          
          {/* Stage Navigation Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={goToPreviousStage}
              disabled={!canGoBack}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous Stage
            </Button>
            
            <div className="px-4 py-2 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                Stage {STAGES.indexOf(currentStage) + 1} of {STAGES.length}
              </span>
            </div>
            
            <Button
              variant="default"
              size="lg"
              onClick={goToNextStage}
              disabled={!canGoForward}
              className="gap-2"
            >
              Next Stage
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Transcript */}
          <div className="space-y-6">
            <Transcript 
              messages={transcript} 
              isAgentSpeaking={isAgentSpeaking}
            />
          </div>

          {/* Right Column - Stage-specific content */}
          <div className="space-y-6">
            {currentStage === 'PAYMENT_SELECTION' && (
              <PaymentOptions
                onPaymentSelect={handlePaymentSelect}
                isProcessing={isPaymentProcessing}
              />
            )}

            {currentStage === 'RCA_DOCS' && (
              <Checklist
                onDocumentStatus={(status) => {
                  console.log('Document status:', status);
                }}
              />
            )}

            {(currentStage === 'GREETING' || currentStage === 'NBFC_PROCESS') && (
              <Card className="p-8 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto flex items-center justify-center">
                    <Mic className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {currentStage === 'GREETING' ? 'Welcome!' : 'Processing...'}
                    </h3>
                    <p className="text-muted-foreground">
                      {currentStage === 'GREETING' 
                        ? 'Your AI assistant is ready to help you get started.'
                        : 'Please wait while we process your information.'
                      }
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Badge variant="outline" className="gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      {currentStage === 'GREETING' ? 'Listening...' : 'Processing...'}
                    </Badge>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-destructive bg-destructive/5 p-4">
            <div className="flex items-center gap-2 text-destructive">
              <Phone className="w-4 h-4" />
              <span className="font-medium">Connection Error:</span>
              <span>{error}</span>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AgentInterface;