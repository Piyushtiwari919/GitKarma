import { Provider } from "react-redux";
import appStore from "./store/store.ts";
import Body from "./components/Body.tsx";

function App() {
  return (
    <>
      <Provider store={appStore}>
        <Body />
      </Provider>
    </>
  );
}

export default App;
