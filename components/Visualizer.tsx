import React, { useState, useEffect, useRef } from 'react';
import { AIState } from '../types';

interface VisualizerProps {
  aiState: AIState;
  inputAnalyserNode: AnalyserNode | null;
  outputAnalyserNode: AnalyserNode | null;
}

// Custom hook to calculate average volume from AnalyserNode
const useAverageVolume = (analyserNode: AnalyserNode | null): number => {
    const [averageVolume, setAverageVolume] = useState(0);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        if (!analyserNode) {
            setAverageVolume(0);
            return;
        }

        const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
        let isCancelled = false;

        const measure = () => {
            if (isCancelled) return;
            
            analyserNode.getByteFrequencyData(dataArray);
            const sum = dataArray.reduce((acc, val) => acc + val, 0);
            const avg = sum / dataArray.length;
            setAverageVolume(avg);
            animationFrameRef.current = requestAnimationFrame(measure);
        };
        
        measure();

        return () => {
            isCancelled = true;
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [analyserNode]);

    return averageVolume;
};


const Visualizer: React.FC<VisualizerProps> = ({ aiState, inputAnalyserNode, outputAnalyserNode }) => {
  const [barHeights, setBarHeights] = useState<number[]>(Array(32).fill(2));
  const animationFrameRef = useRef<number | null>(null);
  
  const inputVolume = useAverageVolume(inputAnalyserNode);
  const outputVolume = useAverageVolume(outputAnalyserNode);
  
  const activeAnalyser = aiState === AIState.LISTENING ? inputAnalyserNode :
                         aiState === AIState.SPEAKING ? outputAnalyserNode : null;


  useEffect(() => {
    const cleanup = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    cleanup();

    if (activeAnalyser) {
      const dataArray = new Uint8Array(activeAnalyser.frequencyBinCount);
      const draw = () => {
        activeAnalyser.getByteFrequencyData(dataArray);
        const newHeights = Array.from(dataArray).map(value => 2 + Math.pow(value / 255, 0.7) * 60);
        setBarHeights(newHeights);
        animationFrameRef.current = requestAnimationFrame(draw);
      };
      draw();

    } else if (aiState === AIState.THINKING) {
        const animateThinking = (timestamp: number) => {
            const newHeights = Array(32).fill(0).map((_, i) => {
                const pulse = Math.sin(timestamp / 500 + i / 4) * 5 + 12;
                return pulse;
            });
            setBarHeights(newHeights);
            animationFrameRef.current = requestAnimationFrame(animateThinking);
        };
        animationFrameRef.current = requestAnimationFrame(animateThinking);
        
    } else { // IDLE
        const animateIdle = (timestamp: number) => {
            const breath = Math.sin(timestamp / 2000) * 2 + 4;
            setBarHeights(Array(32).fill(breath));
            animationFrameRef.current = requestAnimationFrame(animateIdle);
        }
        animationFrameRef.current = requestAnimationFrame(animateIdle);
    }

    return cleanup;
  }, [aiState, activeAnalyser]);
  
  const getGlowStyle = () => {
    let colorVar = 'var(--glow-primary)';
    let intensity = 0;

    switch(aiState) {
        case AIState.LISTENING:
            intensity = Math.min(1, inputVolume / 50);
            break;
        case AIState.SPEAKING:
            colorVar = 'var(--glow-secondary)';
            intensity = Math.min(1, outputVolume / 40);
            break;
        case AIState.THINKING:
            colorVar = 'var(--glow-tertiary)';
            intensity = (Math.sin(Date.now() / 500) + 1) / 2;
            break;
        default:
            return {};
    }
    
    return {
        boxShadow: `0 0 20px ${colorVar}`,
        transform: `scale(${1 + intensity * 0.05})`,
    };
  }
  
  const micInputGlowStyle = {
    boxShadow: `0 0 15px var(--glow-primary)`,
    transform: `scale(${1 + (inputVolume / 100) * 0.1})`,
    opacity: Math.min(1, (inputVolume / 30)),
  };

  const stateClasses = {
    [AIState.IDLE]: { border: 'border-[var(--border-secondary)]', bars: 'bars-bg-tertiary' },
    [AIState.LISTENING]: { border: 'border-[var(--border-primary)]', bars: 'bars-bg-primary' },
    [AIState.THINKING]: { border: 'border-[var(--border-primary)]', bars: 'bars-bg-secondary' },
    [AIState.SPEAKING]: { border: 'border-[var(--border-primary)]', bars: 'bars-bg-secondary' },
  };

  const currentClasses = stateClasses[aiState];

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
        <div 
            className={`relative w-48 h-48 sm:w-64 sm:h-64 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${currentClasses.border}`}
            style={getGlowStyle()}
        >
            <div 
              className="absolute inset-0 rounded-full border-2 border-[var(--border-primary)] transition-all duration-200"
              style={micInputGlowStyle}
            />
            <div className={`flex items-end justify-center h-24 space-x-1 ${currentClasses.bars}`}>
                {barHeights.map((height, i) => (
                    <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-100`}
                        style={{ height: `${height}px` }}
                    />
                ))}
            </div>
        </div>
        <p className="text-[var(--text-secondary)] h-6 transition-opacity duration-300">
            {aiState === AIState.LISTENING ? 'Listening...' : aiState === AIState.THINKING ? 'Thinking...' : aiState === AIState.SPEAKING ? 'Speaking...' : 'Press the mic to talk'}
        </p>
    </div>
  );
};

export default Visualizer;