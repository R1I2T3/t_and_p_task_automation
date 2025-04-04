export const sendResource = async (formData: FormData, token: string) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/resources/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`, // Ensure authentication if required
        },
        body: formData,
      });
  
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };
  