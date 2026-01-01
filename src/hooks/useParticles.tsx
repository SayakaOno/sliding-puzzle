import {useEffect, useState} from 'react';
import {initParticlesEngine} from '@tsparticles/react';
import {loadFull} from 'tsparticles';
import {loadHeartShape} from '@tsparticles/shape-heart';
import {MoveDirection, type IOutModes} from '@tsparticles/engine';

export const useParticles = () => {
  const [isParticlesLoaded, setIsParticlesLoaded] = useState(false);

  // this should be run only once per application lifetime
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
      await loadHeartShape(engine); // now heart is available

      setIsParticlesLoaded(true);
    });
  }, []);

  return isParticlesLoaded;
};

export const PARTICLE_OPTIONS = {
  fpsLimit: 50,
  fullScreen: {zIndex: 1},
  emitters: [
    {
      position: {x: 50, y: 100},
      rate: {quantity: 100, delay: 0}, // first burst
      life: {count: 1, duration: 0.1}, // only once
    },
    {
      position: {x: 50, y: 100},
      rate: {quantity: 5, delay: 0.15},
    },
  ],
  particles: {
    color: {
      value: [
        '#ff0000ff',
        '#ff8c00ff',
        '#E1FF00',
        '#00ff77ff',
        '#a781ffff',
        'rgba(255, 191, 245, 1)',
        '#000000ff',
        '#ffffffff',
      ],
    },
    move: {
      decay: 0.05,
      direction: MoveDirection.top,
      enable: true,
      gravity: {enable: true},
      outModes: {top: 'none', default: 'destroy'} as IOutModes,
      speed: {min: 50, max: 100},
    },
    number: {value: 0},
    opacity: {value: 1},
    rotate: {
      value: {min: 0, max: 360},
      direction: 'random',
      animation: {enable: true, speed: 30},
    },
    tilt: {
      direction: 'random',
      enable: true,
      value: {min: 0, max: 360},
      animation: {enable: true, speed: 30},
    },
    size: {
      value: {min: 1, max: 10},
      animation: {enable: true, sync: false},
    },
    roll: {
      darken: {enable: true, value: 25},
      enlighten: {enable: true, value: 25},
      enable: true,
      speed: {min: 5, max: 15},
    },
    wobble: {distance: 30, enable: true, speed: {min: -7, max: 7}},
    shape: {type: ['heart', 'square']},
  },
  responsive: [
    {
      maxWidth: 1024,
      options: {particles: {move: {speed: {min: 33, max: 66}}}},
    },
  ],
};
