import { useState, useEffect, useRef, useCallback } from "react";

// ==================== GAME DATA ====================
const PLANETS = [
  { id: 1, table: 1, name: "Planeta Uno", color: "#FF6B6B", bg: "linear-gradient(135deg, #1a0a0a 0%, #3d1515 50%, #1a0a0a 100%)", accent: "#FF6B6B", prisoners: 5, emoji: "🔴" },
  { id: 2, table: 2, name: "Planeta Duo", color: "#4ECDC4", bg: "linear-gradient(135deg, #0a1a1a 0%, #153d3a 50%, #0a1a1a 100%)", accent: "#4ECDC4", prisoners: 5, emoji: "🟢" },
  { id: 3, table: 3, name: "Planeta Trio", color: "#FFE66D", bg: "linear-gradient(135deg, #1a1a0a 0%, #3d3d15 50%, #1a1a0a 100%)", accent: "#FFE66D", prisoners: 5, emoji: "🟡" },
  { id: 4, table: 4, name: "Planeta Cuatro", color: "#A78BFA", bg: "linear-gradient(135deg, #0f0a1a 0%, #2d1a3d 50%, #0f0a1a 100%)", accent: "#A78BFA", prisoners: 5, emoji: "🟣" },
  { id: 5, table: 5, name: "Planeta Cinco", color: "#FB923C", bg: "linear-gradient(135deg, #1a0f0a 0%, #3d2615 50%, #1a0f0a 100%)", accent: "#FB923C", prisoners: 5, emoji: "🟠" },
  { id: 6, table: 6, name: "Planeta Seis", color: "#34D399", bg: "linear-gradient(135deg, #0a1a10 0%, #153d25 50%, #0a1a10 100%)", accent: "#34D399", prisoners: 5, emoji: "💚" },
  { id: 7, table: 7, name: "Planeta Siete", color: "#F472B6", bg: "linear-gradient(135deg, #1a0a15 0%, #3d1530 50%, #1a0a15 100%)", accent: "#F472B6", prisoners: 5, emoji: "💗" },
  { id: 8, table: 8, name: "Planeta Ocho", color: "#60A5FA", bg: "linear-gradient(135deg, #0a0f1a 0%, #15263d 50%, #0a0f1a 100%)", accent: "#60A5FA", prisoners: 5, emoji: "💙" },
  { id: 9, table: 9, name: "Planeta Nueve", color: "#FBBF24", bg: "linear-gradient(135deg, #1a1500 0%, #3d3310 50%, #1a1500 100%)", accent: "#FBBF24", prisoners: 5, emoji: "⭐" },
  { id: 10, table: 10, name: "Planeta Diez", color: "#F87171", bg: "linear-gradient(135deg, #1a0505 0%, #3d1010 50%, #1a0505 100%)", accent: "#F87171", prisoners: 5, emoji: "🌟" },
];

const TOOLS = ["hammer", "pogo", "hammer_rock", "laser"];
const TOOL_LABELS = { hammer: "🔨 Martillo", pogo: "🦘 Saltarín", hammer_rock: "⛏️ Romperocas", laser: "🔫 Láser" };
const TOOL_ACTIONS = { hammer: "¡ROMPE la jaula!", pogo: "¡SALTA el obstáculo!", hammer_rock: "¡DESTROZA la roca!", laser: "¡ELIMINA al monstruo!" };
const OBSTACLES = { hammer: "🔒 Jaula", pogo: "🪵 Tronco", hammer_rock: "🪨 Roca gigante", laser: "👾 Monstruo" };

const BODY_COLORS = ["#C4956A", "#8B5E3C", "#D4A076", "#6B8E6B", "#7B6B8E"];
const ACCESSORY_COLORS = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A78BFA", "#FB923C"];
const FLAG_COLORS = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A78BFA", "#34D399"];

function generateProblems(table) {
  const problems = [];
  for (let i = 1; i <= 10; i++) {
    problems.push({ a: table, b: i, answer: table * i });
  }
  return problems.sort(() => Math.random() - 0.5).slice(0, 10);
}

