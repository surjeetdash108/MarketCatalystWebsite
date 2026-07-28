import { ScaledScreen } from "./ScaledScreen";
import { StockDetailContent } from "./StockDetailContent";

export function StockThumb() {
  return (
    <ScaledScreen>
      <div style={{ padding: "20px 28px 0" }}>
        <StockDetailContent />
      </div>
    </ScaledScreen>
  );
}
