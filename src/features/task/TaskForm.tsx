import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
    makeStyles,
    Theme,
    TextField,
    InputLabel,
    MenuItem,
    FormControl,
    Select,
    Button,
    Fab,
    Modal,
} from '@material-ui/core'
import { Save, Add } from '@material-ui/icons'

import { AppDispatch } from '../../app/store'
import { initialState } from './taskSlice'
import {
    fetchAsyncCreateTask,
    fetchAsyncUpdateTask,
    fetchAsyncCreateCategory,
    selectUsers,
    selectEditedTask,
    selectCategory,
    editTask,
    selectTask,
} from './taskSlice'

const useStyles = makeStyles((theme: Theme) => ({
    field: {
        margin: theme.spacing(2),
        minWidth: 240,
    },
    button: {
        margin: theme.spacing(3)
    },
    addIcon: {
        marginTop: theme.spacing(3),
        marginLeft: theme.spacing(2),
    },
    saveModal: {
        marginTop: theme.spacing(4),
        marginLeft: theme.spacing(2),
    },
    paper: {
        position: "absolute",
        textAlign: "center",
        width: 400,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    }
}))

const getModalStyle = () => {
    const top = 50
    const left = 50

    return {
        top: `${top}%`,
        left: `${left}%`,
        transForm: `translate(-${top}%, -${left}%)`
    }
}

const TaskForm: React.FC = () => {
    const classes = useStyles()
    const dispatch: AppDispatch = useDispatch()

    const users = useSelector(selectUsers)
    const category = useSelector(selectCategory)
    const editedTask = useSelector(selectEditedTask)

    const [ open, setOpen ] = useState(false)
    const [ modalStyle ] = useState(getModalStyle)
    const [ inputText, setInputText ] = useState("")

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const isDisabled =
            editedTask.task.length === 0 ||
            editedTask.description.length === 0 ||
            editedTask.criteria.length === 0

    const isCatDisabled = inputText.length === 0

    const handleInputTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value: string | number = e.target.value
        const name = e.target.value
        if (name === "estimate") {
            value = Number(value)
        }
        dispatch(editTask({ ...editedTask, [name]: value }))
    }

    const handleSelectRespChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        const value = e.target.value as number
        dispatch(editTask({ ...editedTask, responsible: value }))
    }

    const handleSelectStatusChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        const value = e.target.value as string
        dispatch(editTask({ ...editedTask, status: value }))
    }

    const handleSelectCatChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        const value = e.target.value as number
        dispatch(editTask({ ...editedTask, category: value }))
    }

    let userOptions = users.map(user => (
        <MenuItem key={user.id} value={user.id}>
            {user.username}
        </MenuItem>
    ))

    let categoryOptions = category.map(cat => (
        <MenuItem key={cat.id} value={cat.id}>
            {cat.item}
        </MenuItem>
    ))

    return (
        <div>
            <h2>{editedTask.id ? "Update Task" : "New Task"}</h2>
            <form>
                <TextField
                    className={classes.field} type="number"
                    label="Estimate [days]" name="estimate"
                    value={editedTask.estimate}
                    InputProps={{ inputProps: { min: 0, max: 1000 } }}
                    InputLabelProps={{ shrink: true }}
                    onChange={handleInputChange}
                />
                <TextField
                    className={classes.field} type="text"
                    label="Task" name="task"
                    value={editedTask.task}
                    InputLabelProps={{ shrink: true }}
                    onChange={handleInputChange}
                />
                <br/>
                <TextField
                    className={classes.field} type="text"
                    label="Description" name="description"
                    value={editedTask.description}
                    InputLabelProps={{ shrink: true }}
                    onChange={handleInputChange}
                />
                <TextField
                    className={classes.field} type="text"
                    label="Criteria" name="criteria"
                    value={editedTask.criteria}
                    InputLabelProps={{ shrink: true }}
                    onChange={handleInputChange}
                />
                <br/>
                <FormControl className={classes.field}>
                    <InputLabel>Responsible</InputLabel>
                    <Select
                        name="responsible" value={editedTask.responsible}
                        onChange={handleSelectRespChange}
                    >
                        {userOptions}
                    </Select>
                </FormControl>
                <FormControl className={classes.field}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        name="status" value={editedTask.status}
                        onChange={handleSelectStatusChange}
                    >
                        <MenuItem value={1}>Not started</MenuItem>
                        <MenuItem value={2}>On going</MenuItem>
                        <MenuItem value={3}>Done</MenuItem>
                    </Select>
                </FormControl>
                <br/>
                <FormControl className={classes.field}>
                    <InputLabel>Category</InputLabel>
                    <Select
                        name="category" value={editedTask.category}
                        onChange={handleSelectCatChange}
                    >
                        {categoryOptions}
                    </Select>
                </FormControl>
                <Fab
                    className={classes.addIcon} size="small"
                    color="primary" onClick={handleOpen}
                >
                    <Add />
                </Fab>
                <Modal open={open} onClick={handleClose}>
                    <div className={classes.paper} style={modalStyle}>
                        <TextField
                            className={classes.field} type="text"
                            label="New Category" value={inputText}
                            InputLabelProps={{ shrink: true }}
                            onChange={handleInputTextChange}
                        />
                        <Button
                            className={classes.button} color="primary"
                            size="small" variant="contained"
                            startIcon={<Save />} disabled={isCatDisabled}
                            onClick={() => {
                                dispatch(fetchAsyncCreateCategory(inputText))
                                handleClose()
                            }}
                        >
                            SAVE
                        </Button>
                    </div>
                </Modal>
                <br/>
                <Button
                    className={classes.button} color="primary"
                    size="small" variant="contained"
                    startIcon={<Save />} disabled={isDisabled}
                    onClick={
                        editedTask.id !== 0
                        ? () => dispatch(fetchAsyncUpdateTask(editedTask))
                        : () => dispatch(fetchAsyncCreateTask(editedTask))
                    }
                >
                    {editedTask.id !== 0 ? "Update" : "Save"}
                </Button>
                <Button
                    className={classes.button} color="default"
                    size="small" onClick={() => {
                        dispatch(editTask(initialState.editedTask))
                        dispatch(selectTask(initialState.selectedTask))
                    }}
                >
                    Cancel
                </Button>
            </form>
        </div>
    )
}

export default TaskForm
