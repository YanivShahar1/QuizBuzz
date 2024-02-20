import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
    UserPoolId: process.env.REACT_APP_POOL_ID,
    ClientId: process.env.REACT_APP_CLIENT_ID,
    Domain: 'https://quiz-y.auth.us-east-1.amazoncognito.com',
};

export const userPool = new CognitoUserPool(poolData);
