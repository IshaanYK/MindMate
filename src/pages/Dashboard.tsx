import React, { useMemo, useState } from 'react'
import ChartCard from '../components/ChartCard'
import MoodTable from '../components/MoodTable'
import BreathingWidget from '../components/BreathingWidget'
import TaskList from '../components/TaskList'
import { generateTrend, weeklyRows, defaultTasks } from '../utils/sampleData'
import { useAuth } from '../context/AuthContext'
import { videosForMood } from '../utils/youtube'

export default function Dashboard(){
  const data = useMemo(()=>generateTrend(14), [])
  const rows = useMemo(()=>weeklyRows(), [])
  const [tasks, setTasks] = useState(defaultTasks())
  const { user, updateLovedOnes } = useAuth()
  const [lo, setLo] = useState(user?.lovedOnes ?? [{name:'', whatsapp:''}, {name:'', whatsapp:''}])
  const latestMood = useMemo(()=>{
    const last = rows[0]
    const delta = last.mood - last.stress
    const score = delta > 5 ? 'positive' : delta < -5 ? 'negative' : 'neutral'
    return score as 'positive'|'neutral'|'negative'
  }, [rows])

  function toggleTask(id:string){
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function saveLoved(){
    updateLovedOnes(lo.filter(l => l.name && l.whatsapp))
  }

  const vids = videosForMood(latestMood)

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <ChartCard data={data} />
        <MoodTable rows={rows} />
        <div className="card">
          <h3 className="font-semibold mb-2">Personalized Wellness</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Based on recent mood, we suggest these short videos. Your current mood appears <b>{latestMood}</b>.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {vids.map((id) => (
              <iframe key={id} className="w-full aspect-video rounded-2xl"
                src={`https://www.youtube.com/embed/${id}`} title="YouTube video" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <BreathingWidget />
        <TaskList tasks={tasks} onToggle={toggleTask} />
        <div className="card">
          <h3 className="font-semibold mb-2">Loved-one Alerts (Parent Control)</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Add up to two trusted contacts (WhatsApp numbers, E.164 format like +90...). With consent only.</p>
          {lo.map((x, i)=>(
            <div key={i} className="flex gap-2 mb-2">
              <input className="border rounded-xl px-3 py-2 w-1/2 bg-white/70 dark:bg-slate-900/50" placeholder="Name" value={x.name} onChange={e=>{
                const v=[...lo]; v[i]={...v[i], name:e.target.value}; setLo(v)
              }} />
              <input className="border rounded-xl px-3 py-2 w-1/2 bg-white/70 dark:bg-slate-900/50" placeholder="WhatsApp (+90...)" value={x.whatsapp} onChange={e=>{
                const v=[...lo]; v[i]={...v[i], whatsapp:e.target.value}; setLo(v)
              }} />
            </div>
          ))}
          <button onClick={saveLoved} className="btn btn-primary w-full">Save</button>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">In crisis, we prepare a WhatsApp message for you to send. Automated sending requires a server + WhatsApp API.</p>
        </div>
        <div className="card text-xs text-slate-500 dark:text-slate-400">
          <p><b>Safety:</b> This demo is not a substitute for professional care. If you’re in danger or thinking about self-harm, contact local emergency services immediately.</p>
        </div>
      </div>
    </div>
  )
}
