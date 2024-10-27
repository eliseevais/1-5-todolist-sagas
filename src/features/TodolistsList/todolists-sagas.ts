import {call, put, takeEvery} from "redux-saga/effects";
import {setAppStatusAC} from "../../app/app-reducer";
import {ResponseGenerator} from "../../app/store";
import {todolistsAPI} from "../../api/todolists-api";
import {
  addTodolistAC,
  changeTodolistEntityStatusAC,
  changeTodolistTitleAC,
  removeTodolistAC,
  setTodolistsAC
} from "./todolists-reducer";
import {handleServerAppErrorSaga, handleServerNetworkErrorSaga} from "../../utils/error-utils";

// sagasActions
export const fetchTodolistsSagaAC = () => ({type: "TODOLISTS/FETCH-TODOLISTS"} as const)
export const removeTodolistSagaAC = (todolistId: string) => ({type: "TODOLISTS/REMOVE-TODOLIST", todolistId} as const)
export const addTodolistSagaAC = (title: string) => ({type: "TODOLISTS/ADD-TODOLIST", title} as const)
export const changeTodolistTitleSagaAC = (id: string, title: string) => ({
  type: "TODOLISTS/CHANGE-TODOLIST-TITLE",
  id,
  title
} as const)

// sagas
export function* fetchTodolistsWorkerSaga() {
  yield put(setAppStatusAC('loading'));

  const res: ResponseGenerator = yield call(todolistsAPI.getTodolists);
  try {
    yield put(setTodolistsAC(res.data));
    yield put(setAppStatusAC('succeeded'));
  } catch (error) {
    if (error instanceof Error) {
      yield handleServerNetworkErrorSaga(error);
    }
  }
}

export function* removeTodolistWorkerSaga(action: ReturnType<typeof removeTodolistSagaAC>) {
  yield put(setAppStatusAC('loading'));
  yield put(changeTodolistEntityStatusAC(action.todolistId, 'loading'));

  const res: ResponseGenerator = yield call(todolistsAPI.deleteTodolist, action.todolistId);
  try {
    yield put(removeTodolistAC(action.todolistId));
    yield put(setAppStatusAC('succeeded'));
  } catch (error) {
    if (error instanceof Error) {
      yield handleServerNetworkErrorSaga(error);
    }
  }
}

export function* addTodolistWorkerSaga(action: ReturnType<typeof addTodolistSagaAC>) {
  yield put(setAppStatusAC('loading'));

  const res: ResponseGenerator = yield call(todolistsAPI.createTodolist, action.title);
  try {
    if (res.data.resultCode === 0) {
      yield put(addTodolistAC(res.data.data.item));
      yield put(setAppStatusAC('succeeded'));
    } else {
      yield handleServerAppErrorSaga(res.data);
    }
  } catch (error) {
    if (error instanceof Error) {
      yield handleServerNetworkErrorSaga(error);
    }
  }
}

export function* changeTodolistTitleWorkerSaga(action: ReturnType<typeof changeTodolistTitleSagaAC>) {
  const res: ResponseGenerator = yield call(todolistsAPI.updateTodolist, action.id, action.title)
  try {
    yield put(changeTodolistTitleAC(action.id, action.title))
  } catch (error) {
    if (error instanceof Error) {
      yield handleServerNetworkErrorSaga(error);
    }
  }
}

export function* todolistsWatcherSaga() {
  yield takeEvery("TODOLISTS/FETCH-TODOLISTS", fetchTodolistsWorkerSaga)
  yield takeEvery("TODOLISTS/REMOVE-TODOLIST", removeTodolistWorkerSaga)
  yield takeEvery("TODOLISTS/ADD-TODOLIST", addTodolistWorkerSaga)
  yield takeEvery("TODOLISTS/CHANGE-TODOLIST-TITLE", changeTodolistTitleWorkerSaga)
}