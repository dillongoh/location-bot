'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';

import type { LocationFeature } from '@/types/geojson';

// Toggle debug logs
const DEBUG = false;

interface ChatPanelProps {
  onLocationsFound?: (locations: LocationFeature[]) => void;
}

export default function ChatPanel({ onLocationsFound }: ChatPanelProps) {
  const [input, setInput] = useState('');

  const lastSentLocationsRef = useRef<LocationFeature[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastProcessedToolResultRef = useRef<string | null>(null);

  const { messages, sendMessage, status } = useChat();

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Extract location data from the most recent tool result and update map
  useEffect(() => {
    if (!onLocationsFound || messages.length === 0) return;

    // Only check the latest message - since we process incrementally and track processed results,
    // we don't need to search backwards through all messages
    const latestMessage = messages[messages.length - 1];
    
    if (latestMessage.role !== 'assistant' || !latestMessage.parts?.length) return;
    
    const toolPart = latestMessage.parts.find((p: any) => 
      p.type === 'tool-search_location' && 
      p.state === 'output-available' &&
      (p as any).output?.features
    );
    
    if (!toolPart) return;
    
    const toolOutput = (toolPart as any).output;
    const locations = toolOutput.features || [];
    
    if (locations.length === 0) return;
    
    // Create a unique key for this tool result to detect changes
    const toolResultKey = `${latestMessage.id}-${JSON.stringify(toolOutput)}`;
    
    // Skip if we've already processed this exact tool result
    if (toolResultKey === lastProcessedToolResultRef.current) return;
    
    lastProcessedToolResultRef.current = toolResultKey;
    
    const limitedLocations = locations.slice(0, 10);
    
    // Only update if different from last sent
    const lastSent = lastSentLocationsRef.current;
    const isSame = JSON.stringify(lastSent) === JSON.stringify(limitedLocations);
    if (!isSame) {
      if (DEBUG) {
        console.log('📍 Locations found:', limitedLocations.length);
      }
      onLocationsFound(limitedLocations);
      lastSentLocationsRef.current = limitedLocations;
    }
  }, [messages, onLocationsFound]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== 'ready') return;

    if (DEBUG) console.log('=== Sending message:', input);
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex-1 overflow-auto border mb-2 p-2">
        {messages.length === 0 && (
          <div className="mb-2">
            <b>assistant:</b>{' '}
            <span>
              Hi! I'm your friendly local hangout guide. I can help you discover great places to hang out, meet friends, and explore local spots in Singapore. Just ask me about any specific location, and I'll show it on the map for you!
            </span>
          </div>
        )}

        {messages.map((m: any) => {
          const textParts = m.parts?.filter((p: any) => p.type === 'text') || [];
          
          // Only get tool parts from THIS specific message, not from other messages
          const locationToolPart = m.parts?.find((p: any) => 
            p.type === 'tool-search_location' && 
            p.state === 'output-available' && 
            p.output?.features
          );
          const reviewToolPart = m.parts?.find((p: any) => 
            p.type === 'tool-get_review_rating' && 
            p.state === 'output-available' && 
            p.output?.success
          );
          
          // Only show location list if this message contains the location tool part AND no rating tool
          // (to prevent showing location list when user asks for rating)
          const locationFeatures: LocationFeature[] = locationToolPart?.output?.features || [];
          const hasValidLocation = locationToolPart && locationFeatures.length > 0 && !reviewToolPart;
          const toolExecutedButEmpty = locationToolPart && !hasValidLocation && !reviewToolPart;
          const isStreaming = status === 'streaming' && m.role === 'assistant';

          // Format location list as text for assistant messages
          const locationListText = hasValidLocation
            ? `Found ${locationFeatures.length} location${locationFeatures.length !== 1 ? 's' : ''}:\n${locationFeatures.slice(0, 10).map((feature: LocationFeature, idx: number) => `${idx + 1}. ${feature.properties?.name || `Location ${idx + 1}`}`).join('\n')}${locationFeatures.length > 10 ? `\n... and ${locationFeatures.length - 10} more` : ''}`
            : '';

          // Format "no locations found" message as text for assistant messages
          const noLocationsText = toolExecutedButEmpty
            ? 'No locations found.'
            : '';

          // Format review rating data as text for assistant messages (only if this message has the rating tool part)
          const reviewRatingText = reviewToolPart && reviewToolPart.output?.success && reviewToolPart.output?.data
            ? (() => {
                const data = reviewToolPart.output.data;
                let text = `${data.name || 'Location'}`;
                if (data.address) {
                  text += `\n📍 ${data.address}`;
                }
                if (data.rating !== undefined) {
                  text += `\n⭐ Rating: ${data.rating}/5`;
                }
                if (data.userRatingCount !== undefined) {
                  text += ` (${data.userRatingCount.toLocaleString()} reviews)`;
                }
                return text;
              })()
            : '';

          // Check if text already contains review rating (to avoid duplication)
          const allText = textParts.map((p: any) => p.text).join('');
          const textAlreadyHasRating = allText.includes('Rating:') || allText.includes('⭐');

          return (
            <div key={m.id} className="mb-2">
              <b>{m.role}:</b>{' '}

              {/* Show assistant text parts */}
              {textParts.length > 0 && textParts.map((part: any, i: number) => (
                <span key={i}>{part.text}</span>
              ))}

              {/* Show location list as assistant message text (after any text parts) */}
              {m.role === 'assistant' && hasValidLocation && (
                <>
                  {textParts.length > 0 && <br />}
                  <span className="whitespace-pre-line">{locationListText}</span>
                </>
              )}

              {/* Show review rating as assistant message text (after any text parts) */}
              {m.role === 'assistant' && reviewRatingText && !textAlreadyHasRating && (
                <>
                  {textParts.length > 0 && <br />}
                  <span className="whitespace-pre-line">{reviewRatingText}</span>
                </>
              )}

              {/* Show "no locations found" as assistant message text */}
              {m.role === 'assistant' && noLocationsText && (
                <>
                  {textParts.length > 0 && <br />}
                  <span>{noLocationsText}</span>
                </>
              )}

              {isStreaming && textParts.length === 0 && !hasValidLocation && !reviewRatingText && !noLocationsText && (
                <span className="text-gray-400 animate-pulse">...</span>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef}></div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="border flex-1 p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={status !== 'ready'}
          placeholder="Ask about a location..."
          aria-label="Chat input"
        />
        <button
          type="submit"
          className="border px-4"
          disabled={status !== 'ready'}
          aria-label="Send message"
        >
          Send
        </button>
      </form>
    </div>
  );
}
