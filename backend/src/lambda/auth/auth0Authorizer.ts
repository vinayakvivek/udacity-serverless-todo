import 'source-map-support/register';
import { CustomAuthorizerEvent, CustomAuthorizerHandler, CustomAuthorizerResult } from 'aws-lambda';

import { verify } from 'jsonwebtoken';
import { JwtPayload } from '../../auth/JwtPayload';
import { createLogger } from '../../utils/logger';

const cert = `-----BEGIN CERTIFICATE-----
MIIC/TCCAeWgAwIBAgIJLdY1rB5hLBchMA0GCSqGSIb3DQEBCwUAMBwxGjAYBgNV
BAMTEWRpcmV2aW4uYXV0aDAuY29tMB4XDTIwMDMyNzE3NTkzNVoXDTMzMTIwNDE3
NTkzNVowHDEaMBgGA1UEAxMRZGlyZXZpbi5hdXRoMC5jb20wggEiMA0GCSqGSIb3
DQEBAQUAA4IBDwAwggEKAoIBAQC7lJxrAxJAAZknBiO7ml5l5Oce05d4jxC5/1dk
pHAVdV3d8TeOS6WZMxfMSAx332Fy9hexOVDGTvHMH/7bM5pfu/zWKl9D0TYuMfqs
VZJNuKt1vDYGa7LkOdrCibeSv9pwf+azUx+EM5xF/lVPV5rvxhDwdHPqGLv6N7hF
wulCBI8PnTmlnQVjw99bF3kgK+ERKvN7haNyUR9B1R1sbV3kv9gdtjD+BBSfiiaM
DAePxerOpTUG8lt5rL4WT93/88bDeLq1SrjOK4/7D2EhKHvm1ZjKKVtRAlF3UIbX
0WRq1Ygz3Qs4c0yCBVMl186hk6h0fKb42pFQY8xwk+CYQPLRAgMBAAGjQjBAMA8G
A1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFKtEJRO4S7nH48a8Y4WfNw//P6u7MA4G
A1UdDwEB/wQEAwIChDANBgkqhkiG9w0BAQsFAAOCAQEAeOsOGaLdrf9QBJ+TH9kJ
LzeFFRNSfEunKnEDn+Jd6h1ZCWcoTAWGiOG6krMLJ08vKYBiDZDgPEKz0ya6HCF9
DpfzKoVyhEV7uSTkK0guC4Ar+PLiJtvdN2zArLDVDZeh9CHJuLnkIMLUM4Eh0h31
J3p79GtgtR/rnWS1R7/Xr/SzXcJFpRRY6eLtK9mZfB9ZZZhD+GcOf0HwsVj3eovU
6ureXDdSG9O5OnbFHFIk2/PPB1EBK0xUmtJB4+HfWP5WL3bBvjwsgCOGLJ4btd7Q
moxsvNB4nQAMYia5SWRcPvvHbm5hMhyp9SRdbs+b5BBsa3cbvZitHqEiUjClw27Q
Cw==
-----END CERTIFICATE-----
`;

const logger = createLogger('Lambda:auth0');
 
export const handler: CustomAuthorizerHandler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
    logger.info('Processing event', {event});

    try {
        const decodedToken = verifyToken(event.authorizationToken);
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

function verifyToken(authHeader: string): JwtPayload {
    if (!authHeader) 
        throw new Error('No authorization header');

    if (!authHeader.startsWith('Bearer '))
        throw new Error('Invalid authorization header');

    const token = authHeader.split(' ')[1];
    return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload;
}
