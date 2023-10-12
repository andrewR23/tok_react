
import React from 'react';
import { createRoot } from 'react-dom/client'; // Import from react-dom/client
import App from './_app_v6';

// Use createRoot to render your app
const rootElement = document.getElementById('root');
const root = createRoot(rootElement!);
root.render(<App />);


