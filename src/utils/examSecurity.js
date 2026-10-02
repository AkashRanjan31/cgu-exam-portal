// Exam Security Helpers and Fullscreen Utilities

/**
 * Format seconds into mm:ss string
 * @param {number} seconds 
 * @returns {string}
 */
export const formatExamTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Request fullscreen on document element
 */
export const requestFullScreenMode = async () => {
  try {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
      await docEl.requestFullscreen();
      return true;
    } else if (docEl.webkitRequestFullscreen) {
      await docEl.webkitRequestFullscreen();
      return true;
    } else if (docEl.mozRequestFullScreen) {
      await docEl.mozRequestFullScreen();
      return true;
    } else if (docEl.msRequestFullscreen) {
      await docEl.msRequestFullscreen();
      return true;
    }
  } catch (err) {
    console.warn('Fullscreen request denied or not supported:', err);
    return false;
  }
  return false;
};

/**
 * Exit fullscreen mode
 */
export const exitFullScreenMode = async () => {
  try {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
    }
  } catch (err) {
    console.warn('Error exiting fullscreen:', err);
  }
};

/**
 * Check if the document is currently in fullscreen
 */
export const isFullScreenActive = () => {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
};

/**
 * Get violation descriptions according to count
 */
export const getViolationDetails = (violationCount) => {
  if (violationCount === 1) {
    return {
      title: 'Security Warning',
      badge: 'First Warning',
      message: 'Tab switching, window minimization, or leaving fullscreen is not permitted during the examination.',
      subtext: 'This is your first recorded security violation. Further violations will result in automated disqualification.',
      severity: 'warning'
    };
  }
  if (violationCount === 2) {
    return {
      title: 'Final Warning',
      badge: 'Critical Warning',
      message: 'You have switched away from the examination window twice.',
      subtext: 'ONE MORE security violation will immediately and permanently submit your examination.',
      severity: 'danger'
    };
  }
  return {
    title: 'Examination Automatically Submitted',
    badge: 'Disqualified / Auto-Submitted',
    message: 'The maximum limit of 3 security violations was reached.',
    subtext: 'Your examination was submitted automatically and flagged for university administrative review.',
    severity: 'error'
  };
};
