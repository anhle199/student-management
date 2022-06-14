import {BindingKey} from '@loopback/core';
import {UserService} from '@loopback/authentication';
import {Account} from './models';
import {Credentials} from './services';

export namespace TokenServiceConstants {
  export const TOKEN_SECRET_VALUE = "secret-key";
  export const TOKEN_EXPIRES_IN_VALUE = "36000";  // 10 mins
}

export namespace AccountServiceBindings {
  export const ACCOUNT_SERVICE = BindingKey.create<
    UserService<Account, Credentials>
  >('services.account.service');
}

export namespace DataSourceBindings {
  export const DATA_SOURCE = "datasources.db";
}

export namespace AuthorizationBindings {
  export const DEFAULT_DECISION = "authorization.default-decision";
  export const AUTHORIZER_PROVIDER = "providers.authorizer.provider";
}
