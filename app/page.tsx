import { getChatGPTUser, chatGPTSignInPath, chatGPTSignOutPath } from "./chatgpt-auth";
import SocialApp from "./social-app";

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await getChatGPTUser();
  return <SocialApp user={user ? { id: user.userId, name: user.fullName ?? user.email.split("@")[0], email: user.email } : null} signInPath={chatGPTSignInPath("/")} signOutPath={chatGPTSignOutPath("/")} />;
}
