
import './App.css';
import Md from './util/markdown/markdown';

function App() {
  return (
    <div>
      <Md>{`# Hello\n\`\`\`python\nprint("Hello world")\n\`\`\`\``}</Md>
    </div>
  );
}

export default App;
