import { Wind } from "lucide-react";

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 flex flex-col items-center justify-center z-50 text-white">
      
      {/* POP-UP ICON */}
      <div className="animate-pop">
        <Wind size={80} />
      </div>

      {/* APP NAME */}
      <h1 className="text-4xl font-black mt-6 tracking-wide animate-pop delay-150">
        AeroWatch
      </h1>

      {/* TAGLINE */}
      <p className="text-sm opacity-90 mt-2 animate-pop delay-300">
        AI Air Quality Intelligence
      </p>

      {/* LOADING BAR */}
      <div className="mt-8 w-40 h-1 bg-white/30 rounded-full overflow-hidden">
        <div className="h-full bg-white animate-loading"></div>
      </div>
    </div>
  );
};

export default SplashScreen;