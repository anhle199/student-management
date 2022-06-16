import {Provider} from '@loopback/core';
import {Authorizer, AuthorizationContext, AuthorizationMetadata, AuthorizationDecision} from '@loopback/authorization';
import {Role} from '../models/role.model';

export class AuthorizationProvider implements Provider<Authorizer> {
  constructor() {}

  value(): Authorizer {
    return this.authorize.bind(this);
  }

  async authorize(
    authorizationContext: AuthorizationContext,
    metadata: AuthorizationMetadata,
  ): Promise<AuthorizationDecision> {
    const userRoles: Role[] = authorizationContext.principals[0].roles;
    const allowedRoles = metadata.allowedRoles;

    let decision = AuthorizationDecision.ABSTAIN;

    // Check allowed roles
    if (userRoles && userRoles.length > 0) {
      for (const role of userRoles) {
        if (allowedRoles?.includes(role.name)) {
          decision = AuthorizationDecision.ALLOW;
          break;
        }
      }
    }

    return decision;
  }

}
