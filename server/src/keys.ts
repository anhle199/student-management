import {BindingKey} from '@loopback/core';
import {UserService} from '@loopback/authentication';
import {Account, SignInCredentials} from './models';
import {PasswordHasher} from './services';

export namespace PasswordHasherServiceConstants {
  export const ROUNDS = 10;
}

export namespace PasswordHasherServiceBindings {
  export const ROUNDS = BindingKey.create<number>("services.password-hasher.rounds");
  export const PASSWORD_HASHER = BindingKey.create<PasswordHasher>("services.password-hasher");
}

export namespace TokenServiceConstants {
  export const TOKEN_SECRET_VALUE = "secret-key";
  export const TOKEN_EXPIRES_IN_VALUE = "216000";  // 1h
}

export namespace AccountServiceBindings {
  export const ACCOUNT_SERVICE = BindingKey.create<
    UserService<Account, SignInCredentials>
  >('services.account.service');
}

export namespace DataSourceBindings {
  export const DATA_SOURCE = "datasources.db";
}

export namespace AuthorizationBindings {
  export const DEFAULT_DECISION = "authorization.default-decision";
  export const AUTHORIZER_PROVIDER = "providers.authorizer.provider";
}

export namespace AuthenticationStrategyConstants {
  export const JWT = "jwt";
}
