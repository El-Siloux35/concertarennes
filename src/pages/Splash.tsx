import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Splash = () => {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Navigate to home after animation
    const timer = setTimeout(() => {
      setIsAnimating(false);
      navigate("/home");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center transition-all duration-1000"
      style={{
        background: isAnimating 
          ? "linear-gradient(180deg, hsl(27, 100%, 50%) 0%, hsl(259, 75%, 42%) 100%)"
          : "linear-gradient(180deg, hsl(259, 75%, 42%) 0%, hsl(259, 75%, 42%) 100%)"
      }}
    >
      <div className="text-center animate-fade-in">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Concerts à Rennes
        </h1>
      </div>
    </div>
  );
};

export default Splash;
