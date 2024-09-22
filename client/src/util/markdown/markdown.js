import { ThemeContext } from '../sidebar/ThemeContext';
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { BlockMath, InlineMath } from 'react-katex';
import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import 'katex/dist/katex.min.css';
import ReactDOMServer from 'react-dom/server';
import { Chart } from "react-google-charts";
import reactStringReplace from 'react-string-replace';
import {emojiShortcut, emojiTransorm} from './emojis';
import { Question } from './question';
import {Tweet} from 'react-tweet'
import { Tooltip } from './integr/wikipedia';
import { CodeBlock } from './integr/code';
import { stringToValidID } from './integr/toc';
import Keyboard from './inline/key';
import Youtube from './integr/youtube';
import WebResult from './integr/webRes';

const sanitizeHtml = (html) => {
  let sanitized = html.replace(/<style[^>]*>.*?<\/style>/gs, '');
  sanitized = sanitized.replace(/ style="[^"]*"/g, '');
  sanitized = sanitized.replace(/ class="[^"]*"/g, '');
  return sanitized;
};
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

/*
TODO :
handle indent for excedent ex:
  ```

handle nested textboxes of same type

handle four+ backticks like

````

see also : attr issue with texboxes
*/

function excedentBlock(str) {
  const codeBlockPatterns = [
      { delimiter: '```', regex: /^\s*```/gm }, // Matches ``` at the beginning of a line after optional whitespace
      { delimiter: '~~~', regex: /^\s*~~~/gm }  // Matches ~~~ at the beginning of a line after optional whitespace
  ];

  const delimiterPositions = [];
  for (const pattern of codeBlockPatterns) {
      let match;
      while ((match = pattern.regex.exec(str)) !== null) {
          const position = match.index;
          const lineStart = str.lastIndexOf('\n', position - 1) + 1;
          const leadingText = str.slice(lineStart, position).trim();
          const leadingSpaces = str.slice(lineStart, position).length;
          if (leadingText === '' && leadingSpaces < 4) {
              if (!isInsideCodeBlock(str, position) || 
                  (delimiterPositions.length !== 0 && delimiterPositions[delimiterPositions.length - 1].delimiter === pattern.delimiter)) {
                  delimiterPositions.push({ position: position, delimiter: pattern.delimiter });
              }
          }
      }
  }

  delimiterPositions.sort((a, b) => a.position - b.position);

  let backtickCount = 0;
  let tildeCount = 0;
  let stack = [];

  for (const item of delimiterPositions) {
      if (stack.length === 0 || stack[stack.length - 1] !== item.delimiter) {
          stack.push(item.delimiter);
      } else {
          const closingDelimiter = stack.pop();
          if (closingDelimiter === '```') {
              backtickCount++;
          } else if (closingDelimiter === '~~~') {
              tildeCount++;
          }
      }
  }

  let completionString = '';
  if (stack.length > 0) {
      completionString = stack[stack.length - 1];
  }

  return {
      backtickCount: backtickCount,
      tildeCount: tildeCount,
      completionString: completionString
  };
}

const Textbox = ({children, cls}) => {
  const output = `\n\n${children}\n${excedentBlock(children).completionString}\n\n`;
  return (
    <div className={`reset ${cls}`} dangerouslySetInnerHTML={{ __html: output }} >
    </div>
  )
}



export const Accordion = ({ content, id, custom=null, wne=null }) => {
  const [isChecked, setIsChecked] = useState(wne);

  const lines = content.split('\n');

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <div className="accordion" style={{border:!custom ? 'current' : 'none'}}>
      <div className="tab">
        <input 
          type="checkbox" 
          name={`accordion-${id}`}
          id={`cb${id}`} 
          checked={isChecked} 
          onChange={handleCheckboxChange}
        />
        <label htmlFor={`cb${id}`} className="tab__label reset" style={{background:custom ? 'none' : 'current', color:custom ? custom : 'current'}}>
          <LightMd>{lines[0]}</LightMd>
          <div>
            {isChecked}
            <a className='material-icons-round' style={{color:wne ? 'var(--wne-yellow)' : 'inherit'}}>expand_more</a>
          </div>
        </label>
        <div className="tab__content" style={{borderLeft:wne ? '1px solid var(--wne-yellow)' : 'none'}}>
          <LightMd>
            {lines.slice(1).join('\n')}
          </LightMd>
        </div>
      </div>
    </div>
  );
};

