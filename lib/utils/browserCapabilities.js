/**
 * Browser Capabilities Utility
 * Checks for screen recording support and provides fallback options
 */

export const checkScreenRecordingSupport = () => {
  // Check if getDisplayMedia is supported
  if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    return {
      supported: false,
      reason: 'browser_unsupported',
      message: 'Your browser doesn\'t support screen recording yet. Try Chrome or Firefox for the best experience!',
      fallback: 'use_modern_browser'
    };
  }

  // Check if we're on a very old browser
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Safari has limited support
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    const safariVersion = userAgent.match(/version\/(\d+)/)?.[1];
    if (safariVersion && parseInt(safariVersion) < 13) {
      return {
        supported: false,
        reason: 'safari_too_old',
        message: 'Your Safari version doesn\'t support screen recording. Please update Safari or try Chrome/Firefox!',
        fallback: 'update_browser'
      };
    }
    
    // Even newer Safari has limitations
    return {
      supported: true,
      limited: true,
      reason: 'safari_limitations',
      message: 'Safari has limited screen recording support. For best results, we recommend using Chrome or Firefox.',
      fallback: 'safari_works_but_limited'
    };
  }

  // Check Chrome version
  if (userAgent.includes('chrome')) {
    const chromeVersion = userAgent.match(/chrome\/(\d+)/)?.[1];
    if (chromeVersion && parseInt(chromeVersion) < 72) {
      return {
        supported: false,
        reason: 'chrome_too_old',
        message: 'Your Chrome version doesn\'t support screen recording. Please update Chrome!',
        fallback: 'update_browser'
      };
    }
  }

  // Check Firefox version
  if (userAgent.includes('firefox')) {
    const firefoxVersion = userAgent.match(/firefox\/(\d+)/)?.[1];
    if (firefoxVersion && parseInt(firefoxVersion) < 66) {
      return {
        supported: false,
        reason: 'firefox_too_old',
        message: 'Your Firefox version doesn\'t support screen recording. Please update Firefox!',
        fallback: 'update_browser'
      };
    }
  }

  // All checks passed
  return {
    supported: true,
    limited: false,
    message: 'Your browser supports screen recording!',
    fallback: null
  };
};

export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';

  if (userAgent.includes('chrome') && !userAgent.includes('edge')) {
    browserName = 'Chrome';
    browserVersion = userAgent.match(/chrome\/(\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('firefox')) {
    browserName = 'Firefox';
    browserVersion = userAgent.match(/firefox\/(\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    browserName = 'Safari';
    browserVersion = userAgent.match(/version\/(\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('edge') || userAgent.includes('edg')) {
    browserName = 'Edge';
    browserVersion = userAgent.match(/edg\/(\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('opera') || userAgent.includes('opr')) {
    browserName = 'Opera';
    browserVersion = userAgent.match(/(?:opera|opr)\/(\d+)/)?.[1] || 'Unknown';
  }

  return {
    name: browserName,
    version: browserVersion,
    userAgent: navigator.userAgent,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  };
};

export const getRecommendedBrowser = () => {
  const browserInfo = getBrowserInfo();
  
  // If on mobile, suggest desktop
  if (browserInfo.isMobile) {
    return {
      name: 'Desktop Browser',
      reason: 'Screen recording works best on desktop',
      downloadUrl: null,
      message: 'For the best experience, we recommend using a desktop browser like Chrome or Firefox.'
    };
  }

  // Recommend Chrome as the most reliable
  return {
    name: 'Chrome',
    reason: 'Best screen recording support',
    downloadUrl: 'https://www.google.com/chrome/',
    message: 'For the best screen recording experience, we recommend Google Chrome.',
    alternative: {
      name: 'Firefox',
      downloadUrl: 'https://www.mozilla.org/firefox/'
    }
  };
};

export const checkMediaDevicePermissions = async () => {
  try {
    // Try to get screen capture permission
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false
    });
    
    // Stop the stream immediately (we were just checking permissions)
    stream.getTracks().forEach(track => track.stop());
    
    return {
      granted: true,
      message: 'Screen sharing permission granted!'
    };
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      return {
        granted: false,
        denied: true,
        message: 'We need screen sharing permission to record. Click \'Start Recording\' and allow access when prompted.',
        error: error
      };
    } else if (error.name === 'NotFoundError') {
      return {
        granted: false,
        notFound: true,
        message: 'No screen or audio device found. Please check your system settings.',
        error: error
      };
    } else if (error.name === 'NotSupportedError') {
      return {
        granted: false,
        unsupported: true,
        message: 'Your browser doesn\'t support screen recording. Try Chrome or Firefox!',
        error: error
      };
    } else {
      return {
        granted: false,
        unknown: true,
        message: 'Something went wrong. Please try again or use a different browser.',
        error: error
      };
    }
  }
};

export default {
  checkScreenRecordingSupport,
  getBrowserInfo,
  getRecommendedBrowser,
  checkMediaDevicePermissions
};

