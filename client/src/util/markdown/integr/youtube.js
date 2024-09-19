import React, { useState } from 'react';

const Youtube = ({ url }) => {
  const [isPlaying, setIsPlaying] = useState(1);

  if (!url) {
    return <div className='warn'>Error: No URL provided</div>;
  }
  const videoId = url.split('v=')[1];
  if (!videoId) {
    return <div className='warn' style={{paddingTop:'10px',paddingBottom:'10px'}}>Error: Invalid YouTube URL</div>;
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto' }}>
      <div className='iframe-parent'>
        {!isPlaying ? (<div style={{backgroundImage:`url(${thumbnailUrl})`}} className='thumbnail-ytb' onClick={handlePlay}>
            <div className='youtube-parent'><div/></div></div>) : (
            <iframe
                src={embedUrl}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                frameBorder={0}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube video player"
          />
        )}
      </div>
    </div>
  )
};

export default Youtube;