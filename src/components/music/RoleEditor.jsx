import React, { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

const RoleEditor = ({
  role,
  profileId,
  details,
  refetch,
  addDetails,
  updateDetails,
  deleteDetails,
  fields,
  title,
}) => {
  const [newDetail, setNewDetail] = useState(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: field.default || "" }), {})
  );

  const [editingDetail, setEditingDetail] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleAddDetail = () => {
    for (const field of fields) {
      if (field.required && !newDetail[field.name]?.trim()) {
        setErrorMessage(`${field.label} is required.`);
        setTimeout(() => setErrorMessage(""), 3000);
        return;
      }
    }

    addDetails({
      ...newDetail,
      role_id: role.id,
      profile_id: profileId,
    })
      .then(() => {
        setNewDetail(fields.reduce((acc, field) => ({ ...acc, [field.name]: field.default || "" }), {}));
        setErrorMessage("");
        setSuccessMessage(`${title} added successfully!`);
        setTimeout(() => setSuccessMessage(""), 3000);

        // Fetch updated details
        refetch()        
      })
      .catch((error) => {
        console.error(`Error adding ${title.toLowerCase()}:`, error);
        setErrorMessage(`Failed to add ${title.toLowerCase()}. Please try again.`);
      });
  };

  const handleSaveDetail = (detail) => {
    const updatedData = {
      ...detail,
      ...editingDetail?.[detail.id],
    };

    for (const field of fields) {
      if (field.required && !updatedData[field.name]?.trim()) {
        setErrorMessage(`${field.label} is required.`);
        setTimeout(() => setErrorMessage(""), 3000);
        return;
      }
    }

    updateDetails(detail.id, updatedData).then(() => {
      setSuccessMessage(`${title} updated successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      refetch();
    });

    setEditingDetail((prev) => {
      const { [detail.id]: _, ...rest } = prev || {};
      return rest;
    });
  };

  const handleDeleteDetail = (id) => {
    console.log("id to delete:", id);
    
    deleteDetails(id)
      .then(() => {
        setSuccessMessage(`${title} deleted successfully!`);
        setTimeout(() => setSuccessMessage(""), 3000);

        // Fetch updated details
        refetch()
      })
      .catch((error) => {
        console.error(`Error deleting ${title.toLowerCase()}:`, error);
        setErrorMessage(`Failed to delete ${title.toLowerCase()}. Please try again.`);
      });
  };

  return (
    <div className="text-gray-800">
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      {successMessage && <p className="text-green-500 mb-2">{successMessage}</p>}
      {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}
      <ul className="space-y-2">
        {details.map((detail) => (
          <li
            key={detail.id}
            className="bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center"
          >
            <div className="flex flex-col gap-2">
              {fields.map((field) => (
                <div key={field.name}>
                  <strong>{field.label}:</strong>
                  {field.type === "select" ? (
                    <select
                      value={editingDetail?.[detail.id]?.[field.name] ?? detail[field.name]}
                      onChange={(e) =>
                        setEditingDetail((prev) => ({
                          ...prev,
                          [detail.id]: {
                            ...prev?.[detail.id],
                            [field.name]: e.target.value,
                          },
                        }))
                      }
                      className="ml-2 p-1 border rounded"
                    >
                      <option value="" disabled>
                        Choose one
                      </option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || "text"}
                      value={editingDetail?.[detail.id]?.[field.name] ?? detail[field.name]}
                      onChange={(e) =>
                        setEditingDetail((prev) => ({
                          ...prev,
                          [detail.id]: {
                            ...prev?.[detail.id],
                            [field.name]: e.target.value,
                          },
                        }))
                      }
                      className="ml-2 p-1 border rounded"
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleSaveDetail(detail)}
                className="bg-green-500 text-white text-xs px-2 py-1 rounded hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={() => handleDeleteDetail(detail.id)}
                className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        {fields.map((field) => (
          <div key={field.name} className="mb-2">
            {field.type === "select" ? (
              <>
                <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                <select
                  value={newDetail[field.name]}
                  onChange={(e) =>
                    setNewDetail({ ...newDetail, [field.name]: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="" disabled>
                    Choose one
                  </option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <Input
                label={field.label}
                placeholder={field.placeholder}
                type={field.type || "text"}
                value={newDetail[field.name]}
                onChange={(e) =>
                  setNewDetail({ ...newDetail, [field.name]: e.target.value })
                }
              />
            )}
          </div>
        ))}
        <Button onClick={handleAddDetail} className="mt-2">
          Add
        </Button>
      </div>
    </div>
  );
};

export default RoleEditor;