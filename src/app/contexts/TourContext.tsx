import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

// ── Tour Step Definition ──────────────────────────────────────────────────────
export interface TourStep {
  id: string;
  page: 'home' | 'login' | 'wardrobe' | 'randomizer' | 'event-planner';
  selector?: string;          // CSS selector to highlight; null = center modal
  title: string;
  description: string;
  arrowDirection?: 'up' | 'down' | 'left' | 'right';
  scrollTo?: string;          // selector to scroll into view before showing
  waitForAction?: boolean;    // if true, shows "Got It" button
  navigateTo?: string;        // Navigate to this path after this step
  nextOnGotIt?: boolean;      // if true, clicking "Got It" advances step (instead of hiding tooltip)
  invisible?: boolean;        // if true, entire TourOverlay renders absolutely nothing
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'; // tooltip position
}

// ── All Tour Steps ────────────────────────────────────────────────────────────
export const TOUR_STEPS: TourStep[] = [
  // ── Homepage ──
  {
    id: 'welcome',
    page: 'home',
    title: '👋 Welcome to Let\'s Dress!',
    description: 'Let me give you a quick tour of everything this app can do. You\'ll be planning outfits like a pro in no time!',
    position: 'center',
  },
  {
    id: 'home-hero',
    page: 'home',
    selector: '#hero-section',
    title: '🏠 Your Digital Wardrobe',
    description: 'This is your home — a place to organize, plan, and style your entire wardrobe without the morning chaos.',
    arrowDirection: 'up',
    position: 'bottom',
  },
  {
    id: 'home-story',
    page: 'home',
    selector: '#our-story',
    title: '📖 Our Story',
    description: 'We built Let\'s Dress to save you those precious morning minutes. Real people save up to 30 minutes a day!',
    scrollTo: '#our-story',
    arrowDirection: 'up',
    position: 'bottom',
  },
  {
    id: 'home-trends',
    page: 'home',
    selector: '#trends',
    title: '✨ Trends & Styles',
    description: 'Explore curated fashion styles — from classic elegance to modern streetwear. Your wardrobe, your rules.',
    scrollTo: '#trends',
    arrowDirection: 'up',
    position: 'bottom',
  },
  {
    id: 'home-why',
    page: 'home',
    selector: '#why-lets-dress',
    title: '💡 Why Let\'s Dress?',
    description: 'Save time, stay organized, maximize your wardrobe — and even see your outfits on a virtual avatar. All from your phone!',
    scrollTo: '#why-lets-dress',
    arrowDirection: 'up',
    position: 'bottom',
  },
  {
    id: 'home-cta',
    page: 'home',
    selector: '#tour-get-started',
    title: '🚀 Ready to Start?',
    description: 'Click this button to dive in! If you are new, it will take you to sign up. If you are already logged in, it will take you straight to your Wardrobe.',
    scrollTo: '#tour-get-started',
    arrowDirection: 'down',
    position: 'top',
    waitForAction: true,
    nextOnGotIt: false,   // hide dialog but keep highlight; user must click the button
  },

  // ── Login Page ──
  {
    id: 'login-welcome',
    page: 'login',
    title: '🔐 Sign In or Sign Up',
    description: 'Welcome back! Use "Sign In" to access your wardrobe. If you\'re new here, click "Sign Up" to create your free account and let\'s get started!',
    selector: '#tour-login-tabs',
    arrowDirection: 'up',
    position: 'bottom',
    waitForAction: true,
    // nextOnGotIt intentionally absent — Got It calls nextStep() which goes to login-idle (invisible)
  },
  {
    id: 'login-idle',
    page: 'login',
    title: '',
    description: '',
    invisible: true,
  },
  {
    id: 'login-signup-fill',
    page: 'login',
    title: '✍️ Enter Your Details',
    description: 'Fill in your sign-up details below. We use this to personalize your virtual try-on avatar!',
    selector: '#tour-signup-form',
    scrollTo: '#tour-signup-form',
    position: 'bottom',
    arrowDirection: 'up',
    waitForAction: true,
  },
  {
    id: 'login-signup-idle',
    page: 'login',
    title: '',
    description: '',
    invisible: true,
  },

  // ── Wardrobe Page ──
  {
    id: 'wardrobe-welcome',
    page: 'wardrobe',
    title: '👗 Your Wardrobe',
    description: 'This is your digital wardrobe — where every outfit lives. Let\'s add your first item!',
    position: 'center',
  },
  {
    id: 'wardrobe-upload',
    page: 'wardrobe',
    selector: '#tour-upload-btn',
    title: '📸 Upload Your First Outfit',
    description: 'Click "Upload" to add a clothing item. You can upload a photo from your gallery or take a picture with your camera!',
    arrowDirection: 'down',
    position: 'top',
    waitForAction: true,
    nextOnGotIt: false,   // user must actually click the upload button
  },
  {
    id: 'wardrobe-color',
    page: 'wardrobe',
    selector: '#tour-color-picker',
    title: '🎨 Pick the Color',
    description: 'Drag the eyedropper pin onto your clothing to detect its exact color. This helps us match outfits intelligently!',
    arrowDirection: 'down',
    position: 'top',
  },
  {
    id: 'wardrobe-type',
    page: 'wardrobe',
    selector: '#tour-dress-type',
    title: '👚 Select Dress Type',
    description: 'Choose whether this item is a Top, Bottom, Footwear or Accessory. This is how we build complete outfit combinations.',
    arrowDirection: 'up',
    position: 'bottom',
  },
  {
    id: 'wardrobe-occasion',
    page: 'wardrobe',
    selector: '#tour-occasions',
    title: '🎉 Select Occasion',
    description: 'Pick the occasions this item works for — Casual, Office, Sports etc. The randomizer will use this to suggest the right outfit!',
    arrowDirection: 'up',
    position: 'bottom',
    waitForAction: true,
    nextOnGotIt: false,
  },
  {
    id: 'wardrobe-reminder',
    page: 'wardrobe',
    title: '📋 Upload At Least These',
    description: 'To unlock the full Outfit Randomizer, please upload at least:\n\n✅ 1 Top\n✅ 1 Bottom\n✅ 1 pair of Footwear\n\nThe more you add, the better your daily outfits will be!',
    position: 'center',
    waitForAction: true,
  },
  {
    id: 'nav-randomizer',
    page: 'wardrobe',
    selector: '#nav-randomizer',
    title: '👗 Time to Randomize!',
    description: 'You\'ve got enough items! Click the "Randomizer" tab in the navigation menu to generate your first outfit.',
    arrowDirection: 'up',
    position: 'bottom',
    waitForAction: true,
    nextOnGotIt: false,
  },

  // ── Randomizer Page ──
  {
    id: 'randomizer-welcome',
    page: 'randomizer',
    title: '🎲 Outfit Randomizer',
    description: 'This is the magic! The randomizer picks intelligent outfit combinations from your wardrobe, making sure colors match and nothing repeats.',
    position: 'center',
  },
  {
    id: 'randomizer-planner',
    page: 'randomizer',
    selector: '#tour-weekly-planner',
    title: '📅 Weekly Planner',
    description: 'You can see your week laid out here. Tick a day to plan an outfit for it — past days are greyed out.',
    scrollTo: '#tour-weekly-planner',
    arrowDirection: 'up',
    position: 'bottom',
  },
  {
    id: 'randomizer-tick',
    page: 'randomizer',
    selector: '#tour-today-day',
    title: '☑️ Tick Today',
    description: 'Click the checkbox on today\'s card to select it. Then you can randomize an outfit for that day!',
    arrowDirection: 'down',
    position: 'top',
    waitForAction: true,
    nextOnGotIt: false,
  },
  {
    id: 'randomizer-button',
    page: 'randomizer',
    selector: '#tour-randomize-btn',
    title: '🔀 Randomize Your Outfit!',
    description: 'Hit this button to generate a perfect outfit for your selected day. Watch it spin!',
    scrollTo: '#tour-randomize-btn',
    arrowDirection: 'up',
    position: 'bottom',
    waitForAction: true,
    nextOnGotIt: false,
  },
  {
    id: 'randomizer-avatar',
    page: 'randomizer',
    selector: '#tour-tryon-btn',
    title: '🪞 Generate Try-On Avatar',
    description: 'After generating an outfit, you can see it on a virtual avatar dressed in your actual clothes! Click "Generate Try-On Avatar" to try it.',
    scrollTo: '#tour-tryon-btn',
    arrowDirection: 'up',
    position: 'bottom',
    waitForAction: true,
    nextOnGotIt: false,
  },
  {
    id: 'nav-event-planner',
    page: 'randomizer',
    selector: '#nav-event-planner',
    title: '📅 Plan Your Events',
    description: 'Awesome! Now, let\'s see how you can schedule outfits for upcoming events. Click the "Event Planner" tab in the navigation menu!',
    arrowDirection: 'up',
    position: 'bottom',
    waitForAction: true,
    nextOnGotIt: false,
  },

  // ── Event Planner Page ──
  {
    id: 'event-welcome',
    page: 'event-planner',
    title: '📆 Event Planner',
    description: 'Got a special occasion coming up? Add it to your calendar and we\'ll suggest appropriate outfits when you randomize!',
    position: 'center',
  },
  {
    id: 'event-calendar',
    page: 'event-planner',
    selector: '#tour-calendar',
    title: '📅 Click Any Future Date',
    description: 'Click on any upcoming date in the calendar to add an event. Past dates are disabled.',
    arrowDirection: 'up',
    position: 'bottom',
    waitForAction: true,
    nextOnGotIt: false,
  },
  {
    id: 'event-title',
    page: 'event-planner',
    selector: '#tour-event-title',
    title: '✍️ Name Your Event',
    description: 'Enter the event name — like "Job Interview", "Date Night", or "Beach Day".',
    arrowDirection: 'up',
    position: 'bottom',
  },
  {
    id: 'event-dress-type',
    page: 'event-planner',
    selector: '#tour-event-dress-type',
    title: '👔 Pick a Dress Type',
    description: 'Select the dress code for your event. The randomizer will then suggest outfits that match!',
    arrowDirection: 'up',
    position: 'bottom',
    waitForAction: true,
    nextOnGotIt: false,
  },
  {
    id: 'tour-complete',
    page: 'event-planner',
    title: '🎉 You\'re All Set!',
    description: 'Amazing! You\'ve completed the Let\'s Dress tour. You now know how to:\n\n✅ Upload your wardrobe\n✅ Randomize daily outfits\n✅ See outfits on your avatar\n✅ Plan outfits for events\n\nHappy dressing! 👗',
    position: 'center',
  },
];

