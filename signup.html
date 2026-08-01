<!-- === Frontend Signup Form === -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Sign Up</title>
  <link rel="stylesheet" href="./styles.css" />
  <script type="module" src="common.js"></script>
</head>
<body>
  <main>
    <div id="authBox" class="authContainer">
      <h2 id="formHeading">Sign Up</h2>

      <form id="signupForm" onsubmit="return handleSignup(event)">
        <input
          type="email"
          id="signupEmail"
          placeholder="Email"
          required
        />

        <input
          type="password"
          id="signupPassword"
          placeholder="Password"
          required
        />

        <!-- ✅ NEW: Repeat Password field -->
        <input
          type="password"
          id="signupPasswordConfirm"
          placeholder="Repeat password"
          aria-label="Repeat password to confirm"
          required
        />

        <button type="submit">Sign Up</button>
        <p id="signupError"></p>
      </form>

      <p>Already have an account? <a href="login.php">Login</a></p>
    </div>
  </main>

  <script>
    function handleSignup(event) {
      event.preventDefault();

      const email    = document.getElementById("signupEmail").value.trim();
      const password = document.getElementById("signupPassword").value.trim();
      const confirm  = document.getElementById("signupPasswordConfirm").value.trim();
      const errorEl  = document.getElementById("signupError");

      // ✅ Clear previous error
      if (errorEl) {
        errorEl.textContent = "";
        errorEl.style.color = "";
      }

      // ✅ Check password match on the frontend
      if (password !== confirm) {
        const msg = "Passwords do not match. Please type the same password twice.";
        if (errorEl) {
          errorEl.textContent = msg;
          errorEl.style.color = "red";
        }
        alert(msg);
        return false;
      }

      fetch("signup.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      })
      .then(async (res) => {
        const text = await res.text();
        let data;

        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error("❌ Invalid server response.");
        }

        if (!res.ok) {
          // Error from backend
          const msg = data.error || "❌ Signup failed.";
          throw new Error(msg);
        }

        return data;
      })
      .then(data => {
        if (data.success) {
          // ✅ Alert for success
          alert("Successfully created an account!");

          // Store creds for auto-login on login.php
          localStorage.setItem("autoLoginEmail", data.email);
          localStorage.setItem("autoLoginPass", data.password);

          window.location.href = "login.php?autologin=true";
        } else {
          const msg = data.error || "❌ Unknown error.";
          if (errorEl) {
            errorEl.textContent = msg;
            errorEl.style.color = "red";
          }
          alert(msg);
        }
      })
      .catch(err => {
        const msg = err.message || "❌ Signup failed.";

        // ✅ Special message if email already exists
        if (msg.toLowerCase().includes("already") && msg.toLowerCase().includes("exists")) {
          alert("An account with that email already exists!");
        } else {
          alert(msg);
        }

        if (errorEl) {
          errorEl.textContent = msg;
          errorEl.style.color = "red";
        }
      });

      return false;
    }
  </script>
</body>
</html>
