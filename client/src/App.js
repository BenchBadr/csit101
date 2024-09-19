import './App.css';
import Md from './util/markdown/markdown';
import Sidebar from './util/sidebar/sidebar';
import { useContext } from 'react';
import { ThemeContext, ThemeContextProvider } from './util/sidebar/ThemeContext';

function App() {
  return (
    <ThemeContextProvider>
        <Home />
    </ThemeContextProvider>
  );
}

const Home = () => {
  const { toggleSidebar, sidebarOpen, mode } = useContext(ThemeContext);

  return (
    <>
    <a className={`burger ${sidebarOpen && 'active'}`} onClick={toggleSidebar} style={{position:'absolute',left:'10px',top:'10px'}}>
        <div></div>
        <div></div>
        <div></div>
      </a>
    <div className={`app ${mode}`}>
      <Sidebar />
      <Md>{`# Hello\n\`\`\`python\nprint("Hello world")\n\`\`\`\`\n:mui>home:`}</Md>
      <button onClick={toggleSidebar} style={{ cursor: 'pointer' }}>
        Toggle Sidebar
      </button>
    </div>
    </>
  );
};

export default App;
