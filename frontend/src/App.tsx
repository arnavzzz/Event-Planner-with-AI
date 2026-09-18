import LoginPage from "./parts/LoginPage.tsx"
import React from "react";

function App() {
  const [isDark,setIsDark] = React.useState(false);
  const onToggle = () => {
    setIsDark((prev) => !prev)
  }
  console.log(isDark?"Light Mode":"Dark Mode")
  return (
    <LoginPage isDark={isDark} onToggle={onToggle}/>
  )
}

export default App
