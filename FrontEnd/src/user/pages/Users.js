import React, { useEffect, useState } from "react";

import UserList from "../components/UserList";
import ErrorModal from "../../shared/components/UIElement/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElement/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";

function User() {
    const [loadedUser, setLoadedUser] = useState();
    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    useEffect(() => {
        const FetchUser = async () => {
            console.log(process.env.REACT_APP_BACKEND_URL);
            try {
                const responseData = await sendRequest(
                    `${process.env.REACT_APP_BACKEND_URL}/api/users`
                );
                setLoadedUser(responseData.users);
            } catch (err) { }
        }
        FetchUser();
    }, [sendRequest]);
    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && <div className="center"><LoadingSpinner asOverlay /></div>}
            {!isLoading && loadedUser && <UserList
                items={loadedUser}
            />}
        </React.Fragment>
    );
}

export default User;