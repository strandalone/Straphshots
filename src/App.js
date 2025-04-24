// Full Rewritten App.js with Firestore and Save Support
import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { firebaseConfig } from "../firebaseConfig";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function App() {
  const [people, setPeople] = useState([]);
  const [reasons, setReasons] = useState({});
  const [shotsTaken, setShotsTaken] = useState({});
  const [inputs, setInputs] = useState({});
  const [nameInput, setNameInput] = useState("");
  const [admin, setAdmin] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "people"));
      const names = [];
      const r = {}, s = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        names.push(docSnap.id);
        r[docSnap.id] = data.reasons || [];
        s[docSnap.id] = data.shots || 0;
      });
      setPeople(names);
      setReasons(r);
      setShotsTaken(s);
    };
    fetchData();
  }, []);

  const handleLogin = () => {
    if (password === "king1") setAdmin(true);
  };

  const addPerson = async () => {
    const name = nameInput.trim();
    if (!name || people.includes(name)) return;
    await setDoc(doc(db, "people", name), { reasons: [], shots: 0 });
    setPeople([...people, name]);
    setReasons({ ...reasons, [name]: [] });
    setShotsTaken({ ...shotsTaken, [name]: 0 });
    setInputs({ ...inputs, [name]: { reason: "", points: "", shots: "" } });
    setNameInput("");
  };

  const addReason = (name) => {
    const { reason, points } = inputs[name];
    const pointVal = parseInt(points, 10);
    if (!reason || isNaN(pointVal)) return;
    const updated = [...(reasons[name] || []), { reason, points: pointVal }];
    setReasons({ ...reasons, [name]: updated });
    setInputs({ ...inputs, [name]: { ...inputs[name], reason: "", points: "" } });
  };

  const addShots = (name) => {
    const val = parseInt(inputs[name]?.shots, 10);
    if (isNaN(val)) return;
    setShotsTaken({ ...shotsTaken, [name]: (shotsTaken[name] || 0) + val });
    setInputs({ ...inputs, [name]: { ...inputs[name], shots: "" } });
  };

  const saveToFirebase = async (name) => {
    await setDoc(doc(db, "people", name), {
      reasons: reasons[name] || [],
      shots: shotsTaken[name] || 0
    });
  };

  const deletePerson = async (name) => {
    await deleteDoc(doc(db, "people", name));
    setPeople(people.filter(p => p !== name));
    const { [name]: _, ...r } = reasons;
    const { [name]: __, ...s } = shotsTaken;
    const { [name]: ___, ...i } = inputs;
    setReasons(r); setShotsTaken(s); setInputs(i);
  };

  const getTotalPoints = (name) => (reasons[name] || []).reduce((sum, r) => sum + r.points, 0);
  const getRemaining = (name) => getTotalPoints(name) - (shotsTaken[name] || 0);

  return (
    <div className="bg-green-950 text-white min-h-screen p-6 space-y-6">
      <h1 className="text-3xl font-bold text-green-300 text-center">Straphshots ING-Phøs25</h1>

      <div className="flex justify-center gap-2">
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Spell..."
          className="text-black px-2 py-1 rounded"
        />
        <button onClick={handleLogin} className="bg-green-600 px-4 py-1 rounded">Enter</button>
      </div>

      {admin && (
        <div className="text-center">
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Add Person"
            className="text-black px-2 py-1 rounded mb-2"
          />
          <button onClick={addPerson} className="bg-green-600 px-4 py-1 rounded">Add</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {people.map((name) => (
          <div key={name} className="bg-green-800 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <strong>{name}</strong>
              {admin && <button onClick={() => deletePerson(name)} className="text-red-400">×</button>}
            </div>
            <p>Total: {getTotalPoints(name)} pts</p>
            <p>Shots Taken: {shotsTaken[name] || 0}</p>
            <p>Remaining: {getRemaining(name)}</p>

            {admin && (
              <div className="space-y-1">
                <input
                  placeholder="Add Shots"
                  value={inputs[name]?.shots || ""}
                  onChange={(e) => setInputs({ ...inputs, [name]: { ...inputs[name], shots: e.target.value } })}
                  className="text-black w-full px-2 rounded"
                />
                <button onClick={() => addShots(name)} className="bg-green-700 px-2 py-1 rounded w-full">+ Shots</button>
                <input
                  placeholder="Reason"
                  value={inputs[name]?.reason || ""}
                  onChange={(e) => setInputs({ ...inputs, [name]: { ...inputs[name], reason: e.target.value } })}
                  className="text-black w-full px-2 rounded"
                />
                <input
                  placeholder="Points"
                  type="number"
                  value={inputs[name]?.points || ""}
                  onChange={(e) => setInputs({ ...inputs, [name]: { ...inputs[name], points: e.target.value } })}
                  className="text-black w-full px-2 rounded"
                />
                <button onClick={() => addReason(name)} className="bg-green-700 px-2 py-1 rounded w-full">+ Reason</button>
                <button onClick={() => saveToFirebase(name)} className="bg-green-500 px-2 py-1 rounded w-full">Save</button>
              </div>
            )}

            <div className="text-sm space-y-1">
              {(reasons[name] || []).map((r, i) => (
                <div key={i} className="flex justify-between">
                  <span>{r.reason}</span>
                  <span className="text-green-300">+{r.points}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
