import { ThePage } from "@/app/ThePage";
import { UserProvider } from "@/context/UserContext";

export default async function Home() {
  return (
    <UserProvider>
      <ThePage />
    </UserProvider>
  );
}
