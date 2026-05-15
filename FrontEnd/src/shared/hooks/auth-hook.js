import { useCallback, useEffect, useState } from 'react';

let logoutTimer;

export default function useAuth() {
    const [token, setToken] = useState(false);
    const [userId, setUserId] = useState(false);
    const [expirationDate, setExpirationDate] = useState();

    const login = useCallback((userId, token, expirationDate) => {
        setToken(token);
        setUserId(userId);
        const tokenExpirationDate = expirationDate ? new Date(expirationDate) : new Date(new Date().getTime() + 1000 * 60 * 60);
        setExpirationDate(tokenExpirationDate);
        localStorage.setItem('userData', JSON.stringify({ userId: userId, token: token, tokenExpirationDate: tokenExpirationDate.toISOString() }));
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setExpirationDate(null);
        setUserId(null);
        localStorage.removeItem('userData');
    }, []);

    useEffect(() => {
        if (token && expirationDate) {
            const remainingTime = expirationDate.getTime() - new Date().getTime();
            logoutTimer = setTimeout(logout, remainingTime);
        } else {
            clearTimeout(logoutTimer);
        }
    }, [token, logout, expirationDate]);

    useEffect(() => {
        const storedData = JSON.parse(localStorage.getItem('userData'));

        if (storedData && storedData.token && new Date(storedData.tokenExpirationDate) > new Date()) {
            login(storedData.userId, storedData.token, storedData.tokenExpirationDate);
        }

    }, [login]);

    return { login, logout, token, userId };
}