import React from "react";
import { NavLink, Outlet, Route, Routes, Navigate, useLocation } from "react-router-dom";

/*********************
    Icon components  
 *********************/
const IconSpark = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden {...props}>
    <path d="M13 2 3 14h6l-2 8 10-12h-6l2-8Z"/>
  </svg>
);
const IconChat = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden {...props}>
    <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 5v-5H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
  </svg>
);
const IconUser = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden {...props}>
    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-9 3-9 6v2h18v-2c0-3-4-6-9-6Z"/>
  </svg>
);
const IconGear = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden {...props}>
    <path d="M19.14 12.94a7.5 7.5 0 0 0 .05-.94 7.5 7.5 0 0 0-.05-.94l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.6-.22l-2.49 1a7.38 7.38 0 0 0-1.63-.94l-.38-2.65A.5.5 0 0 0 13.2 0h-4a.5.5 0 0 0-.49.41l-.38 2.65a7.38 7.38 0 0 0-1.63.94l-2.49-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.64L3.86 11a7.5 7.5 0 0 0 0 1.88l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46a.5.5 0 0 0 .6.22l2.49-1a7.38 7.38 0 0 0 1.63.94l.38 2.65a.5.5 0 0 0 .49.41h4a.5.5 0 0 0 .49-.41l.38-2.65a7.38 7.38 0 0 0 1.63-.94l2.49 1a.5.5 0 0 0 .6-.22l2-3.46a.5.5 0 0 0-.12-.64ZM11 17a5 5 0 1 1 5-5 5 5 0 0 1-5 5Z"/>
  </svg>
);

/**********************
   Layout components  
 **********************/
function AppHeader() {
  const location = useLocation();
  const isChats = location.pathname.includes("/app/chats");

  return (
    <header className="w-full border-b border-[rgba(255,255,255,0.06)]" style={{background: "var(--color-darkest)"}}>
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src="/spark.svg" 
            alt="Spark logo"
            className="h-10 w-20"
            draggable="false"
        />
        </div>
        {isChats && (
          <button className="bg-transparent text-sm text-neutral-300 hover:opacity-80">Select</button>
        )}
      </div>
    </header>
  );
}

function BottomNav() {
  const base = "flex-1 flex flex-col items-center justify-center gap-1 py-3";
  const active = "text-[var(--color-primary)]";
  const inactive = "text-neutral-400";

  return (
    <nav className="w-full border-t border-[rgba(255,255,255,0.06)]" style={{background: "var(--color-dark)"}}>
      <div className="mx-auto max-w-5xl grid grid-cols-4">
        <NavLink to="/app/spark" className={({isActive}) => `${base} ${isActive? active: inactive}`}>
          <IconSpark/>
        </NavLink>
        <NavLink to="/app/chats" className={({isActive}) => `${base} ${isActive? active: inactive}`}>
          <IconChat/>
        </NavLink>
        <NavLink to="/app/profile" className={({isActive}) => `${base} ${isActive? active: inactive}`}>
          <IconUser/>
        </NavLink>
        <NavLink to="/app/settings" className={({isActive}) => `${base} ${isActive? active: inactive}`}>
          <IconGear/>
        </NavLink>
      </div>
    </nav>
  );
}

export function LoggedInLayout() {
  return (
    <div className="min-h-screen w-full text-white flex flex-col" style={{background: "var(--color-darkest)"}}>
      <AppHeader/>
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-4">
        <Outlet/>
      </main>
      <BottomNav/>
    </div>
  );
}

/*****************
    Spark view    
 *****************/
export function SparkView() {
  return (
    <div className="w-full h-full rounded-xl border border-[rgba(255,255,255,0.06)]" style={{background: "var(--color-dark)"}}>
      {/* Empty state for now */}
      <div className="h-[60vh] grid place-items-center text-neutral-400">
        <div className="text-center">
          <div className="mb-3 flex items-center justify-center gap-2 text-[var(--color-primary)]">
            <IconSpark/>
            <span>spark</span>
          </div>
          <p>Go make sparks fly ✨</p>
        </div>
      </div>
    </div>
  );
}

/*****************
    Chat list      
 *****************/
function ChatRow({ avatar, name, age, matched, onClick }) {
  return (
    <button onClick={onClick} className="w-full bg-transparent">
      <div className="flex items-center gap-3 px-3 py-3 border-b border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.03)] rounded-lg">
        <img src={avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{name}</span>
            <span className="text-[var(--color-primary)] text-sm">{age}</span>
          </div>
          <div className="text-xs text-neutral-400">Matched on {matched}</div>
        </div>
        <span className="text-[var(--color-primary)] rotate-[-45deg]">↩︎</span>
      </div>
    </button>
  );
}

const demoChats = [
  { id: 1, avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSScttW0F8EJekGLeARNVJXofcqda8FmHWxQA&s", name: "Izzy", age: 21, matched: "Oct 19, 2025" },
  { id: 2, avatar: "https://freedesignfile.com/upload/2017/04/Blonde-European-women-Stock-Photo-05.jpg", name: "Rianna", age: 23, matched: "Oct 17, 2025" },
];

export function ChatListView() {
  return (
    <div className="w-full h-full rounded-xl border border-[rgba(255,255,255,0.06)] overflow-hidden" style={{background: "var(--color-dark)"}}>
      {demoChats.length === 0 ? (
        <div className="h-[60vh] grid place-items-center text-neutral-400">No chats yet.</div>
      ) : (
        <ul className="divide-y divide-[rgba(255,255,255,0.06)]">
          {demoChats.map(c => (
            <li key={c.id}>
              <ChatRow {...c} onClick={() => {/* navigate to /app/chats/:id later */}} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/*********************************
  Profile & Settings placeholders
 *********************************/
export function ProfileView(){
  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.06)] p-6" style={{background: "var(--color-dark)"}}>
      <p className="text-neutral-300">Profile coming soon…</p>
    </div>
  );
}
export function SettingsView(){
  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.06)] p-6" style={{background: "var(--color-dark)"}}>
      <p className="text-neutral-300">Settings coming soon…</p>
    </div>
  );
}

/*****************
   Route helper   
 *****************/
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/app" element={<LoggedInLayout />}> 
        <Route index element={<Navigate to="/app/spark" replace />} />
        <Route path="spark" element={<SparkView />} />
        <Route path="chats" element={<ChatListView />} />
        <Route path="profile" element={<ProfileView />} />
        <Route path="settings" element={<SettingsView />} />
      </Route>
    </Routes>
  );
}
