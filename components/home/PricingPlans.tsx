"use client";

import { useState } from "react";
import { APP_SIGNUP_URL } from "@/components/marketing/app-url";
import { plans } from "./data";

// ── Pricing ─────────────────────────────────────────────────
export function PricingPlans() {
  const [selected, setSelected] = useState(() => plans.find((p) => p.popular)?.name ?? plans[0].name);

  return (
    <section className="mc-pricing" id="pricing">
      <div className="mc-inner">
        <div className="mc-head-row">
          <div>
            <div className="mc-kicker">Pricing</div>
            <h2 className="mc-h2">
              One platform. <span className="mc-serif">Simple plans.</span>
            </h2>
          </div>
          <div className="mc-head-note">Cancel anytime, no questions asked</div>
        </div>

        <div className="mc-plans" role="radiogroup" aria-label="Pricing plans">
          {plans.map((p) => {
            const isSelected = p.name === selected;
            return (
              <div
                className={`mc-plan${isSelected ? " is-hot" : ""}`}
                key={p.name}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => setSelected(p.name)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(p.name);
                  }
                }}
              >
                <div className="mc-plan-top">
                  <span className="mc-plan-name">{p.name}</span>
                  {p.popular ? <span className="mc-plan-flag">Most popular</span> : null}
                </div>
                <div className="mc-plan-price">
                  <b>{p.price}</b>
                  <span>/mo</span>
                </div>
                <p className="mc-plan-blurb">{p.blurb}</p>
                <div className="mc-plan-feats">
                  {p.features.map((f) => (
                    <div className="mc-plan-feat" key={f}>
                      <i>✓</i>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <a
                  className={`mc-plan-cta${isSelected ? " is-solid" : ""}`}
                  href={APP_SIGNUP_URL}
                  onClick={(e) => e.stopPropagation()}
                >
                  {p.cta}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
