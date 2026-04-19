import { createReducer } from "@reduxjs/toolkit";
import { toggleSidebar } from "../actions/config.action";

const initialState = {
    app: {
        showSideBar: false
    }
};


export type ConfigStateType = typeof initialState;

export default createReducer(initialState, (builder) => {
    builder
        .addCase(toggleSidebar, (state, action) => {
            state.app.showSideBar = action?.payload?.showSidebar ?? !(state?.app?.showSideBar)
            return state
        });
});
