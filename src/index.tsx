import React from "react"
import ReactDOM from "react-dom"
import "./index.scss"
import App from "./App"
import reportWebVitals from "./reportWebVitals"
import { ErrorBoundaryComponent } from "./components/common/error-boundary"

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundaryComponent>
      <App />
    </ErrorBoundaryComponent>
  </React.StrictMode>,
  document.getElementById("root")
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log)
