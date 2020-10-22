import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    makeStyles,
    Theme,
    TextField,
    Button,
    Typography,
} from '@material-ui/core'

import styles from './Auth.module.css'
import { AppDispatch } from '../../app/store'
import {
    toggleMode,
    fetchAsyncLogin,
    fetchAsyncRegister,
    fetchAsyncCreateProfile,
    selectIsLoginView,
} from './authSlice'

const useStyles = makeStyles((theme: Theme) => ({
    button: {
        margin: theme.spacing(3)
    }
}))

const Auth: React.FC = () => {
    const classes = useStyles()
    const dispatch: AppDispatch = useDispatch()
    const isLoginView = useSelector(selectIsLoginView)
    const [ credential, setCredential ] = useState({ username: "", password: "" })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        const name = e.target.name
        setCredential({ ...credential, [name]: value })
    }

    const login = async () => {
        if (isLoginView) {
            await dispatch(fetchAsyncLogin(credential))
        } else {
            const result = await dispatch(fetchAsyncRegister(credential))
            if (fetchAsyncRegister.fulfilled.match(result)) {
                await dispatch(fetchAsyncLogin(credential))
                await dispatch(fetchAsyncCreateProfile())
            }
        }
    }

    return (
        <div className={styles.auth__root}>
            <Typography variant="h1">{isLoginView ? "Login" : "Register"}</Typography>
            <br/>
            <TextField
                type="text" name="username" label="Username"
                value={credential.username} InputLabelProps={{ shrink: true }}
                onChange={handleInputChange}
            />
            <br/>
            <TextField
                type="password" name="password" label="Password"
                value={credential.password} InputLabelProps={{ shrink: true }}
                onChange={handleInputChange}
            />
            <Button
                className={classes.button} variant="contained" color="primary"
                size="small" onClick={login}
            >
                {isLoginView ? "Login" : "register"}
            </Button>
            <span onClick={() => dispatch(toggleMode())}>
                {isLoginView ? "Create new account ?" : "Back to Login"}
            </span>
        </div>
    )
}

export default Auth
