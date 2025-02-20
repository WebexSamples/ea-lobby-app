// src/hooks/useWebex.jsx
import { useState, useEffect } from 'react';
import Application from '@webex/embedded-app-sdk';

const useWebex = () => {
  const [webexData, setWebexData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Define an async function to initialize and fetch meeting context
    const fetchWebexData = async () => {
      try {
        // Initialize the embedded app
        const app = new Application();
        await app.onReady();
        // Retrieve the meeting context
        const meeting = await app.context.getMeeting();
        const user = app.application.states.user;
        const context = {
          app,
          about: app.about,
          meeting,
          user,
        };
        setWebexData(context);
      } catch (err) {
        console.error('Error fetching Webex data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWebexData();
  }, []);

  return { webexData, loading, error };
};

export default useWebex;