// ── Context Type ──────────────────────────────────────────────────────────────
interface TourContextType {
  isTourActive: boolean;
  currentStepIndex: number;
  currentStep: TourStep | null;
  totalSteps: number;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  goToStep: (index: number) => void;
  advanceIfOnStep: (stepId: string) => void;
  tourCompleted: boolean;
  /** Called by LoginPage when user switches to the sign-up tab during the tour */
  notifySignupTabActive: () => void;
  /** Called by LoginPage when user switches back to sign-in tab during the tour */
  notifySigninTabActive: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const STORAGE_KEY = 'ld_tour_done';

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tourCompleted, setTourCompleted] = useState(false);

  // Check if tour was completed on this device
  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (done === '1') setTourCompleted(true);
  }, []);

  // Also check server-side completion (account-level)
  useEffect(() => {
    fetch('/api/tour-status')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.completed) {
          setTourCompleted(true);
          localStorage.setItem(STORAGE_KEY, '1');
        }
      })
      .catch(() => {/* server not available, use localStorage */});
  }, []);

  const markTourDone = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, '1');
    setTourCompleted(true);
    // Persist to server (best-effort)
    fetch('/api/tour-completed', { method: 'POST' }).catch(() => {});
  }, []);

  const startTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsTourActive(true);
  }, []);

  const nextStep = useCallback(() => {
    const currentStep = TOUR_STEPS[currentStepIndex];

    if (currentStep?.navigateTo) {
      // Navigate to next page; the target page will pick up where we left off
      markTourDone(); // only mark done if it's truly the last step
      // But for navigation mid-tour we store the step in sessionStorage
      sessionStorage.setItem('ld_tour_step', String(currentStepIndex + 1));
      setIsTourActive(false);
      window.location.href = currentStep.navigateTo;
      return;
    }

    if (currentStepIndex >= TOUR_STEPS.length - 1) {
      // Last step — mark complete
      markTourDone();
      setIsTourActive(false);
      return;
    }

    // Check if the next step is on a different page — if so it must be via navigateTo
    const nextStepDef = TOUR_STEPS[currentStepIndex + 1];
    const currentPage = currentStep?.page;
    if (nextStepDef && nextStepDef.page !== currentPage) {
      // We'd need a navigateTo; skip to end  
      setCurrentStepIndex(prev => prev + 1);
      return;
    }

    setCurrentStepIndex(prev => prev + 1);
  }, [currentStepIndex, markTourDone]);

  const prevStep = useCallback(() => {
    setCurrentStepIndex(prev => Math.max(0, prev - 1));
  }, []);

  const skipTour = useCallback(() => {
    markTourDone();
    setIsTourActive(false);
  }, [markTourDone]);

  const goToStep = useCallback((index: number) => {
    setCurrentStepIndex(index);
    setIsTourActive(true);
  }, []);

  const advanceIfOnStep = useCallback((stepId: string) => {
    if (isTourActive && TOUR_STEPS[currentStepIndex]?.id === stepId) {
      nextStep();
    }
  }, [isTourActive, currentStepIndex, nextStep]);

  /**
   * Called by LoginPage when the user switches to the Sign-Up tab.
   * If we're on the `login-welcome` or `login-idle` step, jump to `login-signup-fill`.
   */
  const notifySignupTabActive = useCallback(() => {
    if (!isTourActive) return;
    const currentId = TOUR_STEPS[currentStepIndex]?.id;
    if (currentId === 'login-welcome' || currentId === 'login-idle') {
      const target = TOUR_STEPS.findIndex(s => s.id === 'login-signup-fill');
      if (target !== -1) setCurrentStepIndex(target);
    }
  }, [isTourActive, currentStepIndex]);

  /**
   * Called by LoginPage when the user switches back to the Sign-In tab.
   * If we're on `login-signup-fill`, go back to `login-idle` (highlight hidden).
   */
  const notifySigninTabActive = useCallback(() => {
    if (!isTourActive) return;
    const currentId = TOUR_STEPS[currentStepIndex]?.id;
    if (currentId === 'login-signup-fill' || currentId === 'login-signup-idle') {
      const target = TOUR_STEPS.findIndex(s => s.id === 'login-idle');
      if (target !== -1) setCurrentStepIndex(target);
    }
  }, [isTourActive, currentStepIndex]);

  // Resume tour from sessionStorage on page load (after navigation)
  useEffect(() => {
    const storedStep = sessionStorage.getItem('ld_tour_step');
    if (storedStep !== null) {
      const stepIndex = parseInt(storedStep, 10);
      sessionStorage.removeItem('ld_tour_step');
      if (!isNaN(stepIndex) && stepIndex < TOUR_STEPS.length) {
        const done = localStorage.getItem(STORAGE_KEY);
        if (done !== '1') {
          // Small delay to let page render
          setTimeout(() => {
            setCurrentStepIndex(stepIndex);
            setIsTourActive(true);
          }, 800);
        }
      }
    }
  }, []);

  const currentStep = isTourActive ? (TOUR_STEPS[currentStepIndex] ?? null) : null;

  return (
    <TourContext.Provider value={{
      isTourActive,
      currentStepIndex,
      currentStep,
      totalSteps: TOUR_STEPS.length,
      startTour,
      nextStep,
      prevStep,
      skipTour,
      goToStep,
      advanceIfOnStep,
      tourCompleted,
      notifySignupTabActive,
      notifySigninTabActive,
    }}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used within TourProvider');
  return ctx;
}
