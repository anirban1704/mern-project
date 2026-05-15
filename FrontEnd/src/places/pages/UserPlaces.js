import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";

import PlaceList from "../components/PlaceList";
import { useHttpClient } from "../../shared/hooks/http-hook";
import ErrorModal from "../../shared/components/UIElement/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElement/LoadingSpinner";
import Card from '../../shared/components/UIElement/Card';
import Button from "../../shared/components/FormElements/Button";

function UserPlaces() {
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const userId = useParams().userId;
    const [loadPlaces, setLoadPlaces] = useState();
    useEffect(() => {
        const FetchPlaces = async () => {
            try {
                const responseData = await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/api/places/user/${userId}`);
                setLoadPlaces(responseData.places);
            } catch (err) { }
        }
        FetchPlaces();
    }, [sendRequest, userId]);
    function placeDeleteHandler(deletedPlaceId) {
        setLoadPlaces(
            prevPlaces => prevPlaces.filter(item => item.id !== deletedPlaceId)
        );
    }

    return <React.Fragment>
        {!loadPlaces && !error && <div className="center place-list">
            <Card>
                <h2>No Places Found. Maybe create one!</h2>
                <Button to="/places/new">Share Place</Button>
            </Card>
        </div>}
        <ErrorModal error={error} onClear={clearError} />
        {isLoading && (
            <div className="center">
                <LoadingSpinner asOverlay />
            </div>
        )}
        {!isLoading && loadPlaces && <PlaceList items={loadPlaces} onDeletePlace={placeDeleteHandler} />}
    </React.Fragment>
}
export default UserPlaces;