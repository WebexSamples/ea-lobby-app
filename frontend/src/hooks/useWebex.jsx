import { useState, useEffect } from 'react';
import Application from '@webex/embedded-app-sdk';

/**
 * Custom hook to manage Webex SDK state and connection status.
 *
 * @returns {Object} Webex SDK state and metadata.
 * @property {Object|null} webexData - The Webex SDK instance, meeting details, and user info.
 * @property {boolean} loading - Indicates whether the SDK is initializing.
 * @property {string|null} error - Error message if initialization fails.
 * @property {boolean} isConnected - Whether the Webex SDK is connected.
 * @property {boolean} isRunningInWebex - Whether the app is running inside Webex.
 * @property {string|null} username - Webex user's display name.
 * @property {string|null} meetingName - The current Webex meeting name.
 */
const useWebex = () => {
  const [webexData, setWebexData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRunningInWebex, setIsRunningInWebex] = useState(true); // Assume true, detect later
  const [username, setUsername] = useState(null);
  const [meetingName, setMeetingName] = useState(null);

  useEffect(() => {
    const initializeWebex = async () => {
      try {
        const app = new Application();

        // Set timeout in case Webex never loads (running outside Webex)
        const timeout = setTimeout(() => {
          setIsRunningInWebex(false);
          setLoading(false);
          setUsername('Unknown User');
          setMeetingName('No Active Meeting');
        }, 5000); // 5-second timeout

        await app.onReady(); // Will not complete if outside Webex
        clearTimeout(timeout); // Webex detected, clear timeout

        const meeting = await app.context.getMeeting();
        const user = app.application.states.user;

        setWebexData({ app, about: app.about, meeting, user });
        setIsConnected(true);
        setUsername(user?.displayName || 'Unknown User');
        setMeetingName(meeting?.title || 'No Active Meeting');
        setIsRunningInWebex(true);
      } catch (err) {
        console.error('Error initializing Webex SDK:', err);
        setError(err.message || 'Failed to connect to Webex');
        setIsConnected(false);
        setIsRunningInWebex(false);
      } finally {
        setLoading(false);
      }
    };

    initializeWebex();
  }, []);

  return {
    webexData,
    loading,
    error,
    isConnected,
    username,
    meetingName,
    isRunningInWebex,
  };
};

export default useWebex;
