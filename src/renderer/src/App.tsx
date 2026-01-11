import Versions from './components/Versions';
import { ThemeProvider } from './lib/theme-context';
import Home from './pages/Home';

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping');

  return (
    <ThemeProvider>
      <Home />
    </ThemeProvider>
  );
}

export default App;
