import Navbar from './components/Navbar';
import PipelineHero from './components/PipelineHero';
import StatsStrip from './components/StatsStrip';
import ArchitectureCards from './components/ArchitectureCards';
import InteractivePlayground from './components/InteractivePlayground';
import ResultsExplorer from './components/ResultsExplorer';
import ComparisonTable from './components/ComparisonTable';
import Methodology from './components/Methodology';
import ConclusionTakeaways from './components/ConclusionTakeaways';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="relative min-h-screen font-sans selection:bg-signal selection:text-[#04101f]">
      {/* Dynamic Grid Background Backdrop */}
      <div className="grid-bg" aria-hidden="true" />
      
      {/* Sticky Header Nav */}
      <Navbar />
      
      {/* Hero Header with simulation */}
      <PipelineHero />
      
      {/* Stats Summary Strip */}
      <StatsStrip />
      
      <hr className="border-border-soft max-w-[1080px] mx-auto my-0" />
      
      {/* Architecture Cards Section */}
      <ArchitectureCards />
      
      <hr className="border-border-soft max-w-[1080px] mx-auto my-0" />
      
      {/* Interactive Testing Sandbox (Playground) */}
      <InteractivePlayground />
      
      <hr className="border-border-soft max-w-[1080px] mx-auto my-0" />
      
      {/* Results Explorer (Attack Breakdowns) */}
      <ResultsExplorer />
      
      <hr className="border-border-soft max-w-[1080px] mx-auto my-0" />
      
      {/* Comparison Table vs Published Works */}
      <ComparisonTable />
      
      <hr className="border-border-soft max-w-[1080px] mx-auto my-0" />
      
      {/* Mathematical Methodology (Collapsible equations) */}
      <Methodology />
      
      <hr className="border-border-soft max-w-[1080px] mx-auto my-0" />
      
      {/* Takeaways & Future Directions */}
      <ConclusionTakeaways />
      
      {/* Copyrights, Author names and downloads */}
      <Footer />
    </div>
  );
}
