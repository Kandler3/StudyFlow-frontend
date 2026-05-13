import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { AppProvider } from './context/AppContext';
import { router } from './routes';

export default function App() {
  return (
    <AppProvider>
      <Toaster />
      <RouterProvider router={router} />
    </AppProvider>
  );
}
