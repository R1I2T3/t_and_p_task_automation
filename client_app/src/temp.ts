import React, { useState } from "react";

// for
const App = () => {
  const [formElement, setFormElements] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const onAddButtonClick = (e) => {
    e.preventDefault();
    if (!isEdit) {
      const allFormElements = [
        ...formElement,
        { name, type, id: crypto.randomUUID(), placeholder },
      ];
      setFormElements(allFormElements);
    } else {
      const newFormElements = formElement.map((element) =>
        element.id === formElement[0].id
          ? { name, type, id: formElement[0].id, placeholder }
          : element
      );
      setFormElements(newFormElements);
      setIsEdit(false);
    }

    setName("");
    setType("");
    setPlaceholder("");
  };
  const onDeleteButtonClick = (id) => {
    const newFormElements = formElement.filter((element) => element.id !== id);
    setFormElements(newFormElements);
  };
  const editButtonClick = (id) => {
    const element = formElement.filter((element) => element.id === id);
    console.log(element);
    setName(element[0].name);
    setType(element[0].type);
    setPlaceholder(element[0].placeholder);
    setIsEdit(true);
  };
  const [options, setOptions] = useState([
    {
      id: crypto.randomUUID(),
      value: "option",
      placeholder: "option",
    },
  ]);
  return (
    <div>
      <div>
        {formElement.map((element) => (
          <>
            <input
              id={element.id}
              name={element.name}
              type={element.type}
              key={element.id}
              placeholder={element.placeholder}
            />
            <button onClick={() => editButtonClick(element.id)}>edit</button>
            <button onClick={() => onDeleteButtonClick(element.id)}>
              delete
            </button>
          </>
        ))}
      </div>
      <div>
        <form>
          <input
            name="element_name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            name="element_placeholder"
            type="text"
            value={placeholder}
            onChange={(e) => setPlaceholder(e.target.value)}
          />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="text">text</option>
            <option value="number">Number</option>
            <option value="file">File</option>
            <option value="file">select</option>
          </select>
          {/* {type === "select" && (
            <div>
              {options.map((option) => (
                <input key={option.id} value={}/>
              )
              )}
              <button>Add Option</button>
            </div>
          )} */}
          <button onClick={onAddButtonClick}>
            {isEdit ? "Edit" : "Add element"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
