import './App.css';
import Md from './util/markdown/markdown';
import Sidebar from './util/sidebar/sidebar';
import { useContext } from 'react';
import { ThemeContext, ThemeContextProvider } from './util/sidebar/ThemeContext';
import Landing from './pages/landing';

function App() {
  return (
    <ThemeContextProvider>
        <Home>
          <Landing/>
        </Home>
    </ThemeContextProvider>
  );
}



const Home = ({children}) => {
  const { toggleSidebar, sidebarOpen, mode, theme } = useContext(ThemeContext);
  const isMobile = window.innerWidth < 768;
  console.log(theme)
  return (
    <>
    <a className={`burger ${((sidebarOpen && !isMobile) || (isMobile && !sidebarOpen)) && 'active'}`} onClick={() => toggleSidebar()}>
        <div></div>
        <div></div>
        <div></div>
      </a>
    <div className={`app ${mode}`}>
      <Sidebar />
      <div className={`main-content markdown-${theme}`}>
      {children}
      </div>
    </div>
    </>
  );
};

export default App;
