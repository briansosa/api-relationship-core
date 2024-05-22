import { HashRouter, Route, Routes } from "react-router-dom";
import Master from "./components/layout/Master";
import { AppRoutes } from "./routes/appRoutes";
const Router = () => {
  return (
    <div>
      <HashRouter>
        <Routes>
          {AppRoutes.map((route, indexr) =>
            Array.isArray(route.path) ? (
              route.path.map((path, indexp) => (
                <Route
                  key={`${indexr}-${indexp}`}
                  path={path}
                  element={<Master component={route.component} />}
                />
              ))
            ) : (
              <Route
                key={indexr}
                path={route.path}
                element={<Master component={route.component} />}
              />
            )
          )}
        </Routes>
      </HashRouter>
    </div>
  );
};

export default Router;
