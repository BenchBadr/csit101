import React, {useState, useEffect} from 'react';
import Md from '../../../util/markdown/markdown';
import { ThemeContext } from '../../../util/sidebar/ThemeContext';

const Addition = () => {
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

        </div>
        </div>
        </>
    )
}

export default Addition;