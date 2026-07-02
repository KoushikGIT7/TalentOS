import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';

interface LoadingAnimationProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingAnimation({ message = "Loading...", fullScreen = false }: LoadingAnimationProps) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-16 h-16 flex items-center justify-center mb-6">
        {/* Pulsing background circles */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-primary/20"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute inset-2 rounded-full bg-primary/30"
          animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
        
        {/* Core Icon */}
        <motion.div 
          className="relative z-10 w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Briefcase className="text-white" size={24} />
        </motion.div>
      </div>
      
      <motion.p 
        className="text-primary font-medium tracking-wide text-sm uppercase"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {message}
      </motion.p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center items-center py-12">
      {content}
    </div>
  );
}
