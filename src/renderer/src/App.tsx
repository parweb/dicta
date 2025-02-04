import Versions from './components/Versions'
import Home from './pages/Home'

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <Home />
    </>
  )
}

export default App
