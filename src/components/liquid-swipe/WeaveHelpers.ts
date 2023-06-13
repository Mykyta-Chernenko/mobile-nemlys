/* eslint-disable indent */
import { Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');

export const initialVertRadius = 82;
export const maxVertRadius = height * 0.9;

export const initialHorRadius = 48;
export const maxHorRadius = width * 0.8;

export const initialSideWidth = 15;

export const initialWaveCenter = height * 0.5;

export const sideWidth = (progress) => {
  'worklet';
  const p1 = 0.2;
  const p2 = 0.8;
  return progress.value <= p1
    ? initialSideWidth
    : progress.value >= p2
    ? width
    : initialSideWidth + ((width - initialSideWidth) * (progress.value - p1)) / (p2 - p1);
};

export const waveVertRadius = (progress) => {
  'worklet';
  const p1 = 0.4;
  return progress.value <= 0
    ? initialVertRadius
    : progress.value >= p1
    ? maxVertRadius
    : initialVertRadius + ((maxVertRadius - initialVertRadius) * progress.value) / p1;
};

const waveHorR = (progress, A, B) => {
  'worklet';
  const p1 = 0.4;
  const t = (progress.value - p1) / (1 - p1);
  const r = 40;
  const m = 9.8;
  const beta = r / (2 * m);
  const k = 50;
  const omega0 = k / m;
  const omega = Math.sqrt(-(beta ** 2) + omega0 ** 2);
  return progress.value <= 0
    ? initialHorRadius
    : progress.value >= 1
    ? 0
    : progress.value <= p1
    ? initialHorRadius + (progress.value / p1) * B
    : A * Math.exp(-beta * t) * Math.cos(omega * t);
};

export const waveHorRadius = (progress) => {
  'worklet';
  return waveHorR(progress, maxHorRadius, maxHorRadius - initialHorRadius);
};

export const waveHorRadiusBack = (progress) => {
  'worklet';
  return waveHorR(progress, 2 * initialHorRadius, initialHorRadius);
};
