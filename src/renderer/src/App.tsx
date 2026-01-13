import { ApiKeyProvider } from './lib/api-key-context';
import { ThemeProvider } from './lib/theme-context';
import { UpdateProvider } from './lib/update-context';
import Home from './pages/Home';

function App() {
  return (
    <ThemeProvider>
      <ApiKeyProvider>
        <UpdateProvider>
          <Home />
        </UpdateProvider>
      </ApiKeyProvider>
    </ThemeProvider>
  );
}

export default App;
