import { useEffect } from "react";
import { logout } from "../utils/auth";

function useAutoLogout() {

    useEffect(() => {

        const TIMEOUT = 5 * 60 * 1000;

        let timer;

        const resetTimer = () => {

            clearTimeout(timer);

            timer = setTimeout(() => {
                logout();
            }, TIMEOUT);

        };

        [
            "click",
            "mousemove",
            "keypress",
            "scroll",
            "touchstart"
        ].forEach(event =>
            window.addEventListener(event, resetTimer)
        );

        resetTimer();

        return () => {

            clearTimeout(timer);

            [
                "click",
                "mousemove",
                "keypress",
                "scroll",
                "touchstart"
            ].forEach(event =>
                window.removeEventListener(event, resetTimer)
            );

        };

    }, []);

}

export default useAutoLogout;