
//TODO : change userpool to be case sensitive so Yaniv97 will stay Yaniv97 and not yaniv97
// authService.jsx
import { userPool } from './userpool'; // Adjust the path accordingly
import { CognitoUserAttribute, AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';
import React, { useState, useEffect } from 'react';

const AuthService = {

    // Internal array to hold login status change callbacks
    loginStatusChangeCallbacks: [],

    authenticate : (username, password) => {
        const authenticationData = {
            Username: username,
            Password: password,
        };

        const authenticationDetails = new AuthenticationDetails(authenticationData);

        const userData = {
            Username: username,
            Pool: userPool,
        };

        const cognitoUser = new CognitoUser(userData);

        return new Promise((resolve, reject) => {
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: (session) => {
                    resolve(session);
                    // Save the username to session storage
                    sessionStorage.setItem('username', username);

                    // Notify subscriptions after successful authentication
                    console.log("triggerLoginStatusChange")
                    AuthService.triggerLoginStatusChange(); 

                },
                onFailure: (err) => {
                    reject(err);
                },
            });
        });
    },

    logout : () => {
        const cognitoUser = userPool.getCurrentUser();
        
        if (cognitoUser) {
            cognitoUser.signOut();
            AuthService.triggerLoginStatusChange();
           
        }

         // Remove the username from session storage upon logout
        sessionStorage.removeItem('username');
    },
    
    isAuthenticated: () => {
        const cognitoUser = userPool.getCurrentUser();
        return !!cognitoUser;
    },


    signup: async (username, email, password) => {
        const attributeList = [
            new CognitoUserAttribute({ Name: 'email', Value: email }),
        ];

        return new Promise((resolve, reject) => {
            userPool.signUp(username, password, attributeList, null, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result.user);
                AuthService.triggerLoginStatusChange();
            });
        });
    },

    verifyEmail: async (username, verificationCode) => {
        const userData = {
            Username: username,
            Pool: userPool,
        };

        const cognitoUser = new CognitoUser(userData);

        return new Promise((resolve, reject) => {
            cognitoUser.confirmRegistration(verificationCode, true, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
    },

    getSessionUsername: () => {
        const username = sessionStorage.getItem('username');
        // console.log(`getSessionUsername username = ${username}`);
        return username ? username.toLowerCase() : null; // Return lowercase username or an empty string if it's null or undefined
    },
    

    //getCurrentLogedInUserName: () => {
    //    const cognitoUser = userPool.getCurrentUser();
    //    if (cognitoUser) {
    //        console.log(`AuthService.getCurrentUser ${cognitoUser.username}`);
    //        return cognitoUser.username;
    //    }

    //    return null; // Return null if no user is currently authenticated
    //},

    getCurrentLogedInUser: () => {
        const cognitoUser = userPool.getCurrentUser();
        if (cognitoUser) {
            console.log(`AuthService.getCurrentUser ${cognitoUser.username}`);
            return cognitoUser;
        }

        return null; // Return null if no user is currently authenticated
    },

    // Method to subscribe to login status changes
    subscribeToLoginStatusChange: (callback) => {
        AuthService.loginStatusChangeCallbacks.push(callback);
    },

    // Method to unsubscribe from login status changes
    unsubscribeFromLoginStatusChange: (callback) => {
        AuthService.loginStatusChangeCallbacks = AuthService.loginStatusChangeCallbacks.filter(cb => cb !== callback);
    },

    

    // Method to trigger login status change callbacks
    triggerLoginStatusChange: () => {
        AuthService.loginStatusChangeCallbacks.forEach(callback => callback());
    }

};


export default AuthService;
 