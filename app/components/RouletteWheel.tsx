import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface RouletteSection {
  label: string;
  color: string;
}

interface RouletteWheelProps {
  sections?: RouletteSection[];
  onSpinComplete?: (winningIndex: number) => void;
}

const defaultSections: RouletteSection[] = [
  { label: "7000", color: "#FFE4D6" },
  { label: "7000", color: "#FFD6CC" },
  { label: "9500", color: "#FFE4D6" },
  { label: "9700", color: "#FFD6CC" },
  { label: "9800", color: "#FFE4D6" },
  { label: "7000", color: "#FFD6CC" },
  { label: "9500", color: "#FFE4D6" },
  { label: "9700", color: "#FFD6CC" },
];

export default function RouletteWheel({
  sections = defaultSections,
  onSpinComplete,
}: RouletteWheelProps) {
  const wheelRef = useRef<SVGGElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const lastCrossedSectionRef = useRef<number>(-1);

  const sectionCount = sections.length;
  const sectionAngle = 360 / sectionCount;
  const radius = 140;
  const centerX = 150;
  const centerY = 150;

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    lastCrossedSectionRef.current = -1;

    // ランダムに止まるセクションを決定
    const winningIndex = Math.floor(Math.random() * sectionCount);
    const baseRotation = 360 * 5; // 5回転
    const targetRotation = baseRotation + (360 - (winningIndex * sectionAngle + sectionAngle / 2));

    let previousRotation = currentRotation;

    // ルーレットの回転アニメーション
    gsap.to(wheelRef.current, {
      rotation: currentRotation + targetRotation,
      duration: 4,
      ease: "power3.out",
      transformOrigin: "center center",
      onUpdate: () => {
        const currentRot = gsap.getProperty(wheelRef.current, "rotation") as number;
        const normalizedCurrent = ((currentRot % 360) + 360) % 360;
        const normalizedPrev = ((previousRotation % 360) + 360) % 360;

        // 各セクションの境界をチェック
        for (let i = 0; i < sectionCount; i++) {
          const boundaryAngle = i * sectionAngle;

          // 境界を通過したかチェック（0度の位置 = 針の位置）
          const crossed =
            (normalizedPrev < boundaryAngle && normalizedCurrent >= boundaryAngle) ||
            (normalizedPrev > normalizedCurrent && (boundaryAngle === 0 || normalizedCurrent >= boundaryAngle));

          if (crossed && lastCrossedSectionRef.current !== i) {
            lastCrossedSectionRef.current = i;
            animateNeedleBounce();
            break;
          }
        }

        previousRotation = currentRot;
      },
      onComplete: () => {
        setCurrentRotation(currentRotation + targetRotation);
        setIsSpinning(false);
        if (onSpinComplete) {
          onSpinComplete(winningIndex);
        }
      },
    });
  };

  const animateNeedleBounce = () => {
    // 針が振り子のように揺れるアニメーション（ピンは固定）
    gsap.timeline()
      .to(needleRef.current, {
        rotation: -20,
        duration: 0.1,
        ease: "power2.out",
      })
      .to(needleRef.current, {
        rotation: 18,
        duration: 0.12,
        ease: "power2.inOut",
      })
      .to(needleRef.current, {
        rotation: -10,
        duration: 0.1,
        ease: "power2.inOut",
      })
      .to(needleRef.current, {
        rotation: 0,
        duration: 0.12,
        ease: "elastic.out(1.2, 0.5)",
      });
  };

  // SVGパスを生成する関数
  const createSectionPath = (index: number) => {
    const startAngle = (index * sectionAngle - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * sectionAngle - 90) * (Math.PI / 180);

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = sectionAngle > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  // テキスト位置を計算
  const getTextPosition = (index: number) => {
    const angle = (index * sectionAngle + sectionAngle / 2 - 90) * (Math.PI / 180);
    const textRadius = radius * 0.65;
    const x = centerX + textRadius * Math.cos(angle);
    const y = centerY + textRadius * Math.sin(angle);
    const rotation = index * sectionAngle + sectionAngle / 2;

    return { x, y, rotation };
  };

  // ドット位置を計算
  const getDotPosition = (index: number) => {
    const angle = (index * sectionAngle - 90) * (Math.PI / 180);
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { x, y };
  };

  return (
    <div className="roulette-container">
      <style>{`
        .roulette-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          padding: 2rem;
        }

        .roulette-wheel-wrapper {
          position: relative;
          width: 320px;
          height: 320px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .needle-container {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .pin {
          width: 10px;
          height: 10px;
          background: linear-gradient(135deg, #FFE4D6 0%, #FFDACC 100%);
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          z-index: 3;
          position: relative;
        }

        .needle-triangle {
          position: absolute;
          top: 7px;
          width: 0;
          height: 0;
          border-left: 18px solid transparent;
          border-right: 18px solid transparent;
          border-top: 50px solid #FF6B6B;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
          transform-origin: 50% 0;
          z-index: 1;
        }

        .wheel-svg {
          filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.2));
        }

        .section-text {
          font-size: 20px;
          font-weight: bold;
          fill: #333;
          text-anchor: middle;
          dominant-baseline: middle;
          user-select: none;
        }

        .spin-button {
          padding: 15px 50px;
          font-size: 18px;
          font-weight: bold;
          color: white;
          background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
          border: none;
          border-radius: 50px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
          transition: all 0.3s ease;
        }

        .spin-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 107, 107, 0.5);
        }

        .spin-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <div className="roulette-wheel-wrapper">
        <div className="needle-container">
          <div className="pin" />
          <div className="needle-triangle" ref={needleRef} />
        </div>

        <svg
          width="300"
          height="300"
          viewBox="0 0 300 300"
          className="wheel-svg"
        >
          <g ref={wheelRef}>
            {/* 外側の円（ボーダー） */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius + 8}
              fill="#FF6B6B"
            />

            {/* 各セクション */}
            {sections.map((section, index) => (
              <path
                key={`section-${index}`}
                d={createSectionPath(index)}
                fill={section.color}
                stroke="none"
              />
            ))}

            {/* セクションの境界に丸い点 */}
            {sections.map((_, index) => {
              const pos = getDotPosition(index);
              return (
                <circle
                  key={`dot-${index}`}
                  cx={pos.x}
                  cy={pos.y}
                  r="6"
                  fill="#FF6B6B"
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}

            {/* テキスト */}
            {sections.map((section, index) => {
              const pos = getTextPosition(index);
              return (
                <text
                  key={`text-${index}`}
                  x={pos.x}
                  y={pos.y}
                  className="section-text"
                  transform={`rotate(${pos.rotation}, ${pos.x}, ${pos.y})`}
                >
                  {section.label}
                </text>
              );
            })}

            {/* 中央の円 */}
            <circle
              cx={centerX}
              cy={centerY}
              r="40"
              fill="url(#centerGradient)"
            />

            {/* グラデーション定義 */}
            <defs>
              <linearGradient
                id="centerGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#FF6B6B" />
                <stop offset="100%" stopColor="#FF8E8E" />
              </linearGradient>
            </defs>

            {/* 中央のテキスト */}
            <text
              x={centerX}
              y={centerY}
              className="section-text"
              fill="white"
              fontSize="16"
            >
              スピン
            </text>
          </g>
        </svg>
      </div>

      <button
        className="spin-button"
        onClick={spinWheel}
        disabled={isSpinning}
      >
        {isSpinning ? "回転中..." : "回る"}
      </button>
    </div>
  );
}
