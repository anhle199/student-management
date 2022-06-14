import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';

// IMPORT FOR APPLYING AUTHENTICATION
import {AuthenticationComponent} from '@loopback/authentication';
import {
  JWTAuthenticationComponent,
  TokenServiceBindings,
} from '@loopback/authentication-jwt';
import {JWTService} from './services';
import {AccountService} from './services/account.service';
import {TokenServiceConstants, AccountServiceBindings, AuthorizationBindings} from './keys';
import {AuthorizationOptions, AuthorizationDecision, AuthorizationComponent, AuthorizationTags} from '@loopback/authorization';
import {AuthorizationProvider} from './providers';
// ----------------------------------------

export {ApplicationConfig};

export class StudentManagementApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    // ADD SNIPPET FOR APPLYING AUTHENTICATION
    // Mount authentication system
    this.component(AuthenticationComponent);
    // Mount jwt component
    this.component(JWTAuthenticationComponent);
    // ----------------------------------------

    // Override token service
    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);
    this.bind(TokenServiceBindings.TOKEN_SECRET).to(TokenServiceConstants.TOKEN_SECRET_VALUE);
    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE);

    // Override user service
    this.bind(AccountServiceBindings.ACCOUNT_SERVICE).toClass(AccountService);

    // AUTHORIZATION
    const authorizationOptions: AuthorizationOptions = {
      precedence: AuthorizationDecision.DENY,
      defaultDecision: AuthorizationDecision.DENY,
    };

    const binding = this.component(AuthorizationComponent);
    this.configure(binding.key).to(authorizationOptions);

    this.bind(AuthorizationBindings.DEFAULT_DECISION)
      .to(authorizationOptions.defaultDecision);
    
    this.bind(AuthorizationBindings.AUTHORIZER_PROVIDER)
      .toProvider(AuthorizationProvider)
      .tag(AuthorizationTags.AUTHORIZER);
  }
}
