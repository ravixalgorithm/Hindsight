"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Network, Zap, Info, Folder } from "lucide-react";
import { useEffect, useState } from "react";
import { useDatasetSession } from "@/hooks/useDatasetSession";

export default function Sidebar() {
  const pathname = usePathname();
  const { datasetName } = useDatasetSession();
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!datasetName) return;
    let timeoutId: NodeJS.Timeout;
    
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/status?dataset=${datasetName}`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data.status);
          const nextPoll = data.status === 'processing' ? 2000 : 15000;
          timeoutId = setTimeout(checkStatus, nextPoll);
          return;
        }
      } catch (e) {}
      timeoutId = setTimeout(checkStatus, 15000);
    };
    
    checkStatus();
    return () => clearTimeout(timeoutId);
  }, [datasetName]);

  const navItems = [
    { href: "/board", icon: <Network size={20} />, label: "Board" },
    { href: "/ask", icon: <Search size={20} />, label: "Ask" },
    { href: "/dashboard", icon: <Zap size={20} />, label: "Dashboard" },
  ];

  return (
    <div className="w-[56px] h-screen flex-none border-r border-[#2C1F0E] bg-[#0D0D0D] flex flex-col items-center py-4 z-50">
      <Link href="/" className="text-xl font-heading text-[#F5C842] mb-6 hover:scale-110 transition-transform">
        🕵️
      </Link>
      
      <div className="w-8 h-[1px] bg-[#2C1F0E] mb-6" />

      <div className="flex flex-col gap-6 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={`p-2 rounded-lg transition-colors ${
              pathname === item.href 
                ? "bg-[#C0392B] text-white" 
                : "text-[#8B6914] hover:bg-[#2C1F0E] hover:text-[#F5C842]"
            }`}
          >
            {item.icon}
          </Link>
        ))}
      </div>

      <div className="w-8 h-[1px] bg-[#2C1F0E] mb-6" />

      <div 
        title={`Memory: ${status}`}
        className={`w-3 h-3 rounded-full mb-4 shadow-lg ${
          status === 'processing' ? 'bg-yellow-500 animate-pulse' :
          status === 'error' ? 'bg-[#C0392B]' :
          'bg-green-500'
        }`} 
      />
    </div>
  );
}
