
export default function Footer() {
  return (
    <footer className="border-t border-border-soft bg-panel/30 py-12 mt-12">
      <div className="max-w-[1080px] mx-auto px-7 flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
        <div>
          <div className="font-display font-semibold text-[13px] text-text tracking-wide">
            A Hybrid Deep Learning Approach for Intelligent Intrusion Detection
          </div>
          <div className="font-mono text-[11.5px] text-text-dim mt-1.5 leading-relaxed">
            Vasava Khushi — Nirma University
            <br />
            <span className="opacity-80">Co-authors: Vekariya Poojal, Patel Yug, Patel Vraj</span>
            <br />
            Published: 7th International Conference on Intelligent Autonomous Systems (ICIAS)
          </div>
        </div>
        
        <div className="flex gap-4.5 font-mono text-[12.5px]">
          <a 
            href="conference-paper.pdf" 
            download="A_Hybrid_Deep_Learning_Approach_for_Intelligent_Intrusion_Detection.pdf"
            className="text-text-soft hover:text-signal transition-colors duration-150 flex items-center gap-1"
          >
            Paper (PDF) ↗
          </a>
          <a 
            href="icias-presentation.pptx" 
            download="ICIAS_Presentation.pptx"
            className="text-text-soft hover:text-signal transition-colors duration-150 flex items-center gap-1"
          >
            Slides (PPTX) ↗
          </a>
          <a 
            href="https://github.com/Katch-me/Hybrid-Intrusion-Detection-System-using-CICIDS-2017-Dataset" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-text-soft hover:text-signal transition-colors duration-150 flex items-center gap-1"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