function generateOptions(answer) {
  const opts = new Set([answer]);
  while (opts.size < 4) {
    const wrong = answer + (Math.floor(Math.random() * 20) - 10);
    if (wrong > 0 && wrong !== answer) opts.add(wrong);
  }
  return [...opts].sort(() => Math.random() - 0.5);
}

// ==================== COMPONENTS ====================

function StarField() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 3,
  }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {stars.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size, borderRadius: "50%",
          background: "white", opacity: 0.7,
          animation: `twinkle ${2 + s.delay}s ease-in-out infinite alternate`,
          animationDelay: `${s.delay}s`
        }} />
      ))}
    </div>
  );
}

function Character({ bodyColor, accessoryColor, tool, animState }) {
  const bounce = animState === "success";
  const shake = animState === "fail";
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      animation: bounce ? "bounce 0.5s ease-in-out 2" : shake ? "shake 0.3s ease-in-out 3" : "idle 2s ease-in-out infinite",
      fontSize: 14,
    }}>
      {/* Thought bubble */}
      {tool && (
        <div style={{
          position: "relative", background: "white", borderRadius: 20, padding: "8px 12px",
          marginBottom: 6, fontSize: 20, border: "2px solid #ddd",
          animation: "popIn 0.3s ease-out",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
        }}>
          {TOOL_LABELS[tool]}
          <div style={{ position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)" }}>
            <div style={{ width: 10, height: 10, background: "white", borderRadius: "50%", marginBottom: 2, border: "2px solid #ddd" }} />
          </div>
        </div>
      )}
      {/* Body */}
      <div style={{ position: "relative", width: 70, height: 80 }}>
        {/* Head */}
        <div style={{
          width: 50, height: 50, borderRadius: "50%", background: bodyColor,
          border: `3px solid ${accessoryColor}`, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, position: "relative"
        }}>
          👀
          {/* Ears */}
          <div style={{ position: "absolute", top: -8, left: 5, width: 14, height: 14, borderRadius: "50%", background: bodyColor, border: `3px solid ${accessoryColor}` }} />
          <div style={{ position: "absolute", top: -8, right: 5, width: 14, height: 14, borderRadius: "50%", background: bodyColor, border: `3px solid ${accessoryColor}` }} />
        </div>
        {/* Body */}
        <div style={{
          width: 40, height: 35, background: accessoryColor, borderRadius: "12px 12px 8px 8px",
          margin: "0 auto", marginTop: -5, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16
        }}>
          {tool === "hammer" || tool === "hammer_rock" ? "🔨" : tool === "pogo" ? "🦘" : tool === "laser" ? "🔫" : ""}
        </div>
        {/* Legs */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 2 }}>
          <div style={{ width: 12, height: 14, background: bodyColor, borderRadius: 4 }} />
          <div style={{ width: 12, height: 14, background: bodyColor, borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );
}

function PlanetCard({ planet, completed, onSelect, unlocked }) {
  return (
    <div onClick={() => unlocked && onSelect(planet)} style={{
      position: "relative", width: 130, height: 130, borderRadius: "50%",
      background: planet.bg, border: `3px solid ${completed ? "#FFD700" : unlocked ? planet.color : "#555"}`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      cursor: unlocked ? "pointer" : "default", opacity: unlocked ? 1 : 0.5,
      boxShadow: unlocked ? `0 0 30px ${planet.color}60` : "none",
      transition: "transform 0.2s, box-shadow 0.2s",
      transform: "scale(1)",
    }} onMouseEnter={e => { if (unlocked) e.currentTarget.style.transform = "scale(1.08)"; }}
       onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
      <div style={{ fontSize: 36 }}>{planet.emoji}</div>
      <div style={{ color: planet.color, fontWeight: 700, fontSize: 11, textAlign: "center", padding: "0 8px" }}>{planet.name}</div>
      <div style={{ color: "#aaa", fontSize: 10 }}>Tabla del {planet.table}</div>
      {completed && <div style={{ position: "absolute", top: -8, right: -8, fontSize: 20 }}>🏆</div>}
      {!unlocked && <div style={{ position: "absolute", fontSize: 20 }}>🔒</div>}
    </div>
  );
}

