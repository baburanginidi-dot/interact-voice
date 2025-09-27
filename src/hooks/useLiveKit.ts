import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Room, 
  RoomEvent, 
  Track, 
  LocalParticipant,
  RemoteParticipant,
  AudioTrack,
  DataPacket_Kind,
  RoomOptions,
  VideoQuality
} from 'livekit-client';

export interface LiveKitMessage {
  type: 'state_update' | 'transcript_update' | 'error' | 'connection_status';
  stage?: string;
  transcript?: string;
  error?: string;
  status?: string;
  data?: any;
}

interface UseLiveKitProps {
  userName: string;
  serverUrl?: string;
  token?: string;
  roomName?: string;
}

interface UseLiveKitReturn {
  room: Room | null;
  isConnected: boolean;
  isConnecting: boolean;
  participants: (LocalParticipant | RemoteParticipant)[];
  audioTracks: AudioTrack[];
  messages: LiveKitMessage[];
  error: string | null;
  sendData: (message: any) => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useLiveKit = ({ 
  userName, 
  serverUrl = 'wss://your-livekit-server.com',
  token,
  roomName = 'ai-agent-room' 
}: UseLiveKitProps): UseLiveKitReturn => {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [participants, setParticipants] = useState<(LocalParticipant | RemoteParticipant)[]>([]);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [messages, setMessages] = useState<LiveKitMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const roomRef = useRef<Room | null>(null);

  // Add message to the messages array
  const addMessage = useCallback((message: LiveKitMessage) => {
    console.log('LiveKit Message:', message);
    setMessages(prev => [...prev, message]);
  }, []);

  // Send data to the room
  const sendData = useCallback(async (message: any) => {
    if (!roomRef.current || !isConnected) {
      console.warn('Cannot send data: Room not connected');
      return;
    }

    try {
      const data = new TextEncoder().encode(JSON.stringify(message));
      await roomRef.current.localParticipant.publishData(data, { reliable: true });
      console.log('Data sent:', message);
    } catch (err) {
      console.error('Error sending data:', err);
      setError(`Failed to send data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [isConnected]);

  // Connect to LiveKit room
  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setError(null);

    try {
      const newRoom = new Room({
        // Audio settings optimized for voice
        adaptiveStream: true,
        dynacast: true,
        // Audio-only configuration
        videoCaptureDefaults: {
          resolution: { width: 0, height: 0 }, // Disable video
        },
      } as RoomOptions);

      // Set up room event listeners
      newRoom
        .on(RoomEvent.Connected, () => {
          console.log('Connected to room');
          setIsConnected(true);
          addMessage({ type: 'connection_status', status: 'connected' });
        })
        .on(RoomEvent.Disconnected, (reason) => {
          console.log('Disconnected from room:', reason);
          setIsConnected(false);
          addMessage({ type: 'connection_status', status: 'disconnected' });
        })
        .on(RoomEvent.DataReceived, (payload, participant) => {
          try {
            const message = JSON.parse(new TextDecoder().decode(payload));
            addMessage(message);
          } catch (err) {
            console.error('Error parsing received data:', err);
          }
        })
        .on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          console.log('Track subscribed:', track.kind, participant?.identity);
          if (track.kind === Track.Kind.Audio) {
            const audioTrack = track as AudioTrack;
            setAudioTracks(prev => [...prev, audioTrack]);
            
            // Automatically play remote audio
            const audioElement = audioTrack.attach();
            audioElement.play().catch(console.error);
          }
        })
        .on(RoomEvent.TrackUnsubscribed, (track) => {
          if (track.kind === Track.Kind.Audio) {
            setAudioTracks(prev => prev.filter(t => t !== track));
          }
        })
        .on(RoomEvent.ParticipantConnected, (participant) => {
          console.log('Participant connected:', participant.identity);
          setParticipants(prev => [...prev, participant]);
        })
        .on(RoomEvent.ParticipantDisconnected, (participant) => {
          console.log('Participant disconnected:', participant.identity);
          setParticipants(prev => prev.filter(p => p !== participant));
        });

      // Generate a token (in production, this should come from your backend)
      const connectionToken = token || await generateToken(userName, roomName);
      
      // Connect to the room
      await newRoom.connect(serverUrl, connectionToken);
      
      // Enable microphone only
      await newRoom.localParticipant.setMicrophoneEnabled(true);
      
      setRoom(newRoom);
      roomRef.current = newRoom;
      
    } catch (err) {
      console.error('Error connecting to room:', err);
      setError(`Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, [userName, serverUrl, token, roomName, isConnecting, isConnected, addMessage]);

  // Disconnect from room
  const disconnect = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
      setRoom(null);
      setIsConnected(false);
      setParticipants([]);
      setAudioTracks([]);
      addMessage({ type: 'connection_status', status: 'disconnected' });
    }
  }, [addMessage]);

  // Update participants when room changes
  useEffect(() => {
    if (room) {
      const allParticipants = [room.localParticipant, ...Array.from(room.remoteParticipants.values())];
      setParticipants(allParticipants);
    }
  }, [room]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, []);

  return {
    room,
    isConnected,
    isConnecting,
    participants,
    audioTracks,
    messages,
    error,
    sendData,
    connect,
    disconnect
  };
};

// Helper function to generate token (replace with your backend call)
async function generateToken(userName: string, roomName: string): Promise<string> {
  // In production, this should call your backend to generate a JWT token
  // For now, we'll return a placeholder token
  console.warn('Using placeholder token - implement proper token generation in production');
  
  // This is a placeholder - you need to implement actual token generation
  // based on your LiveKit server configuration
  return `placeholder-token-for-${userName}-in-${roomName}`;
}