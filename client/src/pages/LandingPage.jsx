import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900 font-sans flex flex-col relative overflow-hidden">
      
      {/* 1. Navbar - Super Clean (Only Logo) */}
      <nav className="flex items-center px-6 py-5 md:px-12 relative z-10 bg-white/70 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="text-2xl font-bold tracking-tight cursor-default">
          Codexa <span className="text-orange-500">AI</span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center pt-12 md:pt-20 px-6 relative z-10 text-center">
        
        {/* Main Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 max-w-5xl mx-auto leading-[1.1] mb-10">
          Your intelligent AI-agent <br className="hidden md:block" />
          that understands your entire <br className="hidden md:block" />
          codebase <span className="text-orange-500 font-mono animate-pulse">&lt; /&gt;</span>
        </h1>

        {/* 2. The ONLY "Get started" Button - Centered */}
        <button 
          onClick={handleGetStarted}
          className="mb-12 bg-gray-900 text-white px-10 py-3.5 rounded-full font-semibold flex items-center hover:bg-orange-500 transition-all duration-300 shadow-xl hover:shadow-orange-500/30 text-lg transform hover:-translate-y-1 z-30"
        >
          Get started
        </button>

        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 relative">
          
          {/* Left CTA - Funny Text Only (No Button) */}
          <div className="text-center lg:text-left max-w-sm flex flex-col items-center lg:items-start order-2 lg:order-1 z-20">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700 leading-snug">
              Bugs making you cry..?? <br/>
              Let Codexa write the code while you pretend to work !
            </h2>
          </div>

          {/* Center Graphic - FIXED AND BLENDED */}
          <div className="relative w-full max-w-[280px] h-[300px] md:max-w-[400px] md:h-[450px] shrink-0 order-1 lg:order-2 flex items-center justify-center">
            {/* Soft glowing background behind the robot */}
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-400/20 via-orange-300/10 to-transparent blur-3xl rounded-full"></div>
            
            <div className="relative z-10 w-full h-full flex items-center justify-center transition-transform hover:scale-105 duration-500">
               <img 
                 src="/robot.png" 
                 alt="Codexa AI Robot" 
                 // mix-blend-multiply makes white backgrounds transparent, drop-shadow adds a 3D feel
                 className="w-full h-full object-contain mix-blend-multiply drop-shadow-2xl" 
               />
            </div>
          </div>

          {/* Right Text */}
          <div className="text-center lg:text-right max-w-xs flex flex-col items-center lg:items-end order-3 lg:order-3 z-20">
            <p className="text-gray-500 font-medium text-lg leading-relaxed bg-white/50 p-6 rounded-3xl shadow-sm backdrop-blur-sm border border-gray-50">
              <span className="font-bold text-gray-900 block mb-2 text-xl">Build / Debug / Review</span>
              any code and turn your ideas directly into real products.
            </p>
          </div>
        </div>

        {/* 3. Your Tag - Moved to the bottom */}
        <div className="mt-16 mb-8 text-orange-500 font-mono text-sm tracking-wider font-semibold opacity-80">
          @Soumya || 2026
        </div>

      </main>
      
    </div>
  );
};

export default LandingPage;