import { useState, useEffect } from "react";
import { db, auth } from "../firebase/config";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";

export default function TodoWidget() {

  const [task, setTask] = useState("");
  const [todos, setTodos] = useState([]);

  /* LOAD TODOS */

  useEffect(() => {

    const fetchTodos = async () => {

      const q = query(
        collection(db, "todos"),
        where("uid", "==", auth.currentUser.uid)
      );

      const snap = await getDocs(q);

      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      setTodos(data);
    };

    fetchTodos();

  }, []);

  /* REFRESH TODOS */

  const fetchTodos = async () => {

    const q = query(
      collection(db, "todos"),
      where("uid", "==", auth.currentUser.uid)
    );

    const snap = await getDocs(q);

    const data = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    setTodos(data);
  };

  /* ADD TODO */

  const addTodo = async () => {

    if (!task.trim()) return;

    await addDoc(collection(db, "todos"), {
      uid: auth.currentUser.uid,
      text: task,
      completed: false,
      createdAt: serverTimestamp()
    });

    setTask("");
    fetchTodos();
  };

  /* TOGGLE COMPLETE */

  const toggleTodo = async (todo) => {

    await updateDoc(
      doc(db, "todos", todo.id),
      {
        completed: !todo.completed
      }
    );

    fetchTodos();
  };

  /* DELETE */

  const deleteTodo = async (id) => {

    await deleteDoc(doc(db, "todos", id));
    fetchTodos();

  };

  /* ENTER KEY ADD */

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">

      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Today's Tasks
      </h2>

      {/* ADD TASK */}

     <div className="flex flex-col sm:flex-row gap-2 mb-4">

  <input
    value={task}
    onChange={(e) => setTask(e.target.value)}
    onKeyDown={handleKeyDown}
    placeholder="Add new task..."
    className="
      flex-1
      p-3 rounded
      bg-gray-100 dark:bg-gray-700
      text-gray-900 dark:text-white
      outline-none
    "
  />

  <button
    onClick={addTodo}
    className="
      w-full sm:w-auto
      px-4 py-3
      bg-black text-white
      dark:bg-white dark:text-black
      rounded
      hover:opacity-80
    "
  >
    Add
  </button>

</div>

      {/* TASK LIST */}

      <div className="flex flex-col gap-2">

        {todos.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No tasks yet
          </p>
        )}

        {todos.map(todo => (

          <div
            key={todo.id}
            className="
              flex justify-between items-center
              bg-gray-100 dark:bg-gray-700
              p-2 rounded
            "
          >

            <div className="flex items-center gap-2">

              <input
  type="checkbox"
  className="w-5 h-5"
  checked={todo.completed}
  onChange={() => toggleTodo(todo)}
/>

              <span
                className={`text-gray-900 dark:text-white ${
                  todo.completed ? "line-through opacity-60" : ""
                }`}
              >
                {todo.text}
              </span>

            </div>

            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-red-500 text-sm"
            >
              Delete
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}