import {createStore, applyMiddleware, compose, combineReducers} from 'redux';
import thunk from 'redux-thunk';
// import devToolsEnhancer from 'remote-redux-devtools';
import {composeWithDevTools} from 'redux-devtools-extension';
// import {composeWithDevTools} from '@redux-devtools/core';
// import {termsListReducers} from './app/Reducers/termReducers';

// import {updateTheme} from './app/actions/userActions';

// Exemplu de reducer
const exampleReducer = (state = { value: 0 }, action) => {
  switch (action.type) {
      case 'INCREMENT':
          return { ...state, value: state.value + 1 };
      case 'DECREMENT':
          return { ...state, value: state.value - 1 };
      default:
          return state;
  }
};
const reducer = combineReducers({
  example: exampleReducer,
});

const middleware = [thunk];

// const composeEnhancers =
//   typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
//     ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
//         // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
//       })
//     : compose;

// const enhancer = composeEnhancers(
//   applyMiddleware(...middleware),
//   // other store enhancers if any
// );


const store = createStore(
  reducer,
  // initialState,
  
  composeWithDevTools(applyMiddleware(...middleware)),
);


// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch



export default store;