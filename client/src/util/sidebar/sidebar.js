import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

const Sidebar = () => {
  const { mode, handleThemeChange, sidebarOpen, toggleSidebar} = useContext(ThemeContext);

  return (
    <>
    <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className='sidebar-content'>
      <h1>CSIT101 - WNE</h1>
      </div>
    </div>
    </>
  );
};

export default Sidebar;
