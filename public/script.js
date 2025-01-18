let token = '';

document.getElementById('signupButton').addEventListener('click', () => {
  document.getElementById('authForms').style.display = 'block';
  document.getElementById('signupForm').style.display = 'block';
  document.getElementById('signinForm').style.display = 'none';
});

document.getElementById('signinButton').addEventListener('click', () => {
  document.getElementById('authForms').style.display = 'block';
  document.getElementById('signinForm').style.display = 'block';
  document.getElementById('signupForm').style.display = 'none';
});

document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('signupUsername').value;
  const password = document.getElementById('signupPassword').value;

  try {
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const result = await response.text();
    alert(result);
  } catch (error) {
    console.error('Error during sign up:', error);
    alert('Sign up failed. Please try again.');
  }
});

document.getElementById('signinForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('signinUsername').value;
  const password = document.getElementById('signinPassword').value;

  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    token = result.token;
    if (token) {
      document.getElementById('authForms').style.display = 'none';
      alert('Logged in successfully!');
    } else {
      alert('Login failed. Invalid credentials.');
    }
  } catch (error) {
    console.error('Error during sign in:', error);
    alert('Sign in failed. Please try again.');
  }
});

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!token) {
    alert('Please sign up or log in to upload files.');
    return;
  }

  const fileInput = document.getElementById('fileInput');
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  try {
    const response = await fetch('/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.link) {
      document.getElementById('response').innerHTML = `
        <p>${result.message}</p>
        <div class="link-container">
          <a href="${result.link}" target="_blank">${result.link}</a>
          <button class="copy-button" onclick="copyLink('${result.link}')">Copy Link</button>
        </div>
      `;
    } else {
      document.getElementById('response').innerHTML = 'Failed to upload file.';
    }
  } catch (error) {
    document.getElementById('response').innerHTML = `Error: ${error.message}`;
    console.error('Error during file upload:', error);
  }
});

function copyLink(link) {
  const el = document.createElement('textarea');
  el.value = link;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  alert('Link copied to clipboard!');
}
