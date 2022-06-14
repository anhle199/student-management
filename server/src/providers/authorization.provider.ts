import {Provider} from '@loopback/core';
import {Authorizer, AuthorizationContext, AuthorizationMetadata, AuthorizationDecision} from '@loopback/authorization';

export class AuthorizationProvider implements Provider<Authorizer> {
  constructor() {}

  value(): Authorizer {
    return this.authorize.bind(this);
  }

  async authorize(
    authorizationContext: AuthorizationContext,
    metadata: AuthorizationMetadata,
  ): Promise<AuthorizationDecision> {
    const userRole = authorizationContext.principals[0].role;
    const allowedRoles = metadata.allowedRoles;
    // console.log({principals: authorizationContext.principals})
    // console.log({firstPrincipal: authorizationContext.principals[0]})
    // console.log({userRole})
    // console.log({allowedRoles})
    return allowedRoles?.includes(userRole) ? AuthorizationDecision.ALLOW : AuthorizationDecision.DENY;
  }

}
