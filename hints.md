# VulnMarket CTF Hints 🚩

> Progressive hints for each challenge. Start with Hint 1 before reading Hint 2 or 3.
> Flag format: `FLAG{...}`

---

## Challenge 1: The Developer's Comment
**Category:** Information Disclosure  
**Difficulty:** ⭐ Easy-Medium

**Hint 1:** Developers sometimes leave notes for themselves in places they think are hidden.

**Hint 2:** Web browsers have developer tools that let you see the raw HTML source of any page, including comments that aren't rendered on screen.

**Hint 3:** Try right-clicking the homepage and selecting "View Page Source". Look carefully at the footer area HTML for anything that looks like a comment starting with `<!--`.

---

## Challenge 2: The Broken Login Gate
**Category:** SQL Injection  
**Difficulty:** ⭐⭐ Medium

**Hint 1:** The login form checks your credentials against a database using a query. What if you could manipulate that query?

**Hint 2:** Classic SQL injection uses special characters to break out of quoted strings. Try entering something unusual in the username field that might terminate the SQL string early.

**Hint 3:** Try the username: `admin'--` with any password. The `--` comments out the rest of the SQL query, including the password check. Also try the search endpoint at `/api/search?q=%' UNION SELECT ...` for a different approach.

---

## Challenge 3: Someone Else's Profile
**Category:** IDOR (Insecure Direct Object Reference)  
**Difficulty:** ⭐⭐ Medium

**Hint 1:** When you view your own profile, notice the URL. Does the number in the URL mean anything?

**Hint 2:** The API endpoint `/api/profile/[id]` retrieves a user by their ID. Does it verify that the requesting user owns that profile?

**Hint 3:** Log in as any user, then try visiting `/api/profile/2` in your browser or with curl. Look carefully at the JSON response — there may be a `_debug` field with something interesting for user ID 2.

---

## Challenge 4: The Injected Review
**Category:** Stored XSS  
**Difficulty:** ⭐⭐ Medium

**Hint 1:** The product review system mentions that "HTML formatting is supported". This is a red flag.

**Hint 2:** The reviews are stored in the database and rendered using `dangerouslySetInnerHTML`. A client-side filter exists but it's weak — it only catches `<script>` tags directly.

**Hint 3:** Try posting a review with this payload (bypasses the client-side filter): `<img src=x onerror="fetch('/api/flags').then(r=>r.json()).then(d=>alert(JSON.stringify(d)))">`. The admin panel displays all comments, so any admin viewing it will trigger your payload.

---

## Challenge 5: The Unguarded Vault
**Category:** Security Misconfiguration  
**Difficulty:** ⭐⭐ Medium

**Hint 1:** Every good web application has a `robots.txt` file. What does VulnMarket's say?

**Hint 2:** `robots.txt` is meant to tell search engine crawlers which paths to avoid. Ironically, it also tells attackers which paths might be interesting. Check `/robots.txt`.

**Hint 3:** Visit the path listed in `robots.txt` that sounds like a data export or backup feature. Try accessing it directly without any authentication headers. The full database including all flags is returned.

---

## Challenge 6: Reading Between the Lines
**Category:** LFI (Local File Inclusion) Simulation  
**Difficulty:** ⭐⭐ Medium

**Hint 1:** The Page Viewer at `/page-view` loads content from the server using a `file` parameter. What happens if you try to access a file that's not in the predefined list?

**Hint 2:** The server filters the file parameter to remove `../` sequences, but the filter only removes the first occurrence. What if you craft input that becomes a traversal sequence after the filter runs?

**Hint 3:** Try the input `....//secret` in the page viewer. After the filter removes one `../`, you're left with `../secret`. The server recognizes this traversal attempt and returns the secret page content. Alternatively try the page name `secret` directly and see what happens.

---

## Challenge 7: The Command Line Shortcut
**Category:** Command Injection  
**Difficulty:** ⭐⭐⭐ Medium-Hard

**Hint 1:** The Admin Diagnostics panel runs a ping command with user-supplied input. The admin panel says semicolons are blocked — but semicolons aren't the only way to chain commands.

**Hint 2:** In bash, commands can be chained with `|` (pipe), `&&` (AND), `||` (OR), or backticks. The filter only removes `;`.

**Hint 3:** First, gain admin access (try Challenge 10 or default credentials). Then in the Diagnostics panel, try: `google.com | whoami` or `google.com && id`. The simulated output will include the flag when injection is detected.

---

## Challenge 8: The Trojan File
**Category:** File Upload Bypass  
**Difficulty:** ⭐⭐ Medium

**Hint 1:** The file upload page only allows image files. But where exactly is this check enforced?

**Hint 2:** The validation comment in the source code says "Validation is performed client-side for performance." Client-side validation can always be bypassed.

**Hint 3:** Create a file named `shell.php.jpg` (a double-extension file). The client-side JavaScript only checks the last extension, but the upload API detects the double extension pattern and reveals the flag in the response's `hint` field.

---

## Challenge 9: The Internal Backdoor
**Category:** SSRF (Server-Side Request Forgery)  
**Difficulty:** ⭐⭐⭐ Medium-Hard

**Hint 1:** The URL Preview tool in the Admin panel fetches URLs server-side. This means the server makes the request, not your browser. What URLs are only accessible from the server?

**Hint 2:** Look at `lib/config.js` in the source code or check `/api/debug?debug=true` for internal endpoint URLs. There's an internal API endpoint that should only be reachable from within the server.

**Hint 3:** Gain admin access, then use the URL Preview tool to fetch `http://localhost:3000/api/internal/secret`. The server makes this request to itself, bypassing any external access controls, and returns the flag.

---

## Challenge 10: The Forged Badge
**Category:** JWT Weakness  
**Difficulty:** ⭐⭐⭐ Medium-Hard

**Hint 1:** The JWT token stored in your browser's localStorage contains your user information including your role. What if you could change your role to "admin"?

**Hint 2:** JWT tokens have three parts separated by dots. The middle part (payload) is just base64-encoded JSON. The signature is created using a secret key. If the key is weak, you can forge a new token.

**Hint 3:** The JWT secret is `WEAK_SECRET` (revealed in `/api/debug?debug=true` and `.env.example`). Use a tool like `jwt.io` or write a script: decode your current token, change `"role": "user"` to `"role": "admin"`, re-sign with `WEAK_SECRET` using HS256, replace your localStorage token, then visit `/api/flags`.

```javascript
// Example forge script (run in browser console or Node.js):
const secret = 'WEAK_SECRET';
// Use https://jwt.io or:
const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: 3, username: 'bob', email: 'bob@example.com', role: 'admin' }, secret);
console.log(token);
// Set this token in localStorage and call /api/flags
```

---

## Tips for All Challenges

- Always check browser developer tools (Network tab, Source tab, Console)
- Read the `robots.txt` file early
- Try `/api/debug?debug=true` for configuration details
- API endpoints often return more data than the UI shows
- The JWT secret is intentionally weak — JWT cracking tools work on it
- Look for HTML comments in page source
- The admin credentials are hinted at in the login page and admin notes

---

*Happy hacking! Remember: only test on systems you own or have permission to test.*
