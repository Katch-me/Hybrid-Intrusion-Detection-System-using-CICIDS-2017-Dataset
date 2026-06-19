
export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-bg/80 border-b border-border-soft transition-all duration-200">
      <div className="max-w-[1080px] mx-auto px-7 flex items-center justify-between h-[62px]">
        <div className="flex items-center gap-2.5 font-display font-semibold text-[15px] tracking-wide select-none text-text">
          <span className="w-2 h-2 rounded-full bg-safe shadow-[0_0_8px_#3DDC97] animate-pulse-glow" aria-hidden="true" />
          HYBRID-IDS / RF·GRU·LSTM
        </div>
        
        <ul className="hidden md:flex gap-7 list-none">
          <li>
            <a 
              href="#architecture" 
              className="text-text-soft hover:text-text text-[13px] tracking-wide transition-colors duration-200"
            >
              Architecture
            </a>
          </li>
          <li>
            <a 
              href="#playground" 
              className="text-text-soft hover:text-text text-[13px] tracking-wide transition-colors duration-200 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-signal" />
              Testing Playground
            </a>
          </li>
          <li>
            <a 
              href="#results" 
              className="text-text-soft hover:text-text text-[13px] tracking-wide transition-colors duration-200"
            >
              Results
            </a>
          </li>
          <li>
            <a 
              href="#compare" 
              className="text-text-soft hover:text-text text-[13px] tracking-wide transition-colors duration-200"
            >
              Comparison
            </a>
          </li>
          <li>
            <a 
              href="#method" 
              className="text-text-soft hover:text-text text-[13px] tracking-wide transition-colors duration-200"
            >
              Method
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
