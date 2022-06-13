import {inject} from '@loopback/core';
import {repository, Filter} from '@loopback/repository';
import {AccountRepository, StudentRepository} from '../repositories';
import {requestBody, getModelSchemaRef, post, get, HttpErrors, param} from '@loopback/rest';
import {Account} from '../models';
import {hash, genSalt} from 'bcryptjs';
import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {JWTService, AccountService, Credentials} from '../services';
import {AccountServiceBindings} from '../keys';

export class AccountController {
  constructor(
    @repository(AccountRepository) public accountRepository: AccountRepository,
    @repository(StudentRepository) public studentRepository: StudentRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE) public jwtService: JWTService,
    @inject(AccountServiceBindings.ACCOUNT_SERVICE) public accountService: AccountService,
  ) {}

  @post('/accounts')
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Account, {
            title: 'NewAccount',
            exclude: ['id'],
            optional: ['studentId'],
          }),
        },
      },
    })
    account: Account
  ): Promise<Account> {
    // Check existence of student by `studentId`.
    if ("studentId" in account) {
      const isExistedStudent = await this.studentRepository.exists(account.studentId);
      if (!isExistedStudent) {
        throw new HttpErrors.NotFound("User not found.");
      }
    }

    // Validate username and password
    this.accountService.validateCredentials({
      username: account.username,
      password: account.password
    });

    account.password = await hash(account.password, await genSalt());
    return this.accountRepository.create(account);
  }

  @post('/accounts/login')
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              username: {type: 'string'},
              password: {type: 'string'},
            },
            required: ['username', 'password'],
          }
        },
      },
    })
    credentials: Credentials
  ): Promise<{token: string}> {
    // const account = await this.accountRepository.findOne({where: {username: loginInfo.username}})
    // if (account === null || !bcrypt.compareSync(loginInfo.password, account.password)) {
    //   throw new HttpErrors.Forbidden('Username or password does not match.')
    // }

    // // create access token
    // const token = jwt.sign(
    //   {username: account.username}, // data
    //   'secret-key',                 // secret key
    //   {expiresIn: '0.5h'}
    // )

    // const expiredAt = new Date()
    // expiredAt.setMinutes(expiredAt.getMinutes() + 30);

    // this.response
    //   .status(200)
    //   .send({
    //     token: token,
    //     expiredAt: expiredAt.valueOf(),
    //   })

    // return this.response

    const account = await this.accountService.verifyCredentials(credentials);
    const userProfile = this.accountService.convertToUserProfile(account);
    const token = await this.jwtService.generateToken(userProfile);

    return {token};
  }

  @get('/accounts')
  async find(
    @param.filter(Account) filter?: Filter<Account>
  ): Promise<Account[]> {
    return this.accountRepository.find(filter);
  }
}
