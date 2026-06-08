import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { UserProfile } from "../utils/database.types";
import { getUserProfile, updateUserProfile } from "../utils/database";

interface ProfileContextValue {
  profile: UserProfile;
  loading: boolean;
  refresh: () => Promise<void>;
  saveProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "NutriSnap User",
  email: "",
  age: 28,
  height_cm: 170,
  weight_kg: 70,
  activity_level: "moderate",
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const p = await getUserProfile();
      setProfile(p);
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      await updateUserProfile(updates);
      const p = await getUserProfile();
      setProfile(p);
    },
    []
  );

  return (
    <ProfileContext.Provider value={{ profile, loading, refresh, saveProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
