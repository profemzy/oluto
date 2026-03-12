/**
 * API Client - Backward Compatibility Layer
 *
 * This file re-exports from the modular API structure.
 * New code should import directly from '@/app/lib/api' module.
 *
 * @deprecated Use the modular API structure instead:
 * ```typescript
 * import { api } from '@/app/lib/api';
 * await api.transactions.list(businessId);
 * ```
 */

// Re-export everything from the modular API
export * from './api/index';

// Default export for backward compatibility
export { api as default } from './api/index';
