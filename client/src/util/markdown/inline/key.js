const Keyboard = ({content}) => {
    if (content.toLowerCase() === 'ctrl' || content.toLowerCase() === 'cmd') {
        const isMac = navigator.userAgent.indexOf('Mac') !== -1 && navigator.platform.indexOf('Mac') !== -1;
        const keyLabel = isMac ? '⌘' : 'CTRL';
        return <a className='key'>{keyLabel}</a>;
      }
      if (content.toLowerCase() === 'space'){
        return  <a className='key' style={{width:'4em'}}>␣</a>
      }
      if (content.toLowerCase() === 'shift'){
        return <a className='key'>⇧</a>
      }
      if (content.toLowerCase() === 'enter'){
        return  <a className='key'>↵</a>
      }
      if (content.toLowerCase() === 'tab'){
        return  <a className='key' style={{textTransform:'none'}}>Tab</a>
      }
    return <a className="key">{content}</a>
}

export default Keyboard;