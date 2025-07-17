let apiService = (function () {
  let module = {};

  /** List of all the routes:
   * * - POST /users/register: Register a new user
   * * - POST /users/login: Log in an existing user
   * * - GET /users/ Get user based on pagination (This is to get their gallery)
   * * - GET /users/:id/photos: Get all photos of a user via pagination
   * * - POST /users/:id/photos: Upload a new photo for a user
   * * - GET /photos/:id/comments: Get all comments for a photo, 10 per page
   * * - POST /photos/:id/comments: Add a comment to a photo
   * * - DELETE /photos/:id: Delete a photo by ID
   * * - GET /photos/:id/image: Get the image file of a photo
   * * - DELETE /comments/:id: Delete a comment by ID
   */

  // UPDATE: We changed routes for authorization :(
  /** List of all the CHANGED routes:
   * * - POST users/:userId/gallery/:galleryId/photos: Get user gallery photos with pagination
   * * - GET users/:userId/photos/:photoId/comments: Get all comments for a photo, 10 per page
   * * - POST users/:userId/photos/:photoId/comments: Add a comment to a photo
   * * - DELETE users/:userId/gallery/:galleryId/photos/:id: Delete a photo by ID
   * * - DELETE users/:userId/gallery/:galleryId/comments/:id: Delete a comment by ID
   * /



  /** Description of functions in api-service:
   * * - registerUser: Registers a new user with a username and password
   * * - loginUser: Logs in an existing user with a username and password
   * * - getUserPhotos: Fetches photos of a user with pagination support
   * * - getPhotosByUserId: Fetches photos based on userId with pagination support
   * * - uploadPhoto: Uploads a new photo for a user
   * * - getPhotoComments: Fetches all comments for a photo with pagination support
   * * - addPhotoComment: Adds a comment to a photo
   * * - deletePhoto: Deletes a photo by its ID
   * * - deleteComment: Deletes a comment by its ID
   */

  // Function to register a new user
  module.registerUser = function (username, password) {
    return fetch("/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.error || "Registration failed");
          });
        }
        return response.json().then((data) => {
          // Store the token in local storage for future requests
          const token =
            data.user && data.user.token ? data.user.token : data.token;
          localStorage.setItem("token", token);
          return data;
        });
      })
      .catch((error) => {
        throw error;
      });
  };

  // Function to log in an existing user
  module.loginUser = function (username, password) {
    return fetch("/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.error || "Login failed");
          });
        }
        return response.json().then((data) => {
          // Store the token in local storage for future requests
          const token =
            data.user && data.user.token ? data.user.token : data.token;
          localStorage.setItem("token", token);
          return data;
        });
      })
      .catch((error) => {
        throw error;
      });
  };

  // Function to get user gallery with pagination
  module.getUserGallery = function (page = 1, limit = 10) {
    return fetch(`/gallery?page=${page}&limit=${limit}`)
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.error || "Failed to fetch user gallery");
          });
        }
        return response.json();
      })
      .catch((error) => {
        throw error;
      });
  };

  // Function to get user photos with pagination
  module.getUserPhotos = function (galleryId, page = 1, limit = 1) {
    return fetch(`/gallery/${galleryId}/photos?page=${page}&limit=${limit}`)
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.error || "Failed to fetch user photos");
          });
        }
        return response.json();
      })
      .catch((error) => {
        throw error;
      });
  };

  /**
   * Uploads a new photo for the authenticated user
   * @param {string} title - The title of the photo
   * @param {File} photoFile - The photo file to upload (should be sent as 'photo' field)
   * @returns {Promise<object>} The response from the server
   */
  module.uploadPhoto = function (title, photoFile) {
    const token = getTokenWithLog();
    if (!token) throw new Error("No token found in local storage");
    const formData = new FormData();
    formData.append("photo", photoFile);
    formData.append("title", title);
    return fetch(`/users/me/photos`, {
      method: "POST",
      headers: { Authorization: `${token}` },
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.error || "Photo upload failed");
          });
        }
        return response.json();
      })
      .catch((error) => {
        throw error;
      });
  };

  // Function to get all comments for a photo with pagination (for authenticated user)
  module.getPhotoComments = function (photoId, page = 1, limit = 10) {
    const token = getTokenWithLog();
    if (!token) throw new Error("No token found in local storage");
    return fetch(
      `/users/me/photos/${photoId}/comments?page=${page}&limit=${limit}`,
      {
        headers: { Authorization: `${token}` },
      }
    )
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.error || "Failed to fetch photo comments");
          });
        }
        return response.json();
      })
      .catch((error) => {
        throw error;
      });
  };

  // Function to add a comment to a photo (for authenticated user)
  module.addPhotoComment = function (photoId, content, author) {
    const token = getTokenWithLog();
    if (!token) throw new Error("No token found in local storage");
    return fetch(`/users/me/photos/${photoId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      body: JSON.stringify({ content, author }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.error || "Failed to add comment");
          });
        }
        return response.json();
      })
      .catch((error) => {
        throw error;
      });
  };

  // Function to delete a photo by ID (for authenticated user)
  module.deletePhoto = function (galleryId, photoId) {
    const token = getTokenWithLog();
    if (!token) throw new Error("No token found in local storage");
    return fetch(`/users/me/gallery/${galleryId}/photos/${photoId}`, {
      method: "DELETE",
      headers: { Authorization: `${token}` },
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.error || "Failed to delete photo");
          });
        }
        return response.json();
      })
      .catch((error) => {
        throw error;
      });
  };

  // Function to delete a comment by ID (for authenticated user)
  module.deleteComment = function (galleryId, commentId) {
    const token = getTokenWithLog();
    if (!token) throw new Error("No token found in local storage");
    return fetch(`/users/me/gallery/${galleryId}/comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `${token}` },
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.error || "Failed to delete comment");
          });
        }
        return response.json();
      })
      .catch((error) => {
        throw error;
      });
  };

  module.getUser = function () {
    const token = getTokenWithLog();
    if (!token) {
      throw new Error("No token found in local storage");
    }
    return fetch("/users/me", {
      method: "GET",
      headers: {
        Authorization: `${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.error || "Failed to fetch user info");
          });
        }
        return response.json();
      })
      .catch((error) => {
        throw error;
      });
  };

  function getTokenWithLog() {
    const token = localStorage.getItem("token");
    return token;
  }

  // Signout function that calls signout API endpoint
  module.signout = function () {
    const token = getTokenWithLog();
    if (!token) throw new Error("No token found in local storage");
    return fetch("/users/signout", {
      method: "GET",
      headers: { Authorization: `${token}` },
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.error || "Signout failed");
          });
        }
        // Clear the token from local storages
        localStorage.removeItem("token");
        return response.json();
      })
      .catch((error) => {
        throw error;
      });
  };

  return module;
})();
