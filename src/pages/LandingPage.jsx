import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import StorySection from "../components/StorySection";
import LeadershipSection from "../components/LeadershipSection";
import WhatWeDo from "../components/WhatWeDo";
import ProgramCards from "../components/ProgramCards";
import ValuesSection from "../components/ValuesSection";
import GetInvolved from "../components/GetInvolved";
import CTAFooter from "../components/CTAFooter";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <StorySection />
        <LeadershipSection />
        <WhatWeDo />
        <ProgramCards />
        <ValuesSection />
        <CTAFooter />
        <GetInvolved />
      </main>
      <Footer />
    </div>
  );
}