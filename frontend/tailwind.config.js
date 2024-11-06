/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";

export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            animation: {
                "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
                shine: "shine var(--duration) infinite linear",
            },
            keyframes: {
                "border-beam": {
                    "100%": {
                        "offset-distance": "100%",
                    },
                },
                shine: {
                    "0%": {
                        "background-position": "0% 0%",
                    },
                    "50%": {
                        "background-position": "100% 100%",
                    },
                    to: {
                        "background-position": "0% 0%",
                    },
                },
            },
        },
    },
    plugins: [daisyui],
    daisyui: {
        themes: ["aqua"],
    },
};
