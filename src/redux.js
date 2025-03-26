import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./store/reducer/rootReducer";
import thunk from "redux-thunk";
import { persistStore } from "redux-persist";

const reduxConfig = () => {
    const store = configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
    });

    const persistor = persistStore(store);
    return { store, persistor };
};

export default reduxConfig;
