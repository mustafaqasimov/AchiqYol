"use client";
import {useEffect,useState} from "react";
interface InstallEvent extends Event { prompt():Promise<void>; userChoice:Promise<{outcome:"accepted"|"dismissed"}> }
export default function InstallApp(){const [event,setEvent]=useState<InstallEvent|null>(null);const [installed,setInstalled]=useState(false);const [help,setHelp]=useState(false);
useEffect(()=>{setInstalled(window.matchMedia("(display-mode: standalone)").matches);const before=(e:Event)=>{e.preventDefault();setEvent(e as InstallEvent)};const done=()=>{setInstalled(true);setEvent(null)};window.addEventListener("beforeinstallprompt",before);window.addEventListener("appinstalled",done);if("serviceWorker" in navigator)navigator.serviceWorker.register("/service-worker.js").catch(console.error);return()=>{window.removeEventListener("beforeinstallprompt",before);window.removeEventListener("appinstalled",done)}},[]);
async function install(){if(!event){setHelp(!help);return}await event.prompt();await event.userChoice;setEvent(null)}
return installed?<span>Tətbiq quraşdırılıb</span>:<div><button onClick={install} className="rounded-xl bg-emerald-800 px-5 text-white">↓ Tətbiqi yüklə</button>{help&&<p role="status" className="max-w-xs text-sm">Brauzer menyusunda “Install app” seçin. iPhone: Safari → Paylaş → Əsas ekrana əlavə et. Quraşdırma üçün HTTPS tələb olunur.</p>}</div>}
