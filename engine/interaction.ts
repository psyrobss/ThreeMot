// This file is a proxy to resolve module ambiguity between .ts and .tsx files.
// The primary implementation is in `interaction.tsx`.
// It is recommended to remove this file and update imports to point directly to `interaction.tsx`.
export * from './interaction.tsx';
