import type { LoaderFunctionArgs, HeadersFunction } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import RouletteWheel from "../components/RouletteWheel";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function RoulettePage() {
  const [winningResult, setWinningResult] = useState<string | null>(null);

  const sections = [
    { label: "7000", color: "#FFE4D6" },
    { label: "7000", color: "#FFD6CC" },
    { label: "9500", color: "#FFE4D6" },
    { label: "9700", color: "#FFD6CC" },
    { label: "9800", color: "#FFE4D6" },
    { label: "7000", color: "#FFD6CC" },
    // { label: "9500", color: "#FFE4D6" },
    // { label: "9700", color: "#FFD6CC" },
  ];

  const handleSpinComplete = (winningIndex: number) => {
    const winningSection = sections[winningIndex];
    setWinningResult(`おめでとうございます！${winningSection.label}ポイント獲得！`);
  };

  return (
    <s-page heading="インタラクティブ報酬ルーレット">
      <s-section heading="新規ユーザー報酬">
        <s-paragraph>
          まわしてクーポンを決めよう！
        </s-paragraph>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '2rem'
        }}>
          <RouletteWheel
            sections={sections}
            onSpinComplete={handleSpinComplete}
          />

          {winningResult && (
            <s-box
              padding="base"
              borderWidth="base"
              borderRadius="base"
              background="success"
              style={{ marginTop: '2rem', textAlign: 'center' }}
            >
              <s-heading>{winningResult}</s-heading>
            </s-box>
          )}
        </div>
      </s-section>

      <s-section slot="aside" heading="ルーレットについて">
        <s-paragraph>
          このルーレットはGSAP（GreenSock Animation Platform）を使用して実装されています。
        </s-paragraph>
        <s-unordered-list>
          <s-list-item>スムーズな回転アニメーション</s-list-item>
          <s-list-item>針が境界の点に当たると揺れるエフェクト</s-list-item>
          <s-list-item>リアルな減速効果</s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
