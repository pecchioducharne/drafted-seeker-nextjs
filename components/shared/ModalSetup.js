'use client';

import { useEffect } from 'react';
import ReactModal from 'react-modal';

export default function ModalSetup() {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      ReactModal.setAppElement('#root');
    }
  }, []);

  return null;
}
