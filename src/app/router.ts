import { createBrowserRouter } from "react-router";
import Stock from "../router/Stock";
import Openai from "../router/Openai";
import FileTransformation from "../router/FileTransformation";
import Dashboard from "../router/Dashboard";
import History from "../router/History";

const router = createBrowserRouter([
  { path: "/", Component: Dashboard },
  { path: "/stock", Component: Stock },
  { path: "/openai", Component: Openai },
  { path: "/file", Component: FileTransformation },
  { path: "/history", Component: History },
]);

export default router;
