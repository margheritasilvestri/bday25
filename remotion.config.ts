import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);
// OpenGL via ANGLE: rende più fluide le trasformazioni 3D (giro della carta).
Config.setChromiumOpenGlRenderer('angle');
// Se hai già Chrome/Chromium installato puoi indicarlo qui per evitare il download:
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
