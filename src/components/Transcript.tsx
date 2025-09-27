import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Bot, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TranscriptMessage {
  id: string;
  text: string;
  speaker: 'user' | 'agent' | 'system';
  timestamp: Date;
  isPartial?: boolean;
}

interface TranscriptProps {
  messages: TranscriptMessage[];
  isAgentSpeaking?: boolean;
  className?: string;
}

const Transcript = ({ messages, isAgentSpeaking = false, className }: TranscriptProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getSpeakerIcon = (speaker: string) => {
    switch (speaker) {
      case 'user':
        return <Mic className="w-4 h-4" />;
      case 'agent':
        return <Bot className="w-4 h-4" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getSpeakerLabel = (speaker: string) => {
    switch (speaker) {
      case 'user':
        return 'You';
      case 'agent':
        return 'AI Agent';
      default:
        return 'System';
    }
  };

  return (
    <Card className={cn("h-[400px] flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <h3 className="font-semibold text-sm">Live Transcript</h3>
        </div>
        <div className="flex items-center gap-2">
          {isAgentSpeaking && (
            <Badge variant="secondary" className="animate-pulse">
              <Bot className="w-3 h-3 mr-1" />
              Agent Speaking
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {messages.length} messages
          </Badge>
        </div>
      </div>

      {/* Transcript Content */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <div className="text-center">
                <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Waiting for conversation to begin...</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 p-3 rounded-lg transition-all duration-200",
                  {
                    "bg-primary/5 border-l-2 border-primary": message.speaker === 'user',
                    "bg-secondary/5 border-l-2 border-secondary": message.speaker === 'agent',
                    "bg-muted/30 border-l-2 border-muted": message.speaker === 'system',
                    "opacity-70": message.isPartial,
                  }
                )}
              >
                {/* Speaker Avatar */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                    {
                      "bg-primary text-primary-foreground": message.speaker === 'user',
                      "bg-secondary text-secondary-foreground": message.speaker === 'agent',
                      "bg-muted text-muted-foreground": message.speaker === 'system',
                    }
                  )}
                >
                  {getSpeakerIcon(message.speaker)}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {getSpeakerLabel(message.speaker)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.isPartial && (
                      <Badge variant="outline" className="text-xs py-0 px-1">
                        typing...
                      </Badge>
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-sm leading-relaxed",
                      {
                        "text-foreground": !message.isPartial,
                        "text-muted-foreground": message.isPartial,
                      }
                    )}
                  >
                    {message.text}
                    {message.isPartial && (
                      <span className="inline-block w-2 h-4 bg-primary/50 ml-1 animate-pulse rounded-sm" />
                    )}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Footer Status */}
      <div className="px-4 py-2 border-t bg-muted/10 text-xs text-muted-foreground flex items-center justify-between">
        <span>Real-time voice transcription active</span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
          <span>Live</span>
        </div>
      </div>
    </Card>
  );
};

export default Transcript;