import { BedrockProvider } from './contexts/BedrockContext';
import { ApiKeyProvider } from './lib/api-key-context';
import { ThemeProvider } from './lib/theme-context';
import { UpdateProvider } from './lib/update-context';
import Home from './pages/Home';

function App() {
  return (
    <ThemeProvider>
      <ApiKeyProvider>
        <BedrockProvider>
          <UpdateProvider>
            <Home />
          </UpdateProvider>
        </BedrockProvider>
      </ApiKeyProvider>
    </ThemeProvider>
  );
}

export default App;
