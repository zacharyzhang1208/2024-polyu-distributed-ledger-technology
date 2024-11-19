import React from 'react'
import { createRoot } from 'react-dom/client';
import Login from './components/Login/Index.jsx';

function App() {
  return (
    <div>
      <Login />
    </div>
  );
}

function main(){
    const root = createRoot(document.getElementById("app"));
    root.render(
        <App />
    );
}

main()

