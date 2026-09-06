import ForumSubNav from '@/components/forum/ForumSubNav';

// The single <main id="main"> for every /forum/* route — child pages
// return plain content, not their own <main>, so "Skip to main content"
// and #main both resolve to exactly one element per page.
export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main">
      <ForumSubNav />
      {children}
    </main>
  );
}
