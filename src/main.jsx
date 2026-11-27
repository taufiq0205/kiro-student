import { createRoot } from 'react-dom/client'
import { CvEditor } from './CvEditor'
import './index.css'

function App() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12 text-slate-900 sm:py-20">
      <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <h1 className="text-3xl font-bold tracking-tight">MyCV Studio</h1>
        {new URLSearchParams(window.location.search).has('cv') ? (
          <p className="mt-4">This CV is unavailable.</p>
        ) : (
          <CvEditor />
        )}
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
