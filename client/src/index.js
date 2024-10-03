import React, {StrictMode} from 'react';
import { createBrowserRouter, RouterProvider, Route, useParams} from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import App, {Home} from './App';
import NotFoundPage from './pages/404';
import ReactDOM from 'react-dom/client';
import { ThemeContext, ThemeContextProvider } from './util/sidebar/ThemeContext';
import Converter from './pages/apps/data-repr/converter';
import Addition from './pages/apps/data-repr/addition';
const routes = [
  {
    path: "/",
    element: <App/>,
  },
  {
    path: "/data-repr/conversions",
    element: <ThemeContextProvider>
    <Home>
      <Converter/>
    </Home>
</ThemeContextProvider>,
  },
  {
    path: "/data-repr/binary-addition",
    element: <ThemeContextProvider>
    <Home>
      <Addition/>
    </Home>
</ThemeContextProvider>,
  },
  {
    path:'*',
    element:<ThemeContextProvider>
    <Home>
      <NotFoundPage/>
    </Home>
</ThemeContextProvider>
  }
]
const router = createBrowserRouter(routes);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

reportWebVitals();