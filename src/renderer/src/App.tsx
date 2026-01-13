import { ThemeProvider } from './lib/theme-context';
import Home from './pages/Home';

function App() {
  return (
    <ThemeProvider>
      <Home />
    </ThemeProvider>
  );
}

export default App;
