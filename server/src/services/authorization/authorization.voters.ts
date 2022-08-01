import {AuthorizationContext, AuthorizationDecision, AuthorizationMetadata} from '@loopback/authorization';
import {AccountRepository} from '../../repositories';
import _ from 'lodash';

/**
 * example api path: /accounts/{id}/...
 */
export async function verifyMatchingUserIdVoter(
  authorizationContext: AuthorizationContext,
  metadata: AuthorizationMetadata,
): Promise<AuthorizationDecision> {
  if (authorizationContext.invocationContext.args.length === 0 && authorizationContext.principals.length === 0) {
    return AuthorizationDecision.DENY;
  }

  const userId = authorizationContext.invocationContext.args[0];
  const requestedUser = authorizationContext.principals[0];

  return requestedUser.id === userId ? AuthorizationDecision.ALLOW : AuthorizationDecision.DENY;
}

/**
 * example api path: /classes/{id}/...
 */
export async function verifyStudentBelongsToClassVoter(
  authorizationContext: AuthorizationContext,
  metadata: AuthorizationMetadata,
): Promise<AuthorizationDecision> {
  if (
    authorizationContext.invocationContext.args.length === 0
    && authorizationContext.principals.length === 0
  ) {
    return AuthorizationDecision.DENY;
  }

  const userId: number = _.get(authorizationContext.principals[0], "id", -1);
  if (userId === -1) {
    return AuthorizationDecision.DENY
  }

  const invocationContext = authorizationContext.invocationContext;

  // get AccountRepository by binding key from the invocation context.
  const accountRepo: AccountRepository = await invocationContext.get("repositories.AccountRepository");

  // get account (include student and university class) by token's userId
  const accountWithStudentAndClass = await accountRepo.findById(userId, {
    include: [
      {
        relation: "student",
        scope: {
          include: ["universityClass"],
        },
      },
    ],
  })

  // get `universityClassId` param
  const universityClassId = invocationContext.args[0];

  if (accountWithStudentAndClass.student) {
    const universityClass = accountWithStudentAndClass.student.universityClass;

    if (universityClass && universityClass.id === universityClassId) {
      console.log("verifyStudentBelongsToClassVoter ==> ALLOW")
      return AuthorizationDecision.ALLOW
    } else {
      console.log("verifyStudentBelongsToClassVoter ==> DENY")
      return AuthorizationDecision.DENY;
    }
  }

  console.log("verifyStudentBelongsToClassVoter ==> ABSTAIN")
  return AuthorizationDecision.ABSTAIN;

  // if student => class id match ? allow : deny
  // else => abstain
}
