import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from 'react-router-dom'
import Send from './Components/Send.tsx'
import Recieve from './Components/Recieve.tsx'

const router = createBrowserRouter(
    createRoutesFromElements(
    <Route>
    <Route path={'/'} element={<App/>}/>
    <Route path={"/send"} element={<Send/>} />
    <Route path={"/recieve"} element={<Recieve/>} />
    </Route>
))

createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router} />
)
