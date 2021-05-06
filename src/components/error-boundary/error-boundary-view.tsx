import "./error-boundary.scss"
import { ErrorInfo, FunctionComponent } from "react"

interface ErrorBoundaryViewProps {
  error: Error | null
  errorInfo: ErrorInfo | null
}

const ErrorBoundaryView: FunctionComponent<ErrorBoundaryViewProps> = (
  props
) => {
  const handleGoBack = () => {
    // eslint-disable-next-line no-self-assign
    window.location.href = window.location.href
  }
  return (
    <section className="error-boundary">
      <h1 className="error-boundary__title">Something wrong is not right!</h1>
      <h2 className="error-boundary__message">{props.error?.message}</h2>
      <p className="error-boundary__stack">{props.errorInfo?.componentStack}</p>
      <button className="error-boundary__btn-go-back" title='Go back' onClick={handleGoBack}>
        I want to be monke! 🐵
      </button>
    </section>
  )
}

export default ErrorBoundaryView
