import Cookies from 'js-cookie';

export const getToken = (): string | undefined => {
  return Cookies.get('token');
};

export const setToken = (token: string): void => {
  Cookies.set('token', token, { 
    expires: 7, // Expire dans 7 jours
    secure: process.env.NODE_ENV === 'production', // Secure en production
    sameSite: 'strict'
  });
};

export const removeToken = (): void => {
  Cookies.remove('token');
}; 