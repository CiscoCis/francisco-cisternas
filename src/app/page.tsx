import { Fragment } from 'react';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import ResearchPublications from '@/components/sections/ResearchPublications';
import Teaching from '@/components/sections/Teaching';
import Service from '@/components/sections/Service';
import Media from '@/components/sections/Media';
import Videos from '@/components/sections/Videos';
import Writing from '@/components/sections/Writing';
import BeyondWork from '@/components/sections/BeyondWork';
import Recommendations from '@/components/sections/Recommendations';
import StayConnected from '@/components/sections/StayConnected';
import Contact from '@/components/sections/Contact';
import { getPublications } from '@/lib/content/publications.server';
import { getGrants } from '@/lib/content/grants.server';
import { getAwards } from '@/lib/content/awards.server';
import { getTalks, getKeynotes } from '@/lib/content/conferences.server';
import { getServiceGroups } from '@/lib/content/service.server';
import { getVisibleTeachingStories } from '@/lib/content/teachingStories.server';
import { getMediaItems } from '@/lib/content/media.server';
import { getVisibleVideos } from '@/lib/content/videos.server';
import { getVisiblePosts } from '@/lib/content/blog.server';
import { getVisibleBeyondWork } from '@/lib/content/beyondWork.server';
import { getRecommendations } from '@/lib/content/recommendations.server';
import { getGuestbookMessages } from '@/lib/content/guestbook.server';
import { getSectionOrder } from '@/lib/content/siteSettings.server';
import type { SectionKey } from '@/lib/content/siteSettings';

// Talks and conferences aren't a section of their own — they're a panel
// inside Research, kept but with reduced prominence.
//
// Body sections render in whatever order content/settings/homepage.json
// specifies (editable in TinaCMS under "Site Layout") — everything below
// is built once here and looked up by key, rather than a fixed JSX
// sequence, so reordering never touches this file again.

export default function Page() {
  const { awardedGrants, inPreparationGrants } = getGrants();

  const sections: Partial<Record<SectionKey, React.ReactNode>> = {
    about: <About />,
    research: (
      <ResearchPublications
        publications={getPublications()}
        awardedGrants={awardedGrants}
        inPreparationGrants={inPreparationGrants}
        awards={getAwards()}
        talks={getTalks()}
        keynotes={getKeynotes()}
      />
    ),
    teaching: <Teaching teachingStories={getVisibleTeachingStories()} />,
    service: <Service serviceGroups={getServiceGroups()} />,
    media: <Media items={getMediaItems()} />,
    videos: <Videos videos={getVisibleVideos()} />,
    writing: <Writing posts={getVisiblePosts()} />,
    beyond: <BeyondWork items={getVisibleBeyondWork()} />,
    recommendations: <Recommendations items={getRecommendations()} />,
    stayConnected: <StayConnected messages={getGuestbookMessages()} />,
    contact: <Contact />,
  };

  return (
    <main id="main">
      <Hero />
      {getSectionOrder().map((key) => (
        <Fragment key={key}>{sections[key]}</Fragment>
      ))}
    </main>
  );
}
