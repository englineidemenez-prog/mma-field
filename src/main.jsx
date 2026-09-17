import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import PequenosDaFeApp from "./PequenosDaFe.jsx";

// Duas SPAs no mesmo deploy, roteadas pelo caminho da URL:
// "/pequenos-da-fe" -> gate de login/assinatura do Pequenos da Fé Kids
// (que depois redireciona para o jogo estático em /pequenos-da-fe/app/).
// qualquer outro caminho -> MMA Field (comportamento original, inalterado).
ReactDOM.createRoot(document.getElementById("root")).render(
  window.location.pathname.startsWith("/pequenos-da-fe") ? <PequenosDaFeApp /> : <App />
);