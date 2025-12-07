import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@contexts/SocketContext';
import { useAuth } from '@contexts/AuthContext';

export function Matchmaking() {
  const { session, fetchWithAuth } = useAuth();
  const { socket, isConnected, emit, subscribe, unsubscribe } = useSocket();

  const [matchmakingState, setMatchmakingState] = useState('idle');
  const [sessionData, setSessionData] = useState(null);
  const [role, setRole] = useState(null);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [error, setError] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [config, setConfig] = useState({ timeout_seconds: 15, poll_interval_seconds: 3 });

  const pollIntervalRef = useRef(null);

  useEffect(() => {
    fetchWithAuth('/matchmaking/me/config')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleChatReceived = (data) => {
      setChatMessages(prev => [...prev, data]);
    };

    const handleMatchFound = (data) => {
      if (matchmakingState === 'searching' || matchmakingState === 'matched') {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setMatchmakingState('matched');
        setTimeout(() => setMatchmakingState('in_session'), 1500);
      }
    };

    subscribe('chat_received', handleChatReceived);
    subscribe('match_found', handleMatchFound);

    return () => {
      unsubscribe('chat_received', handleChatReceived);
      unsubscribe('match_found', handleMatchFound);
    };
  }, [socket, isConnected, matchmakingState, subscribe, unsubscribe]);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const pollForMatch = async () => {
    try {
      const response = await fetchWithAuth('/matchmaking/me/poll');
      if (!response.ok) throw new Error('Failed to poll for match');

      const result = await response.json();

      if (result.time_elapsed !== undefined) setTimeElapsed(result.time_elapsed);
      if (result.time_remaining !== undefined) setTimeRemaining(result.time_remaining);

      switch (result.status) {
        case 'searching':
          break;

        case 'matched':
        case 'timeout':
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }

          setSessionData(result.session);
          setRole(result.role);
          setMatchmakingState('matched');

          if (isConnected) {
            emit('join_session', { session_id: result.session.id });
          }

          setTimeout(() => setMatchmakingState('in_session'), 1500);
          break;

        case 'cancelled':
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setError('Matchmaking was cancelled');
          setMatchmakingState('idle');
          break;
      }
    } catch (err) {
      console.error('Polling error:', err);
    }
  };

  const joinMatchmaking = async () => {
    try {
      setError(null);
      setMatchmakingState('searching');
      setTimeElapsed(0);
      setTimeRemaining(config.timeout_seconds);

      const response = await fetchWithAuth('/matchmaking/me/join', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to join matchmaking');

      await pollForMatch();

      pollIntervalRef.current = setInterval(
        () => pollForMatch(),
        config.poll_interval_seconds * 1000
      );
    } catch (err) {
      setError(err.message);
      setMatchmakingState('idle');
    }
  };

  const cancelMatchmaking = async () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    try {
      await fetchWithAuth('/matchmaking/me/queue', { method: 'DELETE' });
      setMatchmakingState('idle');
      setError(null);
      setTimeElapsed(0);
      setTimeRemaining(config.timeout_seconds);
    } catch (err) {
      console.error('Failed to cancel matchmaking:', err);
    }
  };

  const leaveSession = async () => {
    try {
      await fetchWithAuth('/session/me', { method: 'DELETE' });

      if (isConnected && sessionData) {
        emit('leave_session', { session_id: sessionData.id });
      }

      setMatchmakingState('idle');
      setSessionData(null);
      setRole(null);
      setChatMessages([]);
      setMessage('');
      setTimeElapsed(0);
      setTimeRemaining(config.timeout_seconds);
    } catch (err) {
      setError(err.message);
    }
  };

  const sendMessage = () => {
    if (!message.trim() || !sessionData) return;

    emit('chat_message', {
      session_id: sessionData.id,
      content: message.trim()
    });

    setMessage('');
  };

  const renderContent = () => {
    switch (matchmakingState) {
      case 'idle':
        return (
          <div className="matchmaking-idle">
            <h2>Ready to Connect?</h2>
            <p>Click below to find someone to chat with</p>
            <button onClick={joinMatchmaking} className="btn-primary">
              Join Matchmaking
            </button>
            {error && <div className="error">{error}</div>}
          </div>
        );

      case 'searching':
        return (
          <div className="matchmaking-searching">
            <div className="spinner"></div>
            <h2>Finding a Match...</h2>

            <div className="timer-display">
              <div className="time-stat">
                <span className="time-value">{timeElapsed}s</span>
                <span className="time-label">elapsed</span>
              </div>
              <div className="time-divider">|</div>
              <div className="time-stat">
                <span className="time-value">{timeRemaining}s</span>
                <span className="time-label">remaining</span>
              </div>
            </div>

            <p className="search-status">
              {timeRemaining > 0
                ? 'Looking for compatible users...'
                : 'Creating session as host...'}
            </p>

            <button onClick={cancelMatchmaking} className="btn-secondary">
              Cancel
            </button>
          </div>
        );

      case 'matched':
        return (
          <div className="matchmaking-matched">
            <div className="success-icon">✓</div>
            <h2>Match Found!</h2>
            <p>You are the <strong>{role}</strong></p>
            <p>Connecting to chat...</p>
          </div>
        );

      case 'in_session':
        return (
          <div className="chat-session">
            <div className="chat-header">
              <div>
                <h2>Chat Session</h2>
                <span className="role-badge">{role}</span>
              </div>

              <button onClick={leaveSession} className="btn-danger">
                Leave Session
              </button>
            </div>

            <div className="chat-messages">
              {chatMessages.length === 0 ? (
                <div className="no-messages">
                  <p>No messages yet. Say hi! 👋</p>
                </div>
              ) : (
                chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`message ${
                      msg.author_uid === session.user.id ? 'own' : 'other'
                    }`}
                  >
                    <div className="message-content">{msg.content}</div>
                    <div className="message-time">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="chat-input">
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                disabled={!isConnected}
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim() || !isConnected}
                className="btn-primary"
              >
                Send
              </button>
            </div>

            {!isConnected && (
              <div className="connection-warning">
                ⚠️ WebSocket disconnected. Reconnecting...
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="matchmaking-container">{renderContent()}</div>;
}