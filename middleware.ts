import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/lister/:path*",
    "/account/:path*",
    "/browse/:path*",
    "/rent/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};
