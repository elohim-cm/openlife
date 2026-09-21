function detectBrowser(userAgent) {
  let browser;
  let version;
  let os;

  // Detect browser and version
  if (/chrome|crios|crmo/i.test(userAgent)) {
    browser = "Chrome";
    version = userAgent.match(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)[1];
  } else if (/firefox|iceweasel|fxios/i.test(userAgent)) {
    browser = "Firefox";
    version = userAgent.match(/(?:firefox|iceweasel|fxios)\/(\d+(\.\d+)?)/i)[1];
  } else if (/safari/i.test(userAgent) && !/chrome|crios|crmo/i.test(userAgent)) {
    browser = "Safari";
    version = userAgent.match(/version\/(\d+(\.\d+)?)/i)[1];
  } else if (/msie|trident/i.test(userAgent)) {
    browser = "Internet Explorer";
    version = userAgent.match(/(?:msie |rv:)(\d+(\.\d+)?)/i)[1];
  } else if (/edg/i.test(userAgent)) {
    browser = "Edge";
    version = userAgent.match(/edg\/(\d+(\.\d+)?)/i)[1];
  } else {
    browser = "Unknown";
    version = "Unknown";
  }

  // Detect operating system
  if (/windows nt/i.test(userAgent)) {
    const osVersionMap = {
      "10.0": "10",
      6.3: "8.1",
      6.2: "8",
      6.1: "7",
      "6.0": "Vista",
      5.2: "XP 64-bit",
      5.1: "XP",
      "5.0": "2000",
    };
    const osVersion = userAgent.match(/windows nt (\d+\.\d+)/i)[1];
    os = `Windows ${osVersionMap[osVersion] || osVersion}`;
  } else if (/macintosh|mac os x/i.test(userAgent)) {
    os = "Mac OS";
    const osVersion = userAgent.match(/mac os x (\d+[\._]\d+([\._]\d+)?)/i);
    if (osVersion) {
      os += " " + osVersion[1].replace(/_/g, ".");
    }
  } else if (/android/i.test(userAgent)) {
    os = "Android";
    const osVersion = userAgent.match(/android (\d+(\.\d+)?)/i);
    if (osVersion) {
      os += " " + osVersion[1];
    }
  } else if (/linux/i.test(userAgent)) {
    os = "Linux";
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    os = "iOS";
    const osVersion = userAgent.match(/os (\d+[\._]\d+([\._]\d+)?)/i);
    if (osVersion) {
      os += " " + osVersion[1].replace(/_/g, ".");
    }
  } else {
    os = "Unknown";
  }

  return {browser, version, os};
}

export default detectBrowser;
