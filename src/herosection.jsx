import React, { useRef, useState, useEffect } from 'react';
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import heroVideo from './assets/herovideo.mp4';

const HeroSection = () => {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true; // Ensure it's muted before autoplay
      videoRef.current.play().catch((err) => {
        console.log('Autoplay error:', err);
      });
    }
  }, []);

  const handleToggleMute = () => {
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const styles = {
    container: {
      position: 'relative',
      width: '100%',
      height: '85vh',
      overflow: 'hidden',
    },
    video: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      zIndex: -1,
    },
    button: {
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      color: '#fff',
      border: 'none',
      padding: '10px',
      borderRadius: '50%',
      cursor: 'pointer',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
    },
  };

  return (
    <div style={styles.container}>
      <video
        ref={videoRef}
        style={styles.video}
        autoPlay
        loop
        muted
        defaultMuted
        playsInline
        preload="auto"
        src={heroVideo}
      />
      <button
        style={styles.button}
        onClick={handleToggleMute}
        aria-label={isMuted ? 'Unmute video' : 'Mute video'}
      >
        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
      </button>
    </div>
  );
};

export default HeroSection;
