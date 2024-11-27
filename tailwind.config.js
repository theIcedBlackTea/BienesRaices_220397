/** @type {import('tailwindcss').Config} */
export default {
  content: ['./views/**/*.pug'], 
  theme: {
    extend: {
      boxShadow: {
        '5xl': '0 10px 25px rgba(0, 0, 0, 0.3)', 
      },
      fontFamily: {
        professional: ['Montserrat', 'sans-serif'], 
      },
      colors: {
        primary: '#FFFFFF',  
        secondary: '#000000', 
        accent: '#FAEBD7',    
        natural: '#606C38',
        dark: '#BC6C25',     
        error: '#FF5252',    
      },
    },
  },
  plugins: [],
};
