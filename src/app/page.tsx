import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import ResearchPublications from '@/components/sections/ResearchPublications';
import Teaching from '@/components/sections/Teaching';
import Service from '@/components/sections/Service';
import Media from '@/components/sections/Media';
import Writing from '@/components/sections/Writing';
import BeyondWork from '@/components/sections/BeyondWork';
import Contact from '@/components/sections/Contact';

// Talks and conferences aren't a section of their own — they're a panel
// inside Research, kept but with reduced prominence.

export default function Page() {
  return (
    <main id="main">
      <Hero />
      <About />
      <ResearchPublications />
      <Teaching />
      <Service />
      <Media />
      <Writing />
      <BeyondWork />
      <Contact />
    </main>
  );
}
