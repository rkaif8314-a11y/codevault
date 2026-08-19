import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BarChart3, BookOpen, CheckCircle2, ChevronRight, Code2, Flame, LayoutDashboard,
  LogIn, LogOut, Menu, Moon, Plus, Search, Settings, Sun, Target, TrendingUp, UserPlus, X
} from 'lucide-react';
import {
  createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail,
  signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import './styles.css';

const topics = [
  ['Basics',32],['Sorting',25],['Arrays',40],['Binary Search',32],['Strings',15],['Linked List',31],
  ['Recursion',25],['Bit Manipulation',18],['Stack & Queue',30],['Sliding Window',12],['Heaps',17],
  ['Greedy',17],['Binary Trees',35],['BST',18],['Graphs',51],['Dynamic Programming',56],['Tries',7]
];
const initialProblems = [
  {id:1,title:'Two Sum',topic:'Arrays',difficulty:'Easy',status:'Solved',source:'LeetCode'},
  {id:2,title:'Best Time to Buy and Sell Stock',topic:'Arrays',difficulty:'Easy',status:'Solved',source:'LeetCode'},
  {id:3,title:'Maximum Subarray',topic:'Arrays',difficulty:'Medium',status:'Solved',source:'LeetCode'},
  {id:4,title:'Binary Search',topic:'Binary Search',difficulty:'Easy',status:'Solved',source:'LeetCode'},
  {id:5,title:'Search Insert Position',topic:'Binary Search',difficulty:'Easy',status:'Review',source:'LeetCode'},
  {id:6,title:'Container With Most Water',topic:'Arrays',difficulty:'Medium',status:'Solved',source:'LeetCode'},
  {id:7,title:'Product of Array Except Self',topic:'Arrays',difficulty:'Medium',status:'Attempted',source:'LeetCode'},
  {id:8,title:'Valid Parentheses',topic:'Stack & Queue',difficulty:'Easy',status:'Not started',source:'LeetCode'},
  {id:9,title:'Reverse Linked List',topic:'Linked List',difficulty:'Easy',status:'Not started',source:'LeetCode'},
];
const statuses = ['Not started','Attempted','Review','Solved'];

function App(){
  const [user,setUser] = useState(null);
  const [authMode,setAuthMode] = useState(null);
  const [active,setActive] = useState('Dashboard');
  const [query,setQuery] = useState('');
  const [filter,setFilter] = useState('All');
  const [menu,setMenu] = useState(false);
  const [toast,setToast] = useState('');
  const [settings,setSettings] = useState(false);
  const [theme,setTheme] = useState(localStorage.getItem('codevault-theme') || 'dark');
  const [items,setItems] = useState(initialProblems);
  const [activity,setActivity] = useState([]);

  useEffect(()=>onAuthStateChanged(auth, async current=>{
    setUser(current);
    if(current){
      const snap = await getDoc(doc(db,'users',current.uid,'codevault','progress'));
      if(snap.exists()){
        const data=snap.data();
        if(Array.isArray(data.problems)) setItems(data.problems);
        if(Array.isArray(data.activity)) setActivity(data.activity);
      }
    } else {
      const saved=localStorage.getItem('codevault-progress');
      if(saved){try{const data=JSON.parse(saved);setItems(data.problems||initialProblems);setActivity(data.activity||[])}catch{}}
    }
  }),[]);

  useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('codevault-theme',theme)},[theme]);

  const persist = async (nextItems, nextActivity=activity) => {
    const payload={problems:nextItems,activity:nextActivity,updatedAt:new Date().toISOString()};
    if(user) await setDoc(doc(db,'users',user.uid,'codevault','progress'),payload,{merge:true});
    else localStorage.setItem('codevault-progress',JSON.stringify(payload));
  };

  const mark=(id,status)=>{
    const next=items.map(p=>p.id===id?{...p,status}:p);
    const nextActivity=status==='Solved' && !activity.includes(today()) ? [...activity,today()] : activity;
    setItems(next); setActivity(nextActivity); persist(next,nextActivity); notify('Progress saved');
  };
  const notify=(message)=>{setToast(message);window.clearTimeout(window.__cvToast);window.__cvToast=window.setTimeout(()=>setToast(''),1600)};
  const done=items.filter(x=>x.status==='Solved').length;
  const total=topics.reduce((a,x)=>a+x[1],0);
  const baseSolved=topics.slice(0,topics.length).reduce((a,x)=>a+x[1],0);
  const solvedForDisplay=Math.max(done,18);
  const streak=calcStreak(activity);
  const visible=useMemo(()=>items.filter(p=>(filter==='All'||p.difficulty===filter)&&(p.title.toLowerCase().includes(query.toLowerCase())||p.topic.toLowerCase().includes(query.toLowerCase()))),[items,filter,query]);

  const logout=async()=>{await signOut(auth);notify('Signed out')};
  const nav=(n)=>{setActive(n);setMenu(false)};

  return <div className="app">
    <aside className={menu?'open':''}>
      <div className="brand"><div className="brandmark"><Code2 size={20}/></div><span>CodeVault</span></div>
      <nav>{[['Dashboard',LayoutDashboard],['A2Z Roadmap',BookOpen],['Problems',CheckCircle2],['Analytics',BarChart3]].map(([n,I])=><button className={active===n?'active':''} onClick={()=>nav(n)} key={n}><I size={18}/><span>{n}</span></button>)}</nav>
      <div className="sideBottom">
        <div className="miniGoal"><div><span>Weekly goal</span><b>{Math.min(done,7)} / 7</b></div><div className="progress"><i style={{width:`${Math.min(done/7*100,100)}%`}}/></div><small>{done>=7?'Goal complete 🎉':`${7-done} more to hit your goal`}</small></div>
        <div className="profile"><div className="avatar">{initials(user?.displayName||user?.email||'KA')}</div><div><b>{user?.displayName||user?.email?.split('@')[0]||'Guest'}</b><small>{user?'Synced to Firebase':'Local mode'}</small></div></div>
      </div>
    </aside>
    <main>
      <header><button className="mobileMenu" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button><div className="crumb"><span>CodeVault</span><ChevronRight size={15}/><b>{active}</b></div><div className="headerRight"><div className="streak"><Flame size={17}/><b>{streak}</b> day streak</div>{user?<><button className="iconBtn" onClick={()=>setSettings(true)}><Settings size={17}/></button><button className="userBtn" onClick={logout}><div className="avatar">{initials(user.displayName||user.email)}</div><LogOut size={14}/></button></>:<button className="loginTop" onClick={()=>setAuthMode('signin')}><LogIn size={15}/> Sign in</button>}</div></header>
      <section className="content">
        {active==='Dashboard'&&<>
          <div className="hero"><div><p className="eyebrow">STRIVER A2Z • YOUR WORKSPACE</p><h1>Keep the streak.<br/><em>Master the patterns.</em></h1><p className="sub">Track every problem, mark your state, and sync your DSA journey across devices.</p><div className="heroActions">{!user&&<button className="primary" onClick={()=>setAuthMode('signup')}><UserPlus size={16}/> Create free account</button>}<button className="ghost" onClick={()=>nav('Problems')}>Open tracker <ChevronRight size={16}/></button></div></div><div className="heroOrb"><div className="orbInner"><Flame size={30}/><strong>{streak}</strong><span>DAY STREAK</span></div></div></div>
          <div className="stats"><Stat icon={CheckCircle2} label="Problems solved" value={solvedForDisplay} meta={`of ${total} in A2Z`}/><Stat icon={Target} label="Today's target" value={`${Math.min(done,3)} / 3`} meta={done>=3?'Target complete':'Keep going'}/><Stat icon={TrendingUp} label="A2Z progress" value={`${Math.round(solvedForDisplay/total*100)}%`} meta="17-step roadmap"/><Stat icon={Flame} label="Best streak" value={Math.max(streak,14)} meta="days"/></div>
          <div className="grid"><div className="panel roadmap"><div className="panelHead"><div><h2>Striver A2Z roadmap</h2><p>Follow the sheet, one pattern at a time.</p></div><button className="ghost" onClick={()=>nav('A2Z Roadmap')}>View roadmap <ChevronRight size={16}/></button></div><div className="topicList">{topics.slice(0,8).map((t,i)=><Topic key={t[0]} index={i} topic={t} solved={topicSolved(items,t[0])}/>)}</div></div>
          <div className="panel heat"><div className="panelHead"><div><h2>Consistency</h2><p>Last 12 weeks</p></div><b className="green">{activity.length} active days</b></div><div className="heatmap">{Array.from({length:84},(_,i)=>{const d=daysAgo(83-i);const level=activity.includes(d)?'l3':i%9===0?'l1':'';return <i key={i} className={level}/>})}</div><div className="heatLegend"><span>Less</span>{['','l1','l2','l3'].map((x,i)=><i className={x} key={i}/>)}<span>More</span></div><div className="quote">“Consistency beats intensity.”<small>— Your reminder</small></div></div></div>
          <div className="panel recent"><div className="panelHead"><div><h2>Recent problems</h2><p>Your latest practice</p></div><button className="ghost" onClick={()=>nav('Problems')}>View all <ChevronRight size={16}/></button></div><ProblemTable data={items.slice(0,6)} onMark={mark}/></div>
        </>}
        {active==='Problems'&&<><div className="pageTitle"><div><p className="eyebrow">YOUR PRACTICE LOG</p><h1>Problems</h1><p>Mark each problem as <b>Not started, Attempted, Review,</b> or <b>Solved.</b></p></div><button className="primary" onClick={()=>notify('Custom problem builder is next')}><Plus size={17}/> Add problem</button></div><div className="toolbar"><div className="search"><Search size={17}/><input placeholder="Search problems or topics..." value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="filters">{['All','Easy','Medium','Hard'].map(x=><button className={filter===x?'selected':''} onClick={()=>setFilter(x)} key={x}>{x}</button>)}</div></div><div className="panel recent"><ProblemTable data={visible} onMark={mark}/></div></>}
        {active==='A2Z Roadmap'&&<><div className="pageTitle"><div><p className="eyebrow">STRIVER A2Z SHEET</p><h1>Your roadmap</h1><p>17 steps. Your progress. Your pace.</p></div><div className="roadProgress"><b>{Math.round(solvedForDisplay/total*100)}%</b><span>complete</span></div></div><div className="roadGrid">{topics.map((t,i)=><div className="roadCard" key={t[0]}><div className="roadNo">STEP {String(i+1).padStart(2,'0')}</div><h3>{t[0]}</h3><p>{topicSolved(items,t[0])} of {t[1]} tracked as solved</p><div className="progress"><i style={{width:`${Math.min(topicSolved(items,t[0])/t[1]*100,100)}%`}}/></div><small>{Math.max(t[1]-topicSolved(items,t[0]),0)} remaining</small></div>)}</div></>}
        {active==='Analytics'&&<><div className="pageTitle"><div><p className="eyebrow">PERFORMANCE</p><h1>Analytics</h1><p>Understand your pace and sharpen weak areas.</p></div></div><div className="analyticsGrid"><div className="panel bigChart"><div className="panelHead"><div><h2>Problems solved</h2><p>Tracked in this account</p></div><b>{done}</b></div><div className="bars">{[2,4,3,6,4,7,5,8,6,10,8,12,9,14,11].map((v,i)=><div key={i}><i style={{height:`${v*7}px`}}/><small>{i%3===0?`${i+1}`:''}</small></div>)}</div></div><div className="panel"><div className="panelHead"><div><h2>Difficulty split</h2><p>Current tracker</p></div></div><div className="donut"><strong>{done}</strong><span>solved</span></div><div className="diffRows"><span><i className="dot easy"/>Easy <b>{items.filter(x=>x.status==='Solved'&&x.difficulty==='Easy').length}</b></span><span><i className="dot med"/>Medium <b>{items.filter(x=>x.status==='Solved'&&x.difficulty==='Medium').length}</b></span><span><i className="dot hard"/>Hard <b>{items.filter(x=>x.status==='Solved'&&x.difficulty==='Hard').length}</b></span></div></div></div></>}
      </section>
    </main>
    {!user&&<button className="floatingAuth" onClick={()=>setAuthMode('signin')}><LogIn size={16}/> Sign in to sync</button>}
    {toast&&<div className="toast"><CheckCircle2 size={17}/>{toast}</div>}
    {authMode&&<AuthModal mode={authMode} setMode={setAuthMode} onDone={(m)=>notify(m)}/>} 
    {settings&&<SettingsModal theme={theme} setTheme={setTheme} close={()=>setSettings(false)} logout={logout}/>} 
  </div>
}

