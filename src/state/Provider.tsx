import { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "./store";

interface MyComponentProps {
  children: ReactNode;
}
const Providers: React.FC<MyComponentProps> = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};

export default Providers;
