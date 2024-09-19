
import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import env from "react-dotenv";

const ThemeContext = React.createContext({});

export { ThemeContext };

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState('light'); // This is the default theme, should be set to 'dark' or 'light'
  const [language, setLanguage] = useState('0'); // This is the default language (English)
  const [cookie] = useCookies(['theme', 'language','accent']);
  const [ip, setIp] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(1);


  useEffect(() => {
    if (cookie.theme) {
      setMode(cookie.theme);
    } else {
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDarkMode ? 'dark' : 'light');
    }
    if (cookie.sidebar){
      setSidebarOpen(cookie.sidebar);
    }
    if (cookie.language) {
      setLanguage(cookie.language);
    } else {
      let langNav = navigator.language;
      if (langNav.length > 2){
      langNav = (langNav.substring(0,2))
      }
      const supported = ['en','fr','es']
      if (supported.includes(langNav)){
        setLanguage(supported.indexOf(langNav))
      }
    }
    if (cookie.accent){
      document.documentElement.style.setProperty('--main', `var(--${cookie.accent})`);
      document.documentElement.style.setProperty('--dark-main', `var(--dark-${cookie.accent})`);
    } else {
      document.cookie = `accent='var(--blue)'; path=/`
    }
  }, [cookie]);

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
       setIp(data.ip)
    })
    .catch(error => {
        // console.error('Error fetching IP address:', error);
    });
  }, []);


  const handleThemeChange = (newTheme) => {
    try {
      setMode(newTheme);
      document.cookie = `theme=${newTheme}; path=/`; // save a cookie
    } catch (error) {
      console.error('Error setting theme cookie:', error);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    try {
      setLanguage(newLanguage);
      document.cookie = `language=${newLanguage}; path=/`; // save a cookie
      window.location.reload()
    } catch (error) {
      console.error('Error setting language cookie:', error);
    }
  };

  const toggleSidebar = () => {
    try {
      setSidebarOpen(!sidebarOpen);
      document.cookie = `sidebar=${sidebarOpen}; path=/`; // save a cookie
    } catch (error) {
      console.error('Error setting language cookie:', error);
    }
  };


  const value = {
    mode,
    language,
    setMode,
    setLanguage,
    handleThemeChange,
    handleLanguageChange,
    sidebarOpen,
    toggleSidebar,
    ip
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
