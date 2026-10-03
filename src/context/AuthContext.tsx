import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export interface LocalUser { id: string; name: string; email: string }
interface StoredUser extends LocalUser { passwordHash: string }
interface AuthValue {
  user: LocalUser | null
  loading: boolean
  signUp: (name: string, email: string, password: string) => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => void
}
const USERS_KEY='money_copilot_users'
const SESSION_KEY='money_copilot_session'
const AuthContext=createContext<AuthValue|null>(null)
const normalize=(e:string)=>e.trim().toLowerCase()
async function hash(p:string){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(p));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')}
function users():StoredUser[]{try{return JSON.parse(localStorage.getItem(USERS_KEY)||'[]')}catch{return[]}}
export function AuthProvider({children}:{children:ReactNode}){
 const [user,setUser]=useState<LocalUser|null>(()=>{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}})
 const [loading,setLoading]=useState(false)
 useEffect(()=>{user?localStorage.setItem(SESSION_KEY,JSON.stringify(user)):localStorage.removeItem(SESSION_KEY)},[user])
 const signUp=async(name:string,email:string,password:string)=>{
  const n=name.trim(),e=normalize(email); if(!n)return{error:'Please enter your name.'}; if(!e.includes('@'))return{error:'Please enter a valid email.'}; if(password.length<6)return{error:'Password must be at least 6 characters.'}
  const list=users(); if(list.some(u=>u.email===e))return{error:'An account with this email already exists.'}
  setLoading(true); try{const u={id:crypto.randomUUID(),name:n,email:e,passwordHash:await hash(password)};localStorage.setItem(USERS_KEY,JSON.stringify([...list,u]));setUser({id:u.id,name:u.name,email:u.email});return{}}finally{setLoading(false)}
 }
 const signIn=async(email:string,password:string)=>{const e=normalize(email),u=users().find(x=>x.email===e);if(!u)return{error:'No account found with this email.'};setLoading(true);try{if(await hash(password)!==u.passwordHash)return{error:'Incorrect password.'};setUser({id:u.id,name:u.name,email:u.email});return{}}finally{setLoading(false)}}
 const value=useMemo(()=>({user,loading,signUp,signIn,signOut:()=>setUser(null)}),[user,loading])
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth(){const c=useContext(AuthContext);if(!c)throw new Error('useAuth must be used within AuthProvider');return c}
