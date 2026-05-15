import React, { useContext, useState } from "react";

import './Authenticate.css';
import { useForm } from "../../shared/hooks/form-hook";
import { VALIDATOR_REQUIRE, VALIDATOR_MINLENGTH, VALIDATOR_EMAIL } from '../../shared/util/validators';
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import Card from "../../shared/components/UIElement/Card";
import { AuthContext } from "../../shared/context/auth-context";
import ErrorModal from "../../shared/components/UIElement/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElement/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";

function Authenticate() {
    const [isLogin, setIsLogin] = useState(true);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    const auth = useContext(AuthContext);

    const [formState, inputHandler, setFormData] = useForm({
        password: {
            value: '',
            isValid: false
        },
        email: {
            value: '',
            isValid: false
        }
    }, false);
    async function authSubmitHandler(event) {
        event.preventDefault();

        if (isLogin) {
            try {
                const responseData = await sendRequest(
                    `${process.env.REACT_APP_BACKEND_URL}/api/users/login`,
                    'POST',
                    JSON.stringify({
                        email: formState.inputs.email.value,
                        password: formState.inputs.password.value
                    }),
                    {
                        'Content-Type': 'application/json',
                    }
                );
                auth.login(responseData.userId,  responseData.token);
            } catch (err) { }
        } else {
            try {
                const formData = new FormData();
                formData.append('email', formState.inputs.email.value);
                formData.append('name', formState.inputs.email.value);
                formData.append('password', formState.inputs.password.value);
                formData.append('image', formState.inputs.image.value);
                const responseData = await sendRequest(
                    `${process.env.REACT_APP_BACKEND_URL}/api/users/signup`,
                    'POST',
                    formData,
                );
                auth.login(responseData.userId, responseData.token);
            } catch (err) { }
        }
    }
    function switchModeHandler() {
        if (!isLogin) {
            setFormData(
                {
                    ...formState.inputs,
                    name: undefined,
                    image: undefined,
                },
                formState.inputs.email.isValid && formState.inputs.password.isValid
            );
        } else {
            setFormData(
                {
                    ...formState.inputs,
                    name: {
                        value: '',
                        isValid: false
                    },
                    image:{
                        value: null,
                        isValid: false
                    }
                }
                , false);
        }

        setIsLogin(prevMode => !prevMode);
    }
    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            <Card className="authentication">
                {isLoading && <LoadingSpinner asOverlay />}
                <h2>Login Required</h2>
                <hr />
                <form onSubmit={authSubmitHandler}>
                    {!isLogin && <Input
                        element="input"
                        id="name"
                        type="text"
                        placeholder="Please enter your name."
                        label="User Name"
                        validators={[VALIDATOR_REQUIRE()]}
                        errorText="Please enter your name."
                        onInput={inputHandler}
                    />}
                    {!isLogin && <ImageUpload center id="image" onInput={inputHandler} />}
                    <Input
                        element="input"
                        id="email"
                        type="email"
                        placeholder="Please enter email."
                        label="E-Mail"
                        validators={[VALIDATOR_EMAIL()]}
                        errorText="Please enter a valid Email."
                        onInput={inputHandler}
                    />
                    <Input
                        element="input"
                        id="password"
                        type="password"
                        placeholder="Please enter Password"
                        label="Password"
                        validators={[VALIDATOR_MINLENGTH(8)]}
                        errorText="Please enter a valid password."
                        onInput={inputHandler}
                    />
                    <Button type="submit" disabled={!formState.isValid}>
                        {isLogin ? "Login" : "Sign Up"}
                    </Button>
                </form>

                <Button type="submit" inverse onClick={switchModeHandler}>
                    Swithch to {!isLogin ? "Login" : "Sign Up"}
                </Button>
            </Card>
        </React.Fragment>
    )
}

export default Authenticate;