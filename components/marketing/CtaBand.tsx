import { APP_SIGNUP_URL } from "./app-url";

export function CtaBand() {
  return (
    <div className="hw-final" style={{ borderTop: "1px solid #1c1c1c" }}>
      <h2 className="mqp-title" style={{ fontSize: "2rem" }}>
        Start your research in one place
      </h2>
      <div className="hw-cta" style={{ justifyContent: "center", marginTop: "18px" }}>
        <a className="mqp-btn solid" style={{ minWidth: "230px" }} href={APP_SIGNUP_URL}>
          Open the terminal →
        </a>
      </div>
      <p style={{ fontSize: ".74rem", color: "#666", marginTop: "16px" }}>
        MarketCatalyst is a research terminal for informational purposes — not investment advice.
      </p>
    </div>
  );
}
