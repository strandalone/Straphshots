// Straphshots with Firebase Firestore Integration
import { useState, useEffect } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from "firebase/firestore";
import { firebaseConfig } from "../firebaseConfig";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [people, setPeople] = useState([]);
  const [reasons, setReasons] = useState({});
  const [shotsTaken, setShotsTaken] = useState({});
  const [inputStates, setInputStates] = useState({});
  const [nameInput, setNameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "people"), (snapshot) => {
      const all = [];
      const reasonsData = {};
      const shotsData = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        all.push(docSnap.id);
        reasonsData[docSnap.id] = data.reasons || [];
        shotsData[docSnap.id] = data.shots || 0;
      });
      setPeople(all);
      setReasons(reasonsData);
      setShotsTaken(shotsData);
    });
    return () => unsub();
  }, []);

  const handleLogin = () => passwordInput === "king1" && setAdmin(true);
  const handleLogout = () => { setAdmin(false); setPasswordInput(""); };

  const addPerson = async () => {
    const name = nameInput.trim();
    if (!name || people.includes(name)) return;
    await setDoc(doc(db, "people", name), {
      reasons: [],
      shots: 0,
    });
    setInputStates({ ...inputStates, [name]: { reason: "", points: "", shots: "" } });
    setNameInput("");
  };

  const addReason = async (name) => {
    const { reason, points } = inputStates[name];
    const entry = { reason, points: parseInt(points, 10) };
    const updated = [...(reasons[name] || []), entry];
    await updateDoc(doc(db, "people", name), { reasons: updated });
    setInputStates({ ...inputStates, [name]: { ...inputStates[name], reason: "", points: "" } });
  };

  const addShots = async (name) => {
    const amount = parseInt(inputStates[name].shots, 10);
    if (!isNaN(amount)) {
      const updated = (shotsTaken[name] || 0) + amount;
      await updateDoc(doc(db, "people", name), { shots: updated });
      setInputStates({ ...inputStates, [name]: { ...inputStates[name], shots: "" } });
    }
  };

  const removeReason = async (name, index) => {
    const updated = [...reasons[name]];
    updated.splice(index, 1);
    await updateDoc(doc(db, "people", name), { reasons: updated });
  };

  const getTotalPoints = (name) => (reasons[name] || []).reduce((sum, r) => sum + r.points, 0);
  const getRemainingPoints = (name) => getTotalPoints(name) - (shotsTaken[name] || 0);
  const getTopShotTakers = () => [...people].sort((a, b) => (shotsTaken[b] || 0) - (shotsTaken[a] || 0)).slice(0, 3);
  const topReason = people
    .flatMap(name => (reasons[name] || []).map(r => ({ ...r, name })))
    .reduce((best, r) => r.points > best.points ? r : best, { name: "—", reason: "", points: 0 });

  return (
    <div className="min-h-screen bg-green-950 text-white p-4 space-y-6">
      <h1 className="text-3xl font-bold text-green-300 text-center">Straphshots ING-Phøs25</h1>

      <div className="flex flex-col items-center w-full sm:w-60 mx-auto">
        <Input value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="Enter Spell..." className="text-black text-sm mb-2" />
        <Button onClick={handleLogin} className="w-full mb-1">Enter</Button>
        {admin && <Button onClick={handleLogout} variant="outline" className="w-full">Leave</Button>}
      </div>

      {admin && (
        <div className="text-center">
          <Input value={nameInput} onChange={(e) => setNameInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addPerson()} placeholder="New name" className="text-black mb-2" />
          <Button onClick={addPerson}>Add Person</Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {people.map((name) => (
          <div key={name} className="bg-green-900 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg">{name}</span>
              {admin && (
                <button onClick={async () => await deleteDoc(doc(db, "people", name))} className="text-red-400">×</button>
              )}
            </div>
            <p className="text-sm">Remaining Shots: {getRemainingPoints(name)}</p>
            <p className="text-sm mb-2">Shots Taken: {shotsTaken[name] || 0}</p>

            {admin && (
              <>
                <Input placeholder="Add Shots" value={inputStates[name]?.shots || ""} onChange={(e) => setInputStates({ ...inputStates, [name]: { ...inputStates[name], shots: e.target.value } })} onKeyDown={(e) => e.key === 'Enter' && addShots(name)} className="text-black mb-1" />
                <Button onClick={() => addShots(name)} className="mb-2">Add Shots</Button>
                <Input placeholder="Reason" value={inputStates[name]?.reason || ""} onChange={(e) => setInputStates({ ...inputStates, [name]: { ...inputStates[name], reason: e.target.value } })} onKeyDown={(e) => e.key === 'Enter' && addReason(name)} className="text-black mb-1" />
                <Input placeholder="Points" type="number" value={inputStates[name]?.points || ""} onChange={(e) => setInputStates({ ...inputStates, [name]: { ...inputStates[name], points: e.target.value } })} onKeyDown={(e) => e.key === 'Enter' && addReason(name)} className="text-black mb-1" />
                <Button onClick={() => addReason(name)} className="mb-2">Add Reason</Button>
              </>
            )}

            <div className="text-sm space-y-1">
              {(reasons[name] || []).map((r, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span>{r.reason}</span>
                  <span className="text-green-300">+{r.points}</span>
                  {admin && (
                    <button onClick={() => removeReason(name, i)} className="ml-2 text-red-400">×</button>
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
