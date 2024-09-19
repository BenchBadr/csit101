import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';

export const stringToValidID = (str) => {
    str = str.toLowerCase();
    str = str.replace(/[^a-z0-9-]/g, '-');
    str = str.replace(/-{2,}/g, '-');
    str = str.replace(/^-+|-+$/g, '');
    return str;
}
  

const processLines = (lines) => {
    // handle within textbox
    const summary = { 'defaultH1': {'defaultH2': []} };
    const cls = ['tips', 'info', 'warn','check', 'gpt', 'bard', 'gpt4', 'gpterr', 'sign', 'canva', 'qst','tweet'];
    let defaultTitle = 'defaultH1';
    let currentH2 = 'defaultH2';
    let inCodeBlock1 = false;
    let inCodeBlock2 = false;
    let inMathBlock = false;
    let inTextbox = false;
    lines.forEach(line => {
      if (inTextbox && line.includes('/]')){
        inTextbox = 0;
      }
      if (line.trimStart().startsWith('```')) {
        inCodeBlock1 = !inCodeBlock1;
      } else if (line.trimStart().startsWith('~~~')) {
        inCodeBlock2 = !inCodeBlock2;
      } else if (line.trimStart().startsWith('$$')) {
        inMathBlock = !inMathBlock;
      } else if (cls.some(c => line.includes(`{${c}}[/`))) {
        if (!(line.includes('/]'))){
          inTextbox = 1;
        }
      } else if (!inCodeBlock1 && !inCodeBlock2 && !inMathBlock && !inTextbox) {
        if (line.trimStart().startsWith('# ')) {
          defaultTitle = line.slice(2).trim();
          if (defaultTitle)
          summary[defaultTitle] = {'defaultH2': []};
          currentH2 = 'defaultH2';
        } else if (line.startsWith('## ')) {
          currentH2 = line.slice(3).trim();
          summary[defaultTitle][currentH2] = [];
        } else if (line.startsWith('### ')) {
          summary[defaultTitle][currentH2].push(line.slice(4).trim());
        }
      }
    });
  
    return summary;
  };
  

export const TextSummary = ({ inputText }) => {
    const lines = inputText.split('\n');
    const summary = processLines(lines);
  
  
    const [openSections, setOpenSections] = useState({});
  
    const toggleSection = (sectionId, level, event) => {
      event.stopPropagation();
  
      setOpenSections((prevState) => ({
        ...prevState,
        [sectionId]: !prevState[sectionId] || prevState[sectionId] === undefined ? false : !prevState[sectionId],
      }));
    };
  
    const gotoId = (id) => {
      return '#'+stringToValidID(id)
    }
  
    const getTotalLength = (parentDictKey) => {
      let innerObject = summary[parentDictKey];
      let totalLength = 0;
  
      for (let innerKey in innerObject) {
          let innerList = innerObject[innerKey];
          totalLength += innerList.length;
      }
  
      return totalLength;
    }
  
    return (
      <div style={{ fontFamily: 'sans-serif' }} className='ulsum'>
        {Object.keys(summary).map((h1Title, index1) => (
          <React.Fragment key={h1Title}>
            {!((summary[h1Title]['defaultH2'].length===0) && (Object.keys(summary[h1Title]).length<=1) && h1Title==='defaultH1') ? (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <details
                  open={true}
                  onToggle={(event) => toggleSection(h1Title, 'h1', event)}
                  style={{
                    borderBottom: '1px solid rgba(163, 186, 245, 0.5)',
                    paddingBottom: '10px',
                    marginBottom: '20px',
                    overflow: 'hidden',
                  }}
                >
                  {h1Title!=='defaultH1' ? <summary
                    style={{
                      fontWeight: 'bold',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <a href={gotoId(h1Title)} className='hover-underline'>
                      {h1Title}
                    </a>
                    <span style={{ marginLeft: 'auto', fontSize: '1.2rem' }} className='material-icons-round'>
                      {Object.keys(summary[h1Title]).length>1 || getTotalLength(h1Title)>0 ? (openSections[h1Title] ? 'expand_less' : 'expand_more') : null}
                    </span>
                  </summary> : <summary className='hide-arrow-details'/>}
                  <div style={{ marginLeft: '20px' }}>
                    {Object.keys(summary[h1Title]).map((h2Level, index2) => (
                      <div key={h2Level} style={{ position: 'relative', paddingLeft: '20px' }}>
                        {!(h2Level==='defaultH2' && summary[h1Title][h2Level].length===0) && (
                          <ul style={{ listStyle: 'none', padding: 0 }}>
                            <details
                              open={true}
                              onToggle={(event) => toggleSection(`${h1Title}-${h2Level}`, 'h2', event)}
                              style={{
                                transition: 'max-height 0.3s ease-in-out',
                                overflow: 'hidden',
                              }}
                            >
                              {h2Level!=='defaultH2' ? <summary
                                style={{
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                <a href={gotoId(h2Level)}  className='hover-underline'>
                                  {h2Level}
                                </a>
                                <span style={{ marginLeft: 'auto', fontSize: '1rem' }} className='material-icons-round'>
                                  {summary[h1Title][h2Level].length>0 ? openSections[`${h1Title}-${h2Level}`] ? 'expand_less' : 'expand_more' : null}
                                </span>
                              </summary> : <summary className='hide-arrow-details'/>}
                              <ul style={{ listStyle: 'none', padding: 0, marginLeft: '20px' }}>
                                {summary[h1Title][h2Level].map((h3Title, index3) => (
                                  <li key={index3} style={{ marginBottom: '5px' }}>
                                    <a href={gotoId(h3Title)}  className='hover-underline'>
                                      {h3Title}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </details>
                          </ul>
                        )}
                        <div
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: '20px',
                            bottom: '20px',
                            width: '3px',
                            borderRadius:'1rem',
                            backgroundColor: 'rgba(163, 186, 245, 0.5)',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </details>
              </ul>
            ) : (
             null   
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };
  