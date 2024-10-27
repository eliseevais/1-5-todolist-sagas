import {initializeAppWorkerSaga} from "./app-sagas";
import {authAPI, MeResponseType} from "../api/todolists-api";
import {call, put} from "redux-saga/effects";
import {setIsLoggedInAC} from "../features/Login/auth-reducer";
import {setAppInitializedAC} from "./app-reducer";

let meResponse: MeResponseType;

beforeEach(() => {
  meResponse = {
    resultCode: 0,
    data: {
      login: '',
      email: '',
      id: 12
    },
    messages: []
  }
})
type Example =
  { resultCode: number, messages: Array<string>, data: { id: number, email: string, login: string } }

test('initializedAppWorkerSaga login successful', () => {
  const gen = initializeAppWorkerSaga()
  expect(gen.next().value).toEqual(call(authAPI.me))

  expect(gen.next(meResponse as MeResponseType[]).value).toEqual(put(setIsLoggedInAC(true)))

  expect(gen.next().value).toEqual(put(setAppInitializedAC(true)))
})

test('initializedAppWorkerSaga login unsuccessful', () => {
  const gen = initializeAppWorkerSaga()
  expect(gen.next().value).toEqual(call(authAPI.me))

  meResponse.resultCode = 1
  expect(gen.next(meResponse as MeResponseType[]).value).toEqual(put(setAppInitializedAC(true)))
})