const Canva = ({url}) => {
  return (
  <div style={{
    position: 'relative',
    width: '100%',
    height: 0,
    paddingTop: '56.2500%',
    paddingBottom: 0,
    boxShadow: '0 2px 8px 0 rgba(63,69,81,0.16)',
    marginTop: '1.6em',
    marginBottom: '0.9em',
    overflow: 'hidden',
    borderRadius: '8px',
    willChange: 'transform'
  }}>
    <iframe
      loading="lazy"
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        border: 'none',
        padding: 0,
        margin: 0
      }}
      src={url+`?embed`}
      allowFullScreen
      allow="fullscreen"
    />
  </div>
)}


export const LightMd = ({children}) => {

  return (
    <Markdown
      remarkPlugins={[remarkMath, [remarkGfm, { singleTilde: false }]]}
      rehypePlugins={[rehypeKatex, rehypeRaw]}
    >{sanitizeHtml(children)}</Markdown>
  )
}

const _mapProps = (props) => {
  // Initialize a counter for code blocks
  let codeBlockCounter = 0;
  const [foot, setFoot] = useState([])

  return {
    ...props,
    remarkPlugins: [
      remarkMath,
      [remarkGfm, { singleTilde: false }],
    ],
    rehypePlugins: [rehypeKatex, rehypeRaw],
    components: {
      math: ({ value }) => (
        <CopyWrapper textToCopy={value}>
          <BlockMath>{value}</BlockMath>
        </CopyWrapper>
      ),
      inlineMath: ({ value }) => (
        <CopyWrapper textToCopy={value}>
          <InlineMath>{value}</InlineMath>
        </CopyWrapper>
      ),
      code: ({ node, inline, className, children, ...props }) => {
        codeBlockCounter += 1;
        const match = /language-(\w+)/.exec(className || '');
        return match ? (
              <CodeBlock language2={match[1]} code={children} count={codeBlockCounter/2}/>
        ) : (
          <InlineCode code={children} count={codeBlockCounter/2} />
        );
      },
      p: CustomParagraph,
      li: CustomLi,
      a: ({ node, children, ...props}) => {
        const linkProps = props;
        if (props.href && props.href.startsWith('http')) {
          linkProps['target'] = '_blank';
          linkProps['rel'] = 'noopener noreferrer';
        }
        return <a {...linkProps}>{children}</a>
      },
      td: CustomTd,
      section: ({children}) => {
        const filteredChildren = children.length ? children.filter(child => child.key === 'ol-0')[0].props.children : null
        filteredChildren && filteredChildren.map((child, index) => {
          if (child!=='\n'){
            const temp = foot
            try {
              temp[(index - 1) / 2] = child.props.children[1].props.children[0];
              setFoot(temp)
            } catch (error) {
              console.log('empty footnote')
            }          
          }
        })
        return <div className='footnotes reset'>{children}</div>
      },
      sup: ({ children }) => {
        return (
          <Tooltip children={children} foot={foot}/>
        )
      },
      h1: ({ children }) => (
        <h1 id={typeof children === 'string' ? stringToValidID(children.toString().toLowerCase()) : ''}>
          {processEmoji(children)}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 id={typeof children === 'string' ? stringToValidID(children.toString().toLowerCase()) : ''}>
          {processEmoji(children)}
        </h2>
      ),
      h3: ({ children }) => (
        <h3 id={typeof children === 'string' ? stringToValidID(children.toString().toLowerCase()) : ''}>
          {processEmoji(children)}
        </h3>
      ),
      h4: ({ children }) => (
        <h4 id={typeof children === 'string' ? stringToValidID(children.toString().toLowerCase()) : ''}>
          {processEmoji(children)}
        </h4>
      ),
      h5: ({ children }) => (
        <h5 id={typeof children === 'string' ? stringToValidID(children.toString().toLowerCase()) : ''}>
          {processEmoji(children)}
        </h5>
      ),
      h6: ({ children }) => (
        <h6 id={typeof children === 'string' ? stringToValidID(children.toString().toLowerCase()) : ''}>
          {processEmoji(children)}
        </h6>
      ),
      table: ({ children }) => (
        <div style={{ overflowX: 'scroll', maxWidth: '100%' }}>
          <table>{children}</table>
        </div>
      ),
      img: CustomImage,
    },
  };
};


