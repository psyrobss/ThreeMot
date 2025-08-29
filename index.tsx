import React from 'react';
import ReactDOM from 'react-dom/client';
// Changed from 'App' to 'Root' to match the default export and include providers
import Root from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
// Render the Root component, which contains the necessary providers
root.render(
  <Root />
);