// ==================== SCREENS ====================

function CustomizeScreen({ character, setCharacter, onStart }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: 24, minHeight: "100vh", background: "linear-gradient(135deg, #0d0d2b 0%, #1a1a4e 50%, #0d0d2b 100%)", color: "white" }}>
      <StarField />
      <div style={{ zIndex: 1, textAlign: "center" }}>
        <div style={{ fontSize: 36, fontWeight: 900, background: "linear-gradient(90deg, #FFD700, #FF6B6B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          🚀 GALAXIA MATEMÁTICA
        </div>
        <div style={{ color: "#aaa", fontSize: 14, marginTop: 4 }}>Personaliza tu explorador</div>
      </div>
      <div style={{ zIndex: 1 }}>
        <Character bodyColor={character.bodyColor} accessoryColor={character.accessoryColor} />
      </div>
      <div style={{ zIndex: 1, width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ color: "#aaa", fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Color del personaje</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {BODY_COLORS.map(c => (
              <div key={c} onClick={() => setCharacter(ch => ({ ...ch, bodyColor: c }))}
                style={{ width: 36, height: 36, borderRadius: "50%", background: c, cursor: "pointer",
                  border: character.bodyColor === c ? "3px solid white" : "3px solid transparent",
                  boxShadow: character.bodyColor === c ? "0 0 12px white" : "none" }} />
            ))}
          </div>
        </div>
        <div>
          <div style={{ color: "#aaa", fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Color del traje</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {ACCESSORY_COLORS.map(c => (
              <div key={c} onClick={() => setCharacter(ch => ({ ...ch, accessoryColor: c }))}
                style={{ width: 36, height: 36, borderRadius: "50%", background: c, cursor: "pointer",
                  border: character.accessoryColor === c ? "3px solid white" : "3px solid transparent",
                  boxShadow: character.accessoryColor === c ? "0 0 12px white" : "none" }} />
            ))}
          </div>
        </div>
        <div>
          <div style={{ color: "#aaa", fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Color de la bandera</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {FLAG_COLORS.map(c => (
              <div key={c} onClick={() => setCharacter(ch => ({ ...ch, flagColor: c }))}
                style={{ width: 36, height: 36, borderRadius: "50%", background: c, cursor: "pointer",
                  border: character.flagColor === c ? "3px solid white" : "3px solid transparent",
                  boxShadow: character.flagColor === c ? "0 0 12px white" : "none" }} />
            ))}
          </div>
        </div>
        <div>
          <div style={{ color: "#aaa", fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Nombre del explorador</div>
          <input value={character.name} onChange={e => setCharacter(ch => ({ ...ch, name: e.target.value }))}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "2px solid #A78BFA", background: "rgba(255,255,255,0.05)",
              color: "white", fontSize: 16, outline: "none", boxSizing: "border-box" }}
            placeholder="Tu nombre..." maxLength={15} />
        </div>
      </div>
      <button onClick={onStart} style={{
        zIndex: 1, padding: "14px 40px", borderRadius: 50, border: "none",
        background: "linear-gradient(90deg, #7C3AED, #EC4899)", color: "white", fontSize: 18, fontWeight: 700,
        cursor: "pointer", boxShadow: "0 0 30px #7C3AED80",
        animation: "pulse 2s ease-in-out infinite"
      }}>¡Iniciar Misión! 🚀</button>
    </div>
  );
}

function GalaxyMapScreen({ completedPlanets, onSelectPlanet, character }) {
  const unlockedCount = completedPlanets.length;
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #020218 0%, #0d0d2b 50%, #020218 100%)", color: "white", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 16px" }}>
      <StarField />
      <div style={{ zIndex: 1, textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 28, fontWeight: 900, background: "linear-gradient(90deg, #FFD700, #FF6B6B, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          🌌 Mapa Galáctico
        </div>
        <div style={{ color: "#aaa", fontSize: 13 }}>Explorador: {character.name} • {unlockedCount}/{PLANETS.length} planetas liberados</div>
        <div style={{ marginTop: 6, background: "rgba(255,255,255,0.1)", borderRadius: 20, height: 8, width: 200, margin: "8px auto 0" }}>
          <div style={{ height: "100%", borderRadius: 20, background: "linear-gradient(90deg, #7C3AED, #EC4899)", width: `${(unlockedCount / PLANETS.length) * 100}%`, transition: "width 0.5s" }} />
        </div>
      </div>
      <div style={{ zIndex: 1, display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center", maxWidth: 500 }}>
        {PLANETS.map((planet, i) => (
          <PlanetCard key={planet.id} planet={planet}
            completed={completedPlanets.includes(planet.id)}
            unlocked={i === 0 || completedPlanets.includes(PLANETS[i - 1].id)}
            onSelect={onSelectPlanet} />
        ))}
      </div>
    </div>
  );
}

function AdventureScreen({ planet, character, onComplete, onBack }) {
  const problems = useRef(generateProblems(planet.table));
  const [problemIdx, setProblemIdx] = useState(0);
  const [phase, setPhase] = useState("approach"); // approach | thinking | question | action | cave | victory
  const [currentTool, setCurrentTool] = useState(null);
  const [options, setOptions] = useState([]);
  const [animState, setAnimState] = useState(null); // success | fail
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [caveMode, setCaveMode] = useState(false);
  const [caveProblems, setCaveProblems] = useState([]);
  const [caveProbIdx, setCaveProbIdx] = useState(0);
  const [caveCorrect, setCaveCorrect] = useState(0);
  const [log, setLog] = useState([]);

  const currentProblem = caveMode ? caveProblems[caveProbIdx] : problems.current[problemIdx];

  const startNextEncounter = useCallback((idx) => {
    if (idx >= 10) {
      setPhase("victory");
      return;
    }
    // 20% chance cave
    if (idx > 0 && Math.random() < 0.2) {
      const caveQ = Array.from({ length: 5 }, () => {
        const b = Math.ceil(Math.random() * 10);
        return { a: planet.table, b, answer: planet.table * b };
      });
      setCaveProblems(caveQ);
      setCaveProbIdx(0);
      setCaveCorrect(0);
      setCaveMode(true);
      setPhase("cave");
      return;
    }
    const tool = TOOLS[idx % TOOLS.length];
    setCurrentTool(tool);
    setPhase("approach");
    setTimeout(() => {
      const prob = problems.current[idx];
      setOptions(generateOptions(prob.answer));
      setPhase("question");
    }, 1200);
  }, [planet.table]);

  useEffect(() => {
    startNextEncounter(0);
  }, []);

  const handleAnswer = (opt) => {
    const prob = currentProblem;
    if (opt === prob.answer) {
      setAnimState("success");
      setScore(s => s + 10);
      setMessage(TOOL_ACTIONS[currentTool]);
      setPhase("action");
      setLog(l => [...l, { q: `${prob.a}×${prob.b}`, a: prob.answer, correct: true }]);
      setTimeout(() => {
        setAnimState(null);
        setMessage("");
        if (caveMode) {
          if (caveProbIdx + 1 >= caveProblems.length) {
            setCaveMode(false);
            setPhase("approach");
            setTimeout(() => startNextEncounter(problemIdx), 600);
          } else {
            setCaveProbIdx(i => i + 1);
            setCaveProblems(cp => { const next = [...cp]; return next; });
            setPhase("cave");
            setOptions(generateOptions(caveProblems[caveProbIdx + 1]?.answer || 0));
          }
        } else {
          const next = problemIdx + 1;
          setProblemIdx(next);
          startNextEncounter(next);
        }
      }, 1800);
    } else {
      setAnimState("fail");
      setLives(l => {
        if (l - 1 <= 0) {
          setTimeout(() => { setMessage("💔 Sin vidas... intenta de nuevo"); setPhase("gameover"); }, 400);
        }
        return l - 1;
      });
      setMessage("❌ ¡La herramienta se dañó!");
      setLog(l => [...l, { q: `${prob.a}×${prob.b}`, a: prob.answer, correct: false, given: opt }]);
      setTimeout(() => { setAnimState(null); setMessage(""); }, 1200);
    }
  };

  const obstacle = currentTool ? OBSTACLES[currentTool] : "⭐";

  if (phase === "victory") {
    return (
      <div style={{ minHeight: "100vh", background: planet.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", padding: 24, textAlign: "center" }}>
        <StarField />
        <div style={{ zIndex: 1, animation: "popIn 0.5s ease-out" }}>
          <div style={{ fontSize: 60 }}>🎉</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: planet.color, marginBottom: 8 }}>¡PLANETA LIBERADO!</div>
          <div style={{ fontSize: 50, marginBottom: 8 }}>🚩</div>
          <div style={{ color: "#aaa", marginBottom: 4 }}>Bandera plantada en {planet.name}</div>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🚀</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Puntos: {score}</div>
          <div style={{ color: "#aaa", fontSize: 13, marginBottom: 20 }}>Tabla del {planet.table} completada</div>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 12, marginBottom: 20, maxHeight: 200, overflowY: "auto" }}>
            {log.map((l, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", color: l.correct ? "#4ECDC4" : "#FF6B6B", fontSize: 13 }}>
                <span>{l.q} = {l.a}</span>
                <span>{l.correct ? "✓" : `✗ (diste ${l.given})`}</span>
              </div>
            ))}
          </div>
          <button onClick={onComplete} style={{ padding: "14px 32px", borderRadius: 50, border: "none", background: `linear-gradient(90deg, ${planet.color}, #7C3AED)`, color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
            ¡Siguiente Planeta! 🌌
          </button>
        </div>
      </div>
    );
  }

  if (phase === "gameover") {
    return (
      <div style={{ minHeight: "100vh", background: planet.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", padding: 24, textAlign: "center" }}>
        <StarField />
        <div style={{ zIndex: 1 }}>
          <div style={{ fontSize: 60 }}>💔</div>
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>¡Misión Fallida!</div>
          <button onClick={onBack} style={{ padding: "12px 28px", borderRadius: 50, border: "none", background: "#FF6B6B", color: "white", fontSize: 16, cursor: "pointer" }}>Volver al mapa</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: planet.bg, display: "flex", flexDirection: "column", color: "white", position: "relative", overflow: "hidden" }}>
      <StarField />
      {/* HUD */}
      <div style={{ zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(0,0,0,0.4)" }}>
        <button onClick={onBack} style={{ background: "none", border: "1px solid #555", color: "white", padding: "4px 10px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>← Mapa</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: planet.color, fontWeight: 700 }}>{planet.name}</div>
          <div style={{ fontSize: 10, color: "#aaa" }}>Tabla del {planet.table} • {problemIdx}/10</div>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {Array.from({ length: 3 }, (_, i) => <span key={i} style={{ fontSize: 16 }}>{i < lives ? "❤️" : "🖤"}</span>)}
          <span style={{ fontSize: 12, color: "#FFD700", marginLeft: 6 }}>⭐{score}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: "rgba(255,255,255,0.1)" }}>
        <div style={{ height: "100%", background: planet.color, width: `${(problemIdx / 10) * 100}%`, transition: "width 0.3s" }} />
      </div>

      {/* Main scene */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-around", padding: "16px", zIndex: 1 }}>
        {/* Cave mode */}
        {caveMode && (
          <div style={{ textAlign: "center", background: "rgba(0,0,0,0.6)", borderRadius: 16, padding: "12px 20px", border: "2px solid #7C3AED", width: "100%", maxWidth: 360 }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>🕳️ ¡CUEVA!</div>
            <div style={{ fontSize: 13, color: "#aaa" }}>Responde {5 - caveProbIdx} preguntas más para salir ({caveCorrect} correctas)</div>
          </div>
        )}

        {/* Scene with character and obstacle */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 40, width: "100%", maxWidth: 360 }}>
          <Character bodyColor={character.bodyColor} accessoryColor={character.accessoryColor}
            tool={phase === "question" || phase === "action" ? currentTool : null} animState={animState} />
          {!caveMode && (
            <div style={{ textAlign: "center", animation: animState === "success" ? "fadeOut 1s ease-out forwards" : animState === "fail" ? "shake 0.3s ease-in-out 2" : "float 2s ease-in-out infinite" }}>
              <div style={{ fontSize: 48 }}>{obstacle}</div>
              <div style={{ fontSize: 10, color: "#aaa" }}>{currentTool ? OBSTACLES[currentTool] : ""}</div>
            </div>
          )}
        </div>

        {/* Message */}
        {message && (
          <div style={{ background: animState === "success" ? "rgba(78,205,196,0.2)" : "rgba(255,107,107,0.2)", border: `1px solid ${animState === "success" ? "#4ECDC4" : "#FF6B6B"}`, borderRadius: 12, padding: "10px 20px", textAlign: "center", animation: "popIn 0.2s ease-out" }}>
            {message}
          </div>
        )}

        {/* Question */}
        {(phase === "question" || phase === "cave") && currentProblem && (
          <div style={{ width: "100%", maxWidth: 360 }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              {caveMode && <div style={{ fontSize: 12, color: "#A78BFA", marginBottom: 4 }}>🕳️ Pregunta de cueva {caveProbIdx + 1}/5</div>}
              <div style={{ fontSize: 44, fontWeight: 900, color: "white", textShadow: `0 0 20px ${planet.color}` }}>
                {currentProblem.a} × {currentProblem.b} = ?
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {options.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(opt)} style={{
                  padding: "16px 10px", borderRadius: 14, border: `2px solid ${planet.color}40`,
                  background: "rgba(255,255,255,0.1)", color: "white", fontSize: 22, fontWeight: 700,
                  cursor: "pointer", backdropFilter: "blur(8px)",
                  transition: "all 0.15s", boxShadow: `0 4px 12px ${planet.color}30`
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${planet.color}40`; e.currentTarget.style.transform = "scale(1.05)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "scale(1)"; }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "approach" && (
          <div style={{ textAlign: "center", color: "#aaa", animation: "pulse 1s ease-in-out infinite" }}>
            🚶 Explorando {planet.name}...
          </div>
        )}

        {phase === "action" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, animation: "bounce 0.3s ease-in-out 3" }}>✨</div>
            <div style={{ color: planet.color, fontWeight: 700 }}>¡Problema #{problemIdx} resuelto!</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  const [screen, setScreen] = useState("customize"); // customize | galaxy | adventure
  const [character, setCharacter] = useState({ name: "Astro", bodyColor: "#C4956A", accessoryColor: "#A78BFA", flagColor: "#FFD700" });
  const [completedPlanets, setCompletedPlanets] = useState([]);
  const [activePlanet, setActivePlanet] = useState(null);

  const handlePlanetSelect = (planet) => { setActivePlanet(planet); setScreen("adventure"); };
  const handlePlanetComplete = () => {
    setCompletedPlanets(cp => cp.includes(activePlanet.id) ? cp : [...cp, activePlanet.id]);
    setScreen("galaxy");
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <style>{`
        @keyframes twinkle { from { opacity: 0.3 } to { opacity: 1 } }
        @keyframes bounce { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-18px) } }
        @keyframes shake { 0%, 100% { transform: translateX(0) } 25% { transform: translateX(-8px) } 75% { transform: translateX(8px) } }
        @keyframes idle { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
        @keyframes float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        @keyframes popIn { from { transform: scale(0.5); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes fadeOut { from { opacity: 1 } to { opacity: 0; transform: scale(1.5) } }
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.6 } }
      `}</style>
      {screen === "customize" && <CustomizeScreen character={character} setCharacter={setCharacter} onStart={() => setScreen("galaxy")} />}
      {screen === "galaxy" && <GalaxyMapScreen completedPlanets={completedPlanets} onSelectPlanet={handlePlanetSelect} character={character} />}
      {screen === "adventure" && activePlanet && (
        <AdventureScreen planet={activePlanet} character={character} onComplete={handlePlanetComplete} onBack={() => setScreen("galaxy")} />
      )}
    </div>
  );
}
