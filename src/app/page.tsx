import { CourseCarousel } from "@/components/sections/CourseCarousel";
import { DispatchFeed } from "@/components/sections/DispatchFeed";
import { EnrollCTA } from "@/components/sections/EnrollCTA";
import { Hero } from "@/components/sections/Hero";
import { ProgramSpotlight } from "@/components/sections/ProgramSpotlight";
import { StatFloatingSection } from "@/components/sections/StatFloatingSection";
import { Testimonials } from "@/components/sections/Testimonials";
import { ToolsShowcase } from "@/components/sections/ToolsShowcase";
import { WhyGenValue } from "@/components/sections/WhyGenValue";

export default function Home() {
  return (
    <>
      <Hero />
      <DispatchFeed />
      <ProgramSpotlight />
      <WhyGenValue />
      <CourseCarousel />
      <StatFloatingSection />
      <ToolsShowcase />
      <Testimonials />
      <EnrollCTA />
    </>
  );
}
