import {TokenService} from '@loopback/authentication';
import {UserProfile, securityId} from '@loopback/security';
import jwt from 'jsonwebtoken'
import {inject} from '@loopback/core';
import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {HttpErrors} from '@loopback/rest';

export class JWTService implements TokenService {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SECRET) protected jwtSecretKey: string,
    @inject(TokenServiceBindings.TOKEN_EXPIRES_IN) protected jwtExpiresIn: string,
  ) {}

  async verifyToken(token: string): Promise<UserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized('Error verifying token: token is null');
    }

    try {
      const decodedToken: any = jwt.verify(token, this.jwtSecretKey);
      const userProfile = {
        [securityId]: decodedToken[securityId],
        id: decodedToken['id'],
        username: decodedToken['username'],
      }

      return userProfile;

    } catch (error) {
      throw new HttpErrors.Unauthorized(`Error verifying token: ${error}`)
    }
  }

  async generateToken(userProfile: UserProfile): Promise<string> {
    if (!userProfile) {
      throw new HttpErrors.Unauthorized(
        'Error generating token : userProfile is null',
      );
    }

    const userDataForToken = {
      id: userProfile[securityId],
      username: userProfile.username,
    };

    try {
      const token = jwt.sign(userDataForToken, this.jwtSecretKey, {
        expiresIn: Number(this.jwtExpiresIn)
      })

      return token;

    } catch (error) {
      throw new HttpErrors.Unauthorized(`Error decoding token: ${error}`)
    }
  }
}
