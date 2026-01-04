import {useMemo, type RefObject} from 'react';
import Modal from 'react-modal';
import Particles from '@tsparticles/react';
import {PARTICLE_OPTIONS, useParticles} from './useParticles';
import '../../App.css';

interface GameSuccessViewProps {
  contentRef: RefObject<HTMLDivElement | null>;
  handleRestart: () => void;
  timer: number | null;
}

export default function GameSuccessView({
  contentRef,
  handleRestart,
  timer,
}: GameSuccessViewProps) {
  const isParticlesLoaded = useParticles();

  const animation = useMemo(
    () =>
      isParticlesLoaded && (
        <Particles id="tsparticles" options={PARTICLE_OPTIONS} />
      ),
    [isParticlesLoaded]
  );

  return (
    <>
      {animation}
      <Modal
        className="success-modal"
        isOpen={timer !== null}
        contentLabel="Success Modal"
        appElement={contentRef.current || undefined}
      >
        <div className="success-message">
          <h2>Congratulations!</h2>
          <p>You completed in {Math.round(timer! / 1000)} seconds!</p>
          <button onClick={handleRestart}>Restart</button>
        </div>
      </Modal>
    </>
  );
}
