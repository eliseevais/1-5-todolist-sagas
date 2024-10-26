import {call, put, takeEvery} from "redux-saga/effects";
import {setAppStatusAC} from "../../app/app-reducer";
import {AxiosResponse} from "axios";
import {GetTasksResponse, ResponseType, todolistsAPI, UpdateTaskModelType} from "../../api/todolists-api";
import {addTaskAC, removeTaskAC, setTasksAC, UpdateDomainTaskModelType, updateTaskAC} from "./tasks-reducer";
import {ResponseGenerator, store} from "../../app/store";

// sagasActions
export const fetchTasks = (todolistId: string) => ({type: 'TASKS/FETCH-TASKS', todolistId})
export const removeTaskSagaAC = (taskId: string, todolistId: string) => ({
  type: 'TASKS/REMOVE-TASK',
  taskId,
  todolistId
})
export const addTaskSagaAC = (title: string, todolistId: string) => ({type: 'TASKS/ADD-TASKS', title, todolistId})
export const updateTaskSagaAC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) => (
  {type: 'TASKS/UPDATE-TASK', taskId, domainModel, todolistId})

// sagas
export function* fetchTasksWorkerSaga(action: ReturnType<typeof fetchTasks>) {
  yield put(setAppStatusAC('loading'));

  const res: AxiosResponse<GetTasksResponse> = yield call(todolistsAPI.getTasks, action.todolistId);
  try {
    const tasks = res.data.items;
    yield put(setTasksAC(tasks, action.todolistId));
    yield put(setAppStatusAC('succeeded'))
  } catch (error) {
    console.log('some error from catch');
    yield put(setAppStatusAC('failed'));
  }
}

export function* removeTaskWorkerSaga(action: ReturnType<typeof removeTaskSagaAC>) {
  const res: AxiosResponse<ResponseType> = yield call(todolistsAPI.deleteTask, action.todolistId, action.taskId);
  try {
    yield put(removeTaskAC(action.taskId, action.todolistId))
  } catch (error) {
    console.log('some error from catch');
    yield put(setAppStatusAC('failed'));
  }
}

export function* addTaskWorkerSaga(action: ReturnType<typeof addTaskSagaAC>) {
  yield put(setAppStatusAC('loading'));

  const res: ResponseGenerator = yield call(todolistsAPI.createTask, action.todolistId, action.title)
  try {
    if (res.data.resultCode === 0) {
      const task = res.data.data.item
      yield put(addTaskAC(task))
      yield put(setAppStatusAC('succeeded'))
    } else {
      // handleServerAppError(res.data, dispatch);
      console.log('some error');
      yield put(setAppStatusAC('failed'));
    }
  } catch (error) {
    // handleServerNetworkError(error, dispatch)
    console.log('some error from catch');
    yield put(setAppStatusAC('failed'));
  }
}

export function* updateTaskWorkerSaga(action: ReturnType<typeof updateTaskSagaAC>) {
  const state = store.getState();
  const task = state.tasks[action.todolistId].find(t => t.id === action.taskId);
  if (!task) {
    console.warn('task not found in the state');
    return
  }

  const apiModel: UpdateTaskModelType = {
    deadline: task.deadline,
    description: task.description,
    priority: task.priority,
    startDate: task.startDate,
    title: task.title,
    status: task.status,
    ...action.domainModel
  }

  const res: ResponseGenerator = yield todolistsAPI.updateTask(action.todolistId, action.taskId, apiModel);
  try {
    if (res.data.resultCode === 0) {
      yield put(updateTaskAC(action.taskId, action.domainModel, action.todolistId))
    } else {
      // handleServerAppError(res.data, dispatch);
      console.log('some error')
    }
  } catch (error) {
    // handleServerNetworkError(error, dispatch);
    console.log('some error from catch');
    yield put(setAppStatusAC('failed'));
  }
}

export function* tasksWatcherSaga() {
yield takeEvery("TASKS/FETCH-TASKS", fetchTasksWorkerSaga)
yield takeEvery("TASKS/REMOVE-TASK", removeTaskWorkerSaga)
yield takeEvery("TASKS/ADD-TASKS", addTaskWorkerSaga)
yield takeEvery("TASKS/UPDATE-TASK", updateTaskWorkerSaga)
}