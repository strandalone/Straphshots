// Straphshots - Fully Working React App with Fixed Imports
import { useState, useEffect } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";

export default function App() {
  const [people, setPeople] = useState([]);
  const [nameInput, setNameInput] = useState("");
  const [reasons, setReasons] = useState({});
  const [shotsTaken, setShotsTaken] = useState({});
  const [inputStates, setInputStates] = useState({});
  const [passwordInput, setPasswordInput] = useState("");
  const [admin, setAdmin] = useState(false);
  const [bubbles, setBubbles] = useState([]);

  const handleLogin = () => passwordInput === "king1" && setAdmin(true);
  const handleLogout = () => {
    setAdmin(false);
    setPasswordInput("");
  };

  const addPerson = () => {
    const name = nameInput.trim();
    if (!name || people.includes(name)) return;
    setPeople([...people, name]);
    setReasons({ ...reasons, [name]: [] });
    setShotsTaken({ ...shotsTaken, [name]: 0 });
    setInputStates({
      ...inputStates,
      [name]: { reason: "", points: "", shots: "" },
    });
    setNameInput("");
  };

  const addReason = (name) => {
    const { reason, points } = inputStates[name];
    if (!reason || isNaN(parseInt(points, 10))) return;
    const entry = { reason, points: parseInt(points, 10) };
    setReasons({ ...reasons, [name]: [...(reasons[name] || []), entry] });
    setInputStates({
      ...inputStates,
      [name]: { ...inputStates[name], reason: "", points: "" },
    });
  };

  const addShots = (name) => {
    const amount = parseInt(inputStates[name].shots, 10);
    if (!isNaN(amount)) {
      setShotsTaken({
        ...shotsTaken,
        [name]: (shotsTaken[name] || 0) + amount,
      });
      setInputStates({
        ...inputStates,
        [name]: { ...inputStates[name], shots: "" },
      });
    }
  };

  const getTotalPoints = (name) =>
    (reasons[name] || []).reduce((sum, r) => sum + r.points, 0);
  const getRemainingPoints = (name) =>
    getTotalPoints(name) - (shotsTaken[name] || 0);
  const getTopShotTakers = () =>
    [...people]
      .sort((a, b) => (shotsTaken[b] || 0) - (shotsTaken[a] || 0))
      .slice(0, 3);

  const topReason = people
    .flatMap((name) =>
      (reasons[name] || []).map((r) => ({ ...r, name }))
    )
    .reduce(
      (best, r) => (r.points > best.points ? r : best),
      { name: "—", reason: "", points: 0 }
    );

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Math.random();
      setBubbles((prev) => [...prev, { id, left: Math.random() * 100 }]);
      setTimeout(() => {
        setBubbles((prev) => prev.filter((b) => b.id !== id));
      }, 4000);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-green-950 text-white p-4 space-y-8 overflow-hidden">
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="absolute bottom-0 w-3 h-3 bg-green-300 rounded-full opacity-30 animate-bubble"
          style={{ left: `${b.left}%` }}
        ></div>
      ))}
      <style>{`
        @keyframes bubble {
          0% { transform: translateY(0) scale(1); opacity: 0.3; }
          100% { transform: translateY(-100vh) scale(1.6); opacity: 0; }
        }
        .animate-bubble {
          animation: bubble 4s linear forwards;
        }
      `}</style>

      <h1 className="text-3xl font-bold text-green-300 text-center">Straphshots ING-Phøs25</h1>

      <div className="flex flex-col items-center w-full sm:w-60 mx-auto">
        <Input
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          placeholder="Enter Spell..."
          className="text-black text-sm mb-2"
        />
        <Button onClick={handleLogin} className="w-full mb-1">
          Enter
        </Button>
        {admin && (
          <Button onClick={handleLogout} variant="outline" className="w-full">
            Leave
          </Button>
        )}
      </div>

      {admin && (
        <div className="text-center">
          <Input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPerson()}
            placeholder="New name"
            className="text-black mb-2"
          />
          <Button onClick={addPerson}>Add Person</Button>
        </div>
      )}

      <div className="flex flex-row justify-center items-end gap-4 sm:gap-6 flex-wrap">
        {[1, 0, 2].map((pos, i) => {
          const top = getTopShotTakers()[pos] || "—";
          return (
            <div
              key={i}
              className={`flex flex-col justify-end items-center text-center rounded-xl ${
                pos === 0
                  ? "bg-green-600 h-36 w-24 sm:h-56 sm:w-1/4"
                  : pos === 1
                  ? "bg-green-700 h-32 w-20 sm:h-44 sm:w-1/5"
                  : "bg-green-800 h-28 w-20 sm:h-40 sm:w-1/5"
              }`}
            >
              <div className="text-sm sm:text-lg font-semibold mt-2">{top}</div>
              <div className="text-4xl sm:text-6xl font-black opacity-20">{pos + 1}</div>
              <div className="text-xs sm:text-sm">{shotsTaken[top] || 0} shots</div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2 bg-green-800 p-4 rounded-xl">
        <h2 className="text-xl font-bold text-green-300 mb-2 text-center">
          Leaderboard
        </h2>
        <ul className="space-y-1">
          {[...people]
            .sort((a, b) => getTotalPoints(b) - getTotalPoints(a))
            .map((name, index) => (
              <li
                key={name}
                className="flex justify-between border-b border-green-600 pb-1"
              >
                <span>{index + 1}. {name}</span>
                <span className="text-green-300 font-mono">
                  {getTotalPoints(name)} pts
                </span>
              </li>
            ))}
        </ul>
      </div>

      <div className="bg-white text-[#0d1f14] p-4 rounded-xl">
        <strong>Most Points Given:</strong> {topReason.name} got "
        {topReason.reason}" worth {topReason.points} points!
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {people.map((name) => (
          <div key={name} className="bg-green-900 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              {admin ? (
                <input
                  className="bg-green-800 text-white px-2 rounded"
                  value={name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    if (!newName || newName === name) return;
                    const updatedPeople = people.map((p) =>
                      p === name ? newName : p
                    );
                    const updatedReasons = {
                      ...reasons,
                      [newName]: reasons[name] || [],
                    };
                    const updatedShots = {
                      ...shotsTaken,
                      [newName]: shotsTaken[name] || 0,
                    };
                    const updatedInputs = {
                      ...inputStates,
                      [newName]:
                        inputStates[name] || {
                          reason: "",
                          points: "",
                          shots: "",
                        },
                    };
                    delete updatedReasons[name];
                    delete updatedShots[name];
                    delete updatedInputs[name];
                    setPeople(updatedPeople);
                    setReasons(updatedReasons);
                    setShotsTaken(updatedShots);
                    setInputStates(updatedInputs);
                  }}
                />
              ) : (
                <span className="font-bold text-lg">{name}</span>
              )}
              {admin && (
                <button
                  onClick={() => {
                    setPeople(people.filter((p) => p !== name));
                    const { [name]: _, ...r } = reasons;
                    const { [name]: __, ...s } = shotsTaken;
                    const { [name]: ___, ...i } = inputStates;
                    setReasons(r);
                    setShotsTaken(s);
                    setInputStates(i);
                  }}
                  className="text-red-400"
                >
                  ×
                </button>
              )}
            </div>
            <p className="text-sm">Remaining Shots: {getRemainingPoints(name)}</p>
            <p className="text-sm mb-2">Shots Taken: {shotsTaken[name] || 0}</p>

            {admin && (
              <>
                <Input
                  placeholder="Add Shots"
                  value={inputStates[name]?.shots || ""}
                  onChange={(e) =>
                    setInputStates({
                      ...inputStates,
                      [name]: {
                        ...inputStates[name],
                        shots: e.target.value,
                      },
                    })
                  }
                  onKeyDown={(e) => e.key === "Enter" && addShots(name)}
                  className="text-black mb-1"
                />
                <Button onClick={() => addShots(name)} className="mb-2">
                  Add Shots
                </Button>
                <Input
                  placeholder="Reason"
                  value={inputStates[name]?.reason || ""}
                  onChange={(e) =>
                    setInputStates({
                      ...inputStates,
                      [name]: {
                        ...inputStates[name],
                        reason: e.target.value,
                      },
                    })
                  }
                  onKeyDown={(e) => e.key === "Enter" && addReason(name)}
                  className="text-black mb-1"
                />
                <Input
                  placeholder="Points"
                  type="number"
                  value={inputStates[name]?.points || ""}
                  onChange={(e) =>
                    setInputStates({
                      ...inputStates,
                      [name]: {
                        ...inputStates[name],
                        points: e.target.value,
                      },
                    })
                  }
                  onKeyDown={(e) => e.key === "Enter" && addReason(name)}
                  className="text-black mb-1"
                />
                <Button onClick={() => addReason(name)} className="mb-2">
                  Add Reason
                </Button>
              </>
            )}

            <div className="text-sm space-y-1">
              {(reasons[name] || []).map((r, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center"
                >
                  <span>{r.reason}</span>
                  <span className="text-green-300">+{r.points}</span>
                  {admin && (
                    <button
                      onClick={() => {
                        const updated = [...reasons[name]];
                        updated.splice(i, 1);
                        setReasons({ ...reasons, [name]: updated });
                      }}
                      className="ml-2 text-red-400"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
