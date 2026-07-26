"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Stage =
  | "home"
  | "walk"
  | "prologue"
  | "chapter"
  | "align"
  | "puzzle"
  | "result"
  | "finale"
  | "reward";
type WalkPlan = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  from: string;
  to: string;
  next: "prologue" | "chapter";
  targetChapter?: number;
};
type PuzzleState = {
  found: string[];
  selected: string[];
  clues: string[];
  illuminated: boolean;
  evidence: Record<string, number>;
};

type Chapter = {
  id: string;
  order: string;
  place: string;
  title: string;
  subtitle: string;
  scene: string;
  card: string[];
  answer: string;
  story: string[];
  task: string;
  knowledge: string;
  takeaway: string;
};

const chapters: Chapter[] = [
  {
    id: "bridge",
    order: "序章",
    place: "月亮湾",
    title: "水镜寻桥",
    subtitle: "被抹去的桥名",
    scene: "/assets/scenes/moonbay-wall-v5.webp",
    card: ["/assets/cards/card-01-moonbay.png"],
    answer: "舍西桥",
    story: [
      "雨停以后，月亮湾的墙绘少了三个字。水面却把消失的笔画藏进了倒影。",
      "题卡上的问号不是答案的位置，而是观察的方向。沿水纹寻找三枚发光的残字吧。",
    ],
    task: "在虚拟墙绘中依次找到三枚桥名残字，再输入完整名称。",
    knowledge:
      "舍西桥横跨吴家港，是连接村落关系与地方记忆的重要桥梁。桥不仅供人通行，也维系着宗族、友谊与共同愿望。",
    takeaway: "桥连接的不只是两岸，也连接人与人的记忆。",
  },
  {
    id: "mulberry",
    order: "第一卷",
    place: "三官庙前",
    title: "桑基初醒",
    subtitle: "照亮卡片中央",
    scene: "/assets/scenes/sanguan-temple-v5.webp",
    card: ["/assets/cards/card-02-shexi.png"],
    answer: "塘基种桑",
    story: [
      "月亮湾找回的桥名为我们指明了方向。穿过舍西桥，我们来到三官庙前，阿荻展开了下一张题卡。",
      "两道残缺线索分别指向“照亮”和“卡片中央”。只有完成动作，秘卷才会显字。",
    ],
    task: "拼合动作提示，移动手电筒照亮题卡中央。",
    knowledge:
      "先民把开挖鱼塘得到的土筑成塘基，并在较高、排水良好的塘基上种桑，形成水陆结合的生产空间。",
    takeaway: "一方塘土被重新安排，便能同时承载水产与桑树。",
  },
  {
    id: "silkworm",
    order: "第二卷",
    place: "三官桥 · 三官庙",
    title: "四纹入蚕房",
    subtitle: "莲、鱼、龙、元宝",
    scene: "/assets/scenes/sanguan-temple-v5.webp",
    card: ["/assets/cards/card-03-sanguan.png"],
    answer: "桑叶喂蚕",
    story: [
      "桑树舒展新叶，风却没能把叶片送进蚕房。门上的四枚纹样顺序被打乱了。",
      "三官桥的莲花、水上舞台的鱼与龙、庙前的元宝，是开启蚕房的四把钥匙。",
    ],
    task: "依照题卡顺序点击四枚纹样，读出它们对应的拼音。",
    knowledge:
      "桑树生长出的叶片是家蚕的重要食物。养蚕把塘基上的植物生产转化为蚕茧与后续可利用的蚕沙。",
    takeaway: "桑叶进入蚕房，植物的能量开始流向下一环。",
  },
  {
    id: "fish",
    order: "第三卷",
    place: "积善桥 · 一元茶馆",
    title: "一八九六",
    subtitle: "三组证据的年份",
    scene: "/assets/scenes/jishan-bridge-v1.webp",
    card: ["/assets/cards/card-04-jishan-overlay-v2.webp"],
    answer: "蚕沙养鱼",
    story: [
      "蚕房恢复了生机，鱼塘却仍缺少养分。沿着水巷前行，我们在积善桥前发现了第一组异常轮廓。",
      "阿荻取出透明题卡。让卡上的屋檐、窗棂与桥洞和眼前建筑一一重合，隐藏的数字才会出现。",
    ],
    task: "完成透明题卡对景，再核验其余数字，计算 1A9(B×C)。",
    knowledge:
      "一元茶馆始建于1896年。谜题以这一文化年份为钥匙，同时揭示蚕沙可作为鱼塘的有机养分。",
    takeaway: "生产中的余料没有被丢弃，而是成为鱼塘的新资源。",
  },
  {
    id: "pond",
    order: "第四卷",
    place: "一元茶馆",
    title: "壁龛旧物",
    subtitle: "空间里的四字暗语",
    scene: "/assets/scenes/teahouse-interior-v5.webp",
    card: [
      "/assets/cards/bookmark-front-v2.jpg",
      "/assets/cards/bookmark-back-v2.jpg",
    ],
    answer: "鱼粪肥塘",
    story: [
      "鱼群终于苏醒，秘卷却只剩最后四格空白。阿荻在一元茶馆壁龛中取下一枚旧书签，正面的四枚轮廓标出了谜底顺序。",
      "把书签翻到背面：上层物件与下层文字共享同一套拼图位置。依次找到晾衣架、日历、洗脸盆和热水罐，同位置的四个字就会浮现。",
    ],
    task: "依照书签正面的顺序，在背面物件拼图中寻找四件旧物，读取同位置文字。",
    knowledge:
      "鱼类活动与排泄物为水体带来养分，并在塘内继续转化。鱼塘不是循环终点，而是积累塘泥、返回塘基的中转站。",
    takeaway: "每一环都在获得，也在为下一环留下可利用的资源。",
  },
];

const blankPuzzle = (): PuzzleState => ({
  found: [],
  selected: [],
  clues: [],
  illuminated: false,
  evidence: {},
});

function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[，。！？、,.!?\s"'“”‘’\-—_]/g, "")
    .replace(/舍西橋/g, "舍西桥")
    .replace(/塘基種桑/g, "塘基种桑")
    .replace(/桑葉餵蠶/g, "桑叶喂蚕")
    .replace(/蠶沙養魚/g, "蚕沙养鱼")
    .replace(/蚕砂养鱼/g, "蚕沙养鱼")
    .replace(/魚糞肥塘/g, "鱼粪肥塘")
    .replace(/塘泥雍桑/g, "塘泥壅桑");
}

