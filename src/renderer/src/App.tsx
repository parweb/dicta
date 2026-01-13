import { ApiKeyProvider } from './lib/api-key-context';
import { ThemeProvider } from './lib/theme-context';
import Home from './pages/Home';

function App() {
  return (
    <ThemeProvider>
      <ApiKeyProvider>
        <Home />
      </ApiKeyProvider>
    </ThemeProvider>
  );
}

export default App;