export const CustomImage = ({ alt, src, title }) => {
  const [isClicked, setClicked] = useState(false);
  const [zoom, setZoom] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (zoom) {
        setOffset((prevOffset) => ({
          x: prevOffset.x + event.movementX,
          y: prevOffset.y + event.movementY,
        }));
      }
    };

    if (zoom) {
      window.addEventListener('mousemove', handleMouseMove);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [zoom]);

  const handleChange = (event) => {
    if (isClicked && !event.target.closest('#modal') || !isClicked) {
    setClicked(!isClicked);
    setZoom(isClicked && zoom)
    if (!isClicked){
      setOffset({ x: 0, y: 0 });
    }
  }
  };


    return (
      <>
      <div className={`background-confirmation-img ${isClicked ? 'img-zoom' : 'reverse-img'}`} onClick={handleChange}>
        <div id='modal' style={{maxWidth:'100%',width:'auto', maxHeight:'80vh', transitionDuration:'0', cursor:zoom ? 'zoom-out' : 'zoom-in',transform:!zoom ? 'none' : `scale(2) translate(${offset.x}px, ${offset.y}px)`}} onClick={() => setZoom(!zoom)}>
        <img src={src} alt={alt} title={title} style={{cursor:'pointer', width:'100%', height:'100%'}}
        onError={(e) => {
          e.target.style.display='none';
        }}
        >
        </img>
        <div style={{color:'white'}} dangerouslySetInnerHTML={{ __html:alt.replaceAll('\n','<br><br>')}} ></div>
        </div>
      </div>
      <div className="center" onClick={handleChange}><img src={src} alt={alt} title={title} id='modal' style={{cursor:'pointer'}}
      onError={(e) => {
        e.target.style.display='none';
      }}
      />
      </div>
      </>
    );
};
const CustomParagraph = ({ children }) => {
  const processedChildren = processChildren(children);
  return <p>{processedChildren}</p>;
};

const CustomTd = ({ children }) => {
  return <td>{processChildren(children)}</td>
};

const CustomLi = ({ children }) => {
  const processedChildren = processChildren(children);
  return <li>{processedChildren}</li>;
};



const processEmoji = (out) => {
  const emojiRegex = /[^:\s]+:\d+>|<a:[^:\s]+:\d+>|(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|\ufe0f)/g
    out = reactStringReplace(out, emojiRegex, (match) => {
      for (const key in emojiShortcut) {
        const value = emojiShortcut[key]
        if (match===value){
        return ':'+key+':'
        }
      }
      return match
    })
    out = reactStringReplace(out, /(:[a-zA-Z0-9_]+:)/g, (match) => {
  for (const key in emojiShortcut) {
    if (match.slice(1,-1)===key){
    const value = emojiShortcut[key]
      if (match.slice(0,3)===':c_') {
        return <a style={{ display: 'inline-block' }} className='tooltip'>
          {/* <a className='tooltip-text' style={{padding:'5px'}}>This emoji is : <b>{match.slice(1,-1)}</b></a> */}
      <img
        key={match}
        className="emoji custom"
        style={{ borderRadius:0 }}
        src={value}
        alt={match}
      />
    </a> } else {
      if (match.slice(0,6)!==':flag_'){

      return <a style={{ display: 'inline-block' }} className='tooltip'>
        {/* <a className='tooltip-text' style={{padding:'5px'}}>This emoji is : <b>{match.slice(1,-1)}</b></a> */}
      <img
        key={match}
        className="emoji"
        style={{ borderRadius:0 }}
        src={`https://abs.twimg.com/emoji/v2/svg/${emojiShortcut[key].codePointAt(0).toString(16)}.svg`}
        height='100%'
        alt={match}
      />
    </a>
      } else {
        const emote_letters = [];
        (Array.from(match).slice(6, -1)).forEach(letter => {
          emote_letters.push(emojiShortcut[`regional_indicator_${letter}`].codePointAt(0).toString(16));
        });
        return (
          <>
      <a style={{ display: 'inline-block' }} className='tooltip'>
      {/* <a className='tooltip-text' style={{padding:'5px'}}>This emoji is : <b>{match.slice(1,-1)}</b></a> */}
      <img
        key={match}
        className="emoji"
        style={{ borderRadius:0 }}
        src={`https://abs.twimg.com/emoji/v2/svg/${emote_letters.join('-')}.svg`}
        height='100%'
        alt={match}
      />
      </a>
          </>
        )
      }
    }
  }
}
return match
    })
  return out
}

