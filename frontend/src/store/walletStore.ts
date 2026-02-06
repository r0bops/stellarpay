import { create } from 'zustand';
import { config } from '../config';

interface WalletState {
  connected: boolean;
  publicKey: string | null;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (xdr: string) => Promise<string>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  connected: false,
  publicKey: null,
  isConnecting: false,
  error: null,

  connect: async () => {
    set({ isConnecting: true, error: null });
    try {
      // Dynamic import to avoid SSR issues
      const freighter = await import('@stellar/freighter-api');

      const isConnected = await freighter.isConnected();
      if (!isConnected) {
        throw new Error(
          'Freighter wallet not detected. Please install the Freighter browser extension.'
        );
      }

      const publicKey = await freighter.getPublicKey();
      if (!publicKey) {
        throw new Error('Failed to get public key from Freighter');
      }

      set({
        connected: true,
        publicKey,
        isConnecting: false,
        error: null,
      });
    } catch (error: any) {
      set({
        connected: false,
        publicKey: null,
        isConnecting: false,
        error: error.message || 'Failed to connect wallet',
      });
      throw error;
    }
  },

  disconnect: () => {
    set({
      connected: false,
      publicKey: null,
      isConnecting: false,
      error: null,
    });
  },

  signTransaction: async (xdr: string) => {
    const state = get();
    if (!state.connected) {
      throw new Error('Wallet not connected');
    }

    try {
      const freighter = await import('@stellar/freighter-api');
      const signedXdr = await freighter.signTransaction(xdr, {
        networkPassphrase: config.networkPassphrase,
      });
      return signedXdr;
    } catch (error: any) {
      throw new Error(error.message || 'Transaction signing failed');
    }
  },
}));
