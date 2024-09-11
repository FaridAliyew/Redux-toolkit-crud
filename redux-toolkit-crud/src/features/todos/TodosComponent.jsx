import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchItems, createItem, updateItem, deleteItem, toggleComplete, deleteAllItems } from "./todosSlice";
import { MdDelete } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import "../../style/style.css";

const TodosComponent = () => {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.items);
  const [inputValue, setInputValue] = useState("");
  const [editItemId, setEditItemId] = useState(null);

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  const handleUpdateItem = (id, text) => {
    setEditItemId(id);
    setInputValue(text);
  };

  const handleDeleteItem = (id) => {
    dispatch(deleteItem(id));
  };

  const handleToggleComplete = async (id, completed) => {
    await dispatch(toggleComplete({ id, completed: !completed }));
    dispatch(fetchItems());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (inputValue.trim()) {
      if (editItemId) {
        const updatedItem = { id: editItemId, text: inputValue };
        await dispatch(updateItem(updatedItem));
        setEditItemId(null); // Reset edit mode
      } else {
        await dispatch(createItem({ item: inputValue }));
      }
      setInputValue(""); 
      dispatch(fetchItems()); 
    }
  };

  const handleDeleteAll = async () => {
    await dispatch(deleteAllItems());
  };

  if (status === "loading") return <div>Loading...</div>;
  if (status === "failed") return <div>Error: {error}</div>;

  return (
    <div className="todo-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit">
          {editItemId ? "Update Item" : "Create Item"}
        </button>
      </form>

      <p>Todo: {items.length}</p>

      <ul>
        {items?.map((item) => (
          <li
            key={item.id}
            className={item.completed ? "completed" : ""}
          >
            {item.item}
            <div>
              <MdEdit
                className="edit-icon"
                onClick={() => handleUpdateItem(item.id, item.item)}
              />
              <MdDelete
                className="delete-icon"
                onClick={() => handleDeleteItem(item.id)}
              />
              <FaCheck
                className="check-icon"
                onClick={() => handleToggleComplete(item.id, item.completed)}
              />
            </div>
          </li>
        ))}
      </ul>
      
      {/* Show the "Delete All" button only if there are items */}
      {items.length > 0 && (
        <button onClick={handleDeleteAll}>Delete All</button>
      )}
    </div>
  );
};

export default TodosComponent;
