/**
 * Express request augmentation.
 * `user` is populated by the `authenticate` middleware, introduced in Phase 3.
 * Declared here now so other Phase 2 middleware can reference `req.user`
 * without a compile error.
 */

export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        roleId: string;
        email: string;
      };
    }
  }
}
