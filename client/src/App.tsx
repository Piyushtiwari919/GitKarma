import { Provider } from "react-redux";
import appStore from "./store/store.ts";
import Body from "./components/Body.tsx";
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <>
      <Provider store={appStore}>
        <Body />
      </Provider>
      <Analytics />
    </>
  );
}

export default App;
