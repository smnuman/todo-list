import React, { useState, useEffect } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  archived: boolean;
  completedAt?: string;
  intendedTime?: string;
  parentId?: number;
  subtasks: Todo[];
}

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [intendedTime, setIntendedTime] = useState('');
  const [showArchive, setShowArchive] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);

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
      const defaultTime = new Date().toISOString().slice(0, 16);
      const newTodo: Todo = {
        id: Date.now(),
        text: inputValue,
        completed: false,
        archived: false,
        intendedTime: defaultTime,
        parentId: selectedParentId || undefined,
        subtasks: []
      };
      setTodos([...todos, newTodo]);
      setInputValue('');
      setIntendedTime('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        const now = new Date().toISOString();
        const newCompleted = !todo.completed;
        const newTodo = { ...todo, completed: newCompleted, completedAt: newCompleted ? now : undefined };
        
        // If completing a parent task, complete all subtasks with the same completion time
        if (newCompleted && !todo.parentId) {
          newTodo.subtasks = todo.subtasks.map(st => ({
            ...st,
            completed: true,
            completedAt: now
          }));
        }
        return newTodo;
      }
      return todo;
    }));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const archiveTodo = (id: number) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        // Archive the main task and all its subtasks
        return { 
          ...todo, 
          archived: true,
          subtasks: todo.subtasks.map(st => ({ ...st, archived: true }))
        };
      }
      return todo;
    }));
  };

  const unarchiveTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, archived: false, completed: false } : todo
    ));
  };

  const duplicateToActive = (todo: Todo) => {
    const duplicateSubtasks = (subtasks: Todo[]): Todo[] => {
      return subtasks.map(subtask => ({
        ...subtask,
        id: Date.now() + Math.random(),
        completed: false,
        archived: false,
        subtasks: duplicateSubtasks(subtask.subtasks)
      }));
    };

    const newTodo: Todo = {
      id: Date.now(),
      text: todo.text,
      completed: false,
      archived: false,
      intendedTime: undefined,
      subtasks: duplicateSubtasks(todo.subtasks)
    };
    setTodos([...todos, newTodo]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-5xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-16">
          <div className="mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - Header and Add Section */}
              <div className="divide-y divide-gray-200">
                {/* Header Section with Title and Instructions */}
                <div className="pb-8">
                  <h1 className="text-3xl font-bold text-center text-blue-600">To-Do List</h1>
                  <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h2 className="text-lg font-semibold text-blue-700 mb-2">How to use:</h2>
                    <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
                      <li>Type your task in the input field and click <span className="font-medium text-blue-600">Add</span> or press Enter</li>
                      <li>Check the checkbox to mark a task as completed</li>
                      <li>Completed tasks can be archived using the archive icon</li>
                      <li>Your tasks are automatically saved in your browser</li>
                    </ul>
                  </div>
                </div>
                
                {/* Todo Input Form */}
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <form onSubmit={addTodo}>
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="Add a new todo..."
                          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
                        />

                      </div>
                      <button
                        type="submit"
                        className="h-12 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                      >
                        {selectedParentId ? 'Add Subtask' : 'Add Task'}
                      </button>
                    </div>
                    {selectedParentId && (
                      <div className="mt-2 text-sm text-blue-600">
                        Adding subtask to: {todos.find(t => t.id === selectedParentId)?.text}
                        <button
                          type="button"
                          onClick={() => setSelectedParentId(null)}
                          className="ml-2 text-red-500 hover:text-red-600"
                        >
                          Done
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>

              {/* Right Column - Todo List and Archive */}
              <div className="border-l pl-8">
                {/* Task Counter */}
                {todos.length > 0 && (
                  <div className="text-sm text-gray-500 mb-4">
                    {todos.filter(todo => todo.completed && !todo.archived).length} of {todos.filter(todo => !todo.archived).length} tasks completed
                  </div>
                )}
                
                {/* Active Todo List */}
                {todos.filter(todo => !todo.archived).length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    <p>No active tasks. Add your first task!</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {todos.filter(todo => !todo.archived).map(todo => (
                      <div
                        key={todo.id}
                        className={`flex items-center gap-3 py-2 border-b border-gray-100 group ${todo.parentId ? 'ml-6' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => toggleTodo(todo.id)}
                          className="h-4 w-4 text-blue-500 rounded focus:ring-blue-400"
                        />
                        <div className="flex-1">
                          <div className={`${todo.completed ? 'text-gray-400' : 'text-gray-700'}`}>
                            {todo.text}
                            <input
                              type="datetime-local"
                              value={todo.intendedTime}
                              onChange={(e) => {
                                const updatedTodos = todos.map(t =>
                                  t.id === todo.id ? { ...t, intendedTime: e.target.value } : t
                                );
                                setTodos(updatedTodos);
                              }}
                              className="ml-2 p-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
                              title="Modify due date"
                            />
                            {todo.completedAt && (
                              <span className="ml-2 text-sm text-green-500">
                                Completed: {new Date(todo.completedAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                          {todo.subtasks.length > 0 && (
                            <div className="ml-6 mt-2 space-y-1">
                              {todo.subtasks.map(subtask => (
                                <div key={subtask.id} className="flex items-center gap-3">
                                  <span className={`text-sm ${subtask.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {subtask.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {!todo.parentId && !todo.completed && (
                            <button
                              onClick={() => setSelectedParentId(todo.id)}
                              className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-500 focus:outline-none focus:opacity-100"
                              title="Add subtask"
                              aria-label="Add subtask"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                          {!todo.completed && (
                            <button
                              onClick={() => deleteTodo(todo.id)}
                              className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 focus:outline-none focus:opacity-100"
                              title="Delete task"
                              aria-label="Delete task"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                          {todo.completed && !todo.parentId && (
                            <button
                              onClick={() => archiveTodo(todo.id)}
                              className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-500 focus:outline-none focus:opacity-100"
                              title="Archive task"
                              aria-label="Archive task"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                                <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Archive Section */}
                <div className="mt-8">
                  <button
                    onClick={() => setShowArchive(!showArchive)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {showArchive ? 'Hide Archive' : 'Show Archive'}
                  </button>

                  {showArchive && (
                    <div className="mt-4 space-y-1">
                      {todos.filter(todo => todo.archived).length === 0 ? (
                        <div className="text-center py-4 text-gray-400">
                          <p>No archived tasks</p>
                        </div>
                      ) : (
                        todos.filter(todo => todo.archived).map(todo => (
                          <div
                            key={todo.id}
                            className="flex items-center gap-3 py-2 border-b border-gray-100 group"
                          >
                            <div className="flex-1">
                              <div className="text-gray-400 line-through">
                                {todo.text}
                                {todo.completedAt && (
                                  <span className="ml-2 text-sm text-green-500">
                                    Completed: {new Date(todo.completedAt).toLocaleString()}
                                  </span>
                                )}
                              </div>
                              {todo.subtasks.length > 0 && (
                                <div className="ml-6 mt-2 space-y-1">
                                  {todo.subtasks.map(subtask => (
                                    <div key={subtask.id} className="text-sm text-gray-400 line-through">
                                      {subtask.text}
                                      {subtask.completedAt && (
                                        <span className="ml-2 text-xs text-green-500">
                                          Completed: {new Date(subtask.completedAt).toLocaleString()}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => unarchiveTodo(todo.id)}
                                className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-green-500 focus:outline-none focus:opacity-100"
                                title="Unarchive task"
                                aria-label="Unarchive task"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <button
                                onClick={() => duplicateToActive(todo)}
                                className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-500 focus:outline-none focus:opacity-100"
                                title="Copy to active list"
                                aria-label="Copy to active list"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                                  <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => deleteTodo(todo.id)}
                                className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 focus:outline-none focus:opacity-100"
                                title="Delete archived task"
                                aria-label="Delete archived task"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;