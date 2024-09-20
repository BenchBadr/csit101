import React, {useContext} from 'react';
import Md from '../util/markdown/markdown';
import { ThemeContext } from '../util/sidebar/ThemeContext';

const Landing = () => {
    const { theme } = useContext(ThemeContext);
  return (
    <div>
      <img 
        src="https://wne.edu/become-a-student/why-wne/img/whywne_header.jpg" 
        className="fading-img" 
        style={{ 
          position: 'absolute', 
          top: '0px', 
          left: '0px', 
          height: '40vh', 
          background: 'var(--main)', 
          objectFit: 'cover' 
        }} 
        alt="image description" 
      />
      <div style={{ paddingLeft:'20px',paddingRight:'20px', paddingTop:'45vh',border:'3px solid var(--wne-blue)'}}>
        {/* <div className={`markdown-${theme}-parent`}> */}
        <div className={`markdown-${theme}`}>
        <Md custom={1}>{`
# Welcome

Welcome to the website for CS/IT 101 at Western New England University. This website contains some of the labs for the course.

## :new: Changelog
- Brand new UI
- Support for Dark / Light modes
- Introduction of themes
- Export image functionnality
        `}</Md>
        </div>
        {/* </div> */}
        </div>
    </div>
  );
}

export default Landing;
