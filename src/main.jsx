import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import { ThemeProvider } from "./theme/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<BrowserRouter>
			<ThemeProvider>
				<ErrorBoundary>
					<AuthProvider>
						<App />
					</AuthProvider>
				</ErrorBoundary>
			</ThemeProvider>
		</BrowserRouter>
	</StrictMode>,
);