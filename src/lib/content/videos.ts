// Types and pure helpers only — safe to import from client components. The
// fs-reading fetcher lives in videos.server.ts. Videos are hosted on
// YouTube/Vimeo (never uploaded as files into the repo — git handles large
// binaries badly, and GitHub hard-blocks anything over 100MB), so all a
// video document stores is a link; parseVideoEmbed turns that link into
// what's needed to embed a player.

export interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnail?: string;
  date?: string;
}

export type VideoEmbed =
  | { provider: 'youtube'; id: string; embedUrl: string; thumbnailUrl: string }
  | { provider: 'vimeo'; id: string; embedUrl: string; thumbnailUrl?: string };

/** Recognizes youtube.com/watch, youtu.be, and vimeo.com URLs. Returns null for anything else. */
export function parseVideoEmbed(url: string): VideoEmbed | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = u.searchParams.get('v');
      if (!id) return null;
      return {
        provider: 'youtube',
        id,
        embedUrl: `https://www.youtube.com/embed/${id}`,
        thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      };
    }

    if (host === 'youtu.be') {
      const id = u.pathname.slice(1);
      if (!id) return null;
      return {
        provider: 'youtube',
        id,
        embedUrl: `https://www.youtube.com/embed/${id}`,
        thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      };
    }

    if (host === 'vimeo.com') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (!id || !/^\d+$/.test(id)) return null;
      return {
        provider: 'vimeo',
        id,
        embedUrl: `https://player.vimeo.com/video/${id}`,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/** True once at least one video has a URL that can actually be embedded. */
export function hasVideos(videos: Video[]): boolean {
  return videos.some((v) => parseVideoEmbed(v.url) !== null);
}