const processChildren = (children) => {
  let count = 0;
  let out = children;

  out =  reactStringReplace(out, /@([a-zA-Z0-9]{1,25})/g, (match, content) => {
      return (
        <a 
        style={{color:'var(--main)',fontWeight:'500'}}
        href={`/@${match}`}
        >@{match}</a>
      );
  });

  out = reactStringReplace(out, /^(:{1,10}) /gm, (match, content) => {
    let numberOfColons = match.length;
    let alineaLinks = Array.from({ length: numberOfColons }, (_, index) => (
      <a key={index} style={{ marginRight: '20px' }}></a>
    ));
    return alineaLinks;
  });
  
  

  out = processEmoji(out);
  
  let hashtags = 0;
  if (hashtags<5){
    out =  reactStringReplace(out,/#(\w*[a-zA-Z0-9]\w*)/g, (match, content) => {
      hashtags+=1
      return (
        <>
        {hashtags<6 ?
        <a 
        className="tags"
        href={`/s/%23${match}`}
        >{match}</a>
        : `${match}`}
        </>
      );
});
}

//out = processEmoji(out);

out = reactStringReplace(out, /\[pie\]&\[([^\]]+)\]/g, (match) => {
  const title = match.split('%')[1];
  const string = match.split('%')[0];
  const jsonObject = Object.fromEntries(
    string.split(',').map(pair => pair.split(':'))
  );


const data = [['A','B'],...Object.entries(jsonObject).map(([key, value]) => [key, parseInt(value)])];
const options = {
  title:title,
  is3D: true
};
  return <Chart
      chartType="PieChart"
      data={data}
      options={options}
      width={"100%"}
      height={"400px"}
    />;
});



out = reactStringReplace(out, /\[map\]&\[([^\]]+)\]/g, (match) => {
  const title = match.split('%')[1];
  const string = match.split('%')[0];
  const jsonObject = Object.fromEntries(
    string.split(',').map(pair => pair.split(':'))
  );


const data = [['A',title],...Object.entries(jsonObject).map(([key, value]) => [key, parseInt(value)])];
  return <Chart
  chartEvents={[
    {
      eventName: "select",
      callback: ({ chartWrapper }) => {
        const chart = chartWrapper.getChart();
        const selection = chart.getSelection();
        if (selection.length === 0) return;
        const region = data[selection[0].row + 1];
        console.log("Selected : " + region);
      },
    },
  ]}
  chartType="GeoChart"
  width="100%"
  height="400px"
  data={data}
/>;
});

out = reactStringReplace(out, /\{tweet\}\[([a-zA-Z0-9]+)\]/g, (match) => {
  return <div className="tweet-wrapper"><Tweet id={match.toString()} /></div>;
});


  return out
};


const InlineCode = ({code, count, ...props}) => {
  const { mode } = useContext(ThemeContext);

  return (
    <>
    {code && !(code.includes('\n')) ?
    <>
    <code
          className={`inline-code ${mode}`}
          {...props}
          style={{
            color: 'grey'
          }}
        >{code}
    </code>
    </>
    : <CodeBlock language2={``} code={!code ? '\n ' : code} count={count}/>
    }
    </>
  )
}

