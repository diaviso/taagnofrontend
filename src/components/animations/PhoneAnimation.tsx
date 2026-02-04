"use client";

import { motion } from "framer-motion";

export function PhoneAnimation({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ rotate: -5 }}
      animate={{ rotate: [- 5, 5, -5] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 120 220" className="w-full h-auto drop-shadow-2xl">
        {/* Phone body */}
        <rect
          x="10"
          y="10"
          width="100"
          height="200"
          rx="15"
          fill="#1a1a1a"
          stroke="#333"
          strokeWidth="2"
        />
        
        {/* Screen */}
        <rect
          x="15"
          y="30"
          width="90"
          height="170"
          rx="5"
          fill="#fff"
        />
        
        {/* Camera notch */}
        <rect x="40" y="15" width="40" height="8" rx="4" fill="#333" />
        <circle cx="60" cy="19" r="3" fill="#444" />
        
        {/* App content - Taagno interface */}
        <g>
          {/* Header */}
          <rect x="15" y="30" width="90" height="25" fill="#22c55e" />
          <text x="60" y="47" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
            Taagno
          </text>
          
          {/* Search bar */}
          <rect x="20" y="60" width="80" height="20" rx="5" fill="#f0f0f0" />
          <text x="30" y="73" fill="#999" fontSize="7">Rechercher un trajet...</text>
          
          {/* Trip cards */}
          <motion.g
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            <rect x="20" y="85" width="80" height="35" rx="5" fill="#f8f8f8" stroke="#e0e0e0" />
            <circle cx="32" cy="97" r="6" fill="#22c55e" opacity="0.2" />
            <circle cx="32" cy="97" r="3" fill="#22c55e" />
            <text x="42" y="95" fill="#333" fontSize="6" fontWeight="bold">Dakar → Thiès</text>
            <text x="42" y="105" fill="#666" fontSize="5">14:00 • 3 places</text>
            <text x="85" y="100" fill="#22c55e" fontSize="8" fontWeight="bold">2500</text>
          </motion.g>
          
          <motion.g
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            <rect x="20" y="125" width="80" height="35" rx="5" fill="#f8f8f8" stroke="#e0e0e0" />
            <circle cx="32" cy="137" r="6" fill="#f59e0b" opacity="0.2" />
            <circle cx="32" cy="137" r="3" fill="#f59e0b" />
            <text x="42" y="135" fill="#333" fontSize="6" fontWeight="bold">Saint-Louis → Dakar</text>
            <text x="42" y="145" fill="#666" fontSize="5">09:30 • 2 places</text>
            <text x="85" y="140" fill="#22c55e" fontSize="8" fontWeight="bold">4000</text>
          </motion.g>
          
          {/* Bottom nav */}
          <rect x="15" y="175" width="90" height="25" fill="#fafafa" />
          <g fill="#999">
            <rect x="25" y="180" width="15" height="15" rx="3" fill="#22c55e" opacity="0.2" />
            <text x="32" y="191" textAnchor="middle" fontSize="6" fill="#22c55e">🏠</text>
            <text x="55" y="191" textAnchor="middle" fontSize="6">🚗</text>
            <text x="78" y="191" textAnchor="middle" fontSize="6">👤</text>
          </g>
        </g>
        
        {/* Home button */}
        <rect x="50" y="205" width="20" height="4" rx="2" fill="#444" />
      </svg>
      
      {/* Tap indicator */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.8, 0, 0.8]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-8 h-8 rounded-full bg-primary/30 border-2 border-primary" />
      </motion.div>
    </motion.div>
  );
}

export function PersonWithPhone({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 150 200" className="w-full h-auto">
        {/* Person body */}
        <motion.g
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Head */}
          <circle cx="75" cy="35" r="25" fill="#FDBF60" />
          {/* Hair */}
          <ellipse cx="75" cy="22" rx="22" ry="12" fill="#4a3728" />
          {/* Eyes */}
          <motion.g
            animate={{ scaleY: [1, 0.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          >
            <ellipse cx="65" cy="35" rx="3" ry="4" fill="#333" />
            <ellipse cx="85" cy="35" rx="3" ry="4" fill="#333" />
          </motion.g>
          {/* Smile */}
          <path d="M65 45 Q75 55 85 45" stroke="#333" strokeWidth="2" fill="none" />
          
          {/* Body */}
          <path
            d="M50 60 Q75 70 100 60 L105 130 Q75 140 45 130 Z"
            fill="#22c55e"
          />
          
          {/* Arms */}
          <motion.g
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ transformOrigin: "55px 70px" }}
          >
            <path
              d="M55 70 Q40 90 50 120"
              stroke="#FDBF60"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />
          </motion.g>
          <motion.g
            animate={{ rotate: [5, -5, 5] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ transformOrigin: "95px 70px" }}
          >
            <path
              d="M95 70 Q110 90 100 120"
              stroke="#FDBF60"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />
          </motion.g>
          
          {/* Phone in hand */}
          <motion.g
            animate={{ rotate: [-10, 10, -10] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ transformOrigin: "75px 115px" }}
          >
            <rect x="60" y="100" width="30" height="50" rx="5" fill="#1a1a1a" />
            <rect x="63" y="105" width="24" height="40" rx="2" fill="#87CEEB" />
            {/* Screen glow */}
            <motion.rect
              x="63"
              y="105"
              width="24"
              height="40"
              rx="2"
              fill="#22c55e"
              opacity={0.3}
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.g>
        </motion.g>
        
        {/* Legs */}
        <rect x="55" y="130" width="15" height="60" rx="5" fill="#2563eb" />
        <rect x="80" y="130" width="15" height="60" rx="5" fill="#2563eb" />
        
        {/* Shoes */}
        <ellipse cx="62" cy="195" rx="12" ry="6" fill="#333" />
        <ellipse cx="88" cy="195" rx="12" ry="6" fill="#333" />
      </svg>
    </div>
  );
}
