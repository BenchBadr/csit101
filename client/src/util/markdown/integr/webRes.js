import React, { useState, useEffect } from 'react';

const WebResult = ({ url, description, title }) => {
  // const testUrl = url ? new URL(url).origin : ''
  const testUrl = (url) => {
    try {
      return new URL(url).origin;
    } catch (error) {
      return url;
    }
  }
  const baseUrl = testUrl(url)

  function fixUnicode(text) {
    return text
      .replace(/\\u([0-9A-Fa-f]{4})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16)))
      .replace(/\\\\/g, '\\')
      .replace(/\\_/g, ' ') 
      .replace(/\\(?![u\\_])/g, '');
  }
  
  return (
    <div className='web-result'>
        <div>
        <ConditionalIcon src={`url(${baseUrl+'/favicon.ico'}`}/> 
        <a>{baseUrl}</a>
        </div>
        <h1><a href={url}>{title}</a></h1>
        <a className='url'>{url}</a>
        <p>{description}</p>
    </div>
  )
};

const ConditionalIcon = ({ src, alt, ...props }) => {
    return (
    <div style={{position:'relative'}}>
      {/* <span className="material-icons-outlined" style={{position:'absolute',fontSize:'20px',left:0,display:'inline-block'}}>
        public
      </span> */}
      <span
        style={{
          backgroundImage:src,
          height: '20px',
          width: '20px',
          display: 'inline-block',
          backgroundSize: 'cover',
          left:0,
          position:'absoute'
        }}
      />
  </div>
    )
}

export default WebResult;