import { useAuth } from '@/hooks/useAuth';

function App() {
  const auth = useAuth();

  return (
    <main>
      <h1>CLACK</h1>
      <p className="text-gray-500">Deploy de humo: si ves esto, el build funciono.</p>
      <p className="text-gray-500">Estado de sesion: {auth.status}</p>
    </main>
  );
}

export default App;
