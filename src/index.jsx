import React from 'react'
import { createRoot } from 'react-dom/client';

function main(){
    const root = createRoot(document.getElementById("app"));
    root.render(
        <h1>Attendence System</h1>
    );
}

main()

