import React, { useState, useEffect, createContext } from 'react';
import { usePython, usePythonConsole } from 'react-py';

export const PythonContext = createContext(null);

export const PythonWrapper = ({children}) => {
  const [output, setOutput] = useState([]);
  const [outputErr, setOutputErr] = useState([]);
  const [num, setNum] = useState(0);
  const { runPython, stdout, stderr, isLoading, isRunning, isReady }  = usePython();


  const runPythonFunc = (code, i) => {
    setNum(i)
    runPython(code)
  }

  const updateOut = () => {
    let temp = output;
    temp[num] = stdout || '';
    setOutput(temp)
  }

  const updateErr = () => {
    let temp2 = outputErr;
    temp2[num] = stderr || '';
    setOutputErr(temp2)
  }


  useEffect(() => {
    updateOut()
    updateErr()
  }, [stdout, stderr])



  return (
    <PythonContext.Provider
    value={{runPythonFunc, isLoading, isRunning, isReady, num, setNum, output, outputErr, stdout, stderr}}
    >
      {children}
    </PythonContext.Provider>
  )
}
