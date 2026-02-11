import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Sparkles, ArrowRight, Package, Zap, Truck, Timer, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { sessionNamespace } from '@/integrations/supabase/client';

const Intro = () => {
  const navigate = useNavigate();
  const { user, userRoles } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Redirect authenticated users to home page
    if (user) {
      if (sessionNamespace === 'admin' && userRoles.includes('admin')) {
        navigate('/admin', { replace: true });
        return;
      }
      if (sessionNamespace === 'vendor' && userRoles.includes('vendor')) {
        navigate('/vendor', { replace: true });
        return;
      }
      if (sessionNamespace === 'user') {
        navigate('/home', { replace: true });
        return;
      }
    }
    
    const timeout = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timeout);
  }, [user, userRoles, navigate]);

  const handleGetStarted = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 overflow-hidden relative">
      {/* Soft Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-24 -left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply blur-2xl opacity-25 animate-blob"></div>
        <div className="absolute top-40 -right-10 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply blur-2xl opacity-25 animate-blob animation-delay-2000"></div>
      </div>

      <div className={`relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        {/* Logo */}
        <div className="mb-8 sm:mb-12 flex items-center gap-3 animate-fade-in">
          <img src="/logo.png" alt="Kash.it" className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain" />
          <span className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
            Kash.it
          </span>
        </div>

        {/* Hero */}
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left - Copy */}
            <div className="text-center lg:text-left space-y-6 sm:space-y-8 order-2 lg:order-1">
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight">
                  <span className="block">Shop Smart,</span>
                  <span className="block bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
                    Live Better
                  </span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
                  Fresh groceries, fair prices, and superfast delivery powered by smart logistics.
                </p>
              </div>

              {/* Feature icons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-2 sm:pt-4">
                <div className="flex flex-col items-center lg:items-start gap-2">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Package className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-600" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-800">Fresh stock</p>
                </div>
                <div className="flex flex-col items-center lg:items-start gap-2">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-sky-100 rounded-full flex items-center justify-center">
                    <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-sky-600" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-800">Fast delivery</p>
                </div>
                <div className="flex flex-col items-center lg:items-start gap-2">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-100 rounded-full flex items-center justify-center">
                    <Timer className="h-6 w-6 sm:h-7 sm:w-7 text-orange-600" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-800">On-time</p>
                </div>
                <div className="flex flex-col items-center lg:items-start gap-2">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-full flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-800">Secure</p>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-2 sm:pt-4">
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-12 py-6 sm:py-7 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    Start shopping
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </Button>
              </div>
            </div>

            {/* Right - Collage */}
            <div className="order-1 lg:order-2 relative">
              <div className="relative w-full h-[400px] sm:h-[500px] md:h-[560px]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-md">
                    {/* Fruits */}
                    <div className="relative group animate-float">
                      <div className="relative bg-white rounded-2xl p-4 sm:p-6 shadow-xl overflow-hidden ring-1 ring-emerald-100">
                        <img 
                          src="/fruits%20and%20vegitables.png" 
                          alt="Fresh Fruits & Vegetables" 
                          className="w-full h-32 sm:h-40 object-cover rounded-lg"
                        />
                        <div className="mt-3 sm:mt-4">
                          <Sparkles className="h-5 w-5 text-emerald-500 mx-auto" />
                        </div>
                      </div>
                    </div>
                    {/* Groceries */}
                    <div className="relative group animate-float-delayed">
                      <div className="relative bg-white rounded-2xl p-4 sm:p-6 shadow-xl overflow-hidden ring-1 ring-sky-100">
                        <img 
                          src="/atta%20rice.png" 
                          alt="Groceries" 
                          className="w-full h-32 sm:h-40 object-cover rounded-lg"
                        />
                        <div className="mt-3 sm:mt-4">
                          <ShoppingBag className="h-5 w-5 text-sky-500 mx-auto" />
                        </div>
                      </div>
                    </div>
                    {/* Bakery */}
                    <div className="relative group animate-float-delayed-2">
                      <div className="relative bg-white rounded-2xl p-4 sm:p-6 shadow-xl overflow-hidden ring-1 ring-emerald-100">
                        <img 
                          src="/bread.png" 
                          alt="Bakery" 
                          className="w-full h-32 sm:h-40 object-cover rounded-lg"
                        />
                        <div className="mt-3 sm:mt-4">
                          <Package className="h-5 w-5 text-green-500 mx-auto" />
                        </div>
                      </div>
                    </div>
                    {/* Drone/IoT Illustration (replaced SVG) */}
                    <div className="relative group animate-float">
                      <div className="relative bg-white rounded-2xl p-3 sm:p-4 shadow-xl overflow-hidden ring-1 ring-purple-100 flex flex-col items-center justify-center">
                        <div className="w-full h-32 sm:h-40 flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg">
                          <img
                            src="/iot.webp"
                            alt="Smart delivery"
                            className="h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                        <div className="mt-3 sm:mt-4">
                          <Truck className="h-5 w-5 text-purple-500 mx-auto" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block animate-bounce">
          <div className="w-6 h-10 border-2 border-emerald-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-emerald-400 rounded-full mt-2 animate-scroll"></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        .animate-blob { animation: blob 10s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float 6s ease-in-out infinite; animation-delay: 1.2s; }
        .animate-float-delayed-2 { animation: float 6s ease-in-out infinite; animation-delay: 2.4s; }
        @keyframes fade-in { from { opacity:0; transform: translateY(16px);} to { opacity:1; transform: translateY(0);} }
        .animate-fade-in { animation: fade-in 0.9s ease-out; }
        @keyframes scroll { 0% { transform: translateY(0); opacity: 1;} 100% { transform: translateY(12px); opacity: 0;} }
        .animate-scroll { animation: scroll 2s infinite; }
      `}</style>
    </div>
  );
};

export default Intro;


