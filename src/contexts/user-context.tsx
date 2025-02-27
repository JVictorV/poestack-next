import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";

import { gql, useMutation, useQuery } from "@apollo/client";
import { UserProfile } from "@generated/graphql";

const initalContext: {
  jwt: string | null;
  profile: UserProfile | null;
  tftMember: boolean | null;
  connect: any | null;
  logout: any | null;
  refetchMyProfile: any | null;
} = {
  jwt: null,
  profile: null,
  tftMember: null,
  connect: (code: string) => {},
  logout: () => {},
  refetchMyProfile: () => {},
};

export const PoeStackAuthContext = createContext(initalContext);

export const localStorageJwtName = "doNotSharePoeStackAuthJwt";

export function PoeStackAuthProvider({ children }) {
  const router = useRouter();

  const [jwt, setJwt] = useState<string | null>(
    typeof window !== "undefined"
      ? localStorage.getItem(localStorageJwtName)
      : null
  );
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tftMember, setTftMember] = useState<boolean | null>(null);

  const [code, setCode] = useState<string | null>(null);
  const [connectAccount] = useMutation(
    gql`
      mutation ExchangeAuthCode($authCode: String!) {
        exchangeAuthCode(authCode: $authCode)
      }
    `,
    {
      variables: { authCode: code },
      onCompleted(data) {
        if (data?.exchangeAuthCode) {
          localStorage.setItem(localStorageJwtName, data?.exchangeAuthCode);
          setJwt(data?.exchangeAuthCode);
        }
      },
      onError(error) {
        console.log("error connecting auth code", error);
      },
    }
  );

  const { refetch: refetchMyProfile } = useQuery(
    gql`
      query MyProfile($forcePull: Boolean) {
        myProfile {
          userId
          poeProfileName
          patreonUserId
          patreonTier
          oAuthTokenUpdatedAtTimestamp
          lastConnectedTimestamp
          discordUsername
          discordUserId
          createdAtTimestamp
          opaqueKey
        }
        checkTftMembership(forcePull: $forcePull)
      }
    `,
    {
      variables: { forcePull: false },
      onCompleted(data) {
        const p: UserProfile = data?.myProfile;
        if (
          p.oAuthTokenUpdatedAtTimestamp &&
          new Date(p.oAuthTokenUpdatedAtTimestamp).valueOf() >
            Date.now() - 1000 * 60 * 60 * 24 * 14
        ) {
          setProfile(p);
        }
        setTftMember(data.checkTftMembership);
      },
    }
  );

  useEffect(() => {
    if (code?.length) {
      connectAccount();
    }
  }, [connectAccount, code]);

  useEffect(() => {
    refetchMyProfile();
  }, [jwt, refetchMyProfile]);

  function connect(code: string) {
    if (code?.length) {
      setCode(code);
    }
  }

  function logout() {
    localStorage.removeItem(localStorageJwtName);
    setJwt(null);
    setProfile(null);
  }

  const value = {
    profile: profile,
    tftMember: tftMember,
    jwt: jwt as any,
    connect: connect,
    logout: logout,
    refetchMyProfile: refetchMyProfile,
  };

  return (
    <PoeStackAuthContext.Provider value={value}>
      {children}
    </PoeStackAuthContext.Provider>
  );
}

export const usePoeStackAuth = () => useContext(PoeStackAuthContext);
