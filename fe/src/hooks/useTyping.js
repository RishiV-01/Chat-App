import { useRef, useCallback } from 'react';
import { emitEvent } from '../socket/socketManager';
import { TYPING_TIMEOUT } from '../config/constants';

export default function useTyping(opportunityId) {
  const isTyping = useRef(false);
  const timeoutRef = useRef(null);

  const startTyping = useCallback(() => {
    if (!opportunityId) return;

    if (!isTyping.current) {
      isTyping.current = true;
      emitEvent('typing_start', { opportunityId });
    }

    // Reset idle timer
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      stopTyping();
    }, TYPING_TIMEOUT);
  }, [opportunityId]);

  const stopTyping = useCallback(() => {
    if (!opportunityId) return;

    if (isTyping.current) {
      isTyping.current = false;
      emitEvent('typing_stop', { opportunityId });
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [opportunityId]);

  return { startTyping, stopTyping };
}
