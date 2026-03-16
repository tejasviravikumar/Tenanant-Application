// AvatarContext.jsx
// Provides shared avatar state between Profile.jsx and Pfp.jsx
// Wrap your app (or layout) with <AvatarProvider> and both components will stay in sync.

import { createContext, useContext, useState } from "react";

const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23DFE5E7'/%3E%3Ccircle cx='100' cy='85' r='38' fill='%23B0BEC5'/%3E%3Cellipse cx='100' cy='185' rx='65' ry='50' fill='%23B0BEC5'/%3E%3C/svg%3E";

const AvatarContext = createContext(null);

export function AvatarProvider({ children }) {
  const [avatarSrc, setAvatarSrc] = useState(DEFAULT_AVATAR);
  return (
    <AvatarContext.Provider value={{ avatarSrc, setAvatarSrc, DEFAULT_AVATAR }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() {
  const ctx = useContext(AvatarContext);
  if (!ctx) throw new Error("useAvatar must be used inside <AvatarProvider>");
  return ctx;
}