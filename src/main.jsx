// Create global AudioContext FIRST — before any other imports
// to catch navigation user-activation window
import './utils/audioUnlock';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

/* Console easter egg */
console.log(
  '%c⚡ PROKYI SYSTEM v2.0 ⚡',
  'color: #00f2fe; font-size: 24px; font-weight: bold; text-shadow: 0 0 10px #00f2fe;'
);
console.log(
  '%c█ Welcome, fellow hacker. █\n%c> This site was built with React 19 + Vite 6 + Three.js\n> Crafted through 100+ iterative loops\n> Try pressing Ctrl+K, ?, or clicking the avatar 7 times 👀',
  'color: #a78bfa; font-size: 14px; font-weight: bold;',
  'color: #4facfe; font-size: 12px;'
);
console.log(
  '%c⚠ セキュリティ警告: ここにコードを貼り付けないでください',
  'color: #ff2d4a; font-size: 14px; font-weight: bold;'
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
