
import Gun from 'gun/gun';

// Public relays - in a real app, you might use your own
const RELAYS = [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://relay.peer.ooo/gun'
];

let gun: any = null;

export function getGun() {
  if (typeof window === 'undefined') return null;
  if (!gun) {
    gun = Gun({ peers: RELAYS });
  }
  return gun;
}

export type ProductData = {
  ean: string;
  name: string;
  brand: string;
  prices: Record<string, { value: number; timestamp: number; deviceId: string }>;
};

/**
 * Nodes:
 * p2p-pulse/products/[EAN] -> { name, brand }
 * p2p-pulse/prices/[EAN] -> { [submissionId]: { value, timestamp, deviceId } }
 */

export const GUN_NAMESPACE = 'p2p-pulse-v1';

export function getDeviceId() {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem('p2p_device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('p2p_device_id', id);
  }
  return id;
}