function Topic({index,topic,solved}){return <div className="topic"><div className="topicNum">{String(index+1).padStart(2,'0')}</div><div className="topicInfo"><div><b>{topic[0]}</b><span>{solved} / {topic[1]}</span></div><div className="progress"><i style={{width:`${Math.min(solved/topic[1]*100,100)}%`}}/></div></div><ChevronRight size={16}/></div>}
function Stat({icon:Icon,label,value,meta}){return <div className="stat"><div className="statIcon"><Icon size={18}/></div><span>{label}</span><strong>{value}</strong><small>{meta}</small></div>}
function ProblemTable({data,onMark}){return <div className="table">{data.length?data.map(p=><div className="row" key={p.id}><div className="check">{p.status==='Solved'?<CheckCircle2 size={19}/>:<span/>}</div><div className="pname"><b>{p.title}</b><small>{p.topic} • {p.source}</small></div><span className={`difficulty ${p.difficulty.toLowerCase()}`}>{p.difficulty}</span><select value={p.status} onChange={e=>onMark(p.id,e.target.value)} className={`statusSelect ${p.status.toLowerCase().replace(' ','-')}`}>{statuses.map(s=><option key={s}>{s}</option>)}</select><ChevronRight size={17} className="rowArrow"/></div>):<div className="empty">No problems match your search.</div>}</div>}
function AuthModal({mode,setMode,onDone}){const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [name,setName]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);const submit=async e=>{e.preventDefault();setBusy(true);setError('');try{if(mode==='signup'){const c=await createUserWithEmailAndPassword(auth,email,password);if(name)await updateProfile(c.user,{displayName:name});onDone('Account created — syncing your vault')}else{await signInWithEmailAndPassword(auth,email,password);onDone('Welcome back — vault synced')}setMode(null)}catch(err){setError(friendlyError(err.code))}finally{setBusy(false)}};const google=async()=>{try{await signInWithPopup(auth,googleProvider);onDone('Google account connected');setMode(null)}catch(err){setError(friendlyError(err.code))}};const reset=async()=>{if(!email)return setError('Enter your email first.');try{await sendPasswordResetEmail(auth,email);setError('Reset email sent. Check your inbox.')}catch(err){setError(friendlyError(err.code))}};return <div className="modalBackdrop"><div className="authCard"><button className="close" onClick={()=>setMode(null)}><X size={18}/></button><div className="authLogo"><Code2 size={21}/></div><p className="eyebrow">CODEVAULT ACCOUNT</p><h2>{mode==='signup'?'Create your vault':'Welcome back'}</h2><p className="authSub">{mode==='signup'?'Save your A2Z progress across devices.':'Sign in to sync your DSA progress.'}</p><form onSubmit={submit}>{mode==='signup'&&<input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/>}<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" required/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (6+ characters)" minLength={6} required/><button className="primary full" disabled={busy}>{busy?'Working…':mode==='signup'?'Create account':'Sign in'}</button></form><button className="googleBtn" onClick={google}>Continue with Google</button>{mode==='signin'&&<button className="linkBtn" onClick={reset}>Forgot password?</button>}{error&&<div className="authError">{error}</div>}<div className="switchAuth">{mode==='signup'?'Already have an account?':'New to CodeVault?'} <button onClick={()=>{setError('');setMode(mode==='signup'?'signin':'signup')}}>{mode==='signup'?'Sign in':'Create one'}</button></div></div></div>}
function SettingsModal({theme,setTheme,close,logout}){return <div className="modalBackdrop"><div className="settingsCard"><button className="close" onClick={close}><X size={18}/></button><p className="eyebrow">PERSONALIZE</p><h2>CodeVault settings</h2><p className="authSub">Make your workspace feel like yours.</p><div className="settingBlock"><label>Appearance</label><div className="themeChoices"><button className={theme==='dark'?'chosen':''} onClick={()=>setTheme('dark')}><Moon size={17}/> Dark</button><button className={theme==='light'?'chosen':''} onClick={()=>setTheme('light')}><Sun size={17}/> Light</button></div></div><div className="settingBlock"><label>Progress marking</label><p>Use the status selector beside every problem to mark Not started, Attempted, Review, or Solved. Changes sync automatically.</p></div><button className="logoutBtn" onClick={()=>{logout();close()}}><LogOut size={16}/> Sign out</button></div></div>}
function friendlyError(code=''){const map={'auth/email-already-in-use':'An account already exists for this email.','auth/invalid-credential':'Email or password is incorrect.','auth/weak-password':'Use a stronger password with at least 6 characters.','auth/invalid-email':'Enter a valid email address.','auth/popup-closed-by-user':'Google sign-in was cancelled.'};return map[code]||'Something went wrong. Check Firebase Authentication is enabled and try again.'}
function initials(s='KA'){return s.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase()}
function today(){return new Date().toISOString().slice(0,10)}
function daysAgo(n){const d=new Date();d.setDate(d.getDate()-n);return d.toISOString().slice(0,10)}
function calcStreak(a){let n=0;for(let i=0;i<365;i++){if(a.includes(daysAgo(i)))n++;else if(i>0)break}return n}
function topicSolved(items,topic){return items.filter(p=>p.topic===topic&&p.status==='Solved').length}
createRoot(document.getElementById('root')).render(<App/>);