export const isInsideCodeBlock = (text, index) => {
  const cls = ['tips', 'info', 'warn','check', 'gpt', 'bard', 'gpt4', 'gpterr', 'sign', 'canva', 'qst','tweet','claude','youtube'];
  const beforeText = text.substring(0, index);
  const codeBlockDelimiters = ['```', '~~~'];

  const codeBlockCounts = codeBlockDelimiters.map(delimiter => {
    return (beforeText.match(new RegExp(delimiter, 'g')) || []).length;
  });

  const isWithinCodeBlock = codeBlockCounts.some(count => count % 2 !== 0);

  if (isWithinCodeBlock) {
    return 1;
  }

  function trimTemp(str) {
    let lastIndex = -1;
    let lastMatch = null;

    cls.forEach(keyword => {
        const pattern = new RegExp(`{${keyword}}\\[/`, 'g');
        let match;

        while ((match = pattern.exec(str)) !== null) {
            lastIndex = match.index + match[0].length;
            lastMatch = match;
        }
    });

    if (lastIndex !== -1) {
        return str.substring(lastIndex);
    } else {
        return str;
    }
}

  let isIndented = false;
  const beforeTextLines = beforeText.split('\n').reverse();
  for (let i = 0; i < beforeTextLines.length; i++) {
    const line = beforeTextLines[i];
    if (i===0) {
        if (trimTemp(line).startsWith('    ')){
          isIndented = true;
        } else {
          isIndented = false;
          break
        }
    } else {
      

    
      if (!(trimTemp(line).startsWith('    ')) && line.trim().length!==0 && !(line.trim().endsWith('}[/') && cls.some(element => line.trim().endsWith(element + '}[/')))){
        isIndented = false;
        break
      } else {
        if (line.trim().length === 0 && isIndented){
          isIndented = true
          break
        }
      }
    }
  }
 
  return isIndented
};

