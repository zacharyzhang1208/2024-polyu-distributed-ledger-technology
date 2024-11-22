import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App/Index.jsx';

function main() {
    const root = createRoot(document.getElementById("app"));
    root.render(<App />);
}

main()