"use client";
import { useState, useEffect } from "react";
import axios from "axios";

const Admin = () => {
  const [chatbots, setChatbots] = useState([]);
  const [newBot, setNewBot] = useState({
    name: "",
    description: "",
    prompt: "",
    image: null,
  });
  const [editingBotId, setEditingBotId] = useState(null); // Track which bot is being edited

  useEffect(() => {
    // Fetch chatbots on page load
    axios.get("https://api.couplenxt.com/api/chatbots").then((res) => setChatbots(res.data));
  }, []);

  const handleFileChange = (e) => {
    setNewBot({ ...newBot, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", newBot.name);
    formData.append("description", newBot.description);
    formData.append("prompt", newBot.prompt);

    if (editingBotId) {
      // Edit existing bot
      await axios.put(`https://api.couplenxt.com/api/chatbots/${editingBotId}`, formData);
      setChatbots(
        chatbots.map((bot) =>
          bot.id === editingBotId
            ? { ...bot, name: newBot.name, description: newBot.description, prompt: newBot.prompt }
            : bot
        )
      );
      setEditingBotId(null);
    } else {
      // Add new bot
      const res = await axios.post("https://api.couplenxt.com/api/chatbots", formData);
      setChatbots([...chatbots, res.data]);
    }

    alert(editingBotId ? "Bot updated!" : "Bot added!");
    setNewBot({ name: "", description: "", prompt: "", image: null });
  };

  const handleImageSubmit = async (id) => {
    if (!newBot.image) return alert("No image selected");
  
    const formData = new FormData();
    formData.append("image", newBot.image);
  
    try {
      await axios.patch(`https://api.couplenxt.com/api/chatbots/${id}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      setChatbots(
        chatbots.map((bot) =>
          bot.id === id ? { ...bot, image: newBot.image.name } : bot
        )
      );
      alert("Image updated!");
      setNewBot({ ...newBot, image: null });
      
      // Reset file input value
      document.querySelector('input[type="file"]').value = '';
    } catch (error) {
      console.error("Error updating image:", error);
      alert("Failed to update image. Please try again.");
    }
  };
  

  const handleActivation = async (id, active) => {
    await axios.patch(`https://api.couplenxt.com/api/chatbots/${id}/active`, { active });
    setChatbots(
      chatbots.map((bot) =>
        bot.id === id ? { ...bot, active } : bot
      )
    );
  };

  const handleEdit = (bot) => {
    // Set the fields with the bot data for editing
    setNewBot({
      name: bot.name,
      description: bot.description,
      prompt: bot.prompt,
      image: null, // Image can't be pre-filled in file input
    });
    setEditingBotId(bot.id); // Set the editing bot ID
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Add new chatbot / Edit chatbot */}
      <form onSubmit={handleSubmit} className="mb-8">
        <input
          type="text"
          placeholder="Name"
          className="border p-2 mb-4 w-full"
          value={newBot.name}
          onChange={(e) => setNewBot({ ...newBot, name: e.target.value })}
        />
        <textarea
          placeholder="Description"
          className="border p-2 mb-4 w-full"
          value={newBot.description}
          onChange={(e) => setNewBot({ ...newBot, description: e.target.value })}
        />
        <textarea
          placeholder="Prompt"
          className="border p-2 mb-4 w-full"
          value={newBot.prompt}
          onChange={(e) => setNewBot({ ...newBot, prompt: e.target.value })}
        />
        <input
          type="file"
          accept=".jpg, .jpeg, .png, .svg"
          onChange={handleFileChange}
          className="mb-4 w-full"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 w-full">
          {editingBotId ? "Update Bot" : "Add Bot"}
        </button>
      </form>

      {/* Chatbot list */}
      <h2 className="text-xl font-bold mb-4">Chatbots</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Profile</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {chatbots.map((bot) => (
            <tr key={bot.id} className="text-center">
              <td className="border p-2">
                {bot.image ? (
                  <img
                    src={`https://api.coupleup.in/uploads/${bot.image}`}
                    alt={bot.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  "No Image"
                )}
                {/* Image Upload Button */}
                <input
                  type="file"
                  accept=".jpg, .jpeg, .png, .svg"
                  onChange={handleFileChange}
                  className="mb-4 w-full"
                />
                <button
                  onClick={() => handleImageSubmit(bot.id)}
                  className="bg-green-500 text-white p-1"
                >
                  Change Image
                </button>
              </td>
              <td className="border p-2">{bot.name}</td>
              <td className="border p-2">{bot.description}</td>
              <td className="border p-2">{bot.active ? "Active" : "Inactive"}</td>
              <td className="border p-2 flex justify-center gap-2">
                <button
                  onClick={() => handleActivation(bot.id, !bot.active)}
                  className="bg-blue-500 text-white p-1"
                >
                  {bot.active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleEdit(bot)}
                  className="bg-yellow-500 text-white p-1"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;
