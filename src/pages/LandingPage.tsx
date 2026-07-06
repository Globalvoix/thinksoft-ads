import { ChevronDown, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black relative text-white font-sans overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=2550")',
          filter: 'brightness(0.55)'
        }}
      >
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="px-6 py-5 flex items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2 mr-8">
              <svg viewBox="0 0 100 114" className="w-[30px] h-[34px]" xmlns="http://www.w3.org/2000/svg">
                <path fill="#95BF47" d="M88.756 29.351L74.873 6.945A6.974 6.974 0 0 0 68.932 3.51H31.066a6.974 6.974 0 0 0-5.94 3.435L11.243 29.351c-2.616 4.167-3.957 8.924-3.957 13.824v50.211c0 7.828 6.346 14.175 14.175 14.175h57.078c7.829 0 14.175-6.347 14.175-14.175V43.175c0-4.9-1.34-9.657-3.958-13.824z"/>
                <path fill="#FFF" d="M68.32 63.805c-3.791 1.632-8.528 2.656-14.887 2.656-6.36 0-11.455-1.574-14.502-4.492-3.048-2.916-4.661-7.143-4.661-12.228 0-6.126 2.302-10.878 6.64-13.793 4.339-2.915 9.682-4.433 15.485-4.433 5.305 0 9.885 1.051 13.255 3.033L67 40.54c-2.474-1.341-5.733-2.1-9.421-2.1-3.69 0-6.721.846-8.75 2.45-2.027 1.604-3.138 3.821-3.138 6.388 0 2.566 1.037 4.549 3.003 5.746 1.966 1.196 5.228 2.304 9.422 3.208 5.42 1.167 9.497 2.916 11.79 5.074 2.292 2.158 3.535 5.511 3.535 9.71 0 6.124-2.257 10.993-6.522 14.113C62.652 68.248 57.195 70 50.548 70c-6.88 0-12.71-1.341-16.852-3.85L36.32 58.62c3.551 2.217 8.353 3.442 13.882 3.442 4.34 0 7.742-.904 9.83-2.624 2.087-1.721 3.197-4.112 3.197-6.882 0-2.566-1.008-4.666-2.915-6.094-1.908-1.43-5.263-2.713-9.711-3.733-4.99-.991-8.736-2.653-10.835-4.81-2.098-2.159-3.237-5.366-3.237-9.303 0-5.424 2.228-9.827 6.44-12.744 4.213-2.917 9.886-4.434 16.402-4.434 5.922 0 11.233 1.05 15.367 3.033l-2.624 5.952z"/>
              </svg>
              <span className="text-2xl font-bold tracking-tight mt-1">Thinksoft</span>
            </a>

            <nav className="hidden lg:flex items-center space-x-7 text-[15px] font-medium">
              <button className="flex items-center hover:text-gray-300 transition-colors">
                Why Thinksoft <ChevronDown className="ml-1.5 w-4 h-4 stroke-[2.5]" />
              </button>
              <button className="flex items-center hover:text-gray-300 transition-colors">
                Products <ChevronDown className="ml-1.5 w-4 h-4 stroke-[2.5]" />
              </button>
              <a href="#" className="hover:text-gray-300 transition-colors">Pricing</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Enterprise</a>
            </nav>
          </div>

          <div className="hidden lg:flex items-center space-x-6 text-[15px] font-medium">
            <button
              onClick={() => navigate('/auth')}
              className="hover:text-gray-300 transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="px-5 py-2.5 bg-white text-black rounded-full hover:bg-gray-100 transition-colors font-semibold"
            >
              Start for free
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center px-6 lg:px-20 mt-[-40px]">
          <div className="max-w-[700px]">
            <h1 className="text-[5rem] lg:text-[6.5rem] font-medium leading-[1.05] tracking-tight mb-6">
              Be the next<br/>big thing
            </h1>
            <p className="text-xl lg:text-[1.35rem] mb-10 text-white font-medium max-w-lg leading-[1.4]">
              Dream big and build fast on Thinksoft.<br/>
              The world's best ads platform.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => navigate('/auth')}
                className="px-8 py-4 bg-white text-black rounded-full hover:bg-gray-100 transition-colors text-[17px] font-semibold w-full sm:w-auto text-center"
              >
                Get started
              </button>
              <button className="flex items-center justify-center px-6 py-3.5 rounded-full border border-white hover:bg-white/10 transition-colors backdrop-blur-sm text-[17px] font-semibold w-full sm:w-auto">
                <Play className="w-5 h-5 mr-2.5 fill-current" />
                Why Thinksoft Ads
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
