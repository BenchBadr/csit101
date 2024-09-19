import React, { useMemo , useState} from 'react';

const f = (i) => {
  return Math.ceil(Math.exp(i) % 150);
};

const g = (i) => {
  return Math.ceil(Math.sin(i) * (255 / 2) + (255 / 2)) % 150;
};

const h = (i) => {
  return Math.ceil((255 / 2) * Math.sin(i + Math.PI) + (255 / 2)) % 150;
};

const CorColor = (index) => `rgba(${f(index)}, ${g(index)}, ${h(index)}, ${5 + index % 5})`;

export const Question = React.memo(({ index, content, addGood, addBad}) => {

  const contentNew = content.split(/\n(?=[+-])|(?<=\n)(?=[+-])/);
  
  const color = useMemo(() => `${CorColor(index)},${CorColor(Math.abs(20 - index))}`, [index]);
  
  const divStyle = useMemo(() => ({
    borderRadius: '1rem',
    padding: '20px',
    overflowX: 'scroll',
    maxWidth: 'calc(100% - 40px)',
  }), [index, color]);
  
  return (
    <div style={divStyle} className="qst-qcm">
      <div className='qst-title'>Question #{index+1}</div>
      <form>
        {contentNew.map((line, i) => {
          const radioId = `radio_${index}_${i}`;
          return (
            <div key={i}
              id={(line.trim().startsWith('-') || line.trim().startsWith('+') ?'cm': '')}
              style={{display:(line.trim().startsWith('-') || line.trim().startsWith('+') ? 'flex' : 'inline-block' ), border:(line.trim().startsWith('-') || line.trim().startsWith('+') ?'1px solid': 'none'), borderRadius:'1rem',
              }}>
              {line.trim().startsWith('-') || line.trim().startsWith('+') ? (
                <input type="radio" 
                id={radioId} 
                name={`radio_${index}`} 
                style={{ marginRight: '0.5rem' }} 
                value={line.trim().startsWith('+') ? 'good' : radioId} 
                className="radio-qcm" 
                />
              )
              : null}
              {line.trim().startsWith('-') || line.trim().startsWith('+') ? (
                <label htmlFor={radioId} style={{ display: 'inline-block', width: 'calc(100% - 30px)', userSelect:'none'}} dangerouslySetInnerHTML={{__html: '\n\n'+line.slice(1)+'\n\n'}}/>
              ) : (
                <p style={{ fontWeight: 'normal', fontSize: '120%' }} dangerouslySetInnerHTML={{__html: '\n\n'+line+'\n\n'}}>
                </p>
              )}
            </div>
          );
        })}
      </form>
    </div>
  );
});

