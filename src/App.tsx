import React, { useState, useEffect } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() !== '') {
      const newTodo: Todo = {
        id: Date.now(),
        text: inputValue,
        completed: false
      };
      setTodos([...todos, newTodo]);
      setInputValue('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-2xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-16">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              {/* Header Section with Title and Instructions */}
              <div className="pb-8">
                <h1 className="text-3xl font-bold text-center text-blue-600">To-Do List</h1>
                <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h2 className="text-lg font-semibold text-blue-700 mb-2">How to use:</h2>
                  <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
                    <li>Type your task in the input field and click <span className="font-medium text-blue-600">Add</span> or press Enter</li>
                    <li>Check the checkbox to mark a task as completed</li>
                    <li>Hover over a task and click <span className="font-medium text-red-500">Delete</span> to remove it</li>
                    <li>Your tasks are automatically saved in your browser</li>
                  </ul>
                </div>
              </div>
              
              {/* Todo Input Form */}
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <form onSubmit={addTodo} className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Add a new todo..."
                    className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-5 py-3 rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    Add
                  </button>
                </form>
                
                {/* Task Counter */}
                {todos.length > 0 && (
                  <div className="text-sm text-gray-500 mb-2">
                    {todos.filter(todo => todo.completed).length} of {todos.length} tasks completed
                  </div>
                )}
                
                {/* Todo List */}
                {todos.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    <p>No tasks yet. Add your first task above!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todos.map(todo => (
                      <div
                        key={todo.id}
                        className="flex items-center gap-3 p-3 border rounded-lg group hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => toggleTodo(todo.id)}
                          className="h-5 w-5 text-blue-500 rounded focus:ring-blue-400"
                        />
                        <span className={`flex-1 ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {todo.text}
                        </span>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-700 focus:outline-none focus:opacity-100"
                          aria-label="Delete task"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;