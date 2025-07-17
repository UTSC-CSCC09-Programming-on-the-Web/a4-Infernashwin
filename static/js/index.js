(function () {
  "use strict";

  // module

  const module = {};

  const [image, getImage, setImage] = meact.useState(null);
  const [comments, getComments, setComments] = meact.useState(null);
  const [auth, getAuth, setAuth] = meact.useState(false);
  const [user, getUser, setUser] = meact.useState(null);
  const [gallery, getGallery, setGallery] = meact.useState(null);
  const [loading, getLoading, setLoading] = meact.useState(false);
  const COMMENT = "comment";
  const IMAGE = "image";
  const USER = "user";

  /** Here is the description of the state variabless:
  * - image: Holds the current image data to be displayed in the gallery.
  *   - the object structure is: 
        * page: The current page number of the image being displayed.
        * totalPages: The total number of pages available for the image.
        * photos: An array of photo objects (refer to the model for more details)
        
  * - comments: Holds the current comments for the displayed image.
  *   - the object structure is:
        * page: The current page number of the comments being displayed.
        * totalPages: The total number of pages available for the comments.
        * comments: An array of comment objects (refer to the model for more details)
        
  * - user: Holds the current user data, which can be used for authentication or display
  *   - the object structure is just the user object (refer to the model for more details)
  
  * - gallery: Holds the user who's gallery we will be displaying
  *   - the object structure is:
      * page: the current page number of the gallery being displayed
      * totalPages: The current page number of the gallery being displayed
      * users: An array of user objects (refer to the model for more detail)
  
  * - loading: A boolean state to indicate if data is currently being loaded.
  *   - true if data is being loaded, false otherwise
 */

  window.addEventListener("load", function () {
    // Set the initial pageIndex to 1
    apiService.getUserGallery(1, 1).then((data) => {
      setGallery(data);
    });
  });

  // Functions
  // As drake says where tf the functions (cause I used a bunch above and I didn't write them yet....)

  /** Functions I need to write
   * * - addImage: Opens a popup to add a new image
   * * - logoutUser: Logs out the current user
   * * - showLoginModal: Creates a popup to log in a user
   * * - showRegisterModal: Creates a popup to register a new user
   * * - noGallery: Displays a message indicating that there is no gallery to display
   * * - noImage: Displays a message indicating that there is no image to display
   * * - noComments: Displays a message indicating that there are no comments to display
   * * - renderGallery: Renders the gallery with the given image data
   * * - renderComments: Renders the comments with the given comment data
   */

  // Most of these are migrated from A2, just need to make minor changes cause of UI changes for users
  // Yes I am using these comments to help prompt co-pilot by giving it context, but also cause I keep forgetting what I need to do
  // And like I am too tired to reread everything every single time. If these comments are annoying mb chief, I'm just going insane trying to do this assignment
  // Also I hope you are having a good day Andre, Vincent, Jason, or Cho, whoever is marking this assignment

  // Legacy code for addImage
  /*
  const popup = document.createElement("div");
    popup.className = "popup-form";
    popup.innerHTML = `
      <h2>Add Image</h2>
      <label for="imgTitle">Title:</label>
      <input type="text" id="imgTitle" required>
      <label for="author">Author:</label>
      <input type="text" id="author" required>
      <label for="file">File:</label>
      <input type="file" id="file" required>
      <button id="submitImage">Submit</button>
      <button id="cancelImage">Cancel</button>
    `;

    const overlay = document.createElement("div");
    overlay.className = "popup-overlay";
    overlay.appendChild(popup);

    document.body.appendChild(overlay);

    popup.querySelector("#cancelImage").addEventListener("click", function () {
      document.body.removeChild(overlay);
    });

    popup.querySelector("#submitImage").addEventListener("click", function () {
      const title = popup.querySelector("#imgTitle").value;
      const author = popup.querySelector("#author").value;
      const file = popup.querySelector("#file").files[0]; // Get the first file from the input
      if (!title || !author || !file) {
        alert("Please fill in all fields");
        return;
      }
      // Legacy: apiService.addImage(title, author, file).then(() => { ... });
    });
  });*/

  // Move function declarations above useEffect hooks so they are hoisted and available
  function addImage() {
    // Create a popup to add a new image
    const popup = document.createElement("div");
    popup.className = "popup-form";
    popup.innerHTML = `
      <h2>Add Image</h2>
      <label for="imgTitle">Title:</label>
      <input type="text" id="imgTitle" required>
      <label for="file">File:</label>
      <input type="file" id="file" required>
      <button id="submitImage">Submit</button>
      <button id="cancelImage">Cancel</button>
    `;

    const overlay = document.createElement("div");
    overlay.className = "popup-overlay";
    overlay.appendChild(popup);

    document.body.appendChild(overlay);

    popup.querySelector("#cancelImage").addEventListener("click", function () {
      document.body.removeChild(overlay);
    });

    popup.querySelector("#submitImage").addEventListener("click", function () {
      const title = popup.querySelector("#imgTitle").value;
      const file = popup.querySelector("#file").files[0]; // Get the first file from the input
      if (!title || !file) {
        alert("Please fill in all fields");
        return;
      }
      apiService
        .uploadPhoto(title, file)
        .then(() => {
          document.body.removeChild(overlay);
          // After upload, refresh the gallery for the current user
          const gallery = getGallery();
          const userId =
            gallery && gallery.users && gallery.users[0]
              ? gallery.users[0].id
              : null;
          if (userId) {
            apiService
              .getUserPhotos(userId, 1, 1)
              .then((data) => setImage(data));
          }
        })
        .catch((error) => {
          alert(error.message || error);
        });
    });
  }

  // Login Modal should similarily be a popup like addImage
  function showLoginModal() {
    // Create a popup to log in a user
    const popup = document.createElement("div");
    popup.className = "popup-form";
    popup.innerHTML = `
      <h2>Login</h2>
      <form id="login-form">
        <label for="username">Username:</label>
        <input type="text" name="username" id="username" required>
        <label for="password">Password:</label>
        <input type="password" name="password" id="password" required>
        <button type="submit" id="loginButton">Login</button>
        <button type="button" id="cancelLogin">Cancel</button>
      </form>
    `;

    const overlay = document.createElement("div");
    overlay.className = "popup-overlay";
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    popup.querySelector("#cancelLogin").addEventListener("click", function () {
      document.body.removeChild(overlay);
    });

    popup
      .querySelector("#login-form")
      .addEventListener("submit", function (event) {
        event.preventDefault();
        // Use FormData to ensure correct field names
        const form = popup.querySelector("#login-form");
        const formData = new FormData(form);
        const username = formData.get("username");
        const password = formData.get("password");
        if (!username || !password) {
          alert("Please fill in all fields");
          return;
        }
        apiService
          .loginUser(username, password)
          .then((data) => {
            setUser(data.user); // Set the user data to make ui easier
            setAuth(true);
            document.body.removeChild(overlay);
            apiService.getUserGallery(1, 1).then((data) => setGallery(data)); // Refresh gallery after login
          })
          .catch((error) => {
            alert(error.message || error);
          });
      });
  }

  // Register Modal should also be a popup like addImage
  function showRegisterModal() {
    // Create a popup to register a new user
    const popup = document.createElement("div");
    popup.className = "popup-form";
    popup.innerHTML = `
      <h2>Register</h2>
      <form id="register-form">
        <label for="username">Username:</label>
        <input type="text" name="username" id="username" required>
        <label for="password">Password:</label>
        <input type="password" name="password" id="password" required>
        <button type="submit" id="registerButton">Register</button>
        <button type="button" id="cancelRegister">Cancel</button>
      </form>
    `;

    const overlay = document.createElement("div");
    overlay.className = "popup-overlay";
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    popup
      .querySelector("#cancelRegister")
      .addEventListener("click", function () {
        document.body.removeChild(overlay);
      });

    popup
      .querySelector("#register-form")
      .addEventListener("submit", function (event) {
        event.preventDefault();
        // Use FormData to ensure correct field names
        const form = popup.querySelector("#register-form");
        const formData = new FormData(form);
        const username = formData.get("username");
        const password = formData.get("password");
        if (!username || !password) {
          alert("Please fill in all fields");
          return;
        }
        apiService
          .registerUser(username, password)
          .then((data) => {
            setUser(data.user); // Set the user data to make ui easier
            setAuth(true);
            document.body.removeChild(overlay);
            apiService.getUserGallery(1, 1).then((data) => setGallery(data)); // Refresh gallery after registration
          })
          .catch((error) => {
            alert(error.message || error);
          });
      });
  }

  // Logout User will just set the user to null
  function logoutUser() {
    // Set user to null and clear gallery and image
    apiService
      .signout()
      .then(() => {
        setUser(null);
        setAuth(false);
      })
      .catch((error) => {
        alert(error.message || error);
      });
    window.location.reload(); // Reload the page to reflect changes
  }

  // Before we do no gallery, let's add the legacy code for noImage and noComments
  /*
  function noImage() {
    const content = document.querySelector("#content");
    content.className = "centered-text";
    content.innerHTML =
      "<p>No images available. Please add an image using the button on the right of the title!.</p>";
  }
  */

  function noImage() {
    const content = document.querySelector("#content");
    content.className = "centered-text";
    content.innerHTML =
      "<p>No images available. Please add an image using the button on the right of the title!.</p>";
  }

  /* 
  function noComments() {
    // No comments so display a message
    let commentContainer = document.querySelector("#commentContainer");
    if (!commentContainer) {
      commentContainer = document.createElement("div");
      commentContainer.id = "commentContainer";
      document.querySelector("#content").appendChild(commentContainer);
    }
    commentContainer.innerHTML = ""; // Clear previous comments
    // If there are no comments, display a message
    let message = document.querySelector("#commentContainer p");
    if (message === null) {
      message = document.createElement("p");
    }
    message.className = "centered-text";
    message.innerHTML =
      "<strong>No comments available for this image yet.</strong>";
    commentContainer.className = "comment-container col-auto";
    commentContainer.appendChild(message);
    content.appendChild(commentContainer);
  */

  function noComments() {
    // No comments so display a message
    let commentContainer = document.querySelector("#commentContainer");
    if (!commentContainer) {
      commentContainer = document.createElement("div");
      commentContainer.id = "commentContainer";
      document.querySelector("#content").appendChild(commentContainer);
    }
    commentContainer.innerHTML = ""; // Clear previous comments
    // If there are no comments, display a message
    let message = document.querySelector("#commentContainer p");
    if (message === null) {
      message = document.createElement("p");
    }
    message.className = "centered-text";
    message.innerHTML =
      "<strong>No comments available for this image yet.</strong>";
    commentContainer.className = "comment-container col-auto";
    commentContainer.appendChild(message);
  }

  // Now we can build noGallery more similarily to noImage (cause both clear the content)
  function noGallery() {
    const content = document.querySelector("#content");
    content.className = "centered-text";
    // Make the message specific to the user's gallery we are on if there is a user
    const user =
      getGallery() && getGallery().users ? getGallery().users[0] : null;
    if (user) {
      content.innerHTML = `<p>No gallery available for user ${user.username}. Please add a photo to create a gallery.</p>`;
    } else {
      content.innerHTML = `<p> No one posted anything yet, so no Galleries are availible. Tell your friends to upload stuff!</p>`;
    }
  }

  // Before we do renderGallery, let's add the legacy code for renderImages and renderComments
  /* 
  function renderGallery(imageDetails, pageIndex, totalPages) {
    const content = document.querySelector("#content");
    content.className = "content-container";
    content.innerHTML = ""; // Clear previous content

    const gallery = document.createElement("div");
    gallery.className = "gallery col-6";
    gallery.id = "gallery";
    gallery.innerHTML = `
      <div class="gallery-header">
        <p class="col-auto gallery-details" id="imgDetails"><strong>${imageDetails.title}</strong> by ${imageDetails.author}</p>
        <div class="col-1 add-comment" id="commentImage"></div>
        <div class="col-1 delete-btn" id="deleteImage"></div>
      </div>
      <div class="gallery-image" id="imgDisplay">
        <img src="" alt="${imageDetails.title}" id="galleryImage">
      </div>
      <div class="nav">
        <div class="col-1 prev" id="prevImage"></div>
        <div class="col-auto page-counter" id="currentImage">${pageIndex}/${totalPages}</div>
        <div class="col-1 next" id="nextImage"></div>
      </div>
    `;
    content.appendChild(gallery);

    // Set the image source
    const imgDisplay = document.querySelector("#galleryImage");
    imgDisplay.src = `/photos/${imageDetails.id}/image`;

    // Add event listeners for navigation, delete, and create comment button
    gallery.querySelector(".prev").addEventListener("click", function () {
      apiService.getUserPhotos(pageIndex - 1, 1).then((data) => setImage(data));
    });
    gallery.querySelector(".next").addEventListener("click", function () {
      apiService.getUserPhotos(pageIndex + 1, 1).then((data) => setImage(data));
    });
    gallery.querySelector(".delete-btn").addEventListener("click", function () {
      apiService
        .deleteAllComments(imageDetails.id)
        .then(() => apiService.deleteImage(imageDetails.id))
        .then(() => apiService.getUserPhotos(pageIndex - 1, 1))
        .then((data) => setImage(data));
    });
    gallery
      .querySelector(".add-comment")
      .addEventListener("click", function () {
        const popup = document.createElement("div");
        popup.className = "popup-form";
        popup.innerHTML = `
        <h2>Add Comment</h2>
        <label for="commentAuthor">Author:</label>
        <input type="text" id="commentAuthor" required>
        <label for="commentText">Comment:</label>
        <input type="text" id="commentText" required></input>
        <button id="submitComment">Submit</button>
        <button id="cancelComment">Cancel</button>
      `;

        const overlay = document.createElement("div");
        overlay.className = "popup-overlay";
        overlay.appendChild(popup);

        document.body.appendChild(overlay);

        popup
          .querySelector("#cancelComment")
          .addEventListener("click", function () {
            document.body.removeChild(overlay);
          });

        popup
          .querySelector("#submitComment")
          .addEventListener("click", function () {
            const commentAuthor = popup.querySelector("#commentAuthor").value;
            const commentText = popup.querySelector("#commentText").value;
            if (!commentAuthor || !commentText) {
              alert("Please fill in all fields");
              return;
            }
            apiService.addComment(imageDetails.id, commentAuthor, commentText);
            document.body.removeChild(overlay);
            apiService
              .getComments(imageDetails.id, 1, 10)
              .then((data) => setComments(data)); // Go to the first comment page after adding
          });
      });
  }
  */

  // Above is called renderGallery, but it actually renders the image, so let's rename it to renderImage
  function renderGallery(imageDetails, pageIndex, totalPages) {
    const content = document.querySelector("#content");
    content.className = "content-container";
    content.innerHTML = ""; // Clear previous content

    // get author from the gallery data
    const galleryData = getGallery();
    const author =
      galleryData && galleryData.users && galleryData.users[0]
        ? galleryData.users[0].username
        : "Unknown Author";

    const gallery = document.createElement("div");
    gallery.className = "gallery col-6";
    gallery.id = "gallery";
    gallery.innerHTML = `
      <div class="gallery-header">
        <p class="col-auto gallery-details" id="imgDetails"><strong>${imageDetails.title}</strong> by ${author}</p>
        <div class="col-1 add-comment" id="commentImage"></div>
        <div class="col-1 delete-btn" id="deleteImage"></div>
      </div>
      <div class="gallery-image" id="imgDisplay">
        <img src="" alt="${imageDetails.title}" id="galleryImage">
      </div>
      <div class="nav">
        <div class="col-1 prev" id="prevImage"></div>
        <div class="col-auto page-counter" id="currentImage">${pageIndex}/${totalPages}</div>
        <div class="col-1 next" id="nextImage"></div>
      </div>
    `;
    content.appendChild(gallery);
    // Set the image source
    const imgDisplay = document.querySelector("#galleryImage");
    imgDisplay.src = `/photos/${imageDetails.id}/image`;
    // Add event listeners for navigation, delete, and create comment button
    gallery.querySelector(".prev").addEventListener("click", function () {
      // Get the userID of the gallery owner
      const userId = getGallery() ? getGallery().users[0].id : null; // Assuming the first user in the gallery is the owner
      if (!userId) {
        alert("No user ID found for gallery owner.");
        return;
      }
      apiService
        .getUserPhotos(userId, pageIndex - 1, 1)
        .then((data) => setImage(data));
    });
    gallery.querySelector(".next").addEventListener("click", function () {
      const userId = getGallery() ? getGallery().users[0].id : null; // Assuming the first user in the gallery is the owner
      if (!userId) {
        alert("No user ID found for gallery owner.");
        return;
      }
      apiService
        .getUserPhotos(userId, pageIndex + 1, 1)
        .then((data) => setImage(data));
    });
    const deleteImageButton = gallery.querySelector(".delete-btn");
    if (!getUser() || getUser().id !== imageDetails.userId) {
      // If the user is not the owner of the image, hide the delete button
      deleteImageButton.style.display = "none";
    } else
      deleteImageButton.addEventListener("click", function () {
        // delete the image (the api will delete all comments associated with it)
        const galleryId =
          getGallery() && getGallery().users[0].id
            ? getGallery().users[0].id
            : -1; // Get the gallery ID
        apiService
          .deletePhoto(galleryId, imageDetails.id)
          .then(() => {
            // After deleting the image, we need to refresh the gallery
            const userId = getGallery() ? getGallery().users[0].id : null; // Assuming the first user in the gallery is the owner
            if (!userId) {
              alert("No user ID found for gallery owner.");
              return;
            }
            apiService
              .getUserPhotos(userId, pageIndex - 1, 1)
              .then((data) => setImage(data));
          })
          .catch((error) => {
            alert(error.message || error);
          });
      });
    const addCommentButton = gallery.querySelector(".add-comment");
    const auth = getAuth();
    if (!auth) {
      // If no user is logged in, hide the add comment button
      addCommentButton.style.display = "none";
    } else {
      addCommentButton.addEventListener("click", function () {
        const popup = document.createElement("div");
        popup.className = "popup-form";
        popup.innerHTML = `
        <h2>Add Comment</h2>
        <label for="commentText">Comment:</label>
        <input type="text" id="commentText" required></input>
        <button id="submitComment">Submit</button>
        <button id="cancelComment">Cancel</button>
      `;

        const overlay = document.createElement("div");
        overlay.className = "popup-overlay";
        overlay.appendChild(popup);

        document.body.appendChild(overlay);

        popup
          .querySelector("#cancelComment")
          .addEventListener("click", function () {
            document.body.removeChild(overlay);
          });

        popup
          .querySelector("#submitComment")
          .addEventListener("click", function () {
            const commentText = popup.querySelector("#commentText").value;
            if (!commentText) {
              alert("Please fill in all fields");
              return;
            }
            const user = getUser();
            const author = user ? user.username : "Anonymous"; // Use the logged-in user's username or "Anonymous"
            apiService
              .addPhotoComment(imageDetails.id, commentText, author)
              .then(() => {
                document.body.removeChild(overlay);
                apiService
                  .getPhotoComments(imageDetails.id, 1, 10)
                  .then((data) => setComments(data)); // Go to the first comment page after adding
              })
              .catch((error) => {
                alert(error.message || error);
              });
          });
      });
    }
  }

  /* Legacy code for renderComments
  function renderComments(commentsData, pageIndex, totalPages) {
    let commentContainer = document.querySelector("#commentContainer");
    if (!commentContainer) {
      commentContainer = document.createElement("div");
      commentContainer.id = "commentContainer";
      document.querySelector("#content").appendChild(commentContainer);
    }

    commentContainer.className = "comment-container col-auto";

    if (commentsData.length === 0) {
      noComments();
      return;
    }

    // Render the comments
    commentContainer.innerHTML = ""; // Clear previous comments
    const commentList = document.createElement("div");
    commentList.className = "comment-list";
    commentList.id = "comments";
    commentsData.forEach((comment) => {
      const commentDiv = document.createElement("div");
      commentDiv.className = "comment row";
      commentDiv.innerHTML = `
        <div class="comment-metadata">
          <p class="comment-author col-8">${comment.author}</p>
          <p class="comment-date col-auto">${new Date(
            comment.date
          ).toLocaleDateString()}</p>
          <div class="col-2 delete-btn" data-id="${comment.id}"></div>
        </div>
        <p class="commentText col-12">${comment.content}</p>
      `;
      commentList.appendChild(commentDiv);
    });
    commentContainer.appendChild(commentList);

    // Add event listeners for deleting comments
    const deleteButtons = commentList.querySelectorAll(".delete-btn");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const commentId = this.getAttribute("data-id");
        apiService.deleteComment(commentId).then(() => {
          // Refresh the comments after deletion
          apiService
            .getComments(commentsData[0].imageId, pageIndex, 10)
            .then((data) => setComments(data));
        });
      });
    });

    // Add navigation for comments
    const commentNav = document.createElement("div");
    commentNav.className = "nav";
    commentNav.innerHTML = `
      <div class="col-1 prev" id="prevComment"></div>
      <div class="col-auto page-counter" id="currentComment">${pageIndex}/${totalPages}</div>
      <div class="col-1 next" id="nextComment"></div>
    `;
    commentContainer.appendChild(commentNav);
    // Add event listeners for comment navigation
    const prevCommentBtn = document.querySelector("#prevComment");
    if (prevCommentBtn) {
      prevCommentBtn.addEventListener("click", function () {
        if (
          commentsData &&
          commentsData.length > 0 &&
          commentsData[0].imageId
        ) {
          apiService
            .getComments(commentsData[0].imageId, pageIndex - 1, 10)
            .then((data) => {
              setComments(data);
            });
        }
      });
    }
    const nextCommentBtn = document.querySelector("#nextComment");
    if (nextCommentBtn) {
      nextCommentBtn.addEventListener("click", function () {
        if (
          commentsData &&
          commentsData.length > 0 &&
          commentsData[0].imageId
        ) {
          apiService
            .getComments(commentsData[0].imageId, pageIndex + 1, 10)
            .then((data) => {
              setComments(data);
            });
        }
      });
    }
    // Update the current comment page display
    const currentComment = document.querySelector("#currentComment");
    if (currentComment) {
      currentComment.innerText = `${pageIndex}/${totalPages}`;
    }
  }
    */

  function renderComments(commentDetails, pageIndex, totalPages) {
    let commentContainer = document.querySelector("#commentContainer");
    if (!commentContainer) {
      commentContainer = document.createElement("div");
      commentContainer.id = "commentContainer";
      document.querySelector("#content").appendChild(commentContainer);
    }

    commentContainer.className = "comment-container col-auto";

    if (commentDetails.comments.length === 0) {
      noComments();
      return;
    }

    // Render the comments
    commentContainer.innerHTML = ""; // Clear previous comments
    const commentList = document.createElement("div");
    commentList.className = "comment-list";
    commentList.id = "comments";

    commentDetails.comments.forEach((comment) => {
      const commentDiv = document.createElement("div");
      commentDiv.className = "comment row";
      commentDiv.innerHTML = `
        <div class="comment-metadata">
          <p class="comment-author col-8">${comment.author}</p>
          <p class="comment-date col-auto">${new Date(
            comment.createdAt
          ).toLocaleDateString()}</p>
          <div class="col-2 delete-btn" data-id="${comment.id}"></div>
        </div>
        <p class="commentText col-12">${comment.content}</p>
      `;
      commentList.appendChild(commentDiv);
    });
    commentContainer.appendChild(commentList);

    // Add event listeners for deleting comments
    const deleteButtons = commentList.querySelectorAll(".delete-btn");
    // If this isn't the user's comment or the user's gallery, hide the delete button, and don't add event listeners

    deleteButtons.forEach((button) => {
      button.style.display = "block"; // Show the delete button if it is the user's comment or the gallery owner
      button.addEventListener("click", function () {
        const commentId = this.getAttribute("data-id");
        const galleryId =
          getGallery() && getGallery().users && getGallery().users[0]
            ? getGallery().users[0].id
            : -1; // Get the gallery owner ID
        apiService
          .deleteComment(galleryId, commentId)
          .then(() => {
            // Refresh the comments after deletion
            // Get the imageId from the imageDetails
            const imageId = getImage() ? getImage().photos[0].id : null;
            if (!imageId) {
              alert("No image ID found for comment deletion.");
              return;
            }
            apiService
              .getPhotoComments(imageId, pageIndex, 10)
              .then((data) => setComments(data));
          })
          .catch((error) => {
            alert(error.message || error);
          });
      });
    });

    // Add navigation for comments
    const commentNav = document.createElement("div");
    commentNav.className = "nav";
    commentNav.innerHTML = `
      <div class="col-1 prev" id="prevComment"></div>
      <div class="col-auto page-counter" id="currentComment">${pageIndex}/${totalPages}</div>
      <div class="col-1 next" id="nextComment"></div>
    `;
    commentContainer.appendChild(commentNav);
    // Add event listeners for comment navigation
    const prevCommentBtn = document.querySelector("#prevComment");
    if (prevCommentBtn) {
      prevCommentBtn.addEventListener("click", function () {
        const imageId = getImage() ? getImage().photos[0].id : -1;
        apiService
          .getPhotoComments(imageId, pageIndex - 1, 10)
          .then((data) => {
            setComments(data);
          })
          .catch((error) => {
            alert(error.message || error);
          });
      });
    }
    const nextCommentBtn = document.querySelector("#nextComment");
    if (nextCommentBtn) {
      nextCommentBtn.addEventListener("click", function () {
        const imageId = getImage() ? getImage().photos[0].id : -1;
        apiService
          .getPhotoComments(imageId, pageIndex + 1, 10)
          .then((data) => {
            setComments(data);
          })
          .catch((error) => {
            alert(error.message || error);
          });
      });
    }
    // Update the current comment page display
    const currentComment = document.querySelector("#currentComment");
    if (currentComment) {
      currentComment.innerText = `${pageIndex}/${totalPages}`;
    }
  }

  // Listeners for the gallery pagination buttons
  document.querySelector("#prevGallery").addEventListener("click", function () {
    // Get the current gallery page and decrement it
    const gallery = getGallery();
    if (gallery && gallery.page > 1) {
      apiService
        .getUserGallery(gallery.page - 1, 1)
        .then((data) => {
          setGallery(data);
        })
        .catch((error) => {
          alert(error.message || error);
        });
    }
  });

  document.querySelector("#nextGallery").addEventListener("click", function () {
    // Get the current gallery page and increment it
    const gallery = getGallery();
    if (gallery && gallery.page < gallery.totalPages) {
      apiService
        .getUserGallery(gallery.page + 1, 1)
        .then((data) => {
          setGallery(data);
        })
        .catch((error) => {
          alert(error.message || error);
        });
    }
  });

  // UseEffects

  // User useEffects

  meact.useEffect(() => {
    // User is either null (not logged in) or an object (logged in)
    // Before we do anything, remove any existing buttons and event listeners
    // remove the buttons event listeners first as they are inside the button container
    let auth = getAuth();
    let addPhotoButton = document.querySelector("#add-photo-button");
    let logOutButton = document.querySelector("#logout-button");
    let signInButton = document.querySelector("#signin-button");
    let registerButton = document.querySelector("#register-button");

    if (addPhotoButton) {
      addPhotoButton.removeEventListener("click", addImage);
    }
    if (logOutButton) {
      logOutButton.removeEventListener("click", logoutUser);
    }
    if (signInButton) {
      signInButton.removeEventListener("click", showLoginModal);
    }
    if (registerButton) {
      registerButton.removeEventListener("click", showRegisterModal);
    }
    // Clear the button container
    document.querySelector("#button-container").innerHTML = "";

    if (auth) {
      // use apiService to get the user data
      const user = getUser();
      // The user is logged in, so then add the add photo and logout buttons in button container
      document.querySelector("#button-container").innerHTML = `
        <div class="signed-in-user" id="signed-in-user">Signed In as ${user.username}</div>
        <div class="button-row">
          <button id="add-photo-button">Add Photo</button>
          <button id="logout-button">Logout</button>
        </div>
      `;
      // Add event listener for the add photo button
      document
        .querySelector("#add-photo-button")
        .addEventListener("click", addImage);
      // Add event listener for the logout button
      document
        .querySelector("#logout-button")
        .addEventListener("click", logoutUser);
    } else {
      // The user is not logged in, so then add the sign in and register buttons in button container
      document.querySelector("#button-container").innerHTML = `
        <div class="signed-in-user" id="signed-in-user">Not Signed In</div>
        <div class="button-row">
          <button id="signin-button">Sign In</button>
          <button id="register-button">Register</button>
        </div>
      `;
      // Add event listener for the sign in button
      document
        .querySelector("#signin-button")
        .addEventListener("click", showLoginModal);
      // Add event listener for the register button
      document
        .querySelector("#register-button")
        .addEventListener("click", showRegisterModal);
    }
  }, [auth]);

  // Gallery useEffects
  meact.useEffect(() => {
    let gallery = getGallery();
    // If the gallery is null, we should display a message indicating that
    if (!gallery) {
      // If it is null, we should first check if there are any images to
      noGallery();
      return;
    }

    // So the gallery is not null, so we can display the gallery
    // First parse gallery's data so it is more readable

    const totalPages = gallery.totalPages;
    const page = gallery.page;

    // If total pages is 0, then we have no gallery to display womp womp
    if (totalPages === 0) {
      noGallery();
      return;
    }

    // Now we need to validate the the page is within the range of total pages
    // if it is out of bounds, then we will just assume the user meant the first or last page
    if (page < 1) {
      // Set gallery using apiService to get the gallery for the first page
      apiService.getUserGallery(1, 1).then((data) => {
        setGallery(data);
      });
      return;
    } else if (page > totalPages) {
      // Set gallery using apiService to get the gallery for the last page
      apiService.getUserGallery(totalPages, 1).then((data) => {
        setGallery(data);
      });
      return;
    }

    const users = gallery.users[0];

    // Now we know we have a valid user for the gallery, so we can change the text of the gallery title to reflect the current user
    const username = users.username || "Unknown User";
    document.querySelector("#title").innerText = `Gallery of ${username}`;

    // We can also set the page number of the gallery
    const galleryPageCounter = document.querySelector("#currentGallery");
    if (galleryPageCounter) {
      galleryPageCounter.innerText = `${page}/${totalPages}`;
    }

    // Now we can display the gallery by setting the image and comments
    apiService
      .getUserPhotos(users.id, 1, 1)
      .then((data) => {
        setImage(data);
      })
      .catch((error) => {
        alert(error.message || error);
      });

    // Comments will be called by setImage, so we are done here :)
  }, [gallery]);

  // Image useEffects
  meact.useEffect(() => {
    let image = getImage();
    // if the image is null, then we should display a message indicating that
    if (!image) {
      noImage();
      return;
    }

    // So the image is not null, so we can display the image
    // First parse image's data so it is more readable
    const totalPages = image.totalPages;
    const page = image.page;

    // If total pages is 0, then we have no image to display womp womp
    if (totalPages === 0) {
      noImage();
      return;
    }
    // get the userID of the gallery we are displaying
    const gallery = getGallery();
    const galleryId = gallery.users[0].id;

    // Now we need to validate the the page is within the range of total pages
    // if it is out of bounds, then we will just assume the user meant the first
    if (page < 1) {
      // Set image using apiService to get the image for the first page
      apiService
        .getUserPhotos(galleryId, 1, 1)
        .then((data) => {
          setImage(data);
        })
        .catch((error) => {
          alert(error.message || error);
        });
      return;
    } else if (page > totalPages) {
      // Set image using apiService to get the image for the last page
      apiService
        .getUserPhotos(galleryId, totalPages, 1)
        .then((data) => {
          setImage(data);
        })
        .catch((error) => {
          alert(error.message || error);
        });
      return;
    }

    // Now we know we have a valid image, so we can render the gallery
    renderGallery(image.photos[0], page, totalPages);

    apiService
      .getPhotoComments(image.photos[0].id, 1, 10)
      .then((data) => {
        setComments(data);
      })
      .catch((error) => {
        alert(error.message || error);
      });
  }, [image]);

  // Comments useEffects
  meact.useEffect(() => {
    // If the user is not logged in, we should not display comments.
    // We will just make the comment section invisible and return
    const auth = getAuth();
    if (!auth) {
      const commentContainer = document.querySelector("#commentContainer");
      if (commentContainer) {
        commentContainer.style.display = "none"; // Hide the comment section
      }
      return;
    }

    let comments = getComments();
    // If comments is null, then we should display a message indicating that
    if (!comments) {
      noComments();
      return;
    }

    // So the comments is not null, so we can display the comments
    // First parse comments' data so it is more readable
    const totalPages = comments.totalPages;
    const page = comments.page;

    // If total pages is 0, then we have no comments to display womp womp
    if (totalPages === 0) {
      noComments();
      return;
    }

    const imageId = getImage() ? getImage().photos[0].id : null;
    if (!imageId) {
      return;
    }

    // Now we need to validate the the page is within the range of total pages
    // if it is out of bounds, then we will just assume the user meant the first or last page
    if (page < 1) {
      // Set comments using apiService to get the comments for the first page
      apiService
        .getPhotoComments(imageId, 1, 10)
        .then((data) => {
          setComments(data);
        })
        .catch((error) => {
          alert(error.message || error);
        });
      return;
    } else if (page > totalPages) {
      // Set comments using apiService to get the comments for the last page
      apiService
        .getPhotoComments(imageId, totalPages, 10)
        .then((data) => {
          setComments(data);
        })
        .catch((error) => {
          alert(error.message || error);
        });
      return;
    }
    // Now we know we have a valid comment list, so we can render the comments
    renderComments(comments, page, totalPages);
  }, [comments]);

  // Loading useEffects
  meact.useEffect(() => {
    // If loading is true, then we should display the loading spinner
    if (loading) {
      document.querySelector("#loading").style.display = "block";
    } else {
      document.querySelector("#loading").style.display = "none";
    }
  }, [loading]);
})();
