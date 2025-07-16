import jwt from "jsonwebtoken";

export async function getToken(request) {
  const authHeader = request.headers.get("Authorization");
  // console.log(authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "No Token Provided" };
  }
  const token = authHeader.split(" ")[1];
  // console.log(token);

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    return decoded;
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      console.error("Token Has Expired:", err.message);
      return { error: "Token Has Expired" };
    } else if (err.name === "JsonWebTokenError") {
      console.error("Invalid token:", err.message);
      return { error: "Invalid Token" };
    } else {
      console.error("Token verification error:", err.message);
      return { error: "Token verification failed" };
    }
  }
}
