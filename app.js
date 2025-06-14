const API_BASE = "http://localhost:5000/api";

let currentUserId = null; // For demo, we will set this after login/register

// Utility to create elements with classes and text
function createElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

// Fetch and display user profile
async function loadUserProfile(userId) {
  const res = await fetch(\`\${API_BASE}/users/\${userId}\`);
  if (!res.ok) {
    document.getElementById("profile-info").textContent = "Failed to load profile";
    return;
  }
  const user = await res.json();
  const profileDiv = document.getElementById("profile-info");
  profileDiv.innerHTML = "";
  profileDiv.appendChild(createElement("p", null, \`Username: \${user.username}\`));
  profileDiv.appendChild(createElement("p", null, \`Email: \${user.email}\`));
  profileDiv.appendChild(createElement("p", null, \`Bio: \${user.bio || ""}\`));
  profileDiv.appendChild(createElement("p", null, \`Followers: \${user.followers.length}\`));
  profileDiv.appendChild(createElement("p", null, \`Following: \${user.following.length}\`));
}

// Fetch and display posts
async function loadPosts() {
  const res = await fetch(\`\${API_BASE}/posts\`);
  if (!res.ok) {
    document.getElementById("posts-container").textContent = "Failed to load posts";
    return;
  }
  const posts = await res.json();
  const container = document.getElementById("posts-container");
  container.innerHTML = "";

  posts.forEach((post) => {
    const postDiv = createElement("div", "post");
    postDiv.appendChild(createElement("div", "author", post.author.username));
    postDiv.appendChild(createElement("div", "content", post.content));

    // Like button
    const likeBtn = createElement("button", null, \`Like (\${post.likes.length})\`);
    likeBtn.onclick = async () => {
      await fetch(\`\${API_BASE}/posts/\${post._id}/like\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId }),
      });
      loadPosts();
    };

    // Comments section
    const commentsDiv = createElement("div", "comments");
    post.comments.forEach((comment) => {
      const commentDiv = createElement("div", "comment");
      commentDiv.appendChild(createElement("div", "author", comment.author.username));
      commentDiv.appendChild(createElement("div", "content", comment.content));
      commentsDiv.appendChild(commentDiv);
    });

    // Add comment input
    const commentInput = createElement("input");
    commentInput.placeholder = "Add a comment...";
    const commentBtn = createElement("button", null, "Comment");
    commentBtn.onclick = async () => {
      const content = commentInput.value.trim();
      if (!content) return;
      await fetch(\`\${API_BASE}/comments\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post._id, author: currentUserId, content }),
      });
      commentInput.value = "";
      loadPosts();
    };

    postDiv.appendChild(likeBtn);
    postDiv.appendChild(commentsDiv);
    postDiv.appendChild(commentInput);
    postDiv.appendChild(commentBtn);

    container.appendChild(postDiv);
  });
}

// Create a new post
async function createPost() {
  const content = document.getElementById("post-content").value.trim();
  if (!content) return alert("Post content cannot be empty");
  await fetch(\`\${API_BASE}/posts\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ author: currentUserId, content }),
  });
  document.getElementById("post-content").value = "";
  loadPosts();
}

// For demo, register a default user and set currentUserId
async function demoRegisterUser() {
  const res = await fetch(\`\${API_BASE}/users/register\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "demoUser", email: "demo@example.com", password: "password" }),
  });
  if (res.ok) {
    const loginRes = await fetch(\`\${API_BASE}/users/login\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "demo@example.com", password: "password" }),
    });
    if (loginRes.ok) {
      const data = await loginRes.json();
      currentUserId = data.userId;
      loadUserProfile(currentUserId);
      loadPosts();
    }
  }
}

document.getElementById("create-post-btn").addEventListener("click", createPost);

window.onload = () => {
  demoRegisterUser();
};
