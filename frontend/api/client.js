import axios from 'axios'

// We will need to use a client like this (calling 'import apiClient from '@api/client'' where we need api calls)
// it will need to have a users authorized `Bearer` token in its headers for the backend to allow use of the api.

// api calls with /me/ in the url are meant to be used to alter your OWN profile and user info

// api calls WITHOUT /me/ still require a valid authorization token (the person has to be logged in)
// but they can request information about a person (they are GET functions) if provided a target uid
// (we will get the uid from the session when two people are chatting, and in the chat messages when people are matched)

// to authorized, we must use our phone otp as thats all we have setup right now.

const apiClient = axios.create({
  baseURL: __API_URL__ || 'http://localhost:5173',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;