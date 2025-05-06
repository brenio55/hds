module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
        {
            dark: {
                ...require("daisyui/src/theming/themes")["data-theme=dark"],
                "--btn-transition": "all 0.1s ease-in-out",
            },
        },
        {
            light: {
                ...require("daisyui/src/theming/themes")["data-theme=light"],
                "--btn-transition": "all 0.1s ease-in-out", 
            },
        },
    ],
    darkTheme: "dark",
  },
};
