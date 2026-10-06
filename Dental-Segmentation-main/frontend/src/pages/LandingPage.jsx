import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import ProblemSection from "../components/landing/ProblemSection";
import SolutionSection from "../components/landing/SolutionSection";
import TechSection from "../components/landing/TechSection";
import ImpactSection from "../components/landing/ImpactSection";
import EthicsSection from "../components/landing/EthicsSection";
import FutureSection from "../components/landing/FutureSection";
import FooterSection from "../components/landing/FooterSection";

function Landing() {
  return (
    <div className="bg-dark-900 min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <TechSection />
        <ImpactSection />
        <EthicsSection />
        <FutureSection />
        <FooterSection />
      </main>
    </div>
  );
}

export default Landing;
