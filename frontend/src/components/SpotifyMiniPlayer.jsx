import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Minus, GripHorizontal } from 'lucide-react';

// Spotify Icon
const SpotifyIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

// Vangelis Track ID from user
// Multiple playlists to shuffle between
const SPOTIFY_PLAYLISTS = [
  '37i9dQZF1DX8tYYl2HSCud',
  '37i9dQZF1DWX7suNVq3K4h',
];

const SpotifyMiniPlayer = ({ onClose, onMinimize, isMinimized }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartOffset = useRef({ x: 0, y: 0 });
  const playerRef = useRef(null);

  // Get random playlist on first load
  useEffect(() => {
    setCurrentPlaylistIndex(Math.floor(Math.random() * SPOTIFY_PLAYLISTS.length));
  }, []);

  const nextPlaylist = () => {
    setCurrentPlaylistIndex((prev) => (prev + 1) % SPOTIFY_PLAYLISTS.length);
  };

  // Initialize position - centered bottom
  useEffect(() => {
    const x = Math.max(16, (window.innerWidth - 320) / 2);
    const y = window.innerHeight - 300;
    setPosition({ x, y });
  }, []);

  // Drag handlers
  const handleDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartPos.current = { x: clientX, y: clientY };
    dragStartOffset.current = { x: position.x, y: position.y };
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - dragStartPos.current.x;
    const deltaY = clientY - dragStartPos.current.y;
    const newX = Math.max(8, Math.min(window.innerWidth - 328, dragStartOffset.current.x + deltaX));
    const newY = Math.max(60, Math.min(window.innerHeight - 220, dragStartOffset.current.y + deltaY));
    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Global drag listeners
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMove = (e) => handleDragMove(e);
      const handleGlobalEnd = () => handleDragEnd();
      window.addEventListener('mousemove', handleGlobalMove);
      window.addEventListener('mouseup', handleGlobalEnd);
      window.addEventListener('touchmove', handleGlobalMove, { passive: false });
      window.addEventListener('touchend', handleGlobalEnd);
      return () => {
        window.removeEventListener('mousemove', handleGlobalMove);
        window.removeEventListener('mouseup', handleGlobalEnd);
        window.removeEventListener('touchmove', handleGlobalMove);
        window.removeEventListener('touchend', handleGlobalEnd);
      };
    }
  }, [isDragging]);

  return (
    <>
      {/* The iframe is ALWAYS rendered to keep music playing */}
      {/* When minimized, we just hide the visual container but iframe stays active */}
      <div
        style={{
          position: 'fixed',
          left: isMinimized ? '-9999px' : `${position.x}px`,
          top: isMinimized ? '-9999px' : `${position.y}px`,
          width: '320px',
          zIndex: 9999,
          opacity: isMinimized ? 0 : 1,
          pointerEvents: isMinimized ? 'none' : 'auto',
        }}
      >
        <motion.div
          ref={playerRef}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #191414 0%, #1a1a2e 100%)',
            border: '1px solid rgba(29, 185, 84, 0.3)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(29, 185, 84, 0.2)',
          }}
          data-testid="spotify-mini-player"
        >
          {/* Header - Draggable */}
          <div 
            className="bg-gradient-to-r from-[#1DB954] to-[#1ed760] px-3 py-2 flex items-center justify-between cursor-grab active:cursor-grabbing"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className="flex items-center gap-2">
              <GripHorizontal className="w-4 h-4 text-white/70" />
              <SpotifyIcon className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-bold">Vangelis</span>
            </div>
            <div className="flex items-center gap-1">
              {/* Minimize button - hides player but keeps music playing */}
              <button
                onClick={onMinimize}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Minimize player"
                title="Ελαχιστοποίηση - η μουσική συνεχίζει"
              >
                <Minus className="w-4 h-4 text-white" />
              </button>
              {/* Close button - stops music */}
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Close player"
                title="Κλείσιμο"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Spotify Embed Player - Playlist mode */}
          <div className="p-2">
            <iframe
              title="BabyWish Music"
              src={`https://open.spotify.com/embed/playlist/${SPOTIFY_PLAYLISTS[currentPlaylistIndex]}?utm_source=generator&theme=0`}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ borderRadius: '12px' }}
            />
          </div>

          {/* Footer with next playlist button */}
          <div className="px-3 pb-3 flex items-center justify-between">
            <p className="text-white/40 text-[10px]">
              🎵 BabyWish Music
            </p>
            <button
              onClick={nextPlaylist}
              className="text-white/50 hover:text-white text-[10px] px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              ↻ Next Playlist
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SpotifyMiniPlayer;
