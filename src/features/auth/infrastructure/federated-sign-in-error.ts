export type FederatedSignInErrorCode =
  | 'requires-dev-build'
  | 'not-configured'
  | 'not-supported'
  | 'provider';

/** Falha do SDK do provedor, antes de qualquer chamada ao backend. */
export class FederatedSignInError extends Error {
  constructor(public readonly code: FederatedSignInErrorCode) {
    super(code);
    this.name = 'FederatedSignInError';
  }
}
