import { ThemeContext } from '../../sidebar/ThemeContext';
import React, { useState, useEffect, useContext } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { Highlight, themes } from "prism-react-renderer"
import mermaid from "mermaid";
import { PythonContext } from './python';


const CopyWrapper = ({ textToCopy, children }) => {
    const handleCopy = (e) => {
      e.preventDefault();
      e.clipboardData.setData('text/plain', textToCopy);
      e.target.blur();
    };
  
    return (
      <span onCopy={handleCopy}>
        {children}
      </span>
    );
  };
  
class Mermaid extends React.Component {
    componentDidMount() {
      this.renderChart();
    }
  
    componentDidUpdate() {
      this.renderChart();
    }
  
    renderChart() {
      mermaid.initialize({
        theme: this.props.theme || 'default'
      });
      mermaid.contentLoaded();
    }
  
    render() {
      return <div className="mermaid">{this.props.chart}</div>;
    }
  }

export const CodeBlock = ({ language2, code, count }) => {
    const { mode, language, auth } = useContext(ThemeContext);
    const [isCopied, setIsCopied] = useState(false);
    const l = language;
    const canRun = ['py', 'python'].includes(language2);
    const pythonValue = useContext(PythonContext);
    const { runPythonFunc, isLoading, isRunning, isReady, output, num, setNum, outputErr, stderr, stdout } = pythonValue || [null, null, null, null, null, null, null]
    const [fullscreen, setFullscreen] = useState(0);
    const [out, setOut] = useState(['', '']);
    const [codeContent, setCodeContent] = useState(code);

    useEffect(() => {
      if (num===count){
        setOut([stdout, stderr])
      }
    }, [num, stdout, stderr])


    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setFullscreen(0); 
        }
      };
  
      document.addEventListener('keydown', handleKeyDown);
  
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, []);



  
    const plainCode = () => {
      const codeArray = Array.isArray(codeContent) ? codeContent : [codeContent];
      const plainCode = codeArray
        .map((item) =>
          typeof item === 'object' ? item.props.children.join('') : item
        )
        .join('');
      return plainCode;
    };
  
    const handleCopy = () => {
      navigator.clipboard.writeText(plainCode()).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1500);
      });
    };
  
    const customTrim = (codeBlock) => (
      codeBlock.startsWith('> ') ? codeBlock.substring(2,codeBlock.length) : codeBlock
    )

    
    const handleRun = () => {
      runPythonFunc(customTrim(plainCode()).replaceAll('\n> ','\n'), count);
      // setStartTime(Date.now());
    };

  if (language2 === 'math') {
    if (codeContent) {
      return <CopyWrapper textToCopy={`$$\n${codeContent}\n$$`}><BlockMath>{codeContent}</BlockMath></CopyWrapper>;
    } else {
      return null;
    }
  }

  if (language2 === 'mermaid') {
    try {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row' }}>
          <Mermaid
            theme={mode === 'dark' ? 'dark' : 'forest'}
            chart={codeContent}
          />
        </div>
      );
    } catch (error) {
      return codeContent;
    }
  }

  return (
    <>
      {!code ? 
        <code className={`inline-code ${mode}`} style={{ color: 'grey' }}>{code}</code> : (
        <div style={{ position: 'relative'}} className="block-code-parent">
          <div className={`copy-btn`} id='#to-hid'>
              <div>
                {!isCopied ? <span className="copy-icon" onClick={handleCopy}></span> : <div className='tooltip'>
                <a className='tooltip-text small flip' style={{ boxShadow: 'none', fontSize: '65%' }}>{["copied!", "copié !", "¡copiado!"][l]}</a>
                <span className="material-icons-round" style={{ color: 'green' }}>done</span> 
              </div>}
                {canRun && !(code.includes('while 1')) && !(code.includes('while True')) ? (
                  isReady ? 
                  <div className={`run-btn ${isRunning && num===count ? 'blink' : ''}`}>
                    {!(isRunning && num===count) ? <div className='material-icons-round' onClick={() => window.location.pathname==='/dyned' || (auth && auth.r) ? handleRun() : document.querySelector(".auth-btn").click()}>play_arrow</div> : ``} 
                  </div> :
                  isLoading ? <div className='spinner smaller' /> : null
                ) : null}
              </div>
          </div>
          <Highlighter codeBlock={code} language={language2} lines={1} code={codeContent} setCode={setCodeContent} />
          {canRun && isReady ?
            <div className={`code-output auto-height ${fullscreen ? 'infull' : ''}`}>
              {out[0]}
              <br></br>
              <a style={{ color: 'var(--red)' }}>
                {out[1]}
              </a>
            </div>
            : null}
             {isReady && canRun ? <a className={`fullscreen-button ${fullscreen ? 'infull' : ''}`} onClick={() => setFullscreen(!fullscreen)}>
              <a className='material-icons-outlined'>{!fullscreen ? 'fullscreen' : 'fullscreen_exit'}</a>
              </a> : null}
        </div>
      )}
    </>
  );
};


const Highlighter = ({codeBlock, language='', lines=1, code, setCode}) => {
    const { mode } = useContext(ThemeContext);
    const customTrim = () => (
      // code.startsWith('> ') ? code.substring(2,code.length) : code
      code
    )
    return (
      <div className='blockCode'>
        {/* <textarea onChange={(event) => setCode(event.target.value)} value={code} className='ghostarea'></textarea> */}
        <Highlight
          code={customTrim(code).replaceAll('\n> ','\n')}
          theme={mode==='dark' ? themes.vsDark : themes.github}
          language={language}
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre style={{...style, background:'transparent'}}>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })} style={{paddingLeft:'40px'}} className={code.split('\n')[i].startsWith(`> `) ? `selectedLine` : ''}
                >
                  {lines ? <a className='line-display'
                  style={{borderTopLeftRadius:[0,'1rem'][i===0],borderBottomLeftRadius:[0,'1rem'][i==tokens.length-1]}}
                  >{i + 1}</a> : null}
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    )
  }
  
