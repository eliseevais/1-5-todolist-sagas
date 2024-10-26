import {tasksReducer} from '../features/TodolistsList/tasks-reducer';
import {todolistsReducer} from '../features/TodolistsList/todolists-reducer';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {appReducer} from './app-reducer';
import {authReducer} from '../features/Login/auth-reducer';
import createSagaMiddleware from 'redux-saga';
import {fetchTasksWorkerSaga, removeTaskWorkerSaga, tasksWatcherSaga} from "../features/TodolistsList/tasks-sagas";
import {appWatcherSaga, initializeAppWorkerSaga} from "./app-sagas";
import {takeEvery} from "redux-saga/effects";

// объединяя reducer-ы с помощью combineReducers,
// мы задаём структуру нашего единственного объекта-состояния
const rootReducer = combineReducers({
  tasks: tasksReducer,
  todolists: todolistsReducer,
  app: appReducer,
  auth: authReducer
})

const sagaMiddleware = createSagaMiddleware()

// непосредственно создаём store
export const store = createStore(rootReducer, applyMiddleware(thunkMiddleware, sagaMiddleware));
// определить автоматически тип всего объекта состояния
export type AppRootStateType = ReturnType<typeof rootReducer>

sagaMiddleware.run(rootWatcher)

// function* rootWatcher() {
//   yield appWatcherSaga()
//   yield tasksWatcherSaga()
// }

function* rootWatcher() {
  yield takeEvery("APP/INITIALIZE-APP", initializeAppWorkerSaga)
  yield takeEvery("TASKS/FETCH-TASKS", fetchTasksWorkerSaga)
  yield takeEvery("TASKS/REMOVE-TASK", removeTaskWorkerSaga)
}

// а это, чтобы можно было в консоли браузера обращаться к store в любой момент
// @ts-ignore
window.store = store;


export type ResponseGenerator = {
  config?: any,
  data?: any,
  headers?: any,
  request?: any,
  status?: number,
  statusText?: string
}