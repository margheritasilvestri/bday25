import React from 'react';
import {Composition} from 'remotion';
import {video} from './config';
import {SaveTheDate} from './SaveTheDate';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="SaveTheDateStory"
      component={SaveTheDate}
      durationInFrames={video.durationInSeconds * video.fps}
      fps={video.fps}
      width={video.story.width}
      height={video.story.height}
    />
    <Composition
      id="SaveTheDateSquare"
      component={SaveTheDate}
      durationInFrames={video.durationInSeconds * video.fps}
      fps={video.fps}
      width={video.square.width}
      height={video.square.height}
    />
  </>
);