function Icon({ name }: { name: "sound" | "book" | "card" | "gear" }) {
  const paths = {
    sound: "M4 10v4h3l4 3V7L7 10H4Zm10-2.5a6 6 0 0 1 0 9m2.5-11.5a9.5 9.5 0 0 1 0 14",
    book: "M5 4.5h9a3 3 0 0 1 3 3V19H8a3 3 0 0 1-3-3V4.5Zm3 0V19",
    card: "M4 6.5h16v11H4v-11Zm3 3h5m-5 3h8",
    gear: "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm0-5v2m0 13v2m8.5-8.5h-2m-13 0h-2m14.5-6-1.5 1.5m-9 9L6 18m12 0-1.5-1.5m-9-9L6 6",
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

export default function Home() {
  const [stage, setStage] = useState<Stage>("home");
  const [chapterIndex, setChapterIndex] = useState(0);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [errors, setErrors] = useState(0);
  const [puzzle, setPuzzle] = useState<PuzzleState>(blankPuzzle);
  const [cardOpen, setCardOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [message, setMessage] = useState("");
  const [completed, setCompleted] = useState<string[]>([]);
  const [restored, setRestored] = useState(false);
  const [walk, setWalk] = useState<WalkPlan | null>(null);
  const [evidenceScene, setEvidenceScene] = useState<
    "fish" | "signs" | null
  >(null);
  const audioRef = useRef<AudioContext | null>(null);

  const chapter = chapters[chapterIndex];
  const activeScene = useMemo(() => {
    if (stage === "walk" && walk) return walk.from;
    if (stage === "home") return "/assets/scenes/gate.png";
    if (stage === "prologue") return "/assets/scenes/gate-lane.png";
    if (stage === "finale" || stage === "reward")
      return "/assets/scenes/courtyard.png";
    return chapter.scene;
  }, [chapter.scene, stage, walk]);

  useEffect(() => {
    const saved = localStorage.getItem("digang-mystery-progress");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      const frame = window.requestAnimationFrame(() => {
        if (Array.isArray(parsed.completed)) setCompleted(parsed.completed);
        if (Number.isInteger(parsed.chapterIndex)) {
          setChapterIndex(Math.min(parsed.chapterIndex, chapters.length - 1));
        }
      });
      return () => window.cancelAnimationFrame(frame);
    } catch {
      // A damaged local save should never block a new journey.
    }
  }, []);

  useEffect(() => {
    const preview = new URLSearchParams(window.location.search).get("preview");
    if (
      ![
        "moonbay-zoom",
        "patterns",
        "jishan",
        "fish",
        "signs",
        "pond",
        "reward",
      ].includes(preview ?? "")
    )
      return;
    const frame = window.requestAnimationFrame(() => {
      if (preview === "moonbay-zoom") {
        setChapterIndex(0);
        setDialogueIndex(0);
        setPuzzle(blankPuzzle());
        setStage("puzzle");
        return;
      }
      if (preview === "patterns") {
        setChapterIndex(2);
        setDialogueIndex(0);
        setPuzzle(blankPuzzle());
        setStage("puzzle");
        return;
      }
      if (preview === "pond") {
        setChapterIndex(4);
        setDialogueIndex(0);
        setPuzzle(blankPuzzle());
        setStage("puzzle");
        return;
      }
      if (preview === "reward") {
        setChapterIndex(4);
        setCompleted(chapters.map((item) => item.id));
        setRestored(true);
        setStage("reward");
        return;
      }
      setChapterIndex(3);
      setDialogueIndex(0);
      if (preview === "jishan") {
        setPuzzle(blankPuzzle());
        setStage("align");
        return;
      }
      setPuzzle({
        ...blankPuzzle(),
        evidence: { A: 8 },
      });
      setStage("puzzle");
      setEvidenceScene(preview as "fish" | "signs");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "digang-mystery-progress",
      JSON.stringify({ completed, chapterIndex }),
    );
  }, [completed, chapterIndex]);

  useEffect(() => {
    if (stage !== "walk" || !walk) return;
    const timer = window.setTimeout(() => {
      if (walk.next === "prologue") {
        setDialogueIndex(0);
        setStage("prologue");
      } else {
        const target = walk.targetChapter ?? chapterIndex;
        setChapterIndex(target);
        setPuzzle(blankPuzzle());
        setAnswer("");
        setMessage("");
        setErrors(0);
        setDialogueIndex(0);
        setStage("chapter");
      }
      setWalk(null);
    }, 6800);
    return () => window.clearTimeout(timer);
  }, [chapterIndex, stage, walk]);

  function tone(kind: "tap" | "success" | "error") {
    if (!soundOn || typeof window === "undefined") return;
    const AudioCtx =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = audioRef.current ?? new AudioCtx();
    audioRef.current = ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = kind === "success" ? "sine" : "triangle";
    osc.frequency.value =
      kind === "success" ? 660 : kind === "error" ? 180 : 420;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.28);
  }

  function startWalk(plan: WalkPlan) {
    setWalk(plan);
    setStage("walk");
  }

  function finishWalk() {
    if (!walk) return;
    tone("tap");
    if (walk.next === "prologue") {
      setDialogueIndex(0);
      setStage("prologue");
    } else {
      const target = walk.targetChapter ?? chapterIndex;
      setChapterIndex(target);
      resetPuzzleState();
      setDialogueIndex(0);
      setStage("chapter");
    }
    setWalk(null);
  }

  function begin() {
    tone("tap");
    startWalk({
      id: "enter-village",
      eyebrow: "第一段路 · 荻港村口",
      title: "跟随阿荻走进古村",
      subtitle: "穿过木门与石板路，故事将在村中醒来",
      from: "/assets/scenes/gate.png",
      to: "/assets/scenes/gate-lane.png",
      next: "prologue",
    });
  }

  function nextPrologue() {
    tone("tap");
    if (dialogueIndex < 3) {
      setDialogueIndex((value) => value + 1);
      return;
    }
    startWalk({
      id: "to-moonbay",
      eyebrow: "前往第一处线索",
      title: "沿水巷漫步至月亮湾",
      subtitle: "墙绘就在转过石巷之后",
      from: "/assets/scenes/gate-lane.png",
      to: "/assets/scenes/moonbay-wall-v5.webp",
      next: "chapter",
      targetChapter: 0,
    });
  }

  function nextChapterDialogue() {
    tone("tap");
    if (dialogueIndex < chapter.story.length - 1) {
      setDialogueIndex((value) => value + 1);
      return;
    }
    setStage(chapterIndex === 3 ? "align" : "puzzle");
    setDialogueIndex(0);
  }

  function resetPuzzleState() {
    setPuzzle(blankPuzzle());
    setAnswer("");
    setMessage("");
    setErrors(0);
    setEvidenceScene(null);
  }

  function checkAnswer() {
    const evidenceReady = [
      puzzle.found.length === 3,
      puzzle.illuminated,
      puzzle.selected.length === 4,
      Object.keys(puzzle.evidence).length === 3,
      puzzle.selected.length === 4,
    ][chapterIndex];
    if (!evidenceReady) {
      tone("error");
      setMessage("最终推理尚未开放：请先完成场景中的全部观察与操作。");
      return;
    }
    const expected = normalizeAnswer(chapter.answer);
    if (normalizeAnswer(answer) === expected) {
      tone("success");
      setMessage("");
      setCompleted((items) =>
        items.includes(chapter.id) ? items : [...items, chapter.id],
      );
      setStage("result");
      return;
    }
    tone("error");
    setErrors((value) => value + 1);
    setMessage(
      errors === 0
        ? "答案还没有形成完整的四字关系，再检查刚刚收集的证据。"
        : errors === 1
          ? `提示：答案与“${chapter.takeaway}”直接相关。`
          : `阿荻推演：${chapter.answer.slice(0, 2)}＿＿`,
    );
  }

  function continueJourney() {
    tone("tap");
    if (chapterIndex === chapters.length - 1) {
      setStage("finale");
      return;
    }
    const target = chapterIndex + 1;
    if (chapterIndex === 0) {
      startWalk({
        id: "moonbay-to-temple",
        eyebrow: "桥名指向下一段村路",
        title: "穿过舍西桥，前往三官庙",
        subtitle: "石桥、窄巷与庙前古树从身边掠过",
        from: "/assets/scenes/moonbay-wall-v5.webp",
        to: "/assets/scenes/sanguan-temple-v5.webp",
        next: "chapter",
        targetChapter: target,
      });
      return;
    }
    if (chapterIndex === 2) {
      startWalk({
        id: "temple-to-jishan",
        eyebrow: "离开三官庙",
        title: "沿着水巷走向积善桥",
        subtitle: "白墙、木窗与桥洞在河面倒影中渐渐重合",
        from: "/assets/scenes/sanguan-temple-v5.webp",
        to: "/assets/scenes/jishan-bridge-v1.webp",
        next: "chapter",
        targetChapter: target,
      });
      return;
    }
    if (chapterIndex === 3) {
      startWalk({
        id: "jishan-to-teahouse",
        eyebrow: "数字指向下一处村落记忆",
        title: "穿过积善桥，循茶香入馆",
        subtitle: "水巷渐远，一元茶馆的木门缓缓打开",
        from: "/assets/scenes/jishan-bridge-v1.webp",
        to: "/assets/scenes/teahouse-interior-v5.webp",
        next: "chapter",
        targetChapter: target,
      });
      return;
    }
    setChapterIndex(target);
    resetPuzzleState();
    setDialogueIndex(0);
    setStage("chapter");
  }

  function restart() {
    localStorage.removeItem("digang-mystery-progress");
    setStage("home");
    setChapterIndex(0);
    setDialogueIndex(0);
    setCompleted([]);
    setRestored(false);
    setWalk(null);
    resetPuzzleState();
  }

  const prologueLines = [
    "欢迎来到荻港。我叫阿荻，是这卷桑基秘卷的守护人。",
    "昨夜，卷中的句子突然失去顺序。水还在流动，村庄却忘记了万物为什么彼此相连。",
    "我们会经过月亮湾、舍西桥、三官桥、积善桥和一元茶馆。每道谜题都藏着一段村庄记忆。",
    "请带上题卡。观察、操作、推理之后，再输入你真正相信的答案。",
  ];

  return (
    <main className="game-shell">
      <section className={`game-frame stage-${stage}`}>
        <div
          className="scene-layer"
          key={`${activeScene}-${chapterIndex}-${stage}`}
          style={{ backgroundImage: `url("${activeScene}")` }}
        />
        <div className="scene-light" />
        <div className="floating-leaves" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>

        {stage !== "home" && stage !== "walk" && (
          <header className="game-hud">
            <button
              className="round-icon"
              onClick={() => setSoundOn((value) => !value)}
              aria-label={soundOn ? "关闭声音" : "打开声音"}
            >
              <Icon name="sound" />
              {!soundOn && <span className="muted-line" />}
            </button>
            <div className="progress-scroll" aria-label="解谜进度">
              <span>
                {stage === "finale"
                  ? "终章"
                  : stage === "reward"
                    ? "通关奖励"
                    : chapter.order}
              </span>
              <div className="progress-dots">
                {chapters.map((item, index) => (
                  <i
                    key={item.id}
                    className={
                      completed.includes(item.id)
                        ? "done"
                        : index === chapterIndex && stage !== "finale"
                          ? "active"
                          : ""
                    }
                  />
                ))}
              </div>
            </div>
            <button
              className="round-icon"
              onClick={() => setSettingsOpen(true)}
              aria-label="打开设置"
            >
              <Icon name="gear" />
            </button>
          </header>
        )}

        {stage === "home" && (
          <div className="home-screen">
            <div className="title-seal">桑基秘卷</div>
            <h1>荻港之谜</h1>
            <p>一场穿行古村的动画推理之旅</p>
            <div className="home-actions">
              <button className="primary-button" onClick={begin}>
                开始探秘
                <span>进入虚拟荻港</span>
              </button>
              <button
                className="secondary-button"
                onClick={() => setStoryOpen(true)}
              >
                <Icon name="book" />
                故事说明
              </button>
              <button
                className="secondary-button"
                onClick={() => setSettingsOpen(true)}
              >
                <Icon name="gear" />
                游戏设置
              </button>
            </div>
            <small>建议佩戴耳机 · 竖屏体验</small>
          </div>
        )}

        {stage === "walk" && walk && (
          <WalkSequence plan={walk} onSkip={finishWalk} />
        )}

        {stage === "prologue" && (
          <Dialogue
            text={prologueLines[dialogueIndex]}
            step={dialogueIndex + 1}
            total={prologueLines.length}
            onNext={nextPrologue}
          />
        )}

        {stage === "chapter" && (
          <>
            <div className="chapter-banner">
              <span>{chapter.order}</span>
              <h2>{chapter.title}</h2>
              <p>{chapter.place}</p>
            </div>
            <Dialogue
              text={chapter.story[dialogueIndex]}
              step={dialogueIndex + 1}
              total={chapter.story.length}
              onNext={nextChapterDialogue}
            />
          </>
        )}

        {stage === "align" && chapterIndex === 3 && (
          <JishanAlignment
            tone={tone}
            onComplete={() => {
              setPuzzle((state) => ({
                ...state,
                evidence: { ...state.evidence, A: 8 },
              }));
              setStage("puzzle");
            }}
          />
        )}

        {stage === "puzzle" && (
          <div className="puzzle-screen">
            <div className="puzzle-heading">
              <span>{chapter.place}</span>
              <h2>{chapter.title}</h2>
              <p>{chapter.task}</p>
            </div>

            <div className="puzzle-workbench">
              {chapterIndex === 0 && (
                <BridgePuzzle puzzle={puzzle} setPuzzle={setPuzzle} tone={tone} />
              )}
              {chapterIndex === 1 && (
                <FlashlightPuzzle
                  puzzle={puzzle}
                  setPuzzle={setPuzzle}
                  tone={tone}
                />
              )}
              {chapterIndex === 2 && (
                <PatternPuzzle
                  puzzle={puzzle}
                  setPuzzle={setPuzzle}
                  tone={tone}
                />
              )}
              {chapterIndex === 3 && (
                <YearPuzzle
                  puzzle={puzzle}
                  tone={tone}
                  onOpenEvidence={setEvidenceScene}
                />
              )}
              {chapterIndex === 4 && (
                <ObjectsPuzzle
                  puzzle={puzzle}
                  setPuzzle={setPuzzle}
                  tone={tone}
                />
              )}
            </div>

            <div className="answer-panel">
              <label htmlFor="answer">最终推理</label>
              <div>
                <input
                  id="answer"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && checkAnswer()}
                  placeholder="输入完整谜底"
                  autoComplete="off"
                />
                <button onClick={checkAnswer}>确认</button>
              </div>
              {message && <p className="answer-message">{message}</p>}
            </div>

            <button className="card-tab" onClick={() => setCardOpen(true)}>
              <Icon name="card" />
              查看题卡
            </button>
          </div>
        )}

        {stage === "puzzle" && chapterIndex === 3 && evidenceScene && (
          <CountingEvidenceScene
            type={evidenceScene}
            tone={tone}
            onClose={() => setEvidenceScene(null)}
            onComplete={(value) => {
              const key = evidenceScene === "fish" ? "B" : "C";
              setPuzzle((state) => ({
                ...state,
                evidence: { ...state.evidence, [key]: value },
              }));
              setEvidenceScene(null);
            }}
          />
        )}

        {stage === "result" && (
          <div className="result-screen">
            <div className="result-orbit">
              <span>{chapter.answer}</span>
            </div>
            <p className="result-kicker">秘卷已修复 · {chapter.order}</p>
            <h2>{chapter.answer}</h2>
            <article>
              <h3>这一环发生了什么？</h3>
              <p>{chapter.knowledge}</p>
              <strong>{chapter.takeaway}</strong>
            </article>
            <button className="primary-button compact" onClick={continueJourney}>
              {chapterIndex === chapters.length - 1
                ? "合拢桑基秘卷"
                : "跟随阿荻继续前行"}
            </button>
          </div>
        )}

        {stage === "finale" && (
          <div className="finale-screen">
            {!restored ? (
              <>
                <p className="result-kicker">隐藏终章 · 泥归桑基</p>
                <h2>循环还差最后一步</h2>
                <div className="cycle-diagram">
                  {[
                    "塘基种桑",
                    "桑叶喂蚕",
                    "蚕沙养鱼",
                    "鱼粪肥塘",
                  ].map((item, index) => (
                    <span key={item} style={{ "--i": index } as React.CSSProperties}>
                      {item}
                    </span>
                  ))}
                  <b>？</b>
                </div>
                <p>
                  鱼塘沉积的塘泥富含养分。转动绞盘，让它回到桑树根部，完成真正的闭环。
                </p>
                <button
                  className="mud-lever"
                  onClick={() => {
                    tone("success");
                    setRestored(true);
                  }}
                >
                  <i />
                  <span>向上拖动绞盘</span>
                </button>
              </>
            ) : (
              <div className="reward-card">
                <span className="reward-rays" />
                <p>桑基秘卷 · 完整复原</p>
                <h2>塘泥壅桑</h2>
                <div className="full-cycle">
                  塘基种桑 → 桑叶喂蚕 → 蚕沙养鱼 → 鱼粪肥塘 → 塘泥壅桑
                </div>
                <blockquote>
                  “真正被找回的不是一卷旧文字，而是一种让万物彼此成全的办法。”
                </blockquote>
                <div className="badge">
                  <i>✓</i>
                  <span>
                    桑基秘卷修复者
                    <small>DI GANG ECOLOGICAL ARCHIVIST</small>
                  </span>
                </div>
                <p className="final-lesson">
                  桑、蚕、鱼、塘不是五个孤立答案，而是一套减少浪费、循环利用、因地制宜的农业智慧。
                </p>
                <button
                  className="primary-button compact reward-claim-button"
                  onClick={() => {
                    tone("success");
                    setStage("reward");
                  }}
                >
                  领取通关奖励
                </button>
              </div>
            )}
          </div>
        )}

        {stage === "reward" && (
          <div className="coupon-reward-screen">
            <div className="reward-confetti" aria-hidden="true">
              {Array.from({ length: 12 }).map((_, index) => (
                <i
                  key={index}
                  style={
                    {
                      "--confetti-index": index,
                      "--confetti-x": `${(index * 37) % 96}%`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
            <header className="coupon-reward-heading">
              <span>挑战完成 · 茶香相赠</span>
              <h2>恭喜您完成挑战！</h2>
              <p>奖励一元茶馆5元茶券一张！</p>
            </header>
            <div className="coupon-ticket-wrap">
              <span className="coupon-ticket-glow" aria-hidden="true" />
              <img
                src="/assets/rewards/teahouse-5yuan-coupon.png"
                alt="一元茶馆五元代金券"
              />
              <div className="coupon-received-stamp" aria-hidden="true">
                已领取
              </div>
            </div>
            <p className="coupon-use-note">
              使用地点：荻港古村东苕溪边里巷梗老旧长廊下
            </p>
            <div className="coupon-actions">
              <a
                href="/assets/rewards/teahouse-5yuan-coupon.png"
                download="一元茶馆5元茶券.png"
              >
                保存茶券
              </a>
              <button type="button" onClick={restart}>
                重新体验
              </button>
            </div>
          </div>
        )}

        {cardOpen && (
          <Modal title={`${chapter.place} · 随身题卡`} onClose={() => setCardOpen(false)}>
            <div className="card-gallery">
              {chapter.card.map((src) => (
                <img key={src} src={src} alt={`${chapter.place}解谜题卡`} />
              ))}
            </div>
            <p className="modal-note">
              题卡提供观察顺序，场景提供动态证据。两者结合后再进行最终推理。
            </p>
          </Modal>
        )}

        {storyOpen && (
          <Modal title="故事说明" onClose={() => setStoryOpen(false)}>
            <div className="story-copy">
              <p>
                一场雨打乱了记录桑基鱼塘智慧的秘卷。玩家将与阿荻同行，进入五段正在失衡的村庄记忆。
              </p>
              <p>
                每章都要经历动画叙事、场景观察、题卡解读、空间操作与答案推理。正确答案会让环境重新生长，而不是只显示“回答正确”。
              </p>
              <ul>
                <li>全程在H5内完成，不跳转公众号。</li>
                <li>答案支持忽略空格、标点与常见输入差异。</li>
                <li>连续三次错误后，阿荻会展开推演提示。</li>
              </ul>
            </div>
          </Modal>
        )}

        {settingsOpen && (
          <Modal title="游戏设置" onClose={() => setSettingsOpen(false)}>
            <div className="settings-list">
              <button onClick={() => setSoundOn((value) => !value)}>
                <span>环境声音</span>
                <b>{soundOn ? "已开启" : "已关闭"}</b>
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("digang-mystery-progress");
                  setCompleted([]);
                  setChapterIndex(0);
                  setSettingsOpen(false);
                  setStage("home");
                }}
              >
                <span>清除进度</span>
                <b>重新开始</b>
              </button>
            </div>
          </Modal>
        )}
      </section>
    </main>
  );
}

function WalkSequence({
  plan,
  onSkip,
}: {
  plan: WalkPlan;
  onSkip: () => void;
}) {
  return (
    <div className="walk-sequence" aria-label={`${plan.title}步行动画`}>
      <div
        className="walk-shot walk-shot-from"
        style={{ backgroundImage: `url("${plan.from}")` }}
      />
      <div
        className="walk-shot walk-shot-to"
        style={{ backgroundImage: `url("${plan.to}")` }}
      />
      <div className="walk-sun" />
      <div className="walk-nearby-leaves" aria-hidden="true">
        <i />
        <i />
      </div>
      <div className="walk-copy">
        <span>{plan.eyebrow}</span>
        <h2>{plan.title}</h2>
        <p>{plan.subtitle}</p>
      </div>
      <div className="walk-footsteps" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="walk-progress" aria-hidden="true">
        <i />
      </div>
      <button className="walk-skip" onClick={onSkip}>
        <span>跳过动画</span>
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="m7.5 5 5 5-5 5" />
        </svg>
      </button>
    </div>
  );
}

function Dialogue({
  text,
  step,
  total,
  onNext,
}: {
  text: string;
  step: number;
  total: number;
  onNext: () => void;
}) {
  return (
    <div className="dialogue-layer">
      <img src="/assets/characters/adi.png" alt="向导阿荻" />
      <div className="dialogue-box">
        <span className="speaker">阿荻</span>
        <p key={text}>{text}</p>
        <div className="dialogue-footer">
          <small>
            {step}/{total}
          </small>
          <button onClick={onNext} aria-label="继续对话">
            继续 <i>›</i>
          </button>
        </div>
      </div>
    </div>
  );
}

function JishanAlignment({
  tone,
  onComplete,
}: {
  tone: (kind: "tap" | "success" | "error") => void;
  onComplete: () => void;
}) {
  const [position, setPosition] = useState({ x: -54, y: 84, rotate: -4 });
  const [snapping, setSnapping] = useState(false);
  const [locked, setLocked] = useState(false);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    originX: -54,
    originY: 84,
    lastX: -54,
    lastY: 84,
  });

  function snapIntoPlace() {
    if (locked || snapping) return;
    tone("tap");
    setSnapping(true);
    setPosition({ x: 0, y: 0, rotate: 0 });
    window.setTimeout(() => {
      setLocked(true);
      setSnapping(false);
      tone("success");
    }, 720);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (locked || snapping) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
      lastX: position.x,
      lastY: position.y,
    };
    tone("tap");
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active || locked || snapping) return;
    const nextX = Math.max(
      -88,
      Math.min(88, dragRef.current.originX + event.clientX - dragRef.current.startX),
    );
    const nextY = Math.max(
      -118,
      Math.min(118, dragRef.current.originY + event.clientY - dragRef.current.startY),
    );
    dragRef.current.lastX = nextX;
    dragRef.current.lastY = nextY;
    setPosition({
      x: nextX,
      y: nextY,
      rotate: Math.max(-5, Math.min(5, nextX / 18)),
    });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
    const distance = Math.hypot(
      dragRef.current.lastX,
      dragRef.current.lastY,
    );
    if (distance <= 42) {
      snapIntoPlace();
    } else {
      tone("error");
    }
  }

  return (
    <div className={`alignment-screen ${locked ? "is-locked" : ""}`}>
      <div className="alignment-copy">
        <span>积善桥 · 动态对景</span>
        <h2>{locked ? "轮廓已经重合" : "举起透明题卡"}</h2>
        <p>
          {locked
            ? "桥、屋檐与银色穹顶共同围出数字线索。"
            : "拖动题卡，让白色建筑轮廓与眼前水巷尽量重合。"}
        </p>
      </div>

      <div className="alignment-viewport">
        <div className="alignment-reticle" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div
          className={`transparent-card ${snapping ? "is-snapping" : ""}`}
          style={
            {
              "--card-x": `${position.x}px`,
              "--card-y": `${position.y}px`,
              "--card-rotate": `${position.rotate}deg`,
            } as React.CSSProperties
          }
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          role="button"
          tabIndex={0}
          aria-label="拖动透明题卡与积善桥建筑轮廓重合"
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") snapIntoPlace();
          }}
        >
          <img
            src="/assets/cards/card-04-jishan-overlay-v2.webp"
            alt="积善桥透明对景题卡"
          />
          <span className="card-grip">按住题卡移动</span>
        </div>

        <div className="alignment-eight" aria-hidden={!locked}>
          8
        </div>
        <div className="alignment-scan" aria-hidden="true" />
      </div>

      <div className="alignment-actions">
        {!locked ? (
          <>
            <p>将题卡中心移入四角标记范围</p>
            <button onClick={snapIntoPlace}>让阿荻示范对准</button>
          </>
        ) : (
          <>
            <strong>重叠完成 · 线索 A＝8</strong>
            <button
              onClick={() => {
                tone("tap");
                onComplete();
              }}
            >
              收下线索，继续推理
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-panel">
        <header>
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="关闭">
            ×
          </button>
        </header>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}

function BridgePuzzle({
  puzzle,
  setPuzzle,
  tone,
}: {
  puzzle: PuzzleState;
  setPuzzle: React.Dispatch<React.SetStateAction<PuzzleState>>;
  tone: (kind: "tap" | "success" | "error") => void;
}) {
  const [revealStage, setRevealStage] = useState<"mural" | "transition" | "water">(
    "mural",
  );
  const [introStarted, setIntroStarted] = useState(false);
  const [holdForPreview, setHoldForPreview] = useState(false);
  const marks = [
    { char: "舍", x: "23%", y: "58%" },
    { char: "西", x: "52%", y: "39%" },
    { char: "桥", x: "76%", y: "66%" },
  ];

  useEffect(() => {
    setHoldForPreview(
      new URLSearchParams(window.location.search).get("preview") ===
        "moonbay-zoom",
    );
    const startTimer = window.setTimeout(() => setIntroStarted(true), 1800);
    return () => window.clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (revealStage !== "mural" || !introStarted || holdForPreview) return;
    const transitionTimer = window.setTimeout(
      () => setRevealStage("transition"),
      4200,
    );
    return () => window.clearTimeout(transitionTimer);
  }, [holdForPreview, introStarted, revealStage]);

  useEffect(() => {
    if (revealStage !== "transition") return;
    const waterTimer = window.setTimeout(() => setRevealStage("water"), 1250);
    return () => window.clearTimeout(waterTimer);
  }, [revealStage]);

  if (revealStage !== "water") {
    return (
      <div
        className={`moonbay-reveal ${introStarted ? "is-playing" : ""} ${revealStage === "transition" ? "is-transition" : ""}`}
      >
        <div className="moonbay-closeup" aria-label="月亮湾墙绘特写">
          <div className="moonbay-closeup-bg" />
          <div className="moonbay-focus-ring" aria-hidden="true" />
          <div className="bridge-name-cluster" aria-label="舍西桥">
            {["舍", "西", "桥"].map((char, index) => (
              <span
                key={char}
                className="bridge-name-char"
                style={{ animationDelay: `${0.55 + index * 0.58}s` }}
              >
                {char}
              </span>
            ))}
          </div>
          <div className="moonbay-reflection" aria-hidden="true">
            <span>舍</span>
            <span>西</span>
            <span>桥</span>
          </div>
          <div className="moonbay-ripple-wipe" aria-hidden="true" />
        </div>
        <div className="moonbay-reveal-copy">
          <p>墙绘里的地名，正被水光逐一唤醒……</p>
          <button
            type="button"
            onClick={() =>
              setRevealStage((stage) =>
                stage === "mural" ? "transition" : "water",
              )
            }
          >
            {revealStage === "mural" ? "跟随水影" : "进入水面"}
            <span aria-hidden="true">⌄</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mural-puzzle water-stage-in">
      <p className="micro-instruction">轻触水面中不自然的三处波纹</p>
      <div className="mural-window">
        {marks.map((mark) => {
          const found = puzzle.found.includes(mark.char);
          return (
            <button
              key={mark.char}
              className={found ? "ripple found" : "ripple"}
              style={{ left: mark.x, top: mark.y }}
              onClick={() => {
                if (!found) tone("tap");
                setPuzzle((state) => ({
                  ...state,
                  found: found ? state.found : [...state.found, mark.char],
                }));
              }}
              aria-label={`寻找第${puzzle.found.length + 1}枚残字`}
            >
              {found ? mark.char : "◌"}
            </button>
          );
        })}
        <div className="water-lines" />
      </div>
      <div className="collected-slots">
        {[0, 1, 2].map((index) => (
          <span key={index}>{puzzle.found[index] ?? "？"}</span>
        ))}
      </div>
    </div>
  );
}

function FlashlightPuzzle({
  puzzle,
  setPuzzle,
  tone,
}: {
  puzzle: PuzzleState;
  setPuzzle: React.Dispatch<React.SetStateAction<PuzzleState>>;
  tone: (kind: "tap" | "success" | "error") => void;
}) {
  const ready =
    puzzle.clues.includes("照亮") && puzzle.clues.includes("卡片中央");
  return (
    <div className="flash-puzzle">
      <p className="micro-instruction">先完成两道残缺线索</p>
      <div className="clue-pair">
        {["照亮", "卡片中央"].map((clue, index) => (
          <button
            key={clue}
            className={puzzle.clues.includes(clue) ? "solved" : ""}
            onClick={() => {
              tone("tap");
              setPuzzle((state) => ({
                ...state,
                clues: state.clues.includes(clue)
                  ? state.clues
                  : [...state.clues, clue],
              }));
            }}
          >
            <small>线索 {index + 1}</small>
            {puzzle.clues.includes(clue) ? clue : index ? "木桩 × 琴键" : "字母回环"}
          </button>
        ))}
      </div>
      {ready && (
        <div
          className={`flash-card ${puzzle.illuminated ? "illuminated" : ""}`}
          onPointerMove={(event) => {
            const box = event.currentTarget.getBoundingClientRect();
            const x = (event.clientX - box.left) / box.width;
            const y = (event.clientY - box.top) / box.height;
            event.currentTarget.style.setProperty("--x", `${x * 100}%`);
            event.currentTarget.style.setProperty("--y", `${y * 100}%`);
            if (Math.abs(x - 0.5) < 0.18 && Math.abs(y - 0.5) < 0.18) {
              setPuzzle((state) => ({ ...state, illuminated: true }));
            }
          }}
        >
          <img src="/assets/cards/card-02-shexi.png" alt="舍西桥题卡" />
          <div className="flash-beam" />
          <strong>{puzzle.illuminated ? "塘基种桑" : "移动光束"}</strong>
        </div>
      )}
    </div>
  );
}

function PatternPuzzle({
  puzzle,
  setPuzzle,
  tone,
}: {
  puzzle: PuzzleState;
  setPuzzle: React.Dispatch<React.SetStateAction<PuzzleState>>;
  tone: (kind: "tap" | "success" | "error") => void;
}) {
  const [phase, setPhase] = useState<"discover" | "solve">("discover");
  const [cardsReady, setCardsReady] = useState(false);
  const correct = ["莲花", "鱼", "龙", "元宝"];
  const choices = ["鱼", "元宝", "莲花", "龙"];
  const discoveryCards = [
    {
      name: "莲花",
      number: "01",
      image: "/assets/patterns/lotus-card.webp",
      originX: "-72px",
      originY: "55px",
    },
    {
      name: "鱼",
      number: "02",
      image: "/assets/patterns/fish-card.webp",
      originX: "70px",
      originY: "52px",
    },
    {
      name: "龙",
      number: "03",
      image: "/assets/patterns/dragon-card.webp",
      originX: "-66px",
      originY: "-54px",
    },
    {
      name: "元宝",
      number: "04",
      image: "/assets/patterns/ingot-card.webp",
      originX: "64px",
      originY: "-58px",
    },
  ];
  const mapping: Record<string, string> = {
    莲花: "SANG",
    鱼: "YE",
    龙: "WEI",
    元宝: "CAN",
  };
  const valid = puzzle.selected.every((item, index) => item === correct[index]);

  useEffect(() => {
    if (phase !== "discover") return;
    const timer = window.setTimeout(() => setCardsReady(true), 3200);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === "discover") {
    return (
      <div className={`pattern-discovery ${cardsReady ? "is-ready" : ""}`}>
        <div className="pattern-temple-stage">
          <div className="pattern-temple-camera" />
          <div className="pattern-temple-glow" aria-hidden="true" />
          <div className="pattern-emerge-grid" aria-label="四枚三官庙纹样">
            {discoveryCards.map((card, index) => (
              <article
                key={card.name}
                className="pattern-emerge-card"
                style={
                  {
                    "--card-delay": `${0.35 + index * 0.55}s`,
                    "--origin-x": card.originX,
                    "--origin-y": card.originY,
                  } as React.CSSProperties
                }
              >
                <img src={card.image} alt={`${card.name}纹样卡`} />
                <b>{card.number}</b>
                <span>{card.name}</span>
              </article>
            ))}
          </div>
          <div className="pattern-temple-scan" aria-hidden="true" />
        </div>
        <div className="pattern-discovery-copy">
          <small>三官庙纹样显影</small>
          <p>记住数字对应的纹样顺序：莲花、鱼、龙、元宝。</p>
          <button
            type="button"
            disabled={!cardsReady}
            onClick={() => {
              tone("tap");
              setPhase("solve");
            }}
          >
            {cardsReady ? "点击解题" : "纹样浮现中…"}
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pattern-puzzle pattern-puzzle-enter">
      <p className="micro-instruction">按题卡给出的图案顺序点亮纹样</p>
      <div className="pattern-slots">
        {correct.map((_, index) => (
          <span key={index} className={!valid ? "warning" : ""}>
            {puzzle.selected[index]
              ? `${puzzle.selected[index]} · ${mapping[puzzle.selected[index]]}`
              : index + 1}
          </span>
        ))}
      </div>
      <div className="pattern-choices">
        {choices.map((item) => (
          <button
            key={item}
            disabled={puzzle.selected.includes(item)}
            onClick={() => {
              const next = [...puzzle.selected, item];
              if (item !== correct[next.length - 1]) {
                tone("error");
                setPuzzle((state) => ({ ...state, selected: [] }));
                return;
              }
              tone(next.length === 4 ? "success" : "tap");
              setPuzzle((state) => ({ ...state, selected: next }));
            }}
          >
            <i>{item === "莲花" ? "✿" : item === "鱼" ? "◁" : item === "龙" ? "〽" : "◇"}</i>
            {item}
          </button>
        ))}
      </div>
      {puzzle.selected.length === 4 && (
        <>
          <div className="decoded-line">SANG · YE · WEI · CAN</div>
          <p className="decode-note">请依据答案拼音拼写成谜底</p>
        </>
      )}
    </div>
  );
}

function YearPuzzle({
  puzzle,
  tone,
  onOpenEvidence,
}: {
  puzzle: PuzzleState;
  tone: (kind: "tap" | "success" | "error") => void;
  onOpenEvidence: (scene: "fish" | "signs") => void;
}) {
  const evidence = [
    ["A", "透明题卡与积善桥建筑轮廓重合", 8],
    ["B", "逆流而上的石鱼数量", 3],
    ["C", "新老“一元茶馆”招牌数量", 2],
  ] as const;
  const complete = Object.keys(puzzle.evidence).length === 3;
  return (
    <div className="year-puzzle">
      <p className="micro-instruction">依次核验三组动态证据</p>
      <div className="evidence-grid">
        {evidence.map(([key, label, value]) => (
          <button
            key={key}
            className={puzzle.evidence[key] ? "revealed" : ""}
            disabled={key === "A" && Boolean(puzzle.evidence.A)}
            onClick={() => {
              tone("tap");
              if (key === "B") onOpenEvidence("fish");
              if (key === "C") onOpenEvidence("signs");
            }}
          >
            <b>{key}</b>
            <span>{label}</span>
            <strong>
              {puzzle.evidence[key] ??
                (key === "A" ? "去对景" : "观察")}
            </strong>
          </button>
        ))}
      </div>
      <div className={`year-formula ${complete ? "complete" : ""}`}>
        1 <span>{puzzle.evidence.A ?? "A"}</span> 9{" "}
        <span>
          {complete
            ? puzzle.evidence.B * puzzle.evidence.C
            : "B×C"}
        </span>
        {complete && <strong>＝1896</strong>}
      </div>
      {complete && (
        <>
          <div className="number-grid">
            {["蚕", "塘", "基", "种", "桑", "鱼", "肥", "沙", "养"].map(
              (item, index) => (
                <span
                  key={`${item}-${index}`}
                  className={[1, 8, 9, 6].includes(index + 1) ? "active" : ""}
                >
                  <small>{index + 1}</small>
                  {item}
                </span>
              ),
            )}
          </div>
          <div className="decoded-line">1 → 8 → 9 → 6：蚕 · 沙 · 养 · 鱼</div>
        </>
      )}
    </div>
  );
}

function CountingEvidenceScene({
  type,
  tone,
  onClose,
  onComplete,
}: {
  type: "fish" | "signs";
  tone: (kind: "tap" | "success" | "error") => void;
  onClose: () => void;
  onComplete: (value: number) => void;
}) {
  const [fishFound, setFishFound] = useState<number[]>([]);
  const [signStep, setSignStep] = useState<"old" | "youth">("old");
  const [signsFound, setSignsFound] = useState(0);
  const fishComplete = fishFound.length === 3;
  const signsComplete = signsFound === 2;

  function countFish(index: number) {
    if (fishFound.includes(index)) return;
    tone(fishFound.length === 2 ? "success" : "tap");
    setFishFound((items) => [...items, index]);
  }

  function countSign() {
    if (signStep === "old" && signsFound === 0) {
      tone("tap");
      setSignsFound(1);
      return;
    }
    if (signStep === "youth" && signsFound === 1) {
      tone("success");
      setSignsFound(2);
    }
  }

  return (
    <div className={`counting-evidence counting-${type}`}>
      {type === "fish" ? (
        <div
          className="evidence-scene-bg fish-evidence-bg"
          style={{
            backgroundImage:
              'url("/assets/scenes/three-stone-fish-v1.webp")',
          }}
        />
      ) : (
        <div className="sign-scene-stack" aria-hidden="true">
          <div
            className={`evidence-scene-bg sign-evidence-bg old ${
              signStep === "old" ? "active" : "past"
            }`}
            style={{
              backgroundImage:
                'url("/assets/scenes/teahouse-old-sign-v1.webp")',
            }}
          />
          <div
            className={`evidence-scene-bg sign-evidence-bg youth ${
              signStep === "youth" ? "active" : ""
            }`}
            style={{
              backgroundImage:
                'url("/assets/scenes/teahouse-youth-sign-v1.webp")',
            }}
          />
        </div>
      )}

      <div className="evidence-scene-shade" />
      <button className="evidence-close" onClick={onClose} aria-label="退出观察">
        ×
      </button>

      <div className="evidence-title">
        <span>{type === "fish" ? "证据 B · 河畔取证" : "证据 C · 新老店招"}</span>
        <h2>
          {type === "fish"
            ? "数一数，河边有几条石鱼？"
            : "新老茶馆共有几块主招牌？"}
        </h2>
        <p>
          {type === "fish"
            ? "逐条点击石鱼，避免把墙上的鱼纹算进去。"
            : signStep === "old"
              ? "先在老茶馆门前找到主店招。"
              : "再到青春版门店，找到第二块主店招。"}
        </p>
      </div>

      {type === "fish" && (
        <div className="fish-count-layer">
          {[
            { left: "32%", top: "63%" },
            { left: "46%", top: "60%" },
            { left: "58%", top: "64%" },
          ].map((position, index) => {
            const found = fishFound.includes(index);
            return (
              <button
                key={index}
                className={`count-hotspot fish-hotspot ${found ? "found" : ""}`}
                style={position}
                onClick={() => countFish(index)}
                aria-label={`第${index + 1}条石鱼`}
              >
                {found ? fishFound.indexOf(index) + 1 : ""}
              </button>
            );
          })}
        </div>
      )}

      {type === "signs" && (
        <>
          <button
            className={`count-hotspot sign-hotspot ${signStep} ${
              signsFound > (signStep === "old" ? 0 : 1) ? "found" : ""
            }`}
            onClick={countSign}
            aria-label={signStep === "old" ? "老茶馆主招牌" : "青春版主招牌"}
          >
            {(signStep === "old" && signsFound > 0) ||
            (signStep === "youth" && signsFound > 1)
              ? signsFound
              : ""}
          </button>
          <div className="sign-route">
            <i className={signsFound >= 1 ? "done" : "active"}>老店</i>
            <span />
            <i className={signsFound === 2 ? "done" : signStep === "youth" ? "active" : ""}>
              青春版
            </i>
          </div>
        </>
      )}

      <div className="counting-footer">
        <div className="count-tally">
          <span>已找到</span>
          <strong>
            {type === "fish" ? fishFound.length : signsFound}
            <small> / {type === "fish" ? 3 : 2}</small>
          </strong>
        </div>

        {type === "signs" && signsFound === 1 && signStep === "old" && (
          <button
            className="evidence-next"
            onClick={() => {
              tone("tap");
              setSignStep("youth");
            }}
          >
            沿廊前往青春版 <i>›</i>
          </button>
        )}

        {(fishComplete || signsComplete) && (
          <div className="evidence-result">
            <span>数字证据已确认</span>
            <b>{type === "fish" ? "B＝3" : "C＝2"}</b>
            <button onClick={() => onComplete(type === "fish" ? 3 : 2)}>
              记下数字，返回推理
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ObjectsPuzzle({
  puzzle,
  setPuzzle,
  tone,
}: {
  puzzle: PuzzleState;
  setPuzzle: React.Dispatch<React.SetStateAction<PuzzleState>>;
  tone: (kind: "tap" | "success" | "error") => void;
}) {
  const [wrongItem, setWrongItem] = useState<string | null>(null);
  const [wrongWord, setWrongWord] = useState<string | null>(null);
  const [layer, setLayer] = useState<"objects" | "words">("objects");
  const [pendingObject, setPendingObject] = useState<string | null>(null);
  const [notice, setNotice] = useState("先看正面顺序，再在物件层寻找第一件旧物。");
  const order = [
    { id: "hanger", label: "晾衣架", char: "鱼", short: "衣" },
    { id: "calendar", label: "日历", char: "粪", short: "历" },
    { id: "basin", label: "洗脸盆", char: "肥", short: "盆" },
    { id: "thermos", label: "热水罐", char: "塘", short: "罐" },
  ] as const;
  const objects = [
    { id: "thermos", label: "热水罐", char: "塘", left: 2, top: 2, width: 29, height: 38 },
    { id: "recipe", label: "菜谱夹", char: "桑", left: 31, top: 2, width: 28, height: 31 },
    { id: "bench", label: "长凳", char: "茶", left: 59, top: 2, width: 39, height: 27 },
    { id: "basin", label: "洗脸盆", char: "肥", left: 2, top: 40, width: 36, height: 24 },
    { id: "tea-jars", label: "茶罐", char: "衣", left: 38, top: 32, width: 31, height: 26 },
    { id: "kettle", label: "水壶", char: "基", left: 69, top: 28, width: 29, height: 37 },
    { id: "hanger", label: "晾衣架", char: "鱼", left: 2, top: 65, width: 36, height: 33 },
    { id: "cabinet", label: "茶柜", char: "象", left: 38, top: 58, width: 31, height: 40 },
    { id: "calendar", label: "日历", char: "粪", left: 69, top: 66, width: 29, height: 32 },
  ] as const;
  const current = order[puzzle.selected.length];
  const complete = puzzle.selected.length === order.length;

  function chooseObject(item: (typeof objects)[number]) {
    if (complete || puzzle.selected.includes(item.label)) return;
    if (!current || item.id !== current.id) {
      tone("error");
      setWrongItem(item.id);
      setNotice(`这不是当前轮廓。请先寻找“${current?.label ?? ""}”。`);
      window.setTimeout(() => setWrongItem(null), 520);
      return;
    }
    tone("tap");
    setPendingObject(item.id);
    setLayer("words");
    setNotice(`已锁定“${item.label}”的位置。请在文字层点击同一块拼图。`);
  }

  function chooseWord(item: (typeof objects)[number]) {
    if (!pendingObject || complete) return;
    if (item.id !== pendingObject) {
      tone("error");
      setWrongWord(item.id);
      setNotice("位置没有对齐。请回忆刚才物件所在的那一格。");
      window.setTimeout(() => setWrongWord(null), 520);
      return;
    }
    const matched = objects.find((object) => object.id === pendingObject);
    if (!matched) return;
    const next = [...puzzle.selected, matched.label];
    tone(next.length === order.length ? "success" : "tap");
    setPuzzle((state) => ({ ...state, selected: next }));
    setPendingObject(null);
    setLayer("objects");
    const nextTarget = order[next.length];
    setNotice(
      nextTarget
        ? `同位置读出“${matched.char}”。下一件：${nextTarget.label}。`
        : "四个位置已经全部对应，请把四字暗语输入最终推理。",
    );
  }

  return (
    <div className={`objects-puzzle bookmark-puzzle ${complete ? "complete" : ""}`}>
      <div className="bookmark-sequence">
        <div>
          <span>书签正面</span>
          <b>谜底顺序</b>
        </div>
        <ol>
          {order.map((item, index) => (
            <li
              key={item.id}
              className={
                puzzle.selected.length > index
                  ? "done"
                  : puzzle.selected.length === index
                    ? "active"
                    : ""
              }
            >
              <i>{item.short}</i>
              <small>{item.label}</small>
            </li>
          ))}
        </ol>
      </div>

      <div className="bookmark-layer-title">
        <span>
          书签背面 · {layer === "objects" ? "上层物件" : "下层文字"}
        </span>
        <i>{layer === "objects" ? "点击当前顺序中的旧物" : "点击刚才物件的同一位置"}</i>
      </div>

      <div className={`bookmark-grid-viewport is-${layer}`}>
        <img
          src="/assets/cards/bookmark-back-v2.jpg"
          alt="一元茶馆旧物拼图"
        />
        <div className="bookmark-grid-shade" aria-hidden="true" />
        {layer === "objects" &&
          objects.map((item) => {
            const found = puzzle.selected.includes(item.label);
            return (
            <button
              key={item.id}
              className={[
                "bookmark-hotspot",
                found ? "found" : "",
                current?.id === item.id ? "target" : "",
                wrongItem === item.id ? "wrong" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                left: `${item.left}%`,
                top: `${item.top}%`,
                width: `${item.width}%`,
                height: `${item.height}%`,
              }}
              onClick={() => chooseObject(item)}
              aria-label={`${item.label}${found ? `对应${item.char}字` : ""}`}
          >
              {found && (
                <span>
                  <small>{item.label}</small>
                  {item.char}
                </span>
              )}
            </button>
            );
          })}
        {layer === "words" &&
          objects.map((item) => (
            <button
              key={item.id}
              className={[
                "bookmark-word-tile",
                puzzle.selected.includes(item.label) ? "found" : "",
                wrongWord === item.id ? "wrong" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                left: `${item.left}%`,
                top: `${item.top}%`,
                width: `${item.width}%`,
                height: `${item.height}%`,
              }}
              onClick={() => chooseWord(item)}
              aria-label={`文字${item.char}`}
            >
              {item.char}
            </button>
          ))}
      </div>

      <p className={`bookmark-notice ${wrongItem ? "warning" : ""}`}>
        {notice}
      </p>

      <div className="object-slots bookmark-answer-slots" aria-label="四字暗语">
        {order.map((item, index) => (
          <span key={item.id} className={puzzle.selected.length > index ? "found" : ""}>
            {puzzle.selected.length > index ? item.char : "？"}
          </span>
        ))}
      </div>
      {complete && <div className="decoded-line">鱼 · 粪 · 肥 · 塘</div>}
    </div>
  );
}
