"use client"

import { useState } from "react"

export default function TriageDashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ severity: string, doctor: string, room: string, wait_time: string } | null>(null)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    temperature: "",
    oxygen: "",
    bp: "",
    age: "",
    symptoms: ""
  })

  // Handle inputs changing natively
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Handle Submit & Talk to Flask API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch prediction")
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError("")
    setFormData({ temperature: "", oxygen: "", bp: "", age: "", symptoms: "" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-100 relative overflow-hidden">
      
      {/* Background Orbs for premium aesthetic */}
      <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none"></div>

      <div className="max-w-3xl w-full space-y-10 z-10 relative mt-4">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-xl">
            AI Triage <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">System</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto font-medium">
            Advanced patient assessment driven by artificial intelligence. Input vitals to instantly determine triage priority.
          </p>
        </div>

        {!result ? (
          <form className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold tracking-wide text-slate-300 ml-1">Temperature (°C)</label>
                <input type="number" name="temperature" step="0.1" required className="block w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl shadow-inner py-3.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all hover:bg-slate-900/80" value={formData.temperature} onChange={handleChange} placeholder="e.g. 37.5" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold tracking-wide text-slate-300 ml-1">Oxygen Level (%)</label>
                <input type="number" name="oxygen" required className="block w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl shadow-inner py-3.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all hover:bg-slate-900/80" value={formData.oxygen} onChange={handleChange} placeholder="e.g. 98" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold tracking-wide text-slate-300 ml-1">Blood Pressure (Sys)</label>
                <input type="number" name="bp" required className="block w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl shadow-inner py-3.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all hover:bg-slate-900/80" value={formData.bp} onChange={handleChange} placeholder="e.g. 120" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold tracking-wide text-slate-300 ml-1">Patient Age</label>
                <input type="number" name="age" required className="block w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl shadow-inner py-3.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all hover:bg-slate-900/80" value={formData.age} onChange={handleChange} placeholder="e.g. 45" />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="block text-sm font-semibold tracking-wide text-slate-300 ml-1">Observed Symptoms</label>
                <textarea name="symptoms" rows={3} className="block w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl shadow-inner py-3.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none hover:bg-slate-900/80" value={formData.symptoms} onChange={handleChange} placeholder="Briefly describe patient symptoms..." />
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center">
                  <div className="flex-shrink-0 text-red-500">⚠️</div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-400">Validation Error</h3>
                    <div className="mt-1 text-sm text-red-300/80"><p>{error}</p></div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-8">
              <button disabled={isLoading} type="submit" className="group relative w-full flex justify-center py-4 px-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 disabled:opacity-70 transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transform hover:-translate-y-1">
                {isLoading ? (
                  <span className="flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing Vitals...
                  </span>
                ) : "Assess Patient Prioritization"}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className={`px-6 py-8 sm:px-10 flex flex-col sm:flex-row gap-4 justify-between items-center ${ result.severity === 'High' ? 'bg-gradient-to-r from-red-600/90 to-rose-500/90' : result.severity === 'Medium' ? 'bg-gradient-to-r from-amber-600/90 to-orange-500/90' : 'bg-gradient-to-r from-emerald-600/90 to-teal-500/90' } backdrop-blur-md border-b border-white/10`}>
              <div>
                <span className="opacity-90 font-medium text-sm uppercase tracking-widest block mb-1 text-white/80">Triage Classification</span>
                <h3 className="text-4xl font-extrabold text-white tracking-tight">
                  {result.severity} Priority
                </h3>
              </div>
              <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border md:border-2 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.2)] text-3xl">
                {result.severity === 'High' ? '⚠️' : result.severity === 'Medium' ? '⏳' : '✅'}
              </div>
            </div>
            
            <div className="px-6 py-10 sm:px-10 bg-slate-900/40">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="bg-slate-800/60 rounded-3xl p-6 md:p-8 border border-white/5 shadow-lg flex flex-col items-center text-center transition-transform duration-300 hover:scale-105 hover:bg-slate-800/80">
                  <div className="h-14 w-14 bg-gradient-to-br from-blue-500/30 to-blue-600/10 rounded-2xl flex items-center justify-center mb-5 text-blue-400 text-2xl border border-blue-500/20 shadow-inner">👨‍⚕️</div>
                  <dt className="text-sm font-semibold tracking-wide text-slate-400 mb-1">Assigned Doctor</dt>
                  <dd className="text-2xl font-bold text-white">{result.doctor}</dd>
                </div>

                <div className="bg-slate-800/60 rounded-3xl p-6 md:p-8 border border-white/5 shadow-lg flex flex-col items-center text-center transition-transform duration-300 hover:scale-105 hover:bg-slate-800/80">
                  <div className="h-14 w-14 bg-gradient-to-br from-cyan-500/30 to-cyan-600/10 rounded-2xl flex items-center justify-center mb-5 text-cyan-400 text-2xl border border-cyan-500/20 shadow-inner">🏥</div>
                  <dt className="text-sm font-semibold tracking-wide text-slate-400 mb-1">Directed Room</dt>
                  <dd className="text-2xl font-bold text-white">{result.room}</dd>
                </div>

                <div className="bg-slate-800/60 rounded-3xl p-6 md:p-8 border border-white/5 shadow-lg flex flex-col items-center text-center transition-transform duration-300 hover:scale-105 hover:bg-slate-800/80">
                  <div className="h-14 w-14 bg-gradient-to-br from-indigo-500/30 to-indigo-600/10 rounded-2xl flex items-center justify-center mb-5 text-indigo-400 text-2xl border border-indigo-500/20 shadow-inner">⏱️</div>
                  <dt className="text-sm font-semibold tracking-wide text-slate-400 mb-1">Estimated Wait</dt>
                  <dd className="text-2xl font-bold text-white">{result.wait_time}</dd>
                </div>

              </div>
            </div>
            
            <div className="px-6 py-5 bg-slate-900/80 border-t border-slate-800 text-center text-sm font-medium text-slate-400">
              <p>Please escort the patient to the directed room immediately.</p>
            </div>
            
            <div className="px-6 py-6 sm:px-10 bg-slate-900/40 border-t border-white/5">
              <button onClick={handleReset} className="w-full flex justify-center py-4 px-4 border border-slate-600 rounded-2xl shadow-sm text-lg font-bold text-white bg-slate-800 hover:bg-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-900 transition-all duration-200">
                Assess New Patient
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
