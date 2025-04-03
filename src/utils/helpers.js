// Handles errors and logs them to the console
export const handleError = (err, setError) => {
    console.error(err.message || "An unknown error occurred");
    setError(err.message || "An unknown error occurred");
  };
  
  // Function to handle loading state
  export const withLoading = async (callback, setLoading) => {
    setLoading(true);
    try {
      const result = await callback(); // Capture the result of the callback
      return result; // Return the result to propagate it
    } finally {
      setLoading(false);
    }
  };