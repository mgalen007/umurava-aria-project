declare module 'react-joyride' {
  import type { ComponentType, ReactNode } from 'react';

  export type Step = {
    target: string;
    content: ReactNode;
    placement?: string;
    disableBeacon?: boolean;
    hideCloseButton?: boolean;
  };

  export type CallBackProps = {
    status?: string;
    type?: string;
    action?: string;
    index: number;
  };

  export const STATUS: {
    FINISHED: string;
    SKIPPED: string;
  };

  export const EVENTS: {
    STEP_AFTER: string;
    TARGET_NOT_FOUND: string;
  };

  export const ACTIONS: {
    NEXT: string;
    PREV: string;
  };

  const Joyride: ComponentType<Record<string, unknown>>;
  export default Joyride;
}
