"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts"

interface Patient {
  timestamp: string;
  severity: string;
  doctor: string;
  room: string;
  temperature: string;
  oxygen: string;
  bp: string;
  age: string;
  symptoms: string;
}

interface Analytics {
  total: number;
  high: number;
  medium: number;
  low: number;
  avg_oxygen: number;
}

export default function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchData = async () => {
    try {
      const [patientsRes, analyticsRes] = await Promise.all([
        fetch("http://127.0.0.1:5000/patients"),
        fetch("http://127.0.0.1:5000/analytics")
      ])
      
      if (!patientsRes.ok || !analyticsRes.ok) {
        throw new Error("Failed to fetch data")
      }
      
      const patientsData = await patientsRes.json()
      const analyticsData = await analyticsRes.json()
      
      setPatients(patientsData)
      setAnalytics(analyticsData)
      setError("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData() // Initial fetch
    
    // Polling every 5 seconds
    const intervalId = setInterval(fetchData, 5000)
    
    return () => clearInterval(intervalId) // Cleanup on unmount
  }, [])

  // Prepare chart data
  const { barData, lineData } = useMemo(() => {
    if (!analytics || !patients.length) return { barData: [], lineData: [] }

    const barData = [
      { name: 'High', count: analytics.high, fill: '#ef4444' },     // Red
      { name: 'Medium', count: analytics.medium, fill: '#eab308' }, // Yellow
      { name: 'Low', count: analytics.low, fill: '#10b981' }        // Green
    ]

    // Sort patients chronologically for timeline
    const chronologicalPatients = [...patients].reverse()
    let countTracker = 0
    
    // Create a point per patient over time to show growth
    const lineData = chronologicalPatients.map(p => {
      countTracker++
      // Extract time portion if available (HH:MM)
      const parts = p.timestamp ? p.timestamp.split(" ") : []
      const timeStr = parts.length > 1 ? parts[1].substring(0, 5) : p.timestamp
      
      return {
        time: timeStr,
        patients: countTracker
      }
    })

    return { barData, lineData }
  }, [patients, analytics])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-100 relative overflow-hidden">
      {/* Background Orbs for premium aesthetic */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-10 z-10 relative">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-xl">
              Doctor <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Analytics Dashboard</span>
            </h2>
            <p className="text-slate-400 mt-2 font-medium">Live monitoring of triaged patients and metrics</p>
          </div>
          
          <div className="flex items-center space-x-3 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700/50 shadow-lg">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-semibold text-slate-300">Live Updates</span>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 animate-in fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-red-500">⚠️</div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-400">Connection Error</h3>
                <div className="mt-1 text-sm text-red-300/80"><p>{error}</p></div>
              </div>
            </div>
          </div>
        )}

        {/* 📊 SUMMARY CARDS */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-800/60 p-6 rounded-3xl border border-white/5 shadow-lg flex flex-col justify-center items-center backdrop-blur-md">
              <h3 className="text-slate-400 text-sm font-semibold tracking-wider uppercase mb-2">Total Patients</h3>
              <p className="text-5xl font-black text-white">{analytics.total}</p>
            </div>
            
            <div className="bg-red-900/20 p-6 rounded-3xl border border-red-500/20 shadow-lg flex flex-col justify-center items-center backdrop-blur-md">
              <h3 className="text-red-400 text-sm font-semibold tracking-wider uppercase mb-2">High Severity</h3>
              <p className="text-5xl font-black text-red-400">{analytics.high}</p>
            </div>
            
            <div className="bg-yellow-900/20 p-6 rounded-3xl border border-yellow-500/20 shadow-lg flex flex-col justify-center items-center backdrop-blur-md">
              <h3 className="text-yellow-400 text-sm font-semibold tracking-wider uppercase mb-2">Medium Severity</h3>
              <p className="text-5xl font-black text-yellow-400">{analytics.medium}</p>
            </div>
            
            <div className="bg-emerald-900/20 p-6 rounded-3xl border border-emerald-500/20 shadow-lg flex flex-col justify-center items-center backdrop-blur-md">
              <h3 className="text-emerald-400 text-sm font-semibold tracking-wider uppercase mb-2">Low Severity</h3>
              <p className="text-5xl font-black text-emerald-400">{analytics.low}</p>
            </div>
          </div>
        )}

        {/* 📈 CHARTS */}
        {(analytics && patients.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 shadow-2xl rounded-3xl p-6">
              <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center">
                <span className="w-2 h-8 bg-cyan-500 rounded-full mr-3"></span>
                Severity Distribution
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} allowDecimals={false} />
                    <RechartsTooltip 
                      cursor={{fill: '#ffffff05'}}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 shadow-2xl rounded-3xl p-6">
              <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center">
                <span className="w-2 h-8 bg-blue-500 rounded-full mr-3"></span>
                Patient Influx Over Time
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="time" stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} allowDecimals={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                      labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                    />
                    <Line type="monotone" dataKey="patients" stroke="#06b6d4" strokeWidth={4} dot={{r: 4, fill: '#0ea5e9'}} activeDot={{ r: 8, fill: '#38bdf8' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* 📝 PATIENT TABLE */}
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 shadow-2xl rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-lg font-bold text-slate-200 flex items-center">
              <span className="w-2 h-6 bg-emerald-500 rounded-full mr-3"></span>
              Recent Admissions Table
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-white/10 text-slate-300 text-sm tracking-widest uppercase">
                  <th className="py-5 px-6 font-semibold">Time</th>
                  <th className="py-5 px-6 font-semibold">Severity</th>
                  <th className="py-5 px-6 font-semibold">Doctor & Room</th>
                  <th className="py-5 px-6 font-semibold">Vitals</th>
                  <th className="py-5 px-6 font-semibold">Symptoms / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading && patients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <svg className="animate-spin h-8 w-8 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Loading patient data...</span>
                      </div>
                    </td>
                  </tr>
                ) : patients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                      No patients have been recorded yet.
                    </td>
                  </tr>
                ) : (
                  patients.map((patient, index) => {
                    const sev = patient.severity ? patient.severity.toUpperCase() : ""
                    const isHigh = sev === 'HIGH' || sev === 'EMERGENCY'
                    const isMedium = sev === 'MEDIUM'
                    
                    return (
                      <tr 
                        key={index} 
                        className={`transition-colors duration-200 hover:bg-slate-800/30 ${
                          isHigh ? 'bg-red-950/20' : ''
                        }`}
                      >
                        <td className="py-4 px-6 text-slate-300 text-sm whitespace-nowrap">
                          {patient.timestamp}
                        </td>
                        
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                            isHigh 
                              ? 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                              : isMedium 
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          }`}>
                            {isHigh && <span className="mr-1.5 animate-pulse">⚠️</span>}
                            {patient.severity}
                          </span>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="text-white font-medium">{patient.doctor}</span>
                            <span className="text-slate-400 text-sm flex items-center mt-1">
                              <span className="inline-block w-2 h-2 rounded-full bg-cyan-500 mr-2"></span>
                              {patient.room}
                            </span>
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="flex flex-col space-y-1 text-sm bg-slate-900/50 p-2.5 rounded-xl border border-white/5">
                            <div className="flex justify-between items-center w-full min-w-[140px]">
                              <span className="text-slate-500 font-medium text-xs">Temp</span>
                              <span className={`font-semibold ${parseFloat(patient.temperature) > 37.8 ? 'text-red-400' : 'text-slate-300'}`}>
                                {patient.temperature}°
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500 font-medium text-xs">O₂</span>
                              <span className={`font-semibold ${parseFloat(patient.oxygen) < 95 ? 'text-red-400' : 'text-slate-300'}`}>
                                {patient.oxygen}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500 font-medium text-xs">BP</span>
                              <span className={`font-semibold ${parseFloat(patient.bp) > 130 || parseFloat(patient.bp) < 90 ? 'text-red-400' : 'text-slate-300'}`}>
                                {patient.bp}
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-6 min-w-[200px]">
                          <div className="flex flex-col">
                            <span className="text-slate-300 text-sm">Age: <span className="font-semibold text-white">{patient.age}</span></span>
                            {patient.symptoms && (
                              <span className="text-slate-400 text-sm mt-1 mb-1 italic line-clamp-2" title={patient.symptoms}>
                                "{patient.symptoms}"
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
