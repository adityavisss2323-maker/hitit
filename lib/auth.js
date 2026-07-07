// lib/auth.js
// JWT authentication utilities - INTENTIONALLY VULNERABLE
const jwt = require('jsonwebtoken');

// VULN: Weak JWT secret stored in environment variable
// Default fallback to "WEAK_SECRET" if env var is not set
const JWT_SECRET = process.env.JWT_SECRET || 'WEAK_SECRET';

// VULN: Very long expiry - 30 days - tokens never really expire
const TOKEN_EXPIRY = '30d';

/**
 * Sign a JWT token with the weak secret
 * VULN: Role is embedded in token payload and can be modified
 */
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Verify a JWT token
 * VULN: No revocation list, no additional validation
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Extract token from Authorization header or cookie
 * VULN: Accepts token from multiple insecure sources
 */
function extractToken(request) {
  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookie (VULN: cookie not set with httpOnly or Secure flags)
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, val] = cookie.trim().split('=');
      acc[key] = val;
      return acc;
    }, {});
    if (cookies.token) return cookies.token;
  }

  return null;
}

/**
 * Get current user from request
 * VULN: Role is taken directly from JWT payload without server-side verification
 */
function getCurrentUser(request) {
  const token = extractToken(request);
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Check if user is admin based on JWT payload role field
 * VULN: Client-side controllable role field used for admin check
 */
function isAdmin(request) {
  const user = getCurrentUser(request);
  return user && user.role === 'admin';
}

module.exports = { signToken, verifyToken, extractToken, getCurrentUser, isAdmin };
