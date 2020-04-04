import 'source-map-support/register';
import { CustomAuthorizerEvent, CustomAuthorizerHandler, CustomAuthorizerResult } from 'aws-lambda';
import axios from 'axios';

import { verify } from 'jsonwebtoken';
import { JwtPayload } from '../../auth/JwtPayload';
import { createLogger } from '../../utils/logger';

let auth0Cert;

const logger = createLogger('Lambda:auth0');
 
export const handler: CustomAuthorizerHandler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
    logger.info('Processing event', {event});

    try {
        const decodedToken = await verifyToken(event.authorizationToken);
        logger.info('User was authorized', {token: decodedToken});
        return {
            principalId: decodedToken.sub,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'
                    }
                ]
            }
        }
    } catch (e) {
        logger.info('User was not authorized');
        return {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'
                    }
                ]
            }
        }
    }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
    if (!authHeader) 
        throw new Error('No authorization header');

    if (!authHeader.startsWith('Bearer '))
        throw new Error('Invalid authorization header');

    const token = authHeader.split(' ')[1];
    const cert = await fetchCertificate();
    return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload;
}

async function fetchCertificate(): Promise<string> {
    if (!auth0Cert) {
        console.log("Fetching Auth0 certificate");
        const result = await axios.get(process.env.AUTH0_CERT_URL);
        auth0Cert = result.data;
        console.log("Certificate fetched", auth0Cert);
    }
    return auth0Cert;
}