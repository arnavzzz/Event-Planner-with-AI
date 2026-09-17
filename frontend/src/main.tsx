import { createRoot } from 'react-dom/client'
import App from './App.tsx'

const main_root = createRoot(document.getElementById("root")!)

main_root.render(
    <App />
)
