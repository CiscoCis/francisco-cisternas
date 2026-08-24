import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import ResearchPublications from '@/components/sections/ResearchPublications';
import Teaching from '@/components/sections/Teaching';
import Service from '@/components/sections/Service';
import Media from '@/components/sections/Media';
import Writing from '@/components/sections/Writing';
import BeyondWork from '@/components/sections/BeyondWork';
import Contact from '@/components/sections/Contact';
import { getPublications } from '@/lib/content/publications.server';
import { getGrants } from '@/lib/content/grants.server';
import { getAwards } from '@/lib/content/awards.server';
import { getTalks, getKeynotes } from '@/lib/content/conferences.server';
import { getServiceGroups } from '@/lib/content/service.server';
import { getVisibleTeachingStories } from '@/lib/content/teachingStories.server';
import { getMediaItems } from '@/lib/content/media.server';
import { getVisiblePosts } from '@/lib/content/blog.server';

// Talks and conferences aren't a section of their own — they're a panel
// inside Research, kept but with reduced prominence.

export default function Page() {
  const { awardedGrants, inPreparationGrants } = getGrants();

  return (
    <main id="main">
      <Hero />
      <About />
      <ResearchPublications
        publications={getPublications()}
        awardedGrants={awardedGrants}
        inPreparationGrants={inPreparationGrants}
        awards={getAwards()}
        talks={getTalks()}
        keynotes={getKeynotes()}
      />
      <Teaching teachingStories={getVisibleTeachingStories()} />
      <Service serviceGroups={getServiceGroups()} />
      <Media items={getMediaItems()} />
      <Writing posts={getVisiblePosts()} />
      <BeyondWork />
      <Contact />
    </main>
  );
}
