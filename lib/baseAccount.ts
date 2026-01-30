'use client';

import { createBaseAccountSDK } from '@base-org/account';
import { ONCHAINKIT_CONFIG } from './config/onchainkit';

declare global {
  // eslint-disable-next-line no-var
  var __vesselBaseAccountSDK: ReturnType<typeof createBaseAccountSDK> | undefined;
}

export function getBaseAccountSDK() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!globalThis.__vesselBaseAccountSDK) {
    globalThis.__vesselBaseAccountSDK = createBaseAccountSDK({
      appName: ONCHAINKIT_CONFIG.appName,
      appLogoUrl: ONCHAINKIT_CONFIG.appIcon || null,
      appChainIds: [ONCHAINKIT_CONFIG.chain.id],
    });
  }

  return globalThis.__vesselBaseAccountSDK;
}
