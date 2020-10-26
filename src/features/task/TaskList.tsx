import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
    makeStyles,
    Theme,
    Button,
    Avatar,
    Badge,
    Table,
    TableHead,
    TableCell,
    TableRow,
    TableBody,
    TableSortLabel
} from '@material-ui/core'
import {
    AddCircleOutline,
    DeleteOutlineOutlined,
    EditOutlined
} from '@material-ui/icons'

import styles from './TaskList.module.css';
import { AppDispatch } from '../../app/store'
import { initialState } from './taskSlice'
import { SORT_STATE, READ_TASK } from '../types'
import { selectLoginUser, selectProfiles } from '../auth/authSlice'
import {
    fetchAsyncDeleteTask,
    selectTasks,
    editTask,
    selectTask
} from './taskSlice'

const useStyles = makeStyles((theme: Theme) => ({
    table: {
        tableLayout: "fixed",
    },
    button: {
        margin: theme.spacing(3)
    },
    small: {
        margin: "auto",
        width: theme.spacing(3),
        height: theme.spacing(3)
    },
}))

const TaskList: React.FC = () => {
    const classes = useStyles()
    const dispatch: AppDispatch = useDispatch()
    const tasks = useSelector(selectTasks)
    const loginUser = useSelector(selectLoginUser)
    const profiles = useSelector(selectProfiles)
    const columns = tasks[0] && Object.keys(tasks[0])

    const [ state, setState ] = useState<SORT_STATE>({
        rows: tasks,
        order: "desc",
        activeKey: "",
    })

    const handleClickSortColumn = (column: keyof READ_TASK) => {
        const isDesc = column === state.activeKey && state.order === "desc"
        const newOrder = isDesc ? "asc" : "desc"
        const sortedRows = Array.from(state.rows).sort((a, b) => {
            if (a[column] > b[column]) {
                return newOrder === "asc" ? 1 : -1
            } else if (a[column] < b[column]) {
                return newOrder === "asc" ? -1 : 1
            } else {
                return 0
            }
        })

        setState({
            rows: sortedRows,
            order: newOrder,
            activeKey: column,
        })
    }

    const renderSwitch = (statusName: string) => {
        switch (statusName) {
            case "Not started":
                return (
                    <Badge variant="dot" color="error">
                        {statusName}
                    </Badge>
                )
            case "On going":
                return (
                    <Badge variant="dot" color="primary">
                        {statusName}
                    </Badge>
                )
            case "Done":
                return (
                    <Badge variant="dot" color="secondary">
                        {statusName}
                    </Badge>
                )
            default:
                return null
        }
    }

    const conditionalSrc = (user: number) => {
        const loginProfile = profiles.filter(
            profile => profile.user_profile === user
        )[0]
        return loginProfile?.img !== null ? loginProfile?.img : undefined
    }

    useEffect(() => {
        setState(state => ({
            ...state,
            rows: tasks,
        }))
    },[tasks])

    return (
        <>
            <Button
                className={classes.button} variant="contained" color="primary"
                size="small" startIcon={<AddCircleOutline />}
                onClick={() => {
                    dispatch(
                        editTask({
                            id: 0,
                            task: "",
                            description: "",
                            criteria: "",
                            responsible: loginUser.id,
                            status: "1",
                            category: 1,
                            estimate: 0,
                        })
                    )
                    dispatch(selectTask(initialState.selectedTask))
                }}
            >
                Add New
            </Button>
            {tasks[0]?.task && (
                <Table className={classes.table} size="small">
                    <TableHead>
                        <TableRow>
                            {columns.map((column, columnIndex) =>
                                (column === "task" ||
                                    column === "status" ||
                                    column === "category" ||
                                    column === "estimate" ||
                                    column === "responsible" ||
                                    column === "owner"
                                ) && (
                                    <TableCell key={columnIndex} align="center">
                                        <TableSortLabel
                                            active={state.activeKey === column} direction={state.order}
                                            onClick={() => handleClickSortColumn(column)}
                                        >
                                            <strong>{column}</strong>
                                        </TableSortLabel>
                                    </TableCell>
                                )
                            )}
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {state.rows.map((row, rowIndex) => (
                            <TableRow key={rowIndex} hover>
                                {Object.keys(row).map(
                                    (key, columnIndex) =>
                                        (key === "task" ||
                                            key === "status_name" ||
                                            key === "category_item" ||
                                            key === "estimate"
                                        ) && (
                                            <TableCell
                                                className={styles.taskList__hover} align="center"
                                                key={`${rowIndex}+${columnIndex}`}
                                                onClick={() => {
                                                    dispatch(selectTask(row))
                                                    dispatch(editTask(initialState.editedTask))
                                                }}
                                            >
                                                {key === "status_name" ? (
                                                    renderSwitch(row[key])
                                                ) : (
                                                    <span>{row[key]}</span>
                                                )}
                                            </TableCell>
                                        )
                                )}
                                <TableCell>
                                    <Avatar
                                        className={classes.small} alt="resp"
                                        src={conditionalSrc(row["responsible"])}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Avatar
                                        className={classes.small} alt="owner"
                                        src={conditionalSrc(row["owner"])}
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <button
                                        className={styles.taskList__icon}
                                        disabled={row["owner"] !== loginUser.id}
                                        onClick={() => {
                                            dispatch(fetchAsyncDeleteTask(row.id))
                                        }}
                                    >
                                        <DeleteOutlineOutlined />
                                    </button>
                                    <button
                                        className={styles.taskList__icon}
                                        disabled={row["owner"] !== loginUser.id}
                                        onClick={() => dispatch(editTask(row))}
                                    >
                                        <EditOutlined />
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </>
    )
}

export default TaskList
