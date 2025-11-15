import React, { useState, useRef, useCallback, useEffect, useContext } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { ConnectionState, AIState, MicState, ChatMessage, VoiceSettings, AnimationSettings } from './types';
import { decode, decodeAudioData, createBlob } from './utils/audio';
import { ThemeContext } from './contexts/ThemeContext';

import StatusBar from './components/StatusBar';
import Visualizer from './components/Visualizer';
import MicButton from './components/MicButton';
import ChatLog from './components/ChatLog';
import Settings from './components/Settings';
import Logo from './components/Logo';

// Fix: Moved AIStudio interface into `declare global` to resolve TypeScript error with global window object.
declare global {
  // Add aistudio to the window interface to satisfy TypeScript
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

const ApiKeyScreen: React.FC<{ onSelectKey: () => void }> = ({ onSelectKey }) => {
    return (
        <div className="bg-stone-950 text-white min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 text-center">
            <header className="absolute top-0 w-full flex justify-center items-center p-4 sm:p-6">
                 <Logo className="h-8" />
            </header>
            <main className="flex flex-col items-center">
                <p className="max-w-md text-gray-400 mb-8">
                    To start your real-time voice conversation, please select a Gemini API key.
                    This allows the app to connect to Google's generative models.
                </p>
                <button
                    onClick={onSelectKey}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-cyan-400 shadow-lg shadow-cyan-500/50"
                >
                    Select API Key
                </button>
                <p className="text-xs text-gray-500 mt-6 max-w-sm">
                    For more information, please visit the{' '}
                    <a
                        href="https://ai.google.dev/gemini-api/docs/billing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-cyan-400"
                    >
                        Gemini API billing documentation
                    </a>.
                </p>
            </main>
        </div>
    );
};


const App: React.FC = () => {
    const [isKeyReady, setIsKeyReady] = useState(false);
    const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
    const [aiState, setAiState] = useState<AIState>(AIState.IDLE);
    const [micState, setMicState] = useState<MicState>(MicState.OFF);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [streamingModelTranscript, setStreamingModelTranscript] = useState<ChatMessage | null>(null);
    const [streamingUserTranscript, setStreamingUserTranscript] = useState<ChatMessage | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    // Voice settings now managed by ThemeContext to persist them
    const { voiceSettings, setVoiceSettings, themeName, animationName, animationSettings } = useContext(ThemeContext);

    const [inputAnalyserNode, setInputAnalyserNode] = useState<AnalyserNode | null>(null);
    const [outputAnalyserNode, setOutputAnalyserNode] = useState<AnalyserNode | null>(null);

    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const sessionRef = useRef<any | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const outputGainNodeRef = useRef<GainNode | null>(null);
    const outputAnalyserNodeRef = useRef<AnalyserNode | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const playingSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef<number>(0);
    const connectionAttemptIdRef = useRef(0);
    const speakingStateTimeoutRef = useRef<number | null>(null);
    const userSpeakingTimeoutRef = useRef<number | null>(null);
    const isStoppingRef = useRef(false);
    const isNewModelTurnRef = useRef(true);
    
    useEffect(() => {
        const checkKey = async () => {
            if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
                setIsKeyReady(true);
            }
        };
        checkKey();
    }, []);

    const handleSelectKey = async () => {
        if (window.aistudio) {
            try {
                 await window.aistudio.openSelectKey();
                 // Assume key is selected after dialog closes to handle race conditions
                 setIsKeyReady(true);
            } catch (e) {
                console.error("Could not open API key selection:", e);
            }
        }
    };

    const stopConversation = useCallback(async () => {
        if (isStoppingRef.current) return;
        isStoppingRef.current = true;
        
        connectionAttemptIdRef.current++; // Invalidate any pending connection attempts
        setMicState(MicState.OFF);
        setAiState(AIState.IDLE);

        if (speakingStateTimeoutRef.current) {
            clearTimeout(speakingStateTimeoutRef.current);
            speakingStateTimeoutRef.current = null;
        }
        if (userSpeakingTimeoutRef.current) {
            clearTimeout(userSpeakingTimeoutRef.current);
            userSpeakingTimeoutRef.current = null;
        }

        if (sessionRef.current) {
            try {
                sessionRef.current.close();
            } catch (e) {
                console.error("Error closing session:", e);
            }
            sessionRef.current = null;
            sessionPromiseRef.current = null;
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
           await inputAudioContextRef.current.close().catch(e => console.error("Error closing input audio context:", e));
        }
        inputAudioContextRef.current = null;
        setInputAnalyserNode(null);


        if (outputAnalyserNodeRef.current) {
            outputAnalyserNodeRef.current.disconnect();
            outputAnalyserNodeRef.current = null;
        }
        setOutputAnalyserNode(null);

        if (outputGainNodeRef.current) {
            outputGainNodeRef.current.disconnect();
            outputGainNodeRef.current = null;
        }

        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            await outputAudioContextRef.current.close().catch(e => console.error("Error closing output audio context:", e));
        }
        outputAudioContextRef.current = null;
        
        playingSourcesRef.current.forEach(source => {
            try { source.stop() } catch(e) {}
        });
        playingSourcesRef.current.clear();
        nextStartTimeRef.current = 0;

        setConnectionState(ConnectionState.DISCONNECTED);
        setStreamingModelTranscript(null);
        setStreamingUserTranscript(null);
        isNewModelTurnRef.current = true;
        isStoppingRef.current = false;
    }, []);

    const startConversation = useCallback(async () => {
        const currentAttemptId = ++connectionAttemptIdRef.current;
        setMicState(MicState.ON);
        setConnectionState(ConnectionState.CONNECTING);
        setAiState(AIState.LISTENING);
        isNewModelTurnRef.current = true;
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            // Setup Output Audio Pipeline
            outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
            outputAudioContextRef.current.resume(); // Ensure context is active
            const outputGainNode = outputAudioContextRef.current.createGain();
            outputGainNode.connect(outputAudioContextRef.current.destination);
            outputGainNodeRef.current = outputGainNode;
            
            const outputAnalyser = outputAudioContextRef.current.createAnalyser();
            outputAnalyser.fftSize = 64;
            outputAnalyser.smoothingTimeConstant = 0.5;
            outputAnalyser.connect(outputGainNode);
            outputAnalyserNodeRef.current = outputAnalyser;
            setOutputAnalyserNode(outputAnalyser);

            // Setup Input Audio Pipeline
            inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
            inputAudioContextRef.current.resume(); // Ensure context is active
            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaStreamSource = inputAudioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
            const inputAnalyser = inputAudioContextRef.current.createAnalyser();
            inputAnalyser.fftSize = 64;
            inputAnalyser.smoothingTimeConstant = 0.7;
            mediaStreamSource.connect(inputAnalyser);
            setInputAnalyserNode(inputAnalyser);
            
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { 
                            prebuiltVoiceConfig: { voiceName: voiceSettings.voiceName },
                        },
                    },
                    systemInstruction: "You are AuraLink AI. Your primary goal is to create a conversation that feels as fast, fluid, and natural as a face-to-face interaction. Be extremely concise and get to the point quickly; avoid long preambles or meta-commentary like 'That's a great question...'. Use short sentences and a direct speaking style. Your core function is to act as an empathetic, perceptive partner. Analyze the user's transcribed speech—their word choice, pacing, and punctuation—to infer their emotional and tonal state in real-time. Reflect this understanding in your responses. For example, if they sound excited, match their energy. If they sound contemplative, adopt a calmer, more thoughtful tone. Use natural conversational fillers ('hmm', 'right', 'I see'), brief pauses, and relevant follow-up questions to demonstrate active listening. If the user interrupts you, pause immediately and gracefully cede the floor. Your responses should be supportive, insightful, and always feel like they are coming from a deeply engaged friend.",
                    inputAudioTranscription: {},
                    outputAudioTranscription: {}
                },
                callbacks: {
                    onopen: () => {
                        if (connectionAttemptIdRef.current !== currentAttemptId) {
                            console.warn("Stale connection attempt's onopen was ignored.");
                            return;
                        }
                        setConnectionState(ConnectionState.CONNECTED);
                        
                        const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;
                        
                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromise.then((session) => {
                                if (connectionAttemptIdRef.current === currentAttemptId) {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                }
                            });
                        };
                        mediaStreamSource.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                         if (connectionAttemptIdRef.current !== currentAttemptId) return;

                        if (userSpeakingTimeoutRef.current) {
                            clearTimeout(userSpeakingTimeoutRef.current);
                        }

                        if (message.serverContent?.interrupted) {
                            if (speakingStateTimeoutRef.current) {
                                clearTimeout(speakingStateTimeoutRef.current);
                                speakingStateTimeoutRef.current = null;
                            }
                            playingSourcesRef.current.forEach(source => {
                                try { source.stop(); } catch (e) {/* Ignore errors if already stopped */}
                            });
                            playingSourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                            // After interruption, AI should go back to listening
                            setAiState(AIState.LISTENING);
                        }

                        if(message.serverContent?.inputTranscription) {
                            setAiState(AIState.LISTENING); // User is speaking, ensure state is listening
                            setStreamingUserTranscript(prev => ({
                                id: prev?.id || `user-stream-${Date.now()}`,
                                role: 'user',
                                text: (prev?.text || '') + message.serverContent!.inputTranscription!.text,
                            }));

                            // Set a timeout to detect when the user stops talking.
                            userSpeakingTimeoutRef.current = window.setTimeout(() => {
                                setStreamingUserTranscript(prev => {
                                    if (prev && prev.text.trim().length > 0) {
                                        // User has finished their turn, commit it.
                                        setChatHistory(history => [...history, { ...prev, id: `user-${Date.now()}`}]);
                                        setAiState(AIState.THINKING); // AI is now processing
                                        isNewModelTurnRef.current = false; // Mark user turn as processed.
                                    }
                                    return null; // Clear the streaming transcript
                                });
                            }, 750); // 750ms pause is a good indicator of a finished thought.
                        }
                        
                        const hasModelOutput = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data || message.serverContent?.outputTranscription;
                        if (hasModelOutput && isNewModelTurnRef.current) {
                            // Model responded before user pause timeout.
                            if (userSpeakingTimeoutRef.current) {
                                clearTimeout(userSpeakingTimeoutRef.current);
                                userSpeakingTimeoutRef.current = null;
                            }
                            isNewModelTurnRef.current = false;
                            setStreamingUserTranscript(prev => {
                                if (prev && prev.text.trim().length > 0) {
                                    setChatHistory(history => [...history, { ...prev, id: `user-${Date.now()}`}]);
                                }
                                return null;
                            });
                        }


                        if(message.serverContent?.outputTranscription) {
                           setStreamingModelTranscript(prev => ({
                               id: prev?.id || `model-stream-${Date.now()}`,
                               role: 'model',
                               text: (prev?.text || '') + message.serverContent!.outputTranscription!.text,
                           }));
                        }

                        if(message.serverContent?.turnComplete) {
                            setStreamingModelTranscript(prev => {
                                if (prev) {
                                    setChatHistory(history => [...history, { ...prev, id: `model-${Date.now()}`}]);
                                }
                                return null;
                            });
                            setAiState(AIState.LISTENING);
                            isNewModelTurnRef.current = true; // Ready for the next user turn
                        }
                        
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            if (speakingStateTimeoutRef.current) {
                                clearTimeout(speakingStateTimeoutRef.current);
                            }
                            setAiState(AIState.SPEAKING);
                            const audioData = decode(base64Audio);
                            const audioBuffer = await decodeAudioData(audioData, outputAudioContextRef.current!, 24000, 1);
                            
                            const source = outputAudioContextRef.current!.createBufferSource();
                            source.buffer = audioBuffer;

                            // Apply client-side voice modifications for rate and pitch
                            source.playbackRate.value = voiceSettings.speakingRate;
                            // Detune is in cents. A value of 100 cents is one semitone.
                            source.detune.value = voiceSettings.pitch * 100;
                            
                            if (outputAnalyserNodeRef.current) {
                                source.connect(outputAnalyserNodeRef.current);
                            } else {
                                source.connect(outputGainNodeRef.current!);
                            }

                            source.onended = () => {
                                playingSourcesRef.current.delete(source);
                                if (playingSourcesRef.current.size === 0) {
                                    speakingStateTimeoutRef.current = window.setTimeout(() => {
                                      setAiState(AIState.LISTENING);
                                    }, 300);
                                }
                            };
                            
                            const currentTime = outputAudioContextRef.current!.currentTime;
                            const startTime = Math.max(currentTime, nextStartTimeRef.current);

                            source.start(startTime);
                            // Adjust next start time based on the modified playback rate
                            nextStartTimeRef.current = startTime + (audioBuffer.duration / voiceSettings.speakingRate);
                            playingSourcesRef.current.add(source);
                        } else if (!message.serverContent?.turnComplete && !message.serverContent?.outputTranscription && isNewModelTurnRef.current === false) {
                           setAiState(prevAiState => {
                               if (prevAiState === AIState.LISTENING || prevAiState === AIState.IDLE) {
                                   return AIState.THINKING;
                               }
                               return prevAiState;
                           });
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        if (connectionAttemptIdRef.current !== currentAttemptId) return;
                        console.error("Connection error:", e);
                        if (e.message && e.message.includes('Requested entity was not found')) {
                            console.error("API Key may be invalid. Prompting for new key selection.");
                            setIsKeyReady(false);
                        }
                        setConnectionState(ConnectionState.ERROR);
                        stopConversation();
                    },
                    onclose: (e: CloseEvent) => {
                        if (connectionAttemptIdRef.current !== currentAttemptId) return;
                        console.log(`Connection closed: code=${e.code} reason=${e.reason}`);
                        // Don't call stopConversation() here, as it might already be closing
                    },
                },
            });
            sessionPromiseRef.current = sessionPromise;
            sessionRef.current = await sessionPromise;

        } catch (error) {
            if (connectionAttemptIdRef.current !== currentAttemptId) return;
            console.error("Failed to start conversation:", error);
            setConnectionState(ConnectionState.ERROR);
            await stopConversation();
        }
    }, [stopConversation, voiceSettings]);

    const handleToggleMic = useCallback(() => {
        // Resume audio contexts on user interaction, which is required by modern browsers.
        if (outputAudioContextRef.current && outputAudioContextRef.current.state === 'suspended') {
            outputAudioContextRef.current.resume();
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state === 'suspended') {
            inputAudioContextRef.current.resume();
        }

        if (micState === MicState.ON) {
            stopConversation();
        } else {
            startConversation();
        }
    }, [micState, startConversation, stopConversation]);

    useEffect(() => {
        // Cleanup on component unmount
        return () => {
            stopConversation();
        };
    }, [stopConversation]);

    if (!isKeyReady) {
        return <ApiKeyScreen onSelectKey={handleSelectKey} />;
    }
    
    const animationStyle = {
        '--anim-speed-modifier': animationSettings.speed,
        '--anim-intensity-modifier': animationSettings.intensity,
        '--anim-saturation-modifier': animationSettings.saturation,
    } as React.CSSProperties;
    
    return (
        <>
            <div 
                id="app-container" 
                data-theme={themeName} 
                data-animation={animationName} 
                data-ai-state={aiState.toLowerCase()} 
                className="min-h-screen flex flex-col justify-between items-center p-4 sm:p-6 overflow-hidden transition-colors duration-500"
                style={animationStyle}
            >
                <div className="background-animation"></div>
                <header className="w-full flex justify-center items-center relative z-10">
                    <Logo className="h-8"/>
                    <StatusBar connectionState={connectionState} />
                </header>

                <main className="flex-grow flex flex-col items-center justify-center w-full z-10">
                    <Visualizer 
                        aiState={aiState}
                        inputAnalyserNode={inputAnalyserNode}
                        outputAnalyserNode={outputAnalyserNode}
                    />
                </main>

                <footer className="w-full flex flex-col items-center justify-center space-y-4 z-10">
                    <ChatLog 
                        messages={chatHistory} 
                        streamingModelMessage={streamingModelTranscript}
                        streamingUserMessage={streamingUserTranscript}
                    />
                    <div className="flex items-center space-x-4">
                        <MicButton micState={micState} onToggle={handleToggleMic} />
                        <button 
                            onClick={() => setIsSettingsOpen(true)}
                            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors duration-200 p-2 rounded-full"
                            aria-label="Open voice settings"
                            disabled={micState === MicState.ON}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                                <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69a.75.75 0 0 1 .981.981A10.501 10.501 0 0 1 18 16.5a10.5 10.5 0 0 1-10.5-10.5c0-1.77.446-3.447 1.239-4.942a.75.75 0 0 1 .819-.162Z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 1 .981.981A6.75 6.75 0 0 1 19.5 9a6.75 6.75 0 0 1-6.75 6.75 6.75 6.75 0 0 1-6.75-6.75c0-1.093.255-2.138.71-3.072A.75.75 0 0 1 7.72 6.31a8.25 8.25 0 0 0-5.454 2.953.75.75 0 0 1-1.06-1.06A9.75 9.75 0 0 1 12 3a9.72 9.72 0 0 1 5.096 1.342A.75.75 0 0 1 12.963 2.286Z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </footer>
            </div>
            <Settings
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </>
    );
};

export default App;