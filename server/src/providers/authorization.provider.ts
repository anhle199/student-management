import {inject, Provider} from '@loopback/core';
import {Authorizer, AuthorizationContext, AuthorizationMetadata, AuthorizationDecision} from '@loopback/authorization';
import {AuthorizationBindings} from '../keys';
import {Role} from '../models/role.model';

export class AuthorizationProvider implements Provider<Authorizer> {
  constructor(
    @inject(AuthorizationBindings.DEFAULT_DECISION)
    protected defaultDecision: AuthorizationDecision
  ) { }

  value(): Authorizer {
    return this.authorize.bind(this);
  }

  async authorize(
    authorizationContext: AuthorizationContext,
    metadata: AuthorizationMetadata,
  ): Promise<AuthorizationDecision> {
    const userRoles: Role[] = authorizationContext.principals[0].roles;
    const allowedRoles = metadata.allowedRoles;

    console.log({principals: authorizationContext.principals})
    console.log({userRoles})
    console.log({allowedRoles})

    let decision = this.defaultDecision;

    // Check allowed roles
    for (let role of userRoles) {
      if (allowedRoles?.includes(role.name)) {
        decision = AuthorizationDecision.ALLOW;
        break;
      }
    }

    // Check denied roles

    return decision;
  }

}
