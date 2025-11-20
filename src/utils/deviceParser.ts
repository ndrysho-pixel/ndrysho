export interface DeviceInfo {
  browser: string;
  browserVersion: string;
  os: string;
  device: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

export const parseUserAgent = (userAgent: string): DeviceInfo => {
  const ua = userAgent.toLowerCase();
  
  // Browser detection
  let browser = 'Unknown';
  let browserVersion = '';
  
  if (ua.includes('edg/')) {
    browser = 'Edge';
    browserVersion = ua.match(/edg\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('chrome/') && !ua.includes('edg/')) {
    browser = 'Chrome';
    browserVersion = ua.match(/chrome\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('firefox/')) {
    browser = 'Firefox';
    browserVersion = ua.match(/firefox\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('safari/') && !ua.includes('chrome')) {
    browser = 'Safari';
    browserVersion = ua.match(/version\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('opera/') || ua.includes('opr/')) {
    browser = 'Opera';
    browserVersion = ua.match(/(opera|opr)\/([\d.]+)/)?.[2] || '';
  }
  
  // OS detection
  let os = 'Unknown';
  
  if (ua.includes('windows nt 10.0')) {
    os = 'Windows 10';
  } else if (ua.includes('windows nt 6.3')) {
    os = 'Windows 8.1';
  } else if (ua.includes('windows nt 6.2')) {
    os = 'Windows 8';
  } else if (ua.includes('windows nt 6.1')) {
    os = 'Windows 7';
  } else if (ua.includes('mac os x')) {
    const version = ua.match(/mac os x ([\d_]+)/)?.[1].replace(/_/g, '.') || '';
    os = `macOS ${version}`;
  } else if (ua.includes('android')) {
    const version = ua.match(/android ([\d.]+)/)?.[1] || '';
    os = `Android ${version}`;
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    const version = ua.match(/os ([\d_]+)/)?.[1].replace(/_/g, '.') || '';
    os = `iOS ${version}`;
  } else if (ua.includes('linux')) {
    os = 'Linux';
  }
  
  // Device type detection
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  let device = 'Desktop';
  
  if (ua.includes('mobile') || ua.includes('android')) {
    deviceType = 'mobile';
    if (ua.includes('iphone')) {
      device = 'iPhone';
    } else if (ua.includes('android')) {
      device = 'Android Phone';
    } else {
      device = 'Mobile';
    }
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    deviceType = 'tablet';
    if (ua.includes('ipad')) {
      device = 'iPad';
    } else {
      device = 'Tablet';
    }
  }
  
  return {
    browser,
    browserVersion,
    os,
    device,
    deviceType
  };
};
