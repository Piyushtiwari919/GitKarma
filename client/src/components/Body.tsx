import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import Layout from "./layout/Layout.tsx";
import Error from "./common/Error.tsx";
import Home from "../pages/Home.tsx";
import Result from "../pages/Result.tsx";

const Body = () => {
  const appRouter = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />} errorElement={<Error />}>
        <Route path="/" element={<Home />} />
        <Route path="/score/:username" element={<Result />} />
      </Route>,
    ),
  );

  return <RouterProvider router={appRouter} />;
};

export default Body;
