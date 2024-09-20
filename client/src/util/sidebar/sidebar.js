import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

const Sidebar = () => {
  const { mode, handleModeChange, sidebarOpen, toggleSidebar} = useContext(ThemeContext);

  return (
    <>
    <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className='sidebar-content'>
      <h1>CSIT101 - WNE</h1>
      </div>
      <div style={{position:'absolute',bottom:'10px',left:'10px',display:'flex',alignItems:'center'}}>
      <div  onClick={() => handleModeChange(mode==='dark' ? 'light' : 'dark')} className='opacity-btn'>
        <a className='material-icons-outlined'>{mode!=='dark' ? 'dark_mode' : 'light_mode'}</a>
      </div>
      <DropdownTheme/>
      </div>
    </div>
    </>
  );
};

export default Sidebar;


const DropdownTheme = () => {
  const { language, mode, theme, handleThemeChange} = useContext(ThemeContext);
  const l = language;
  return (
    <div className="dropdown-theme">
  {['Theme', 'Thème', 'Tema'][l]} : 
  <select id="dropdown-theme" name="dropdown-theme" className={mode} onChange={(e) => handleThemeChange(e.target.value)}>
    <option value="body" selected={'body'==theme}>{['Default', 'Par défaut', 'Estándar'][l]}</option>
    <option value="hand" selected={'hand'==theme}>{['Handwritten', 'Écrit à la main', 'Manuscrito'][l]}</option>
    <option value="news" selected={'news'==theme}>{['Newspaper', 'Journal', 'Periódico'][l]}</option>
    <option value="pres" selected={'pres'==theme}>{["Script", "Script", "Script"][l]}</option>
  </select>
  </div>
  )
}
