import React, {useContext} from 'react';
import Md from '../util/markdown/markdown';
import { ThemeContext } from '../util/sidebar/ThemeContext';
import menuData from './data/sections';
import { Accordion } from '../util/markdown/markdown';

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
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '30px'
        }}>
        <img 
            src="https://wne.edu/_global/images/footer-logo.svg"
            style={{zIndex:1, maxWidth:'500px', borderRadius:0}}
        />
        </div>
      <div style={{ paddingLeft:'20px',paddingRight:'20px', paddingTop:'10vh'}}>
        <div className={`markdown-${theme}`}>
        <Md custom={1}>{`
# Welcome

Hello world! Welcome to the website for CS/IT 101 at **Western New England University**. This website contains some of the labs for the course.

|| Changelog
- Brand new UI
- Support for Dark / Light modes
- Introduction of themes
- Export image functionnality
||

## Important contacts

- Bob Walz, robert.walz@wne.edu
        `}</Md>
        </div>
        </div>
    </div>
  );
}

export default Landing;
