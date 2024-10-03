import React, {useState, useEffect, useRef} from 'react';
import Md from '../../../util/markdown/markdown';
import { ThemeContext } from '../../../util/sidebar/ThemeContext';

const Addition = () => {
    const [expr, setExpr] = useState('# hello')
    const inputRef = useRef(null);


    const handleClick = (event) => {
        inputRef.current.focus()
    }

    const insert = (string) => {
        const index = inputRef.current.selectionStart;
        setExpr(string.slice(0, index) + ':key>caret:' + string.slice(index))
    }
    const handleChange = (event) => {
        const string = event.target.value;
        insert(string);
    }

    const handleCaretPosition = (event) => {
        if (inputRef.current) {
          insert(event.target.value);
        }
    };



    return (
        <>
        <div style={{display:'flex',justifyContent:'center'}}>
        <div className='calc-container'>
            <h1>Binary Addition</h1>

        <div className='container-clean-2'>
        Two's complement
        <div style={{display:'flex',alignItems:'center', position:'absolute',right:'10px'}}>
            <label className='switch'>
            <input type={`checkbox`}/>
            <span className='slider round'></span>
        </label>
        </div>
        </div>



        <div className='container-clean-2' style={{marginTop:'20px', userSelect:'none'}} onClick={handleClick}>
            <Md>{expr}</Md>
        </div>

        <textarea className='converter-input'
        ref={inputRef}
        value={expr.replaceAll(':key>caret:','')}
        onKeyUp={handleCaretPosition}
        onChange={handleChange}/>
        </div>
        </div>
        </>
    )
}

export default Addition;