import React, {useState, useEffect} from 'react';
import Md from '../../../util/markdown/markdown';
import { ThemeContext } from '../../../util/sidebar/ThemeContext';

const Converter = () => {
    // 0 : bin
    // 1 : oct
    // 2 : dec
    // 3 : hex
    const [cvtMode, setMode] = useState([0,1]);
    const [inp, setInp] = useState('');
    const [cvtOut, setOut] = useState('');
    const [cvtTxt, setCvtText] = useState('Enter a number to get started.')
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const names = ['Binary','Octal','Decimal','Hexadecimal'];
    const numbers = [2, 8, 10, 16];

    useEffect(() => {
        if (!(inp==='')){
            setOut('');
        }
        setCvtText(inp!='' ?
`
> You're converting $\\text{${inp}}$ from ${names[cvtMode[0]]} to ${names[cvtMode[1]]}.

${conversion()}
`
: `Enter a number to get started.`)
    }, [inp])

    const handleChangeIn = (event) => {
        textHandling(event.target.value);
    }

    const textHandling = (text) => {
        const listAllowed = chars.slice(0, numbers[cvtMode[0]]);
        const inpLower = text
            .replace(/^0+/, '')
            .toUpperCase()
            .split('')
            .filter(char => listAllowed.includes(char))
            .join('')
        setInp(inpLower)
    }



    const Dropdown = ({ index }) => (
        <select value={cvtMode[index]} onChange={(e) => {
            const newMode = [...cvtMode];
            newMode[index] = parseInt(e.target.value);
            if (newMode[index] === newMode[Number(!index)]){
                newMode[Number(!index)] = cvtMode[index];
            }
            setMode(newMode);
            textHandling(inp);
        }}>
            {names.map((name, i) => (
                <option key={i} value={i}>
                    {name}
                </option>
            ))}
        </select>
    );
    
    const convertedToPowers = () => {
        const seeked = numbers[cvtMode[0]];
        let out = `\\text{${inp}}_{${seeked}} = `;
        let outNum = 0;
        inp.split('').map((char, index) => {
            out+=`${chars.indexOf(char)}\\cdot${seeked}^{${inp.length - index - 1}} ${index!==inp.length-1 ? '+' : ''}`
            outNum+=chars.indexOf(char)*(seeked**(inp.length - index - 1))
        })
        return [`$${out} = ${outNum}_{10}$`, outNum];
    }
    function powersConversion() {
        const seeked = numbers[cvtMode[1]];
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let x = inp;
        let converted = '';
        let out = ``;
        while (x > seeked){
            const quotient = Math.floor(x / seeked)
            const module = x % seeked;
            out+=`$${x} \\div ${seeked} = ${quotient}$ | $${module} ${module>9 ? `\\ (\\text{`+chars[module]+`})` : ''}$\n`;
            converted = chars[module]+converted;
            x = quotient;
        }
        out+=`$${x} \\div ${seeked} = 0$ | $${x} ${x>9 ? `\\ (\\text{`+chars[x]+`})` : ''}$\n`;
        converted = chars[x]+converted;
        return [`| Division | Remainder | \n | - | - | \n${out}\n\nAs the converted number is given by all the remainders, read from the end : $${inp}_{10} = \\text{${converted}}_{${seeked}}$`, converted];
    }

    const binToElse = (selected=cvtMode[1], currentNum=inp) => {
        const seeked = numbers[selected];
        const length = Math.log2(seeked);
        const factors = [...Array(length)].map((_, i) => 2**(length-i-1));
        let result = currentNum.padStart(Math.ceil(currentNum.length / length) * length, '0').match(new RegExp(`.{1,${length}}`, 'g'));
        let outNum = '';
        let out = `1. Add zeros at the beginning of the number to make the length a multiple of ${length} and then split the number in different groups of ${length} digits.
\n      - $${currentNum} \\to (${result.join(`)(`)})$
\n 2. Multiply respectives digits of each part by ${factors.join('-')} in this order.\n\n| Part | Multiplication | Result |\n| - | - | - |\n`;
        result.map((part) => {
            const res = factors.reduce((sum, factor, i) => sum + factor * part[i], 0);
            outNum += chars[res]
            out+=`| ${part} | $${factors.map((fac, index) => `${fac} \\cdot ${part[index]}`).join('+')}$ | $${res} ${res>9 ? `\\ (\\text{${chars[res]}})` : ''}$\n`
        })
        out+=`3. Combine the octal digits in the \`result\` column.\n\n   - $\\text{${outNum}}$\n\n$\\text{${currentNum}}_{${numbers[cvtMode[0]]}} = \\text{${outNum}}_{${numbers[cvtMode[1]]}}$`
        return [out,outNum];
    }

    const elseToBin = () => {
        let out = `1. Convert each digit\n`;
        const seeked = numbers[cvtMode[1]];
        let outNum = ``;
        const makeN = (binStr) => {
            const adjBin = binStr.padStart(Math.ceil(binStr.length / Math.log2(seeked)) * Math.log2(seeked), '0');
            outNum += adjBin;
            return adjBin;
        };        
        
        inp.split('').map((digit) => {out+=`\n    - $\\text{${digit}}_{10} = ${makeN((Number(chars.indexOf(digit))).toString(2))}_2$`});
        out+=`\n2. Combine the values : \`${outNum}\`\n\nSo $\\text{${inp}}_8 = ${outNum}_2$`
        return [out, outNum]
    }

    const conversion = () => {
        if (cvtMode[0]===cvtMode[1]){
            return `$${inp}$ is already in ${names[cvtMode[0]]}.`
        } else if (cvtMode[0]===2){
            const [latex, output] =  powersConversion()
            setOut(output)
            return latex
        } else if (cvtMode[1]===2){
            const [latex, output] = convertedToPowers();
            setOut(output)
            return latex
        } else if (cvtMode[0]===0){
            const [latex, output] = binToElse();
            setOut(output)
            return latex
        } else if (cvtMode[1]==0){
            const [latex, output] = elseToBin();
            setOut(output)
            return latex
        } else {
            const [latex, output] = elseToBin();
            let out = latex;
            const [latex2, output2] = binToElse(cvtMode[1], output);
            out+='\n\n---\n'+latex2;
            setOut(output2);
            return out
        }
        return ''
    }



    return (
        <>
        <h1>Conversions Between Bases</h1>
        <div className='grid-container'>
            <div className='converter-container'>
                <Dropdown index={0}/>
                <input className='converter-input' onChange={handleChangeIn} value={inp}/>
            </div>
            <div className='converter-container'>
                <Dropdown index={1}/>
                <div className='converter-input' style={{opacity:.5, minHeight:'1em'}}>{cvtOut}</div>
            </div>
        </div>
        <h3>Details</h3>
        <Md custom={1}>
{cvtTxt}
        </Md>
        </>
    )
}


export default Converter;