export const isInsideInlineCode = (text, index) => {
  const lastEmptyLineIndex = text.lastIndexOf('\n\n', index);
  const inlineCodeBackticksCount = (text.substring(lastEmptyLineIndex, index).match(/`/g) || []).length;
  const nextBacktickIndex = text.indexOf('`', index);
  const isInsideCode = nextBacktickIndex !== -1
    ? inlineCodeBackticksCount % 2 === 1 && !text.substring(index, nextBacktickIndex).includes('\n\n')
    : false;
  if (isInsideCode){
  return isInsideCode;
  }
  const latexDelimiter = '$';
  const latexDelimitersCount = (text.substring(lastEmptyLineIndex, index).match(/\$/g) || []).length;
  const nextLatexDelimiterIndex = text.indexOf(latexDelimiter, index);
  const isInsideLatex = nextLatexDelimiterIndex !== -1 
    ? latexDelimitersCount % 2 === 1 && !text.substring(index, nextLatexDelimiterIndex).includes('\n\n') 
    : false;

  return isInsideLatex;
};





const Md = ({ custom = 0, elem = 1, ...props }) => {
  const [error, setError] = useState(null);
  const [goodAnswers, setGoodAnswers] = useState(0);
  const [corrected, setCorrected] = useState(0);
  const { language } = useContext(ThemeContext);
  const l = language;

  props.children = sanitizeHtml(props.children)


  props.children = props.children.replace(/__(.*?)__/g, (match, content, matchIndex) => {
    if (isInsideCodeBlock(props.children, matchIndex) || isInsideInlineCode(props.children, matchIndex)) {
      return match;
    }
    return `<u>${content}</u>`;
  });

  let count = 0;
  let spoilBlock = 0;
  const spoilReg = /\|\|(.*?)\|\|/gs;
  props.children = props.children.replace(spoilReg, (match, content, matchIndex) => {
    if (isInsideCodeBlock(props.children, matchIndex) || isInsideInlineCode(props.children, matchIndex)) {
      return match;
    }
      count++;
      const checkboxId = `colorCheckbox_${count}`;
      if (!content.includes('\n')) {
        return ReactDOMServer.renderToStaticMarkup(
          <a key={count}>
            <input type="checkbox" className="hidden-checkbox" id={checkboxId} />
            <label htmlFor={checkboxId} className="spoiler" dangerouslySetInnerHTML={{ __html: content }}>
            </label>
          </a>
        );
      } else {
        spoilBlock++;
        return ReactDOMServer.renderToStaticMarkup(
          <Accordion content={content} id={spoilBlock} />
        )+'\n\n';
      }
  });


  const addGood = () => {
    setGoodAnswers(goodAnswers+1)
  }

  const addBad = () => {
    setGoodAnswers(goodAnswers-0.5)
  }

  

  let matchIndexQst = 0;
  if (elem){

    
  const processChildrenAfter = (children) => {
    
    try {


      children = children.replace(/(?:\n\s*)?-?\s*description:\s*(.*?)\n?\s*-?\s*title:\s*(.*?)\n?\s*-?\s*url:\s*(.*?)(?=\n|$)/gs, (match, description, title, url) => {
        return '\n'+ReactDOMServer.renderToStaticMarkup(<WebResult url={url} title={title} description={description}/>)+'\n'
      });
      

      const regex = new RegExp(`\\{qst\\}\\[/(.*?)/\\]`, 'gs');
        children = children.replace(regex, (match, content, matchIndex) => {
          if (isInsideCodeBlock(props.children, matchIndex) || isInsideInlineCode(props.children, matchIndex)) {
            return match;
          }
          const newContent = ReactDOMServer.renderToStaticMarkup(
            <Question content={content} index={matchIndexQst} addGood={addGood} addBad={addBad} />
          );
          matchIndexQst++;
          return newContent;
        });


        
        

const classes = ['tips', 'info', 'warn','check',
  'gpt', 'bard', 'gpt4', 'gpterr','claude',
  'sign',
   'canva','youtube'];
classes.forEach((cls) => {
  const regex = new RegExp(`\\{${cls}\\}\\[/(.*?)/\\]`, 'gs');
  children = children.replace(regex, (match, content, matchIndex) => {
    if (isInsideCodeBlock(props.children, matchIndex) || isInsideInlineCode(props.children, matchIndex)) {
      return match;
    }

    let contentNew = content;
    if (cls === 'canva') {
      return ReactDOMServer.renderToStaticMarkup(<Canva url={content} />);
    }
    if (cls === 'youtube') {
      return ReactDOMServer.renderToStaticMarkup(<Youtube url={content} />);
    }
    if (cls === 'sign' && contentNew.length > 0) {
      try {
        contentNew = contentNew.split('\n').filter(line => line.trim() !== '').map(line => line.split('&'));
        const output = (
          <div className="sign">
            <div className="row">
              {contentNew[0].map((element, index) => (
                <div className="cell" key={index}>
                  <Markdown
                    remarkPlugins={[remarkMath, [remarkGfm, { singleTilde: false }]]}
                    rehypePlugins={[rehypeKatex, rehypeRaw]}
                  >{`$${element}$`}</Markdown>
                </div>
              ))}
            </div>
            {contentNew.slice(1).map((line, rowIndex) => (
              <div className="row" key={rowIndex}>
                {line.map((element, columnIndex) => {
                  let classCell = `cell ${element.includes('|') ? ' ban' : ''} ${element.includes('#') ? ' zero' : ''}`;
                  return (
                    <div className={classCell} key={columnIndex}>
                      <Markdown
                        remarkPlugins={[remarkMath, [remarkGfm, { singleTilde: false }]]}
                        rehypePlugins={[rehypeKatex, rehypeRaw]}
                      >{`$${element.replace('#', '').replace('|', '')}$`}</Markdown>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );

        return ReactDOMServer.renderToStaticMarkup(output)+'\n\n';
      } catch (error) {
        console.log('invalid sign table');
      }
    } else {
      return ReactDOMServer.renderToStaticMarkup(<Textbox children={contentNew} cls={cls}/>)+'\n\n';
    }
  });
});

const inlineClasses = ['key', 'mui'];
    inlineClasses.forEach((cls) => {
      const regex = new RegExp(`:${cls}>(.*?)\\:`, 'gs');
      children = children.replace(regex, (match, content, matchIndex) => {
        if (isInsideCodeBlock(props.children, matchIndex) || isInsideInlineCode(props.children, matchIndex)) {
          return match;
        }
        if (cls === 'key') {
          return ReactDOMServer.renderToStaticMarkup(<Keyboard content={content}/>)
        }
        if (cls === 'mui') {
          return ReactDOMServer.renderToStaticMarkup(<a className='material-icons-outlined'>{content}</a>)
        }
        return `<a class='${cls}'>${content}</a>`;
      });
    });


return children + ReactDOMServer.renderToStaticMarkup(<></>);
} catch (error) {
setError(error);
console.error('Error processing children:', error);
return children; // Return original children in case of an error
}
};

props.children = processChildrenAfter(props.children);
}

const getGrad = (event) => {
  let grade = 0;
  const container = event.target.parentElement.parentElement.parentElement
  const elements = container.querySelectorAll('.qst-qcm');
  elements.forEach(element => {
    element.querySelectorAll('#cm').forEach(ans => {

      ans.style.border = '1px solid'
      const inputGood = element.querySelector('input[value="good"]');
      if (inputGood) {
          const parentDiv = inputGood.closest('div');
          if (parentDiv) {
              parentDiv.style.border = '3px var(--green) solid';
              parentDiv.style.background = 'rgba(0,255,0,0.2)'
          }
      }



      if (ans.querySelector('input').checked) {
        if (ans.querySelector('input').value==='good'){
          grade++
        } else {
          grade=grade-0.5
          ans.style.background = 'rgba(255,0,0,0.2)'
          ans.style.border = '3px solid red'
        }
      }
    })
  });
  setGoodAnswers(grade < 0 ? 0 : grade)
  setCorrected(1)
}

const retry = (
  ) => {
    setGoodAnswers(0);
    setCorrected(0);
  
    const elements = document.querySelectorAll('.qst-qcm');
    elements.forEach((element) => {
      const answers = Array.from(element.querySelectorAll('#cm'));
  
      answers.forEach((ans) => {
        ans.style.background = 'none';
        ans.querySelector('input').checked = false;
        ans.style.border = '1px solid';
      });
  

  element.append(...answers.sort(() => Math.random() - 0.5));
    });
  };
  

  let rendered = <>
  <Markdown {..._mapProps(props)} />
  {matchIndexQst!==0 ?  <div className='qcm-results'>{!corrected ?
        <center>
        <div style={{fontSize:'150%',fontWeight:'bold',padding:'15px',fontFamily:'sans-serif'}}>
          {["Get your grade", "Obtenez votre note", "Obtén tu calificación"][l]}
        </div>
        <div className="signin-btn" onClick={getGrad} style={{fontFamily:'sans-serif'}}>
        {["Correct", "Corriger", "Corregir"][l]}
        </div>
        </center>
      :
    <center>
      <div style={{fontSize:'150%',fontWeight:'bold',padding:'15px'}}>{goodAnswers}/{matchIndexQst}</div>
      <div style={{padding:'20px'}}>{(goodAnswers*20/matchIndexQst).toFixed(2)}/20</div>
      <div className="signin-btn" onClick={retry}>
        {["Retry", "Réessayer", "Reintentar"][l]}
      </div>
    </center>}</div>  : null
    }
  </>;
  if (custom) {
    return rendered;
  } else {
    return (
      <div className="markdown-body">
        {error ? 'Error rendering Markdown' : rendered}
      </div>
    );
  }
};

export const Typer = ({ text, typingSpeed = 10 }) => {
  const [typedText, setTypedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        if (currentIndex < text.length) {
          setTypedText((prevText) => prevText + text[currentIndex]);
          setCurrentIndex((prevIndex) => prevIndex + 1);
        }
      }, typingSpeed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, typingSpeed, isVisible]);
  return (
  <>
  <a ref={containerRef} className={text!==typedText ? 'blink-dot' : null}>{typedText}</a>
  </>
  )
}


export default Md;