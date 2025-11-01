import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import NatureScene from '../components/NatureScene'

export default function Landing(){
  return (
    <div className="container-p">
      <section className="bg-app rounded-2xl p-8 md:p-12 relative overflow-hidden border border-slate-200/60 dark:border-slate-800">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-forest-600 to-moss bg-clip-text text-transparent">
              We help you feel better — one small step at a time.
            </span>
          </h1>
          <p className="text-slate-700 dark:text-slate-300 mb-2">
            This website is for <b>supporting your mental wellness</b> — to understand what you’re feeling,
            suggest evidence‑informed actions, and help you build healthy routines.
          </p>
          <p className="text-slate-700 dark:text-slate-300 mb-6">
            Start a chat, track your mood, and get gentle recommendations. When needed, loved‑one alerts are available with your consent.
          </p>
          <div className="flex gap-3">
            <Link to="#" onClick={(e)=>{ e.preventDefault(); document.getElementById('openTalk')?.click(); }} className="btn btn-primary">Talk now</Link>
            <Link to="/signup" className="btn btn-outline">Create account</Link>
          </div>
        </motion.div>

        <div className="mt-8">
          <NatureScene />
        </div>

        {/* Floating nature accents */}
        <motion.div
          className="hidden md:block absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-forest-200/50 dark:bg-forest-900/30 blur-2xl"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="hidden md:block absolute -left-10 -top-10 w-48 h-48 rounded-full bg-mint/40 dark:bg-forest-800/30 blur-2xl"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
      </section>

      <section className="mt-10 grid md:grid-cols-3 gap-6">
        {[
          {title:'Motivations', to:'/motivations', desc:'Stories of resilience from people you know.'},
          {title:'News', to:'/news', desc:'Positive, future‑looking updates from around the world.'},
          {title:'Games', to:'/games', desc:'Guided breathing + mini quizzes to unwind.'},
        ].map((c)=> (
          <Link key={c.title} to={c.to} className="card hover:shadow-lg hover:-translate-y-0.5 transition">
            <h3 className="font-semibold">{c.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{c.desc}</p>
          </Link>
        ))}
      </section>

      {/* hidden button the Navbar's BotLauncher listens to */}
      <button id="openTalk" className="hidden" onClick={()=>{
        // dispatch a custom event that BotLauncher can hook into if needed
      }} />
    </div>
  )
}
