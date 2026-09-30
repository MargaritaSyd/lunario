const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('wasm');

// expo-notifications 57.0.21 throws while importing in Android Expo Go,
// because it subscribes to remote push tokens. Local reminders do not need that.
const pushRegistrationStub = path.resolve(__dirname, 'src/notifications/push-registration-stub.js');
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName.includes('DevicePushTokenAutoRegistration') &&
    context.originModulePath.includes(`${path.sep}expo-notifications${path.sep}`)
  ) {
    return { type: 'sourceFile', filePath: pushRegistrationStub };
  }
  return context.resolveRequest(context, moduleName, platform);
};

config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    return middleware(req, res, next);
  };
};

module.exports = config;
