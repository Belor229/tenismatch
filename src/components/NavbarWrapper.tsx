import { getSession } from "@/lib/auth";
import Navbar from "./Navbar";

export default async function NavbarWrapper() {
    const session = await getSession();
    return <Navbar isLoggedIn={!!session} />;
}

