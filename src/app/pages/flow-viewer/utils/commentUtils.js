/**
 * Utilities for saving and loading flow comments
 */

// Save a comment to the database
export const saveCommentToDatabase = async (comment) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('/api/flowCommentAPI', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comment),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      } catch (jsonError) {
        throw new Error(`Error: ${response.status}${response.statusText ? ` ${response.statusText}` : ''}`);
      }
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error saving comment to database:', error);
    
    if (error.name === 'AbortError') {
      return { success: false, error: 'Request timed out. Please check your connection.' };
    }
    
    if (error.message.includes('Failed to fetch') || error.message.includes('ERR_INTERNET_DISCONNECTED')) {
      return { success: false, error: 'No internet connection. Comment will be saved when connection is restored.' };
    }
    
    return { success: false, error: error.message };
  }
};

// Get all comments for a specific flow and session
export const getCommentsForFlow = async (flowId, sessionId) => {
  try {
    if (!flowId || !sessionId) {
      throw new Error('Both flowId and sessionId are required');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`/api/flowCommentAPI?flowId=${flowId}&sessionId=${sessionId}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      } catch (jsonError) {
        throw new Error(`Error: ${response.status}${response.statusText ? ` ${response.statusText}` : ''}`);
      }
    }

    const comments = await response.json();
    return { success: true, data: comments };
  } catch (error) {
    console.error('Error fetching comments from database:', error);
    
    if (error.name === 'AbortError') {
      return { success: false, error: 'Request timed out. Please check your connection.', data: [] };
    }
    
    if (error.message.includes('Failed to fetch') || error.message.includes('ERR_INTERNET_DISCONNECTED')) {
      return { success: false, error: 'No internet connection. Comments will be available when connection is restored.', data: [] };
    }
    
    return { success: false, error: error.message, data: [] };
  }
};

// Delete a comment
export const deleteComment = async (commentId) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`/api/flowCommentAPI?commentId=${commentId}`, {
      method: 'DELETE',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      } catch (jsonError) {
        throw new Error(`Error: ${response.status}${response.statusText ? ` ${response.statusText}` : ''}`);
      }
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error deleting comment:', error);
    
    if (error.name === 'AbortError') {
      return { success: false, error: 'Request timed out. Please check your connection.' };
    }
    
    if (error.message.includes('Failed to fetch') || error.message.includes('ERR_INTERNET_DISCONNECTED')) {
      return { success: false, error: 'No internet connection. Please try again when connection is restored.' };
    }
    
    return { success: false, error: error.message };
  }
}; 