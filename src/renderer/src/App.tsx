import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { BedrockProvider } from './contexts/BedrockContext';
import { queryClient } from './lib/query-client';
import { UpdateProvider } from './lib/update-context';
import Home from './pages/Home';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BedrockProvider>
        <UpdateProvider>
          <Home />
        </UpdateProvider>
      </BedrockProvider>
      {/* React Query DevTools - only in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
