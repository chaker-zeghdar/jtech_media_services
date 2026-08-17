/**
 * Single import surface for the content layer.
 *
 * In Phase 2 the modules behind this barrel become Supabase queries; every
 * consumer imports from `@/content` so nothing downstream changes.
 */
export * from './schemas';
export * from './categories';
export * from './products';
export * from './services';
export * from './settings';
export * from './wilayas';
