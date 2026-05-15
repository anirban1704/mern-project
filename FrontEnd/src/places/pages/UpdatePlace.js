import React, { useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom/cjs/react-router-dom.min";

import { useHttpClient } from "../../shared/hooks/http-hook";
import ErrorModal from "../../shared/components/UIElement/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElement/LoadingSpinner";
import { useForm } from "../../shared/hooks/form-hook";
import './PlaceForm.css';
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import { VALIDATOR_REQUIRE, VALIDATOR_MINLENGTH } from '../../shared/util/validators';
import Card from '../../shared/components/UIElement/Card';
import { AuthContext } from "../../shared/context/auth-context";

function UpdatePlace() {
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const placeId = useParams().placeId;
    const [identifiedPlace, setIdentifiedPlace] = useState();
    const history = useHistory();
    const auth = useContext(AuthContext);
    const [formState, inputHandler, setFormData] = useForm({
        title: {
            value: "",
            isValid: false
        },
        description: {
            value: "",
            isValid: false
        },
    }, false);
    async function placeUpdateSubmitHandler(event) {
        event.preventDefault();
        console.log(formState.inputs);
        try {
            await sendRequest(
               `${process.env.REACT_APP_BACKEND_URL}/api/places/${placeId}`,
                "PATCH",
                JSON.stringify({
                    "title": formState.inputs.title.value,
                    "description": formState.inputs.description.value
                }),
                {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`
                }
            );
            history.push(`/${auth.userId}/places`);
        } catch (err) { }
    }

    useEffect(() => {
        const FetchPlaces = async () => {
            try {
                const responseData = await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/api/places/${placeId}`);
                setIdentifiedPlace(responseData.place);
                setFormData(
                    {
                        title: {
                            value: responseData.place.title,
                            isValid: true
                        },
                        description: {
                            value: responseData.place.description,
                            isValid: true
                        }
                    }
                    , true)
            } catch (err) { }
        }
        FetchPlaces();
    }, [placeId, sendRequest, setFormData]);

    if (isLoading) {
        return <div className="center">
            <LoadingSpinner asOverlay />
        </div>
    }

    if (!identifiedPlace && !error) {
        return (
            <div className="center">
                <Card><h2>Could not find place!</h2></Card>
            </div>
        );
    }

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {!isLoading && identifiedPlace && <form className="place-form" onSubmit={placeUpdateSubmitHandler}>
                <Input
                    id="title"
                    label="Title"
                    type="text"
                    element="input"
                    validators={[VALIDATOR_REQUIRE()]}
                    errorText="Please enter a valid title."
                    initialvalue={identifiedPlace.title}
                    onInput={inputHandler}
                    initialvalid={true}
                />
                <Input
                    id="description"
                    label="Description"
                    element="textarea"
                    validators={[VALIDATOR_MINLENGTH(5)]}
                    errorText="Please enter a valid description (min 5 characters)."
                    initialvalue={identifiedPlace.description}
                    onInput={inputHandler}
                    initialvalid={true}
                />
                <Button type="submit" disabled={!formState.isValid}>
                    UPDATE PLACE
                </Button>
            </form>}
        </React.Fragment>
    );
}

export default UpdatePlace;
