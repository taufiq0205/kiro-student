import { createRoot } from 'react-dom/client'
import { CvEditor } from './CvEditor'
import { PublicCv } from './PublicCv'
import './index.css'

function App() {
  const query = new URLSearchParams(window.location.search)
  const isPublicCv = query.has('cv')

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12 text-slate-900 sm:py-20">
      <section className={`mx-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 ${isPublicCv ? 'max-w-3xl' : 'max-w-xl'}`}>
        <h1 className="text-3xl font-bold tracking-tight">MyCV Studio</h1>
        {isPublicCv ? (
          <PublicCv id={query.get('cv')} />
        ) : (
          <CvEditor />
        )}
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
