"use client";

import { motion } from "framer-motion";

export function CarAnimation({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Road */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-full">
        {/* Road markings */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 flex gap-8"
          animate={{ x: [0, -100] }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(20)].map((_, i) => (
            <div key={i} className="w-12 h-1 bg-yellow-400 rounded-full" />
          ))}
        </motion.div>
      </div>

      {/* Car */}
      <motion.div
        className="relative z-10"
        animate={{ 
          y: [0, -3, 0],
        }}
        transition={{ 
          duration: 0.5, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg viewBox="0 0 200 80" className="w-full h-auto">
          {/* Car body */}
          <motion.g>
            {/* Main body */}
            <path
              d="M20 50 L30 30 L70 25 L130 25 L160 35 L180 50 L180 60 L20 60 Z"
              fill="url(#carGradient)"
              stroke="#1a5f2a"
              strokeWidth="2"
            />
            {/* Roof */}
            <path
              d="M50 30 L60 15 L120 15 L140 30"
              fill="url(#roofGradient)"
              stroke="#1a5f2a"
              strokeWidth="2"
            />
            {/* Windows */}
            <path
              d="M55 28 L62 18 L90 18 L90 28 Z"
              fill="#87CEEB"
              opacity="0.8"
            />
            <path
              d="M95 18 L95 28 L130 28 L120 18 Z"
              fill="#87CEEB"
              opacity="0.8"
            />
            {/* Headlights */}
            <motion.ellipse
              cx="170"
              cy="48"
              rx="8"
              ry="5"
              fill="#FFD700"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            {/* Taillights */}
            <motion.rect
              x="22"
              y="45"
              width="6"
              height="8"
              rx="2"
              fill="#FF4444"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          </motion.g>

          {/* Wheels */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "50px 60px" }}
          >
            <circle cx="50" cy="60" r="12" fill="#333" />
            <circle cx="50" cy="60" r="8" fill="#666" />
            <circle cx="50" cy="60" r="3" fill="#999" />
          </motion.g>
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "150px 60px" }}
          >
            <circle cx="150" cy="60" r="12" fill="#333" />
            <circle cx="150" cy="60" r="8" fill="#666" />
            <circle cx="150" cy="60" r="3" fill="#999" />
          </motion.g>

          {/* Driver silhouette */}
          <ellipse cx="75" cy="25" rx="8" ry="10" fill="#444" opacity="0.7" />
          
          {/* Passenger silhouettes */}
          <ellipse cx="105" cy="25" rx="7" ry="9" fill="#444" opacity="0.6" />
          <ellipse cx="125" cy="26" rx="6" ry="8" fill="#444" opacity="0.5" />

          {/* Gradients */}
          <defs>
            <linearGradient id="carGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            <linearGradient id="roofGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Dust particles */}
      <motion.div
        className="absolute bottom-6 left-4"
        animate={{ 
          x: [-20, -60],
          opacity: [0.8, 0],
          scale: [0.5, 1.5]
        }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        <div className="w-3 h-3 rounded-full bg-gray-400/50" />
      </motion.div>
      <motion.div
        className="absolute bottom-8 left-8"
        animate={{ 
          x: [-20, -50],
          opacity: [0.6, 0],
          scale: [0.3, 1.2]
        }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
      >
        <div className="w-2 h-2 rounded-full bg-gray-400/40" />
      </motion.div>
    </div>
  );
}

export function CarDrivingScene({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-64 bg-gradient-to-b from-sky-200 via-sky-100 to-green-100 rounded-2xl overflow-hidden ${className}`}>
      {/* Sun */}
      <motion.div
        className="absolute top-6 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {/* Sun rays */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-6 bg-yellow-300 rounded-full"
            style={{
              top: "50%",
              left: "50%",
              transformOrigin: "center -20px",
              transform: `rotate(${i * 45}deg) translateY(-100%)`,
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </motion.div>

      {/* Clouds */}
      <motion.div
        className="absolute top-8 left-10"
        animate={{ x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Cloud />
      </motion.div>
      <motion.div
        className="absolute top-16 left-1/3"
        animate={{ x: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        <Cloud size="sm" />
      </motion.div>

      {/* Trees in background */}
      <div className="absolute bottom-16 left-8">
        <Tree />
      </div>
      <div className="absolute bottom-16 right-12">
        <Tree />
      </div>
      <div className="absolute bottom-16 left-1/3">
        <Tree size="sm" />
      </div>

      {/* Road */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-600 to-gray-500">
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 flex gap-12 left-0"
          animate={{ x: [0, -150] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(15)].map((_, i) => (
            <div key={i} className="w-16 h-2 bg-yellow-400 rounded-full" />
          ))}
        </motion.div>
      </div>

      {/* Animated Car */}
      <motion.div
        className="absolute bottom-8 w-32"
        initial={{ x: -150 }}
        animate={{ x: ["-20%", "120%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      >
        <CarAnimation />
      </motion.div>
    </div>
  );
}

function Cloud({ size = "md" }: { size?: "sm" | "md" }) {
  const scale = size === "sm" ? 0.6 : 1;
  return (
    <svg width={80 * scale} height={40 * scale} viewBox="0 0 80 40">
      <ellipse cx="25" cy="25" rx="20" ry="15" fill="white" />
      <ellipse cx="45" cy="20" rx="25" ry="18" fill="white" />
      <ellipse cx="65" cy="25" rx="15" ry="12" fill="white" />
    </svg>
  );
}

function Tree({ size = "md" }: { size?: "sm" | "md" }) {
  const scale = size === "sm" ? 0.7 : 1;
  return (
    <svg width={40 * scale} height={60 * scale} viewBox="0 0 40 60">
      <rect x="16" y="40" width="8" height="20" fill="#8B4513" />
      <polygon points="20,0 0,40 40,40" fill="#228B22" />
      <polygon points="20,10 5,35 35,35" fill="#2E8B2E" />
    </svg>
  );
}
